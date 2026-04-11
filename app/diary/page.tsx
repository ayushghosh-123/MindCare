'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BookOpen, Plus, Calendar, FileText, Search, Filter, Pencil, X, Check, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dbHelpers, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { RichTextEditor } from '@/components/journal/rich-text-editor';

import { useDiary } from '@/components/journal/DiaryContext';
import { useAgent } from '@/components/hooks/use-agent';
import { AgentReviewPanel } from '@/components/journal/AgentReviewPanel';

export default function DiaryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const { selectedJournal, entries, setEntries, loading, refreshJournals, deleteJournal, isWriting, setIsWriting } = useDiary();
  const agent = useAgent();

  const [_selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Journal Editing state
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [editingJournalTitle, setEditingJournalTitle] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');

  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryMood, setEntryMood] = useState<'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'>('neutral');
  const [entryTags, setEntryTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const saveJournalTitle = async () => {
    if (!selectedJournal || !editingJournalTitle.trim()) return;
    try {
      const { data, error } = await dbHelpers.updateJournal(selectedJournal.id, { title: editingJournalTitle.trim() });
      if (error) throw error;
      await refreshJournals();
      setIsEditingJournal(false);
      toast({ title: 'Success', description: 'Journal renamed!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to rename journal.' });
    }
  };

  const saveEntry = async () => {
    if (!entryContent.trim() || !selectedJournal || !user?.id) return;

    try {
      const wordCount = entryContent.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      const { data, error } = await dbHelpers.createJournalEntry({
        journal_id: selectedJournal.id,
        user_id: user.id,
        title: entryTitle || undefined,
        content: entryContent,
        mood: entryMood,
        tags: entryTags,
        is_private: true,
      });

      if (error) throw error;
      setEntries(prev => [data, ...prev]);

      setEntryTitle('');
      setEntryContent('');
      setEntryMood('neutral');
      setEntryTags([]);
      setIsWriting(false);

      toast({
        title: 'Entry saved!',
        description: 'AI is now analyzing your entry…',
        variant: 'default',
      });

      await agent.invoke({
        userMessage: entryContent,
        sessionId: crypto.randomUUID(),
        journalEntry: {
          journal_id: selectedJournal.id,
          user_id: user.id,
          content: entryContent,
          mood: entryMood,
          tags: entryTags,
          word_count: wordCount,
          reading_time: readingTime,
          is_private: true,
        },
      });

    } catch {
      toast({ title: 'Error', description: 'Failed to save entry.' });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !entryTags.includes(newTag.trim())) {
      setEntryTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setEntryTags(prev => prev.filter(t => t !== tag));

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      poor: 'bg-orange-100 text-orange-800 border-orange-200',
      terrible: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodBorder = (mood: string) => {
    const borders: Record<string, string> = {
      excellent: 'border-l-green-500',
      good: 'border-l-blue-500',
      neutral: 'border-l-yellow-500',
      poor: 'border-l-orange-500',
      terrible: 'border-l-red-500',
    };
    return borders[mood] || 'border-l-slate-300';
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D3D3FF]" />
      </div>
    );
  }

  if (!user) { router.push('/sign-in'); return null; }

  // Computations for Timeline
  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = filterMood === 'all' || e.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
      <div className="space-y-6">
        {isWriting ? (
          <Card className="shadow-lg border-[#D3D3FF]/30">
            <CardHeader className="bg-[#D3D3FF]/10 border-b border-[#D3D3FF]/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-800">Write New Entry</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsWriting(false)}>Cancel</Button>
                  <Button
                    onClick={saveEntry}
                    disabled={!entryContent.trim() || loading}
                    className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Entry
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label htmlFor="entry-title" className="text-slate-700 font-semibold">Entry Title</Label>
                <Input
                  id="entry-title"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="mt-1.5 focus-visible:ring-indigo-500 text-lg shadow-sm"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-semibold">Content</Label>
                <RichTextEditor
                  content={entryContent}
                  onChange={setEntryContent}
                  placeholder="Start writing your thoughts, feelings, and experiences..."
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F0F0FF] p-4 rounded-xl border border-slate-100">
                <div>
                  <Label className="text-slate-700 font-semibold">Mood</Label>
                  <Select value={entryMood} onValueChange={(v: typeof entryMood) => setEntryMood(v)}>
                    <SelectTrigger className="mt-1.5 bg-[#F8F8FF] shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="terrible">Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">Tags</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="bg-[#F8F8FF] shadow-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} variant="secondary">Add</Button>
                  </div>
                  {entryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entryTags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="cursor-pointer bg-[#F8F8FF] hover:bg-[#D3D3FF]/10 hover:text-indigo-700 transition-colors py-1 px-2" onClick={() => removeTag(tag)}>
                          {tag} <span className="ml-1 opacity-50">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : selectedJournal ? (
          <div className="space-y-6">
            {/* Header Card matching Premium Sidebar Aesthetic */}
            <div 
              className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 p-8 text-white min-h-[160px] flex flex-col justify-center"
              style={{ backgroundColor: selectedJournal.color || '#6366F1' }}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {isEditingJournal ? (
                    <div className="flex items-center gap-3 w-full md:max-w-md">
                      <Input
                        value={editingJournalTitle}
                        onChange={(e) => setEditingJournalTitle(e.target.value)}
                        className="h-12 text-2xl font-bold px-3 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus-visible:ring-white/50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveJournalTitle();
                          if (e.key === 'Escape') setIsEditingJournal(false);
                        }}
                      />
                      <button className="p-2 rounded-full bg-white/20 hover:bg-emerald-500 transition-colors" onClick={saveJournalTitle}>
                        <Check className="w-6 h-6" />
                      </button>
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" onClick={() => setIsEditingJournal(false)}>
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight truncate">{selectedJournal.title}</h2>
                        <button 
                          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
                          onClick={() => {
                            setEditingJournalTitle(selectedJournal.title);
                            setIsEditingJournal(true);
                          }}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-lg text-white/80 font-medium max-w-2xl">{selectedJournal.description || 'A place for my thoughts and experiences'}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                   <button
                    onClick={() => deleteJournal(selectedJournal.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/80 transition-all font-bold text-sm"
                  >
                    <Trash2 size={18} />
                    <span>Delete Journal</span>
                  </button>
                </div>
              </div>

              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
            
            {/* Filtering & Search Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="py-4">
                  {entries.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Search entries..." 
                          className="pl-10 bg-slate-50 border-slate-200 shadow-sm"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={filterMood} onValueChange={setFilterMood}>
                        <SelectTrigger className="w-full md:w-[180px] bg-slate-50 border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="truncate">
                              {filterMood === 'all' ? 'All Moods' : filterMood}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Moods</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="terrible">Terrible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </CardHeader>
            </Card>

            {entries.length === 0 && !loading ? (
              <Card className="border-dashed border-2 bg-slate-50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to start writing?</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">Capture your daily thoughts and get AI insights.</p>
                  <Button onClick={() => setIsWriting(true)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                    <Plus className="h-4 w-4 mr-2" /> Write Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Calendar className="w-5 h-5" />
                       <h3 className="font-semibold">{format(new Date(date), 'MMMM d, yyyy')}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {groupedEntries[date].map((entry) => (
                        <Card key={entry.id} className={cn("cursor-pointer hover:shadow-md transition-all border-l-4", getMoodBorder(entry.mood || 'neutral'))} onClick={() => setSelectedEntry(entry)}>
                          <CardHeader className="pb-3 pt-5 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-lg font-bold text-slate-800">{entry.title || 'Untitled'}</CardTitle>
                              {entry.mood && (
                                <Badge variant="outline" className={cn('capitalize text-[10px] px-2', getMoodColor(entry.mood))}>
                                  {entry.mood}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{format(new Date(entry.created_at), 'h:mm a')}</span>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-4">
                              {entry.content.replace(/<[^>]*>/g, '')}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t pt-2">
                              <span>{entry.word_count} words • {entry.reading_time} min read</span>
                              <div className="flex gap-1">
                                {entry.tags?.slice(0, 2).map((t, idx) => (
                                  <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-slate-50 py-20 text-center">
            <CardContent className="flex flex-col items-center">
              <BookOpen className="h-16 w-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Select a Journal</h3>
              <p className="text-slate-500">Choose a journal from the sidebar to view entries or start writing.</p>
            </CardContent>
          </Card>
        )}

        {/* AI AGENT STATUS CARDS */}
        {agent.status === 'loading' && (
          <Card className="border-violet-200 bg-violet-50/50">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600" />
              <p className="text-sm font-medium text-violet-700">AI Analysis in progress...</p>
            </CardContent>
          </Card>
        )}

        {agent.reviewPayload && (
           <AgentReviewPanel
              payload={agent.reviewPayload}
              isResuming={agent.status === 'resuming'}
              isComplete={agent.status === 'complete'}
              result={agent.result}
              onApprove={(edited) => agent.approve(edited)}
              onReject={() => agent.reject()}
           />
        )}

        {agent.status === 'complete' && agent.result && !agent.reviewPayload && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="pt-5">
              <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2">✨ AI Insight Generated</p>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{agent.result.response}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
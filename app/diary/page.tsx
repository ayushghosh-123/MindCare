'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BookOpen, Plus, Calendar, FileText, Search, Filter, Pencil, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MainNavbar } from '@/components/main-navbar';
import { dbHelpers, type Journal, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';

import { useAgent } from '@/components/hooks/use-agent';
import { AgentReviewPanel } from '@/components/journal/AgentReviewPanel';

export default function DiaryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const agent = useAgent();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [_selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);

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

  useEffect(() => {
    if (isLoaded && user) loadJournals();
  }, [isLoaded, user]);

  useEffect(() => {
    if (selectedJournal) loadJournalEntries(selectedJournal.id);
  }, [selectedJournal]);

  const loadJournals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserJournals(user.id);
      if (error) throw error;
      setJournals(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load journals.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async (journalId: string) => {
    try {
      const { data, error } = await dbHelpers.getJournalEntries(journalId);
      if (error) throw error;
      setEntries(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load entries.', variant: 'error' });
    }
  };

  const createJournal = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await dbHelpers.createJournal({
        user_id: user.id,
        title: 'My New Journal',
        description: 'A place for my thoughts and experiences',
        color: '#6366f1',
        is_public: false,
      });
      if (error) throw error;
      setJournals(prev => [data, ...prev]);
      setSelectedJournal(data);
      toast({ title: 'Success', description: 'Journal created!', variant: 'default' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create journal.', variant: 'error' });
    }
  };

  const saveJournalTitle = async () => {
    if (!selectedJournal || !editingJournalTitle.trim()) return;
    try {
      const { data, error } = await dbHelpers.updateJournal(selectedJournal.id, { title: editingJournalTitle.trim() });
      if (error) throw error;
      setJournals(prev => prev.map(j => (j.id === selectedJournal.id ? data : j)));
      setSelectedJournal(data);
      setIsEditingJournal(false);
      toast({ title: 'Success', description: 'Journal renamed!', variant: 'default' });
    } catch {
      toast({ title: 'Error', description: 'Failed to rename journal.', variant: 'error' });
    }
  };

  const saveEntry = async () => {
    if (!entryContent.trim() || !selectedJournal || !user?.id) return;

    try {
      setLoading(true);

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
      toast({ title: 'Error', description: 'Failed to save entry.', variant: 'error' });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MainNavbar />
      {/* Header */}
      <div className="bg-[#F8F8FF] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Diary</h1>
                <p className="text-sm sm:text-base text-slate-600">Write and organize your thoughts</p>
              </div>
            </div>
            {!isWriting && (
              <Button onClick={() => setIsWriting(true)} className="bg-[#D3D3FF] hover:bg-[#BDBDFE] shadow-md">
                <Plus className="h-4 w-4 mr-2" /> New Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Journals</CardTitle>
                  <Button onClick={createJournal} size="sm" variant="outline" className="text-[#8A8AFF] border-[#D3D3FF]/50 hover:bg-[#D3D3FF]/10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && journals.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D3D3FF] mx-auto" />
                  </div>
                ) : journals.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2 font-medium">No journals yet</p>
                    <p className="text-sm text-slate-400">Create your first journal</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {journals.map((journal) => (
                      <div
                        key={journal.id}
                        className={cn(
                          'p-3 rounded-xl cursor-pointer transition-all border',
                          selectedJournal?.id === journal.id
                            ? 'bg-[#D3D3FF]/10 border-[#D3D3FF]/50 shadow-sm'
                            : 'bg-[#F8F8FF] border-transparent hover:bg-[#F0F0FF] hover:border-slate-200'
                        )}
                        onClick={() => setSelectedJournal(journal)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: journal.color }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">{journal.title}</h3>
                            <p className="text-xs text-slate-500 truncate">{journal.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">

            {isWriting ? (
              <Card className="shadow-lg border-[#D3D3FF]/30">
                <CardHeader className="bg-[#D3D3FF]/10/50 border-b border-[#D3D3FF]/30 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-rose-900">Write New Entry</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsWriting(false)}>Cancel</Button>
                      <Button
                        onClick={saveEntry}
                        disabled={!entryContent.trim() || loading}
                        className="bg-[#D3D3FF] hover:bg-[#BDBDFE] shadow-md"
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
                      className="mt-1.5 focus-visible:ring-rose-500 text-lg"
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
                        <SelectTrigger className="mt-1.5 bg-[#F8F8FF]"><SelectValue /></SelectTrigger>
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
                          className="bg-[#F8F8FF]"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} variant="secondary">Add</Button>
                      </div>
                      {entryTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entryTags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="cursor-pointer bg-[#F8F8FF] hover:bg-[#D3D3FF]/10 hover:text-rose-700 transition-colors py-1 px-2" onClick={() => removeTag(tag)}>
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
                <Card className="bg-[#F8F8FF] shadow-sm border-slate-200">
                  <CardHeader className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-5 h-5 rounded-full shadow-inner flex-shrink-0" style={{ backgroundColor: selectedJournal.color }} />
                        <div className="flex-1 min-w-0">
                          {isEditingJournal ? (
                            <div className="flex items-center gap-2 w-full md:max-w-xs">
                              <Input
                                value={editingJournalTitle}
                                onChange={(e) => setEditingJournalTitle(e.target.value)}
                                className="h-8 text-sm px-2 w-full"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveJournalTitle();
                                  if (e.key === 'Escape') setIsEditingJournal(false);
                                }}
                              />
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0" onClick={saveJournalTitle}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600 shrink-0" onClick={() => setIsEditingJournal(false)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
                              <div className="flex items-center gap-1.5">
                                <CardTitle className="text-xl truncate">{selectedJournal.title}</CardTitle>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                                  onClick={() => {
                                    setEditingJournalTitle(selectedJournal.title);
                                    setIsEditingJournal(true);
                                  }}
                                  title="Edit Journal Name"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {!isEditingJournal && <p className="text-sm text-slate-500 mt-0.5 truncate">{selectedJournal.description}</p>}
                        </div>
                      </div>
                      
                      {/* Filtering & Search */}
                      {entries.length > 0 && (
                        <div className="flex flex-1 md:max-w-md gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                              placeholder="Search entries..." 
                              className="pl-9 bg-[#F0F0FF] border-slate-200"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <Select value={filterMood} onValueChange={setFilterMood}>
                            <SelectTrigger className="w-[130px] bg-[#F0F0FF] border-slate-200">
                              <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3 text-slate-400" />
                                <span className="truncate">
                                  {filterMood === 'all' ? 'All Moods' : filterMood.charAt(0).toUpperCase() + filterMood.slice(1)}
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
                    </div>
                  </CardHeader>
                </Card>

                {entries.length === 0 ? (
                  <Card className="border-dashed border-2 bg-[#F0F0FF]/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 bg-[#F8F8FF] rounded-full shadow-sm mb-4">
                        <FileText className="h-10 w-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to start writing?</h3>
                      <p className="text-slate-500 mb-6 text-center max-w-sm">Capture your daily thoughts, track your mood, and discover AI-powered insights.</p>
                      <Button onClick={() => setIsWriting(true)} className="bg-[#D3D3FF] hover:bg-[#BDBDFE] shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Write First Entry
                      </Button>
                    </CardContent>
                  </Card>
                ) : sortedDates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No entries match your search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sortedDates.map((date) => (
                      <div key={date} className="space-y-4">
                        {/* Date Header */}
                        <div className="flex items-center gap-2">
                           <Calendar className="w-5 h-5 text-slate-400" />
                           <h3 className="font-semibold text-slate-700 text-lg">
                             {format(new Date(date), 'MMMM d, yyyy')}
                           </h3>
                        </div>

                        {/* Entries for Date */}
                        <div className="space-y-4">
                          {groupedEntries[date].map((entry) => (
                            <Card key={entry.id} className={cn("cursor-pointer hover:shadow-md transition-shadow border-l-4", getMoodBorder(entry.mood || 'neutral'))} onClick={() => setSelectedEntry(entry)}>
                              <CardHeader className="pb-3 pt-5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg font-bold text-slate-800">{entry.title || 'Untitled Entry'}</CardTitle>
                                    {entry.mood && (
                                      <Badge variant="outline" className={cn('capitalize text-[11px] px-2.5 py-0.5 border-0', getMoodColor(entry.mood))}>
                                        {entry.mood}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm font-medium text-slate-500 shrink-0">
                                    {format(new Date(entry.created_at), 'h:mm a')}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-slate-600 line-clamp-3 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                                  {entry.content.replace(/<[^>]*>/g, '')}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                  <div className="flex gap-4 text-xs font-medium text-slate-500">
                                    <span>{entry.word_count} words</span>
                                    <span>{entry.reading_time} min read</span>
                                  </div>
                                  {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex gap-1.5 overflow-hidden max-w-[50%] justify-end">
                                      {entry.tags.slice(0, 3).map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-[10px] font-normal truncate bg-slate-100 text-slate-600">{tag}</Badge>
                                      ))}
                                      {entry.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-[10px] font-normal bg-slate-100 text-slate-600">+{entry.tags.length - 3}</Badge>
                                      )}
                                    </div>
                                  )}
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
              <Card className="border-dashed border-2 bg-[#F0F0FF]/50">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="p-4 bg-[#F8F8FF] rounded-full shadow-sm mb-4">
                    <BookOpen className="h-12 w-12 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Journal</h3>
                  <p className="text-slate-500 text-center mb-6">Choose an existing journal from the sidebar or click below to create a new one.</p>
                  <Button onClick={createJournal} className="bg-[#D3D3FF] hover:bg-[#BDBDFE] shadow-md">
                    <Plus className="h-4 w-4 mr-2" /> Create New Journal
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── AGENT STATUS CARDS ────────────────────────────────── */}

            {/* 1. Analyzing */}
            {agent.status === 'loading' && (
              <Card className="border-violet-200 bg-violet-50/80 shadow-inner">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="relative flex justify-center items-center w-8 h-8">
                    <div className="absolute w-full h-full border-2 border-violet-200 rounded-full" />
                    <div className="absolute w-full h-full border-2 border-violet-600 border-t-transparent animate-spin rounded-full" />
                  </div>
                  <p className="font-medium text-violet-900">AI is analyzing your entry to generate insights…</p>
                </CardContent>
              </Card>
            )}

            {/* 2. HITL / Review — Paused OR Resuming OR Complete (if we have a review payload) */}
            {(agent.status === 'interrupted' || agent.status === 'resuming' || agent.status === 'complete') && agent.reviewPayload && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                    agent.status === 'complete' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50"
                  )} />
                  <p className="text-sm font-semibold text-slate-700 tracking-wide">
                    {agent.status === 'complete' ? "Insight finalized" : "Your AI insight is ready — review it before saving"}
                  </p>
                </div>
                <AgentReviewPanel
                  payload={agent.reviewPayload}
                  isResuming={agent.status === 'resuming'}
                  isComplete={agent.status === 'complete'}
                  result={agent.result}
                  onApprove={(edited) => agent.approve(edited)}
                  onReject={() => agent.reject()}
                />
              </div>
            )}

            {/* 4. Complete */}
            {agent.status === 'complete' && agent.result && !agent.reviewPayload && (
              <Card className={cn(
                'border shadow-md transition-all',
                agent.result.sentiment === 'positive'
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                  : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'
              )}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b pb-3 border-black/5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                       {agent.result.agentType === 'report' ? '📊 Wellness Report' : '✨ AI Insight'}
                    </p>
                    {agent.result.emailSent ? (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        📧 Delivered
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {agent.result.response
                      ?.split('\n')
                      .filter((l) => l.trim())
                      .map((para, i) => (
                        <p key={i} className="text-[15px] text-slate-800 leading-relaxed font-medium">{para}</p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. Error */}
            {agent.status === 'error' && agent.error && (
              <Card className="border-red-200 bg-red-50 shadow-sm">
                <CardContent className="pt-4 flex flex-col items-start">
                  <p className="text-sm font-medium text-red-800 mb-1">Issue connecting to Agent</p>
                  <p className="text-xs text-red-600 mb-3">{agent.error}</p>
                  <Button onClick={() => agent.reset()} variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-100">
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
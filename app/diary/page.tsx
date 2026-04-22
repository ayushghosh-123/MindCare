'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BookOpen, Plus, Calendar, FileText, Search, Filter, Pencil, X, Check, Trash2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dbHelpers, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { RichTextEditor } from '@/components/journal/rich-text-editor';

import { useDiary } from '@/components/journal/DiaryContext';
import { useAgent } from '@/components/hooks/use-agent';
import { AgentReviewPanel } from '@/components/journal/AgentReviewPanel';
import { motion, AnimatePresence } from 'framer-motion';

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
      excellent: 'bg-green-50 text-green-700 border-green-200',
      good: 'bg-blue-50 text-blue-700 border-blue-200',
      neutral: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      poor: 'bg-orange-50 text-orange-700 border-orange-200',
      terrible: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodBorder = (mood: string) => {
    const borders: Record<string, string> = {
      excellent: 'border-l-green-500',
      good: 'border-l-blue-500',
      neutral: 'border-l-indigo-500',
      poor: 'border-l-orange-500',
      terrible: 'border-l-red-500',
    };
    return borders[mood] || 'border-l-slate-300';
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f559a]" />
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
    <div className="container mx-auto px-4 sm:px-6 pt-10 pb-20 max-w-5xl text-slate-800">
      <div className="space-y-12">
        {isWriting ? (
          <div className="rounded-[1.5rem] sm:rounded-[3rem] bg-white/80 backdrop-blur-xl shadow-2xl shadow-[#2C2A4A]/5 overflow-hidden relative border-none animate-in fade-in zoom-in duration-500">
            
            <div className="bg-[#f9f9f9]/80 px-4 sm:px-8 py-4 sm:py-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] text-[#5f559a] tracking-tight">New Reflection</h3>
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                  <button onClick={() => setIsWriting(false)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 font-bold text-[#484550] rounded-full hover:bg-[#f3f3f3] transition-all text-sm">Cancel</button>
                  <button
                    onClick={saveEntry}
                    disabled={!entryContent.trim() || loading}
                    className="flex-1 sm:flex-none bg-[#5f559a] text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-full font-bold flex items-center justify-center shadow-lg shadow-[#5f559a]/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Save
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-10 relative z-10 bg-white/40">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="entry-title" className="text-[#5f559a]/60 uppercase tracking-[0.2em] font-black text-[10px] px-2">The Focus</Label>
                <Input
                  id="entry-title"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Session name..."
                  className="mt-2 text-xl sm:text-2xl font-bold border-none bg-[#f3f3f3] rounded-xl sm:rounded-2xl shadow-inner h-14 sm:h-16 px-4 sm:px-6 focus-visible:ring-0 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[#5f559a]/60 uppercase tracking-[0.2em] font-black text-[10px] px-2">The Depths</Label>
                <div className="mt-2 bg-[#f3f3f3] rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-inner min-h-[300px] sm:min-h-[400px]">
                  <RichTextEditor
                    content={entryContent}
                    onChange={setEntryContent}
                    placeholder="Let it all out..."
                    className="border-none bg-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                <div className="bg-white/60 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-3 sm:space-y-4">
                  <Label className="text-[#5f559a]/60 uppercase tracking-[0.2em] font-black text-[10px] px-2">Energy</Label>
                  <Select value={entryMood} onValueChange={(v: typeof entryMood) => setEntryMood(v)}>
                    <SelectTrigger className="h-12 sm:h-14 bg-[#f3f3f3] border-none rounded-xl sm:rounded-2xl font-bold text-[#1a1c1c] focus:ring-0 text-sm">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-none rounded-xl sm:rounded-2xl shadow-2xl bg-white p-2">
                      <SelectItem value="excellent" className="font-bold cursor-pointer rounded-xl py-3 focus:bg-[#bdb2ff]/20">Feeling Radiant</SelectItem>
                      <SelectItem value="good" className="font-bold cursor-pointer rounded-xl py-3 focus:bg-[#bdb2ff]/20">Good Energy</SelectItem>
                      <SelectItem value="neutral" className="font-bold cursor-pointer rounded-xl py-3 focus:bg-[#bdb2ff]/20">Equilibrium</SelectItem>
                      <SelectItem value="poor" className="font-bold cursor-pointer rounded-xl py-3 focus:bg-[#bdb2ff]/20">Low Vibration</SelectItem>
                      <SelectItem value="terrible" className="font-bold cursor-pointer rounded-xl py-3 focus:bg-[#bdb2ff]/20">Deep Turmoil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-white/60 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm space-y-3 sm:space-y-4">
                  <Label className="text-[#5f559a]/60 uppercase tracking-[0.2em] font-black text-[10px] px-2">Themes</Label>
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Zen, Focus..."
                      className="bg-[#f3f3f3] h-12 sm:h-14 border-none rounded-xl sm:rounded-2xl shadow-inner font-bold text-[#1a1c1c] focus-visible:ring-0 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button onClick={addTag} className="px-6 sm:px-8 font-black text-[10px] uppercase tracking-widest text-white bg-[#5f559a] rounded-xl sm:rounded-2xl hover:scale-105 transition-all shadow-lg">Map</button>
                  </div>
                  {entryTags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-4 pt-4">
                       {entryTags.map((tag, i) => (
                         <div key={i} className="flex items-center gap-2 bg-[#bdb2ff] text-[#1b0c53] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider relative group">
                           {tag} 
                           <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-full p-0.5 ml-1">
                             <X size={12} strokeWidth={3} />
                           </button>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : selectedJournal ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Card - More Classic Pro style */}
            <div 
              className="relative rounded-[1.5rem] sm:rounded-[2rem] border-none transition-all duration-700 p-6 sm:p-8 md:p-12 min-h-[200px] sm:min-h-[250px] flex flex-col justify-center overflow-hidden shadow-xl shadow-[#2C2A4A]/5 group"
              style={{ backgroundColor: selectedJournal.color || '#e5deff' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:bg-white/30 transition-all duration-1000" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
                <div className="flex-1 min-w-0 space-y-6">
                  {isEditingJournal ? (
                    <div className="flex items-center gap-2 sm:gap-4 w-full md:max-w-xl">
                      <Input
                         value={editingJournalTitle}
                         onChange={(e) => setEditingJournalTitle(e.target.value)}
                         className="h-16 sm:h-20 text-2xl sm:text-4xl md:text-5xl font-black px-6 sm:px-8 bg-white/80 border-none rounded-2xl sm:rounded-3xl shadow-2xl text-[#1a1c1c] focus-visible:ring-0"
                         autoFocus
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') saveJournalTitle();
                           if (e.key === 'Escape') setIsEditingJournal(false);
                         }}
                      />
                      <div className="flex flex-col gap-2">
                        <button className="p-3 rounded-2xl bg-white shadow-xl hover:scale-110 active:scale-95 transition-all text-green-500" onClick={saveJournalTitle}>
                          <Check className="w-6 h-6 stroke-[3]" />
                        </button>
                        <button className="p-3 rounded-2xl bg-white shadow-xl hover:scale-110 active:scale-95 transition-all text-red-500" onClick={() => setIsEditingJournal(false)}>
                          <X className="w-6 h-6 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-[#1b0c53] leading-none drop-shadow-sm font-['Plus_Jakarta_Sans']">
                          {selectedJournal.title}
                        </h2>
                        <button 
                          className="w-fit p-3 sm:p-4 rounded-full bg-white/40 hover:bg-white/80 shadow-sm hover:scale-110 active:rotate-12 transition-all text-[#1b0c53]"
                          onClick={() => {
                            setEditingJournalTitle(selectedJournal.title);
                            setIsEditingJournal(true);
                          }}
                        >
                          <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                      <p className="text-lg sm:text-xl text-[#1b0c53]/70 font-medium max-w-2xl leading-relaxed italic pr-0 sm:pr-12">
                        {selectedJournal.description || 'Holding space for your thoughts, one entry at a time.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0 pt-2">
                   <button
                    onClick={() => deleteJournal(selectedJournal.id)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2C2A4A]/10 hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest text-[#2C2A4A] shadow-sm active:scale-90"
                   >
                    <Trash2 size={16} strokeWidth={3} />
                    <span>Purge Journal</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filtering & Search Section */}
            <div className="px-4">
                  {entries.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative flex-1 group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5f559a]/40 group-focus-within:text-[#5f559a] transition-colors" />
                        <Input 
                          placeholder="Search through history..." 
                          className="pl-16 h-16 bg-[#f3f3f3] border-none rounded-[2rem] shadow-inner font-bold text-lg focus-visible:ring-0 placeholder:text-[#5f559a]/30"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <span className="text-xs font-black uppercase tracking-widest text-[#5f559a]/40 whitespace-nowrap hidden lg:block">Polarity:</span>
                        <Select value={filterMood} onValueChange={setFilterMood}>
                          <SelectTrigger className="w-full md:w-[240px] h-16 bg-[#f3f3f3] border-none rounded-[2rem] shadow-inner font-bold text-lg text-[#1a1c1c] focus:ring-0">
                            <div className="flex items-center gap-3">
                              <Filter className="w-5 h-5 text-[#5f559a]/40" />
                              <span>{filterMood === 'all' ? 'All Frequencies' : filterMood}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="border-none rounded-2xl shadow-2xl p-2">
                            <SelectItem value="all" className="font-bold py-3">All Frequencies</SelectItem>
                            <SelectItem value="excellent" className="font-bold py-3">Feeling Radiant</SelectItem>
                            <SelectItem value="good" className="font-bold py-3">Good Energy</SelectItem>
                            <SelectItem value="neutral" className="font-bold py-3">Equilibrium</SelectItem>
                            <SelectItem value="poor" className="font-bold py-3">Low Vibration</SelectItem>
                            <SelectItem value="terrible" className="font-bold py-3">Deep Turmoil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
            </div>

            {entries.length === 0 && !loading ? (
              <div className="bg-[#f3f3f3] rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-20 text-center shadow-inner mt-10">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl shadow-[#bdb2ff]/40 mb-8 sm:mb-10 relative animate-bounce duration-[3000ms]">
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-[#bdb2ff]" />
                    <div className="absolute inset-0 bg-[#bdb2ff] rounded-full animate-ping opacity-10"></div>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black font-['Plus_Jakarta_Sans'] text-[#1b0c53] mb-4 sm:mb-6 tracking-tight">The ink is waiting.</h3>
                  <p className="text-[#484550] font-medium text-lg sm:text-xl mb-8 sm:mb-12 max-w-sm mx-auto opacity-70">Every great transformation begins with a single honest thought.</p>
                  <button onClick={() => setIsWriting(true)} className="bg-[#5f559a] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black text-base sm:text-lg shadow-2xl shadow-[#5f559a]/40 hover:scale-105 active:scale-95 transition-all">
                    Initialize Reflection
                  </button>
              </div>
            ) : (
              <div className="space-y-16">
                {sortedDates.map((date, i) => (
                  <div key={date} className="space-y-8">
                    <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6 pl-2 sm:pl-4">
                       <span className="hidden sm:block text-xs font-black text-[#5f559a]/40 uppercase tracking-[0.4em] transform -rotate-90 origin-left translate-y-8 select-none">Temporal Marker</span>
                       <h3 className="text-xl sm:text-2xl font-black text-[#1b0c53] tracking-tighter bg-[#bdb2ff]/20 px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-sm">{format(new Date(date), 'MMMM d, yyyy')}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      {groupedEntries[date].map((entry) => (
                        <div 
                          key={entry.id} 
                          className="group cursor-pointer hover:translate-x-2 transition-all duration-500 bg-white shadow-xl shadow-[#2C2A4A]/5 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden p-6 sm:p-8 relative border-none"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="absolute top-0 left-0 w-2 h-full bg-[#bdb2ff]/30 group-hover:w-4 group-hover:bg-[#bdb2ff] transition-all" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="space-y-2 sm:space-y-3">
                              <h4 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] font-['Plus_Jakarta_Sans'] leading-tight tracking-tight group-hover:text-[#5f559a] transition-colors">{entry.title || 'Untitled Session'}</h4>
                              {entry.mood && (
                                <span className="inline-block uppercase tracking-[0.2em] font-black text-[8px] sm:text-[9px] px-3 sm:px-4 py-1.5 bg-[#f3f3f3] text-[#5f559a] rounded-full shadow-inner">
                                  Polarity: {entry.mood}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-xs font-black text-[#484550]/40 uppercase tracking-widest whitespace-nowrap pt-1 sm:pt-2">{format(new Date(entry.created_at), 'h:mm a')}</span>
                          </div>
                          <div className="px-2">
                            <p className="text-[#484550] font-medium leading-relaxed line-clamp-2 text-lg sm:text-xl opacity-80 mb-6 sm:mb-8">
                              {entry.content.replace(/<[^>]*>/g, '')}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest pt-4 border-t border-[#f3f3f3]">
                              <div className="flex gap-3">
                                <span className="bg-[#f3f3f3] px-3 sm:px-4 py-2 rounded-full text-[#484550]/60">{entry.word_count} Tokens</span>
                                <span className="bg-[#f3f3f3] px-3 sm:px-4 py-2 rounded-full text-[#484550]/60">{entry.reading_time} Min Processing</span>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:ml-auto">
                                {entry.tags?.slice(0, 3).map((t, idx) => (
                                  <span key={idx} className="bg-[#bdb2ff] text-[#1b0c53] px-3 sm:px-4 py-2 rounded-full shadow-sm">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#f3f3f3] rounded-[2rem] sm:rounded-[4rem] p-12 sm:p-32 text-center flex flex-col items-center shadow-inner min-h-[400px] sm:min-h-[600px] justify-center relative overflow-hidden">
             {/* Signature Design Detail */}
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-[#bdb2ff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-[#bdb2ff]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full shadow-2xl flex items-center justify-center mb-8 sm:mb-12 relative animate-pulse duration-[4000ms]">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-[#5f559a]" strokeWidth={1.5} />
              <div className="absolute -top-4 -right-6 sm:-right-8 bg-[#bdb2ff] text-[#1b0c53] text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 sm:px-6 py-2 rounded-full shadow-xl rotate-12 scale-110">
                Awaiting
              </div>
            </div>
            <h3 className="text-3xl sm:text-5xl font-black font-['Plus_Jakarta_Sans'] text-[#1b0c53] mb-4 sm:mb-8 tracking-tighter leading-none">Select a Core Journal.</h3>
            <p className="text-lg sm:text-xl font-medium text-[#484550] leading-relaxed max-w-md opacity-60 italic">Your mental digital archive is sorted and ready for exploration.</p>
          </div>
        )}

        {/* AI AGENT STATUS CARDS */}
        {agent.status === 'loading' && (
          <div className="fixed bottom-24 right-8 z-[100] bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-[#bdb2ff]/30 px-10 py-6 flex items-center gap-6 animate-in slide-in-from-right-10 duration-500">
            <div className="w-10 h-10 border-[6px] border-[#bdb2ff] border-r-transparent rounded-full animate-spin" />
            <div>
              <p className="text-[10px] font-black text-[#5f559a]/40 uppercase tracking-[0.2em] mb-1">Active Reasoning</p>
              <p className="text-lg font-black text-[#1b0c53] font-['Plus_Jakarta_Sans']">Parsing Nuance...</p>
            </div>
          </div>
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
          <div className="glass-card rounded-3xl border-none shadow-md p-6 lg:p-8 relative mt-10">
            <div className="absolute -top-4 -left-4 bg-[#e5deff] border border-white/80 rounded-full px-5 py-2 text-sm font-bold text-[#5f559a] shadow-sm flex items-center gap-2">
              ✨ AI Insight Generated
            </div>
            <div className="text-lg font-medium tracking-wide text-slate-800 leading-relaxed whitespace-pre-wrap mt-4">{agent.result.response}</div>
          </div>
        )}
      </div>
    </div>
  );
}
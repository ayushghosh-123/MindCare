'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BookOpen, Plus, Calendar, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MainNavbar } from '@/components/main-navbar';
import { dbHelpers, type Journal, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { RichTextEditor } from '@/components/rich-text-editor';

// ── NEW: Agent imports ────────────────────────────────────────────────────────
import { useAgent } from '@/components/hooks/use-agent';
import { AgentReviewPanel } from '@/components/journal/AgentReviewPanel';

export default function DiaryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // ── NEW: Agent hook ───────────────────────────────────────────────────────
  const agent = useAgent();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [_selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);

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

  // ── UPDATED: saveEntry now fires the agent after saving ───────────────────
  const saveEntry = async () => {
    if (!entryContent.trim() || !selectedJournal || !user?.id) return;

    try {
      setLoading(true);

      const wordCount = entryContent.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Step 1: Save to Supabase (unchanged from your original)
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

      // Reset form and close writing mode
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

      // Step 2: Fire agent — this triggers the full pipeline:
      // main_agent → journaling_agent → sentiment → diagnosis → response
      // → evaluate_agent → interrupt() [HITL] → email_agent
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!user) { router.push('/sign-in'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MainNavbar />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Diary</h1>
                <p className="text-sm sm:text-base text-slate-600">Write and organize your thoughts</p>
              </div>
            </div>
            {!isWriting && (
              <Button onClick={() => setIsWriting(true)} className="bg-rose-600 hover:bg-rose-700">
                <Plus className="h-4 w-4 mr-2" /> New Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Journals</CardTitle>
                  <Button onClick={createJournal} size="sm" className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600 mx-auto" />
                  </div>
                ) : journals.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No journals yet</p>
                    <p className="text-sm text-slate-400">Create your first journal</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {journals.map((journal) => (
                      <div
                        key={journal.id}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-colors',
                          selectedJournal?.id === journal.id
                            ? 'bg-rose-50 border border-rose-200'
                            : 'hover:bg-slate-50'
                        )}
                        onClick={() => setSelectedJournal(journal)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: journal.color }} />
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800">{journal.title}</h3>
                            <p className="text-sm text-slate-500">{journal.description}</p>
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
          <div className="lg:col-span-2 space-y-4">

            {isWriting ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Write New Entry</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsWriting(false)}>Cancel</Button>
                      <Button
                        onClick={saveEntry}
                        disabled={!entryContent.trim() || loading}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        <Save className="h-4 w-4 mr-2" /> Save Entry
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="entry-title">Entry Title</Label>
                    <Input
                      id="entry-title"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      placeholder="What's on your mind today?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                      content={entryContent}
                      onChange={setEntryContent}
                      placeholder="Start writing your thoughts, feelings, and experiences..."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Mood</Label>
                      <Select value={entryMood} onValueChange={(v: typeof entryMood) => setEntryMood(v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                      <Label>Tags</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag..."
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} size="sm">Add</Button>
                      </div>
                      {entryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entryTags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : selectedJournal ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedJournal.color }} />
                    <div>
                      <CardTitle>{selectedJournal.title}</CardTitle>
                      <p className="text-sm text-slate-600">{selectedJournal.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entries.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No entries yet</p>
                      <Button onClick={() => setIsWriting(true)} className="bg-rose-600 hover:bg-rose-700">
                        <Plus className="h-4 w-4 mr-2" /> Write First Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {entries.map((entry) => (
                        <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEntry(entry)}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-lg">{entry.title || 'Untitled Entry'}</CardTitle>
                                {entry.mood && (
                                  <Badge variant="outline" className={cn('hidden sm:inline-flex', getMoodColor(entry.mood))}>
                                    {entry.mood}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(entry.created_at), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-700 line-clamp-3 mb-3">
                              {entry.content.replace(/<[^>]*>/g, '')}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-4 text-sm text-slate-500">
                                <span>{entry.word_count} words</span>
                                <span>{entry.reading_time} min read</span>
                              </div>
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.tags.slice(0, 3).map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                                  ))}
                                  {entry.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">+{entry.tags.length - 3}</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Journal</h3>
                  <p className="text-slate-600 text-center mb-4">Choose a journal or create a new one.</p>
                  <Button onClick={createJournal} className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="h-4 w-4 mr-2" /> Create New Journal
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── AGENT STATUS CARDS (NEW) ────────────────────────────────── */}

            {/* 1. Analyzing */}
            {agent.status === 'loading' && (
              <Card className="border-violet-200 bg-violet-50">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-600">AI is analyzing your entry…</p>
                </CardContent>
              </Card>
            )}

            {/* 2. HITL / Review — Paused OR Resuming OR Complete (if we have a review payload) */}
            {(agent.status === 'interrupted' || agent.status === 'resuming' || agent.status === 'complete') && agent.reviewPayload && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    agent.status === 'complete' ? "bg-emerald-400" : "bg-amber-400"
                  )} />
                  <p className="text-sm font-medium text-slate-600">
                    {agent.status === 'complete' ? "Your report has been delivered" : "Your AI insight is ready — review it before it gets emailed to you"}
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


            {/* 4. Complete — Already handled by the persistent ReviewPanel above if reviewPayload exists */}
            {agent.status === 'complete' && agent.result && !agent.reviewPayload && (
              <Card className={cn(
                'border',
                agent.result.sentiment === 'positive'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-violet-50 border-violet-200'
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {agent.result.agentType === 'report' ? '📊 Wellness Report' : '💬 Your Insight'}
                    </p>
                    {agent.result.emailSent ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                        📧 Email sent to {agent.result.email}
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                        No email sent
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {agent.result.response
                      ?.split('\n')
                      .filter((l) => l.trim())
                      .map((para, i) => (
                        <p key={i} className="text-sm text-slate-700 leading-relaxed">{para}</p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. Error */}
            {agent.status === 'error' && agent.error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-red-600">{agent.error}</p>
                  <button onClick={() => agent.reset()} className="text-xs text-red-500 underline mt-1">
                    Try again
                  </button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { dbHelpers, type Journal, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';

interface DiaryContextType {
  journals: Journal[];
  selectedJournal: Journal | null;
  setSelectedJournal: (journal: Journal | null) => void;
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  loading: boolean;
  isWriting: boolean;
  setIsWriting: (writing: boolean) => void;
  refreshJournals: () => Promise<void>;
  loadJournalEntries: (journalId: string) => Promise<void>;
  deleteJournal: (journalId: string) => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);

  const loadJournals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserJournals(user.id);
      if (error) throw error;
      setJournals(data || []);
      // Auto-select first journal if none selected
      if (data && data.length > 0 && !selectedJournal) {
        setSelectedJournal(data[0]);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load journals.' });
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
      toast({ title: 'Error', description: 'Failed to load entries.' });
    }
  };

  const deleteJournal = async (journalId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this journal and all its entries?')) return;
      
      const { success, error } = await dbHelpers.deleteJournal(journalId);
      if (error) throw error;
      
      if (success) {
        toast({ title: 'Success', description: 'Journal deleted.' });
        await loadJournals();
        if (selectedJournal?.id === journalId) {
          setSelectedJournal(null);
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete journal.' });
    }
  };

  useEffect(() => {
    if (isLoaded && user) loadJournals();
  }, [isLoaded, user]);

  useEffect(() => {
    if (selectedJournal) loadJournalEntries(selectedJournal.id);
  }, [selectedJournal]);

  const value = {
    journals,
    selectedJournal,
    setSelectedJournal,
    entries,
    setEntries,
    loading,
    isWriting,
    setIsWriting,
    refreshJournals: loadJournals,
    loadJournalEntries,
    deleteJournal,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
}

// STEP 25 — hooks/use-journal.ts
// Saves a journal entry to Supabase then fires the agent.
// The agent hook handles everything after that (HITL, email, etc).
// Used by app/diary/page.tsx.

import { useState, useCallback } from "react";
import { dbHelpers, JournalEntry } from "@/lib/supabase";
import { useAgent } from "./use-agent";

interface SubmitParams {
  journalId: string;
  userId: string;
  content: string;
  mood?: JournalEntry["mood"];
  tags?: string[];
}

interface UseJournalReturn {
  submitEntry: (params: SubmitParams) => Promise<JournalEntry | null>;
  loadEntries: (journalId: string) => Promise<void>;
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  agent: ReturnType<typeof useAgent>; // exposed so diary page can render AgentReviewPanel
}

export function useJournal(): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agent = useAgent();

  const submitEntry = useCallback(
    async ({
      journalId,
      userId,
      content,
      mood,
      tags,
    }: SubmitParams): Promise<JournalEntry | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const wordCount = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // ~200 wpm

        // 1. Save to Supabase immediately
        const { data: entry, error: dbError } = await dbHelpers.createJournalEntry({
          journal_id: journalId,
          user_id: userId,
          content,
          mood,
          tags,
          is_private: true,
          word_count: wordCount,
          reading_time: readingTime,
        });

        if (dbError) throw new Error(String(dbError));

        // Optimistic UI update
        if (entry) setEntries((prev) => [entry, ...prev]);

        // 2. Fire agent (async — updates status via agent state)
        await agent.invoke({
          userMessage: content,
          sessionId: crypto.randomUUID(),
          journalEntry: {
            journal_id: journalId,
            user_id: userId,
            content,
            mood,
            tags,
            word_count: wordCount,
            reading_time: readingTime,
            is_private: true,
          },
        });

        return entry ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save entry");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [agent]
  );

  const loadEntries = useCallback(async (journalId: string) => {
    setIsLoading(true);
    const { data, error: dbError } = await dbHelpers.getJournalEntries(journalId);
    if (dbError) setError(String(dbError));
    else setEntries(data ?? []);
    setIsLoading(false);
  }, []);

  return { submitEntry, loadEntries, entries, isLoading, error, agent };
}
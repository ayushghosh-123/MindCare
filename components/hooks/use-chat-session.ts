// STEP 26 — hooks/use-chat-sessions.ts
// Manages the full session list shown in the ChatSidebar.
// Creates, renames, deletes, and searches sessions.
// Uses optimistic updates for instant UI feedback.

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatSession } from "@/lib/supabase-chat";

interface UseChatSessionsReturn {
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  createSession: (name: string, agentType?: ChatSession["agent_type"]) => Promise<ChatSession | null>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  searchSessions: (query: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export function useChatSessions(): UseChatSessionsReturn {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions on mount
  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/chat/sessions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load sessions");
      const { sessions: data } = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    refreshSessions(); 
    
    // Listen for events from ChatWindow auto-creating a session
    const handleRefresh = () => refreshSessions();
    window.addEventListener("refresh-chat-sessions", handleRefresh);
    return () => window.removeEventListener("refresh-chat-sessions", handleRefresh);
  }, [refreshSessions]);

  // Create new session
  const createSession = useCallback(
    async (
      name: string,
      agentType?: ChatSession["agent_type"]
    ): Promise<ChatSession | null> => {
      try {
        const token = await getToken();
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({ name, agentType }),
        });
        if (!res.ok) throw new Error("Failed to create session");
        const { session } = await res.json();
        setSessions((prev) => [session, ...prev]); // optimistic prepend
        return session;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create error");
        return null;
      }
    },
    []
  );

  // Rename with optimistic update
  const renameSession = useCallback(
    async (sessionId: string, name: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, name } : s))
      );
      try {
        const token = await getToken();
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error("Rename failed");
      } catch (err) {
        await refreshSessions(); // revert on failure
        setError(err instanceof Error ? err.message : "Rename error");
      }
    },
    [refreshSessions]
  );

  // Delete with optimistic remove
  const deleteSession = useCallback(
    async (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      try {
        const token = await getToken();
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Delete failed");
      } catch (err) {
        await refreshSessions(); // revert on failure
        setError(err instanceof Error ? err.message : "Delete error");
      }
    },
    [refreshSessions]
  );

  // Search sessions by name
  const searchSessions = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/chat/sessions/search?q=${encodeURIComponent(query)}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Search failed");
      const { sessions: data } = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    createSession,
    renameSession,
    deleteSession,
    searchSessions,
    refreshSessions,
  };
}
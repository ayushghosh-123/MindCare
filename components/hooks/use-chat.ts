import { Chat } from './../../lib/supabase';
// STEP 27 — hooks/use-chat.ts
// Manages the active chat session — loading, sending messages, and resume.
// Works with use-agent for HITL support inside the chat window.

import { useState, useCallback } from "react";
import { ChatSession, SessionWithMessages } from "@/lib/supabase-chat";
import { useAgent } from "./use-agent";

interface UseChatReturn {
  activeSession: ChatSession | null;
  messages: Chat[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  loadSession: (sessionId: string) => Promise<void>;  // resume an existing session
  startNewSession: (session: ChatSession) => void;    // begin a fresh session
  sendMessage: (text: string) => Promise<void>;
  agent: ReturnType<typeof useAgent>;                 // exposed for HITL panel in ChatWindow
}

export function useChat(): UseChatReturn {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agent = useAgent();

  // ── Load / Resume existing session ───────────────────────────────────────
  const loadSession = useCallback(
    async (sessionId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`);
        if (!res.ok) throw new Error("Failed to load session");

        const { session }: { session: SessionWithMessages } = await res.json();
        setActiveSession(session);
        setMessages(session.messages);
        agent.reset(); // clear any previous agent state
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load error");
      } finally {
        setIsLoading(false);
      }
    },
    [agent]
  );

  // ── Start a brand new session ─────────────────────────────────────────────
  const startNewSession = useCallback(
    (session: ChatSession) => {
      setActiveSession(session);
      setMessages([]);
      setError(null);
      agent.reset();
    },
    [agent]
  );

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeSession || !text.trim()) return;

      setIsSending(true);

      // Optimistic message bubble — appears instantly before DB confirms
      const optimistic: Chat = {
        id: crypto.randomUUID(),
        user_id: activeSession.user_id,
        session_id: activeSession.id,
        message: text,
        is_user_message: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        // Fire agent — chatNode saves both messages to DB
        await agent.invoke({
          userMessage: text,
          sessionId: activeSession.id,
        });

        // After agent completes, reload messages from DB to get AI response
        if (agent.status !== "interrupted") {
          const res = await fetch(`/api/chat/sessions/${activeSession.id}`);
          const { session }: { session: SessionWithMessages } = await res.json();
          setMessages(session.messages);
          setActiveSession((prev) =>
            prev
              ? {
                  ...prev,
                  message_count: session.message_count,
                  last_message: session.last_message,
                }
              : prev
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Send error");
      } finally {
        setIsSending(false);
      }
    },
    [activeSession, agent]
  );

  return {
    activeSession,
    messages,
    isLoading,
    isSending,
    error,
    loadSession,
    startNewSession,
    sendMessage,
    agent,
  };
}
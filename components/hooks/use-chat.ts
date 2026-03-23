import { Chat } from './../../lib/supabase';
import { useState, useCallback, useEffect, useRef } from "react";
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
      if (!text.trim()) return;

      setIsSending(true);
      setError(null);

      let currentSession = activeSession;

      // Auto-create session if none is active
      if (!currentSession) {
        try {
          const res = await fetch("/api/chat/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: text.slice(0, 30) + (text.length > 30 ? "..." : ""), agentType: "chat" }),
          });
          if (!res.ok) throw new Error("Failed to create session");
          const { session } = await res.json();
          currentSession = session;
          setActiveSession(session);
          
          // Tell the sidebar to refresh its list
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("refresh-chat-sessions"));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to create new chat.");
          setIsSending(false);
          return;
        }
      }

      if (!currentSession) return; // TypeScript safety check

      // Optimistic message bubble — appears instantly before DB confirms
      const optimistic: Chat = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        user_id: currentSession.user_id,
        session_id: currentSession.id,
        message: text,
        is_user_message: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        // Fire agent — chatNode saves both messages to DB
        await agent.invoke({
          userMessage: text,
          sessionId: currentSession.id,
        });

        // After agent completes, reload messages from DB to get AI response
        if (agent.status !== "interrupted") {
          const res = await fetch(`/api/chat/sessions/${currentSession.id}`);
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
  
  // ── Sync messages after agent completes (e.g. after HITL approval) ────────
  // We use a ref to prevent infinite loops when the agent status is "complete"
  const lastProcessedRef = useRef("");
  
  useEffect(() => {
    const processKey = `${activeSession?.id}-${agent.status}`;
    
    if (agent.status === "complete" && activeSession && lastProcessedRef.current !== processKey) {
      const reload = async () => {
        lastProcessedRef.current = processKey;
        const res = await fetch(`/api/chat/sessions/${activeSession.id}`);
        if (res.ok) {
           const { session }: { session: SessionWithMessages } = await res.json();
           setMessages(session.messages);
        }
      };
      reload();
    }
    
    // Reset the ref if we move away from complete (e.g. new message starts)
    if (agent.status !== "complete") {
      lastProcessedRef.current = "";
    }
  }, [agent.status, activeSession]);

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
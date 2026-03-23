// STEP 20 — lib/supabase-chat.ts
// Chat session CRUD helpers.
// Each named session stores user_id, name, message_count, last_message preview.
// Powers the sidebar in the chatbot page and the resume feature.

import { supabase, supabaseAdmin, Chat } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChatSession = {
  id: string;
  user_id: string;
  name: string;              // "Morning Check-in", "Anxious Day", etc.
  summary?: string;          // AI-generated 1-line summary (optional)
  agent_type?: "journaling" | "chat" | "data" | "report";
  message_count: number;
  last_message?: string;     // preview shown in sidebar
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionWithMessages = ChatSession & {
  messages: Chat[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const chatSessionHelpers = {

  // Create a new named session
  async createSession(
    userId: string,
    name: string,
    agentType?: ChatSession["agent_type"]
  ): Promise<ChatSession | null> {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .insert([{ user_id: userId, name, agent_type: agentType }])
      .select()
      .single();

    if (error) { console.error("[chatSession] createSession:", error); return null; }
    return data;
  },

  // Get all sessions for a user, sorted by most recently updated
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (error) { console.error("[chatSession] getUserSessions:", error); return []; }
    return data ?? [];
  },

  // Get a single session by ID
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) { console.error("[chatSession] getSession:", error); return null; }
    return data;
  },

  // Get session + all messages (used for resume)
  async getSessionWithMessages(sessionId: string): Promise<SessionWithMessages | null> {
    const session = await chatSessionHelpers.getSession(sessionId);
    if (!session) return null;

    const { data: messages, error } = await supabaseAdmin
      .from("chats")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) { console.error("[chatSession] getSessionWithMessages:", error); return null; }
    return { ...session, messages: messages ?? [] };
  },

  // Rename a session
  async renameSession(sessionId: string, name: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("chat_sessions")
      .update({ name })
      .eq("id", sessionId);

    if (error) { console.error("[chatSession] renameSession:", error); return false; }
    return true;
  },

  // Soft-delete (sets is_active = false, keeps data)
  async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("chat_sessions")
      .update({ is_active: false })
      .eq("id", sessionId);

    if (error) { console.error("[chatSession] deleteSession:", error); return false; }
    return true;
  },

  // Update progress after each message — increments count and updates preview
  async updateSessionProgress(
    sessionId: string,
    lastMessage: string,
    summary?: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc("increment_session_message_count", {
      session_id_param: sessionId,
      last_message_param: lastMessage.slice(0, 120),
      summary_param: summary ?? null,
    });

    if (error) {
      // Fallback: manual update if RPC not available
      await supabaseAdmin
        .from("chat_sessions")
        .update({ last_message: lastMessage.slice(0, 120) })
        .eq("id", sessionId);
    }
  },

  // Search sessions by name
  async searchSessions(userId: string, query: string): Promise<ChatSession[]> {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) { console.error("[chatSession] searchSessions:", error); return []; }
    return data ?? [];
  },
};
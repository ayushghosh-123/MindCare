// STEP 31 — components/chat/ChatSidebar.tsx
// Shows all named sessions. Handles create, rename, delete, and search.
// Clicking a session calls onSelectSession which loads its full history.

"use client";
import { useState } from "react";
import { ChatSession } from "@/lib/supabase-chat";
import { useChatSessions } from "@/hooks/use-chat-sessions";

interface ChatSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: (session: ChatSession) => void;
}

const AGENT_EMOJI: Record<string, string> = {
  journaling: "📔",
  chat: "💬",
  data: "📊",
  report: "📋",
};

export function ChatSidebar({
  activeSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  const {
    sessions,
    isLoading,
    createSession,
    renameSession,
    deleteSession,
    searchSessions,
  } = useChatSessions();

  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    await searchSessions(q);
  }

  async function handleCreate() {
    const name = newName.trim() || "New Chat";
    const session = await createSession(name, "chat");
    if (session) {
      onNewSession(session);
      setNewName("");
      setShowNewInput(false);
    }
  }

  async function handleRename(sessionId: string) {
    if (!renameValue.trim()) return;
    await renameSession(sessionId, renameValue.trim());
    setRenamingId(null);
  }

  return (
    <aside className="w-72 h-full bg-gray-50 border-r border-gray-200 flex flex-col">

      {/* Header + search */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Conversations</h2>
        <input
          type="text"
          placeholder="Search chats…"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      {/* New session */}
      <div className="p-3 border-b border-gray-100">
        {showNewInput ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Session name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNewInput(false);
              }}
              className="flex-1 text-sm border border-violet-300 rounded-lg px-3 py-1.5 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="w-full text-sm text-violet-600 border border-violet-200 rounded-lg py-2 hover:bg-violet-50 transition font-medium"
          >
            + New Chat
          </button>
        )}
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
            <p className="p-4 text-sm text-gray-400 text-center">Loading…</p>
        ) : sessions.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">No chats yet. Start one!</p>
        ) : (
            sessions.map((session: ChatSession) => (
                <div
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className={`group px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-white transition ${
                        activeSessionId === session.id
                            ? "bg-white border-l-2 border-l-violet-500"
                            : ""
                    }`}
                >
                    {renamingId === session.id ? (
                        <div
                            className="flex gap-1"
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        >
                            <input
                                autoFocus
                                type="text"
                                value={renameValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") handleRename(session.id);
                                    if (e.key === "Escape") setRenamingId(null);
                                }}
                                className="flex-1 text-sm border border-violet-300 rounded px-2 py-1 focus:outline-none"
                            />
                            <button
                                onClick={() => handleRename(session.id)}
                                className="text-xs text-violet-600 font-medium"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                    {AGENT_EMOJI[session.agent_type ?? "chat"]} {session.name}
                                </span>
                                <div
                                    className="hidden group-hover:flex gap-1 shrink-0"
                                    onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => {
                                            setRenamingId(session.id);
                                            setRenameValue(session.name);
                                        }}
                                        className="text-xs text-gray-400 hover:text-violet-600 px-1"
                                        title="Rename"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => deleteSession(session.id)}
                                        className="text-xs text-gray-400 hover:text-red-500 px-1"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {session.last_message && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {session.last_message}
                                </p>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-300">
                                    {session.message_count} msg{session.message_count !== 1 ? "s" : ""}
                                </span>
                                <span className="text-xs text-gray-300">·</span>
                                <span className="text-xs text-gray-300">
                                    {new Date(session.updated_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            ))
        )}
      </div>
    </aside>
  );
}
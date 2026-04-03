"use client";

import { useState } from "react";
import { ChatSession } from "@/lib/supabase-chat";
import { useChatSessions } from "@/components/hooks/use-chat-session";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  X,
  Check,
  Loader2,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <aside className="w-full h-full bg-white flex flex-col border-r border-slate-100">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Chats
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNewInput(true)}
            className="rounded-full hover:bg-violet-50 text-violet-600"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* New session input */}
      {showNewInput && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 space-y-3">
            <input
              autoFocus
              type="text"
              placeholder="Session name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNewInput(false);
              }}
              className="w-full bg-white border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-lg h-9"
                onClick={handleCreate}
              >
                Create
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="px-3 rounded-lg h-9 hover:bg-violet-100 text-violet-700"
                onClick={() => setShowNewInput(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {isLoading && sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Syncing sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-sm font-medium text-slate-500">No chats found</p>
             <p className="text-xs text-slate-400 mt-1">Start a new conversation to get started</p>
          </div>
        ) : (
          sessions.map((session: ChatSession) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200",
                activeSessionId === session.id
                  ? "bg-violet-50 text-violet-700 border border-violet-100 shadow-sm shadow-violet-100/50"
                  : "hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                activeSessionId === session.id ? "bg-white" : "bg-slate-100 group-hover:bg-white"
              )}>
                <span className="text-base font-emoji">
                  {AGENT_EMOJI[session.agent_type || "chat"] || "💬"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {renamingId === session.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="w-full text-sm bg-white border border-violet-200 rounded px-2 py-1 outline-none ring-2 ring-violet-500/20"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleRename(session.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-green-600 hover:bg-green-50"
                      onClick={() => handleRename(session.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold truncate leading-tight">
                    {session.name}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                  {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Actions */}
              {!renamingId && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
                      onClick={() => { setRenamingId(session.id); setRenameValue(session.name); }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </aside>
  );
}
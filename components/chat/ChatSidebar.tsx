"use client";

import { useState } from "react";
import { ChatSession } from "@/lib/supabase-chat";
import { useUser, UserButton } from "@clerk/nextjs";
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
  onClose?: () => void;
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
  onClose,
}: ChatSidebarProps) {
  const { user } = useUser();
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
    <aside className="w-full h-full bg-[#f3f3f3] flex flex-col relative overflow-hidden">
      {/* Sidebar background detail */}
      <div className="absolute top-0 right-0 w-32 h-64 bg-[#bdb2ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="p-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-[#1b0c53] tracking-tighter">
            Archive
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewInput(true)}
              className="rounded-full bg-white/50 hover:bg-white text-[#5f559a] shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f559a]/40 group-focus-within:text-[#5f559a] transition-all" strokeWidth={3} />
          <input
            type="text"
            placeholder="Search through mind..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/50 border-none rounded-2xl text-sm font-bold text-[#1a1c1c] focus:bg-white focus:ring-0 transition-all placeholder:text-[#5f559a]/30 shadow-inner"
          />
        </div>
      </div>

      {/* New session input */}
      {showNewInput && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-500">
          <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Session perspective..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNewInput(false);
              }}
              className="w-full bg-[#f3f3f3] border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1a1c1c] focus:ring-0 shadow-inner"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-[#5f559a] hover:bg-[#1b0c53] rounded-xl h-10 font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                onClick={handleCreate}
              >
                Create
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="px-4 rounded-xl h-10 hover:bg-[#f3f3f3] text-[#5f559a] font-black text-xs uppercase tracking-widest"
                onClick={() => setShowNewInput(false)}
              >
                <X className="w-4 h-4 stroke-[3]" />
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
             <div className="w-12 h-12 bg-[#F0F0FF] rounded-2xl flex items-center justify-center mx-auto mb-3">
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
                "group relative flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300",
                activeSessionId === session.id
                  ? "bg-white text-[#1b0c53] shadow-lg shadow-[#bdb2ff]/10"
                  : "hover:bg-white/40 text-[#5f559a]/60 hover:text-[#5f559a]"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
                activeSessionId === session.id ? "bg-[#bdb2ff] shadow-sm transform scale-110" : "bg-white/40"
              )}>
                <span className="text-lg font-emoji">
                  {AGENT_EMOJI[session.agent_type || "chat"] || "💬"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {renamingId === session.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="w-full text-sm font-bold bg-white rounded-lg px-2 py-1 outline-none shadow-inner text-[#1b0c53]"
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
                      className="h-8 w-8 text-green-500 hover:bg-green-50 rounded-lg"
                      onClick={() => handleRename(session.id)}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </Button>
                  </div>
                ) : (
                  <p className={cn(
                    "text-sm font-black truncate leading-none mb-1",
                    activeSessionId === session.id ? "text-[#1b0c53]" : "text-[#5f559a]/70"
                  )}>
                    {session.name}
                  </p>
                )}
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5f559a]/30">
                  {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Actions */}
              {!renamingId && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#5f559a]/40 hover:text-[#5f559a] hover:bg-white rounded-xl shadow-sm"
                      onClick={() => { setRenamingId(session.id); setRenameValue(session.name); }}
                    >
                      <Edit3 className="w-3 h-3 stroke-[3]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#5f559a]/40 hover:text-red-500 hover:bg-white rounded-xl shadow-sm"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="w-3 h-3 stroke-[3]" />
                    </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-6 bg-white/40 backdrop-blur-3xl relative z-10">
        <div className="flex items-center justify-between bg-white/80 rounded-[2rem] p-4 shadow-xl shadow-[#2C2A4A]/5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-shrink-0 scale-110">
              <UserButton />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-[#1b0c53] truncate tracking-tight">
                {user?.fullName || "Seeker"}
              </span>
              <span className="text-[10px] text-[#5f559a]/40 font-black uppercase tracking-widest">
                Inner Sanctum
              </span>
            </div>
          </div>
        </div>
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
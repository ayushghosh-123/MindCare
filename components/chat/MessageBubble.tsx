// STEP 29 — components/chat/MessageBubble.tsx
// Renders a single chat message — styled differently for user vs AI.

"use client";
import { Chat } from "@/lib/supabase";

export function MessageBubble({ message }: { message: Chat }) {
  const isUser = message.is_user_message;
  const time = new Date(message.created_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex w-full mb-6 sm:mb-10 relative animate-in fade-in slide-in-from-bottom-3 duration-700 ${isUser ? "justify-end pl-8 sm:pl-20" : "justify-start pr-8 sm:pr-20"}`}>
      
      {!isUser && (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-2xl shadow-[#2C2A4A]/10 flex items-center justify-center text-xl mr-4 sm:mr-8 shrink-0 mt-1 border border-white">
          <span className="animate-pulse">✨</span>
        </div>
      )}

      <div className={`flex flex-col gap-3 max-w-full ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-xl font-medium leading-relaxed shadow-[0_20px_50px_-10px_rgba(44,42,74,0.08)] transition-all ${
            isUser
              ? "bg-[#1b0c53] text-white rounded-[2rem] rounded-tr-md sm:rounded-tr-lg"
              : "bg-white/95 backdrop-blur-3xl text-[#1b0c53] rounded-[2rem] rounded-tl-md sm:rounded-tl-lg border border-white"
          }`}
        >
          {message.message}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5f559a]/30 px-6">
          {time}
        </span>
      </div>
    </div>
  );
}
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
    <div className={`flex w-full mb-4 sm:mb-8 relative animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? "justify-end pl-6 sm:pl-12" : "justify-start pr-6 sm:pr-12"}`}>
      
      {!isUser && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-xl shadow-[#2C2A4A]/5 flex items-center justify-center text-base sm:text-lg mr-3 sm:mr-6 shrink-0 mt-1 animate-in zoom-in duration-700">
          ✨
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[95%] sm:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 sm:px-8 py-3 sm:py-5 text-base sm:text-lg font-medium leading-[1.6] whitespace-pre-line shadow-2xl shadow-[#2C2A4A]/5 relative transition-all ${
            isUser
              ? "bg-[#5f559a] text-white rounded-[1.5rem] sm:rounded-[2rem] rounded-tr-lg sm:rounded-tr-lg"
              : "bg-white/90 backdrop-blur-3xl text-[#1b0c53] rounded-[1.5rem] sm:rounded-[2rem] rounded-tl-lg sm:rounded-tl-lg"
          }`}
        >
          {message.message}
        </div>
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/30 px-4">
          {time}
        </span>
      </div>
    </div>
  );
}
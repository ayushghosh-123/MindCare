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
    <div className={`flex w-full mb-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {!isUser && (
        <div className="w-8 h-8 rounded-full border border-gray-200 bg-gradient-to-br from-[#F8F8FF] to-gray-50 flex items-center justify-center text-sm mr-4 shrink-0 mt-0.5 shadow-sm">
          🤖
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-line shadow-sm border ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm border-transparent"
              : "bg-[#F8F8FF] border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
          }`}
        >
          {message.message}
        </div>
        <span className="text-[11px] text-gray-400 px-1 mt-0.5 font-medium tracking-wide">
          {time}
        </span>
      </div>

    </div>
  );
}
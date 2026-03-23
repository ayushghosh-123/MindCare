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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">
          🤖
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-violet-600 text-white rounded-br-sm"
              : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm"
          }`}
        >
          {message.message}
        </div>
        <span className="text-xs text-gray-300">{time}</span>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white ml-2 shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}
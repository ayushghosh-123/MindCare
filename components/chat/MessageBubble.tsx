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
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {!isUser && (
        <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm mr-4 shrink-0 mt-0.5">
          🤖
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-gray-100 text-gray-900 rounded-2xl"
              : "text-gray-800"
          }`}
        >
          {message.message}
        </div>
      </div>

    </div>
  );
}
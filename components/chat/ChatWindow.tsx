// STEP 30 — components/chat/ChatWindow.tsx
// Main message area. Shows message history, typing indicator, and HITL panel.

"use client";
import { useEffect, useRef, useState } from "react";
import { Chat } from "@/lib/supabase";
import { MessageBubble } from "./MessageBubble";
import { AgentReviewPanel } from "@/components/journal/AgentReviewPanel";
import type { HumanReviewPayload } from "@/agents/nodes/evaluateAgent";

interface ChatWindowProps {
  sessionName: string;
  messages: Chat[];
  isSending: boolean;
  isLoading: boolean;
  agentStatus: string;
  reviewPayload: HumanReviewPayload | null;
  onApprove: (edited?: string) => void;
  onReject: () => void;
  onSendMessage: (text: string) => void;
}

export function ChatWindow({
  sessionName,
  messages,
  isSending,
  isLoading,
  agentStatus,
  reviewPayload,
  onApprove,
  onReject,
  onSendMessage,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatus]);

  function handleSend() {
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Session header */}
      <div className="px-5 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-base font-semibold text-gray-800">{sessionName}</h2>
        <p className="text-xs text-gray-400">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 animate-pulse">Loading conversation…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="text-4xl">💬</span>
            <p className="text-sm text-gray-500 font-medium">Start the conversation</p>
            <p className="text-xs text-gray-400">
              Ask anything about your wellness, share how you&re feeling, or request a daily report.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm mr-2">
              🤖
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HITL review panel — appears when evaluate_agent calls interrupt() */}
        {agentStatus === "interrupted" && reviewPayload && (
          <div className="mt-4">
            <AgentReviewPanel
              payload={reviewPayload}
              isResuming={agentStatus === "resuming"}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message MindCare…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
          >
            {isSending ? "…" : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1.5 text-center">
          Try: "I'm feeling anxious" · "How was my week?" · "Make a report of today"
        </p>
      </div>
    </div>
  );
}
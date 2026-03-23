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
    <div className="flex flex-col h-full bg-white relative">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[50vh]">
              <p className="text-sm text-gray-400 animate-pulse">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-center">
              <span className="text-4xl text-gray-300">👋</span>
              <p className="text-lg text-gray-700 font-medium">How can I help you today?</p>
              <p className="text-sm text-gray-500 max-w-sm">
                Ask about your wellness, share how you're feeling, or request a daily report.
              </p>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex justify-start mb-3">
              <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm mr-3 shrink-0">
                🤖
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* HITL review panel */}
          {(agentStatus === "interrupted" || agentStatus === "resuming") && reviewPayload && (
            <div className="mt-6 mb-8">
              <AgentReviewPanel
                payload={reviewPayload}
                isResuming={agentStatus === "resuming"}
                onApprove={onApprove}
                onReject={onReject}
              />
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end shadow-lg border border-gray-200 bg-white rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-200 focus-within:border-violet-400 transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.currentTarget.style.height = 'auto';
                }
              }}
              placeholder="Message MindCare…"
              className="flex-1 max-h-[200px] text-base bg-transparent px-4 py-3.5 resize-none focus:outline-none placeholder:text-gray-400"
            />
            <div className="p-2">
              <button
                onClick={() => {
                   handleSend();
                   const ta = document.querySelector('textarea');
                   if (ta) ta.style.height = 'auto';
                }}
                disabled={isSending || !input.trim()}
                className="bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
                title="Send message"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M12 4L12 20M12 4L5.5 10.5M12 4L18.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">
             MindCare can make mistakes. Consider verifying important health information.
          </p>
        </div>
      </div>
    </div>
  );
}
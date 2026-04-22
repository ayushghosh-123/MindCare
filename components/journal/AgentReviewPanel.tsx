// STEP 28 — components/journal/AgentReviewPanel.tsx
// Renders the human-readable review card when evaluate_agent calls interrupt().
// The user sees the formatted AI response and must Approve / Edit / Reject
// before the email is sent. This is the UI side of HITL.

"use client";
import { useState } from "react";
import type { HumanReviewPayload } from "@/agents/nodes/evaluateAgent";

interface AgentReviewPanelProps {
  payload: HumanReviewPayload;
  isResuming: boolean;
  isComplete?: boolean;
  result?: { emailSent: boolean; email?: string | null } | null;
  onApprove: (editedResponse?: string) => void;
  onReject: () => void;
}

export function AgentReviewPanel({
  payload,
  isResuming,
  isComplete,
  result,
  onApprove,
  onReject,
}: AgentReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(payload.responseToReview);
  const [confirmed, setConfirmed] = useState(false);

  const { sections, sentiment, urgencyHigh } = payload;

  const scheme =
    sentiment === "positive" || isComplete
      ? {
          border: isComplete ? "border-emerald-500" : "border-emerald-300",
          bg: "bg-emerald-50",
          btn: "bg-emerald-500 hover:bg-emerald-600",
          badge: "bg-emerald-100 text-emerald-700",
        }
      : {
          border: "border-violet-300",
          bg: "bg-violet-50",
          btn: "bg-violet-600 hover:bg-violet-700",
          badge: "bg-violet-100 text-violet-700",
        };

  function handleApprove() {
    setConfirmed(true);
    onApprove(isEditing ? editedText : undefined);
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#2C2A4A]/5 overflow-hidden">


      {/* Header */}
      <div className="p-8 bg-[#f3f3f3]">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
              {sections.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1b0c53] tracking-tighter leading-none mb-2">
                {isComplete ? "Archive Entry Created" : sections.title}
              </h3>
              <p className="text-sm text-[#5f559a]/60 font-medium italic">
                {isComplete ? `Transmitted to ${result?.email || payload.email}` : "Perspective analysis complete. Please verify the alignment."}
              </p>
            </div>
          </div>
          <div className="bg-[#bdb2ff] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1b0c53] shadow-sm">
            {payload.agentType} · {sentiment ?? "neutral"}
          </div>
        </div>
      </div>

      {/* Crisis warning */}
      {urgencyHigh && (
        <div className="bg-red-50 px-8 py-4 flex items-start gap-4">
          <span className="text-red-500 text-2xl mt-1">⚠️</span>
          <div>
            <p className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Observation of Urgency</p>
            <p className="text-sm text-red-700/80 font-medium leading-relaxed">
              This response suggests professional support may be
              beneficial. If you are in crisis, please contact your local mental
              health sanctuary immediately.
            </p>
          </div>
        </div>
      )}

      {/* Workflow Progress Steps */}
      <div className="px-8 py-5 bg-[#fcfcfc]">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {payload.steps.map((step, i) => {
            const isFinished = isComplete || step.completed;
            const isWaiting = isComplete && step.label === "Waiting for Approval";
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  isFinished ? (isWaiting ? "bg-[#5f559a]/20" : "bg-[#bdb2ff] shadow-[0_0_8px_#bdb2ff]") : "bg-[#f3f3f3]"
                )} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  isFinished ? "text-[#1b0c53]/80" : "text-[#5f559a]/20"
                )}>
                  {isWaiting ? "Verified" : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response body */}
      <div className="px-8 py-8 bg-white border-t border-[#f3f3f3]">
        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-top-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a] mb-4">
               Perspective Adjustment
            </p>
            <textarea
              rows={8}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-lg font-medium text-[#1b0c53] bg-[#f3f3f3] border-none rounded-3xl p-6 focus:ring-2 focus:ring-[#bdb2ff]/30 leading-relaxed resize-none shadow-inner"
            />
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f559a]/40 mb-6">
              Synthesized Projection
            </p>
            <div className="space-y-6">
              {payload.responseToReview
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((paragraph, i) => (
                  <p key={i} className="text-xl text-[#1b0c53] font-medium leading-[1.6]">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        )}

        {sections.footer && (
          <div className="mt-10 pt-8 border-t border-[#f3f3f3]">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[#5f559a]/30">
               Routing to <span className="text-[#5f559a]">{payload.email}</span>
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isComplete ? (
        <div className="px-8 py-8 bg-[#f3f3f3] flex flex-wrap gap-4">
          <button
            onClick={handleApprove}
            disabled={isResuming || confirmed}
            className="flex-1 bg-[#1b0c53] hover:bg-black text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-6 rounded-3xl transition-all shadow-xl shadow-[#2C2A4A]/20 disabled:opacity-50 active:scale-95"
          >
            {isResuming || confirmed ? "Transmitting..." : "Align & Transmit"}
          </button>

          <button
            onClick={() => {
              setIsEditing((v) => !v);
              if (isEditing) setEditedText(payload.responseToReview);
            }}
            disabled={isResuming || confirmed}
            className="flex-1 bg-white hover:bg-[#bdb2ff]/10 text-[#5f559a] text-xs font-black uppercase tracking-[0.2em] py-5 px-6 rounded-3xl transition-all shadow-sm active:scale-95"
          >
            {isEditing ? "Dismiss Edit" : "Deepen Adjust"}
          </button>

          <button
            onClick={onReject}
            disabled={isResuming || confirmed}
            className="w-full md:w-auto bg-transparent hover:bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 rounded-3xl transition-all"
          >
            Reject Stream
          </button>
        </div>
      ) : (
        <div className="px-8 py-6 bg-[#bdb2ff] flex items-center justify-between">
           <p className="text-[#1b0c53] text-sm font-black uppercase tracking-widest flex items-center gap-4">
              <span className="text-2xl animate-pulse">🕊️</span>
              Perspective Stored in Sanctuary
           </p>
        </div>
      )}
    </div>
  );
}
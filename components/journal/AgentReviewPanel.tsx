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
  onApprove: (editedResponse?: string) => void;
  onReject: () => void;
}

export function AgentReviewPanel({
  payload,
  isResuming,
  onApprove,
  onReject,
}: AgentReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(payload.responseToReview);
  const [confirmed, setConfirmed] = useState(false);

  const { sections, sentiment, urgencyHigh } = payload;

  const scheme =
    sentiment === "positive"
      ? {
          border: "border-emerald-300",
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
    <div className={`rounded-2xl border-2 ${scheme.border} shadow-md overflow-hidden`}>

      {/* Header */}
      <div className={`${scheme.bg} px-5 py-4 border-b ${scheme.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sections.emoji}</span>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                {sections.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ready to send — please review before approving
              </p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${scheme.badge}`}>
            {payload.agentType} · {sentiment ?? "neutral"}
            {payload.sentimentScore !== null && ` · ${payload.sentimentScore}/100`}
          </span>
        </div>
      </div>

      {/* Crisis warning */}
      {urgencyHigh && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-start gap-2">
          <span className="text-red-500 text-lg mt-0.5">⚠️</span>
          <p className="text-sm text-red-700">
            <strong>Note:</strong> This response suggests professional support may be
            beneficial. If you or your user are in crisis, please contact a mental
            health helpline immediately.
          </p>
        </div>
      )}

      {/* Response body */}
      <div className="px-5 py-4">
        {isEditing ? (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              ✏️ Editing response
            </p>
            <textarea
              rows={8}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-300 leading-relaxed resize-none"
            />
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
              Preview — what will be emailed to you
            </p>
            <div className="space-y-3">
              {payload.responseToReview
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((paragraph, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        )}

        {sections.footer && (
          <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
            📬 {sections.footer}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={handleApprove}
          disabled={isResuming || confirmed}
          className={`flex-1 ${scheme.btn} text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isResuming || confirmed ? "Sending email…" : "✅ Approve & Send Email"}
        </button>

        <button
          onClick={() => {
            setIsEditing((v) => !v);
            if (isEditing) setEditedText(payload.responseToReview);
          }}
          disabled={isResuming || confirmed}
          className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          {isEditing ? "↩ Cancel Edit" : "✏️ Edit Before Sending"}
        </button>

        <button
          onClick={onReject}
          disabled={isResuming || confirmed}
          className="flex-1 border border-red-200 bg-white hover:bg-red-50 text-red-500 text-sm font-medium py-2.5 px-4 rounded-xl transition disabled:opacity-50"
        >
          ❌ Reject — Don&t Email
        </button>
      </div>
    </div>
  );
}
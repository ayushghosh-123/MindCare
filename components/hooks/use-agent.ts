// STEP 24 — hooks/use-agent.ts
// The core React state machine for all agent interactions.
// Handles the full HITL lifecycle: invoke → interrupted → approve/reject → complete
//
// Status transitions:
//   idle → loading → interrupted → resuming → complete
//                  ↘ (reject)   → complete (no email)
//        → error (any step)

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { AgentRequest } from "@/agents/schemas/JournalSchema";
import type { HumanReviewPayload } from "@/agents/nodes/evaluateAgent";

// ── Response types ────────────────────────────────────────────────────────────

interface AgentCompleteResponse {
  status: "complete";
  response: string;
  sentiment: "positive" | "negative" | null;
  sentimentScore: number | null;
  diagnosis: string | null;
  agentType: "journaling" | "chat" | "data" | "report" | null;
  emailSent: boolean;
  email?: string | null;
  usedEditedResponse?: boolean;
}

interface AgentInterruptedResponse {
  status: "interrupted";
  threadId: string;
  reviewPayload: HumanReviewPayload; // fully typed — passed directly to AgentReviewPanel
}

type AgentAPIResponse = AgentCompleteResponse | AgentInterruptedResponse;

type AgentStatus = "idle" | "loading" | "interrupted" | "resuming" | "complete" | "error";

// ── Hook return type ──────────────────────────────────────────────────────────

interface UseAgentReturn {
  invoke: (request: AgentRequest) => Promise<void>;
  approve: (editedResponse?: string) => Promise<void>;
  reject: () => Promise<void>;
  reset: () => void;
  status: AgentStatus;
  result: AgentCompleteResponse | null;
  reviewPayload: HumanReviewPayload | null;
  error: string | null;
  currentStage: string | null;
  sendEmailReport: (sessionId: string) => Promise<{ sessionId: string; subject: string; body: string; evaluation?: any } | null>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgent(): UseAgentReturn {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [result, setResult] = useState<AgentCompleteResponse | null>(null);
  const [reviewPayload, setReviewPayload] = useState<HumanReviewPayload | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);

  // ── Start a new graph run ─────────────────────────────────────────────────
  const invoke = useCallback(async (request: AgentRequest) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setReviewPayload(null);
    setThreadId(null);

    try {
      const token = await getToken();
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Agent request failed");
      }

      const data: AgentAPIResponse = await res.json();

      if (data.status === "interrupted") {
        // Graph paused at evaluate_agent → show review panel
        setThreadId(data.threadId);
        setReviewPayload(data.reviewPayload);
        setStatus("interrupted");
      } else {
        setResult(data);
        setStatus("complete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, []);

  // ── Resume the graph ──────────────────────────────────────────────────────
  const resume = useCallback(
    async (humanApproved: boolean, editedResponse?: string) => {
      if (!threadId) return;
      setStatus("resuming");

      try {
        const token = await getToken();
        const res = await fetch("/api/agent/resume", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({ threadId, humanApproved, editedResponse }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Resume failed");
        }

        const data: AgentCompleteResponse = await res.json();
        setResult(data);
        setStatus("complete");
        setReviewPayload(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Resume error");
        setStatus("error");
      }
    },
    [threadId]
  );


  const sendEmailReport = async (sessionId: string) => {
    setStatus("loading");
    setCurrentStage("Classifying request...");
    try {
      const token = await getToken();
      
      // Artificial delay to show the stages to the user
      const stages = ["Fetching Wellness Data...", "Analyzing Sentiment...", "Drafting Report...", "Checking Safety..."];
      let stageIdx = 0;
      const interval = setInterval(() => {
        if (stageIdx < stages.length) {
          setCurrentStage(stages[stageIdx]);
          stageIdx++;
        }
      }, 1500);

      const response = await fetch("/api/agent/email", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ sessionId })
      });

      clearInterval(interval);
      const data = await response.json();
      if (data.success) {
        return { 
          sessionId: data.sessionId, 
          subject: data.data.subject, 
          body: data.data.body,
          evaluation: data.data.evaluation
        };
      } else {
        throw new Error(data.error || "Failed to trigger email agent");
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const approve = useCallback(
    (editedResponse?: string) => resume(true, editedResponse),
    [resume]
  );

  const reject = useCallback(() => resume(false), [resume]);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setReviewPayload(null);
    setThreadId(null);
    setError(null);
    setCurrentStage(null);
  }, []);

  return { invoke, approve, reject, reset, status, result, reviewPayload, error, currentStage, sendEmailReport };
}
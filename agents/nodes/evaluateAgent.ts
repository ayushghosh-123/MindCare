// STEP 16 — agents/nodes/evaluateAgent.ts
// The most important node. Three jobs:
// 1. AI safety review — rewrites unsafe/clinical/cold responses
// 2. formatForHuman() — builds a structured, readable card for the UI
// 3. interrupt() — PAUSES the graph and waits for human approval
//
// Flow:
//   evaluate_agent runs
//   → interrupt() saves state to checkpointer, returns payload to UI
//   → UI renders AgentReviewPanel
//   → User clicks Approve / Edit / Reject
//   → POST /api/agent/resume resumes the graph
//   → interrupt() returns { approved, editedResponse }
//   → routeAfterEvaluate edge fires: approved → email_agent, rejected → END

import { interrupt } from "@langchain/langgraph";
import { AgentState } from "../types/state";
import { llmPro } from "../config/llm";
import { EVALUATE_PROMPT } from "../prompts";
import { dbHelpers } from "@/lib/supabase";
import { saveChatMessage } from "../tools/supbaseTool";

// This is the payload the UI receives when the graph pauses.
// AgentReviewPanel renders this directly — fully typed end to end.
export interface HumanReviewPayload {
  responseToReview: string;   // the raw text for the edit textarea
  sections: {
    title: string;   // "Your Support Message" / "Your Wellness Insight" / "Daily Report"
    emoji: string;   // "💙" / "🌟" / "📊"
    body: string;    // same as responseToReview — rendered as paragraphs
    footer: string;  // "This will be emailed to you"
  };
  sentiment: AgentState["sentiment"];
  agentType: AgentState["agentType"];
  sentimentScore: number | null;
  urgencyHigh: boolean;
  email: string; // recipient's email address
  steps: { label: string; completed: boolean }[]; // workflow progress
}

// Builds human-readable sections based on agent type and sentiment
function formatForHuman(
  response: string,
  state: AgentState
): HumanReviewPayload["sections"] {
  const { agentType, sentiment } = state;

  if (agentType === "report") {
    return {
      title: "Your Daily Wellness Report",
      emoji: "📊",
      body: response.trim(),
      footer: "Your personalised wellness report will be emailed to you.",
    };
  }

  if (agentType === "data") {
    return {
      title: "Your Health Summary",
      emoji: "📈",
      body: response.trim(),
      footer: "This health summary will be emailed to you.",
    };
  }

  if (agentType === "chat") {
    return {
      title: "Your Chat Insight",
      emoji: "💭",
      body: response.trim(),
      footer: "This chat-based wellness insight will be emailed to you.",
    };
  }

  if (sentiment === "positive") {
    return {
      title: "Your Wellness Insight",
      emoji: "🌟",
      body: response.trim(),
      footer: "This uplifting insight will be emailed to you.",
    };
  }

  return {
    title: "Your Support Message",
    emoji: "💙",
    body: response.trim(),
    footer:
      "This support message will be emailed to you. If you are in crisis, please contact a mental health helpline.",
  };
}

// Scans for crisis indicators — shows red warning banner in UI if found
function detectHighUrgency(text: string): boolean {
  const keywords = [
    "crisis",
    "self-harm",
    "self harm",
    "suicide",
    "suicidal",
    "emergency",
    "professional help urgently",
    "immediate support",
    "helpline",
  ];
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export async function evaluateAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  if (!state.response) return {};

  // ── Step 1: AI safety and quality review ─────────────────────────────────
  let reviewedResponse = state.response;
  try {
    const result = await llmPro.invoke([
      { role: "system", content: EVALUATE_PROMPT },
      {
        role: "user",
        content: `Review and improve this response for a mental health journaling app:\n\n${state.response}`,
      },
    ]);
    reviewedResponse = result.content.toString().trim();
  } catch (err) {
    console.error("[evaluateAgent] AI review failed, using original:", err);
  }

  // ── Step 2: Format for human readability ──────────────────────────────────
  const sections = formatForHuman(reviewedResponse, state);
  const urgencyHigh = detectHighUrgency(reviewedResponse);

  // ── Step 2.5: Fetch User Email ──────────────────────────────────────────
  let userEmail = state.email || "";
  if (!userEmail) {
    const { data: user } = await dbHelpers.getUser(state.userId);
    if (user?.email) userEmail = user.email;
  }

  // ── Step 2.6: Determine Completed Steps ──────────────────────────────────
  const workflowSteps = [
     { label: "Classified Request", completed: true },
     { label: "Analyzed Sentiment", completed: !!state.sentiment },
     { label: state.agentType === 'report' ? "Merged Data & Journal" : "Generated Insights", completed: true },
     { label: "Drafted Email", completed: true },
     { label: "Waiting for Approval", completed: false },
  ];

  // ── Step 3: HUMAN-IN-THE-LOOP ─────────────────────────────────────────────
  // interrupt() PAUSES the graph here.
  // The full payload is sent to the UI → AgentReviewPanel renders it.
  // Graph state is saved to the checkpointer (MemorySaver in dev, PostgresSaver in prod).
  // The graph resumes when POST /api/agent/resume is called with { approved, editedResponse }.
  const humanDecision = interrupt<
    HumanReviewPayload,
    { approved: boolean; editedResponse?: string }
  >({
    responseToReview: reviewedResponse,
    sections,
    sentiment: state.sentiment,
    agentType: state.agentType,
    sentimentScore: state.sentimentScore,
    urgencyHigh,
    email: userEmail,
    steps: workflowSteps,
  });

  console.log(`[evaluateAgent] Human decision received: approved=${humanDecision.approved}, edited=${!!humanDecision.editedResponse}`);

  // ── Step 4: Handle human decision ────────────────────────────────────────
  if (!humanDecision.approved) {
    // Rejected → routeAfterEvaluate will go to END (no email)
    // Response is still stored so UI can show it without emailing
    return {
      humanApproved: false,
      humanFeedback: null,
      response: reviewedResponse,
    };
  }

  // If user edited the text, use their version — otherwise use AI-reviewed version
  const finalResponse = humanDecision.editedResponse?.trim() || reviewedResponse;

  return {
    humanApproved: true,
    humanFeedback: humanDecision.editedResponse ?? null,
    response: finalResponse,
    email: userEmail,
  };
}
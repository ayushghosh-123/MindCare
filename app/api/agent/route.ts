
// STEP 21 — app/api/agent/route.ts
// Starts a new graph run. Returns threadId + reviewPayload when graph pauses at HITL.
// Returns response directly when graph completes without HITL (chat/data).
//
// export const maxDuration = 60  → required for Vercel (agents take 10-30s)

import { auth } from "@clerk/nextjs/server";
import { buildMainGraph } from "@/agents";
import { AgentRequestSchema } from "@/agents/schemas/JournalSchema";
import { AgentState } from "@/agents/types/state";
import type { HumanReviewPayload } from "@/agents/nodes/evaluateAgent";

export const maxDuration = 60; // seconds — required for Vercel Pro

// Singleton — compiled once, reused across all requests
const graph = buildMainGraph();

export async function POST(req: Request) {
  // ── 1. Auth via Clerk ─────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Validate request body ──────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = AgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { userMessage, sessionId, journalEntry } = parsed.data;

  // ── 3. Build initial state ────────────────────────────────────────────────
  const initialState: AgentState = {
    userId,
    sessionId,
    userMessage,
    JournalEntry: journalEntry ? { title: journalEntry.title, content: journalEntry.content } : undefined,
    agentType: null,
    sentiment: null,
    sentimentScore: null,
    diagonosis: null,
    healthSummary: null,
    response: null,
    chatHistory: [],
    humanApproved: false,
    humanFeedback: null,
    emailSent: false,
    error: null,
  };

  // ── 4. thread_id — must be identical between invoke and resume ────────────
  const threadId = `${userId}-${sessionId}`;
  const config = { configurable: { thread_id: threadId } };

  // ── 5. Run the graph ──────────────────────────────────────────────────────
  try {
    await graph.invoke(initialState, config);

    // ── 6. Check if graph paused at interrupt() ────────────────────────────
    const graphState = await graph.getState(config);
    const isInterrupted = (graphState.tasks ?? []).some(
      (t) => t.interrupts?.length > 0
    );

    if (isInterrupted) {
      // Extract the HumanReviewPayload that evaluate_agent passed to interrupt()
      const reviewPayload: HumanReviewPayload | undefined = graphState.tasks
        .flatMap((t) => t.interrupts ?? [])
        .at(0)?.value as HumanReviewPayload | undefined;

      if (!reviewPayload) {
        return Response.json({ error: "Interrupt payload missing" }, { status: 500 });
      }

      // Return to UI — useAgent hook sets status = "interrupted"
      // AgentReviewPanel renders reviewPayload directly
      return Response.json({
        status: "interrupted",
        threadId,          // UI sends this back on resume
        reviewPayload,     // fully formatted, human-readable payload
      });
    }

    // ── 7. Normal completion (chat / data — no HITL needed) ───────────────
    const finalState = graphState.values as AgentState;
    return Response.json({
      status: "complete",
      response: finalState.response,
      sentiment: finalState.sentiment,
      sentimentScore: finalState.sentimentScore,
      agentType: finalState.agentType,
      emailSent: finalState.emailSent,
    });

  } catch (err) {
    console.error("[api/agent]", err);
    return Response.json(
      { error: "Agent failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
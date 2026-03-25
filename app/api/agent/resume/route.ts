import { getVerifiedUserId } from "@/lib/auth-bypass";
import { buildMainGraph } from "@/agents";
import { z } from "zod";
import { Command } from "@langchain/langgraph";

export const maxDuration = 60;

const graph = buildMainGraph();

const ResumeSchema = z.object({
  threadId: z.string().min(1),
  humanApproved: z.boolean(),
  editedResponse: z.string().optional(), // user's rewritten version (optional)
});

export async function POST(req: Request) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const userId = await getVerifiedUserId(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Validate ───────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = ResumeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid resume payload", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { threadId, humanApproved, editedResponse } = parsed.data;

  // ── 3. Security — thread_id must belong to this user ─────────────────────
  if (!threadId.startsWith(userId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = { configurable: { thread_id: threadId } };

  try {
    // ── 4. Resume from checkpointer ────────────────────────────────────────
    // Resume using Command per LangGraph 1.x / 0.2.x+ API
    const result = await graph.invoke(new Command({
      resume: {
        approved: humanApproved,
        editedResponse: editedResponse?.trim() || undefined,
      }
    }), config);

    return Response.json({
      status: "complete",
      response: result.response,
      sentiment: result.sentiment,
      agentType: result.agentType,
      emailSent: result.emailSent,
      email: result.email,
      diagnosis: result.diagnosis,
      usedEditedResponse: !!editedResponse?.trim(),
    });

  } catch (err) {
    console.error("[api/agent/resume]", err);
    return Response.json(
      { error: "Resume failed. Please try again." },
      { status: 500 }
    );
  }
}
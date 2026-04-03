// app/api/agent/email/route.ts
import { NextResponse } from "next/server";
import { buildEmailGraph } from "@/agents/graphs/emailWorkflow";
import { getVerifiedUserId } from "@/lib/auth-bypass";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/agent/email
 * Starts the Email Agent workflow.
 * Pauses at human_approval and returns the draft for review.
 */
export async function POST(req: Request) {
  const userId = await getVerifiedUserId(req);
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId = uuidv4() } = await req.json().catch(() => ({}));

    // Build and compile the graph
    const emailGraph = buildEmailGraph();
    
    // Config for checkpointing (HITL requires a thread/session ID)
    const config = { configurable: { thread_id: sessionId } };

    // Initialize the graph state
    const initialState = {
      userId,
      sessionId,
      humanApproved: false,
      agentType: "report" // default for email agent
    };

    console.log(`[API] Starting Email workflow for session: ${sessionId}`);

    // Trigger the graph — this will run until it hits the interrupt()
    const result = await emailGraph.invoke(initialState, config);

    // The graph pauses and returns the state (including emailSubject, emailBody, evaluationResult)
    return NextResponse.json({ 
      success: true, 
      sessionId, 
      data: {
        subject: result.emailSubject,
        body: result.emailBody,
        evaluation: result.evaluationResult
      }
    });

  } catch (err: any) {
    console.error("[API] Error triggering email agent:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

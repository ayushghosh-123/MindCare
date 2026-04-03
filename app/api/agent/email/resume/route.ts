// app/api/agent/email/resume/route.ts
import { NextResponse } from "next/server";
import { buildEmailGraph } from "@/agents/graphs/emailWorkflow";
import { getVerifiedUserId } from "@/lib/auth-bypass";

/**
 * POST /api/agent/email/resume
 * Resumes the graph after human feedback (approves, edits, or rejects).
 */
export async function POST(req: Request) {
  const userId = await getVerifiedUserId(req);
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, decision, updatedContent } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const emailGraph = buildEmailGraph();
    const config = { configurable: { thread_id: sessionId } };

    // 2. Update the persistent state of the graph for this sessionId
    // This fills in the gaps after the interrupt() call.
    await emailGraph.updateState(config, {
      humanApproved: decision === 'approved',
      humanFeedback: decision === 'edit' ? updatedContent : null,
      humanRejected: decision === 'reject',
      // If the user edited the body, we save it into the state immediately
      emailBody: (decision === 'approved' || decision === 'edit') ? updatedContent : undefined
    });

    console.log(`[API] State updated for session: ${sessionId}. Resuming execution...`);

    // 3. Continue the graph to the end (invoke with null start input)
    const finalResult = await emailGraph.invoke(null, config);

    return NextResponse.json({ 
       success: true, 
       finalState: {
           emailSent: finalResult.emailSent,
           error: finalResult.error
       } 
    });

  } catch (err: any) {
    console.error(`[API] Error resuming email agent for session ${sessionId}:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

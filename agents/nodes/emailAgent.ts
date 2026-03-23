// agents/nodes/emailAgent.ts
// Reads the authenticated user's email from your Supabase users table.
// The email was synced from Clerk when the user signed up (via webhook).
// So whatever Gmail they used to sign in → that's where the wellness email goes.

import { AgentState, SentimentType } from "../types/state";
import { sendWellnessSummaryEmail } from "../tools/emailTool";
import { dbHelpers } from "@/lib/supabase";
import { saveChatMessage } from "../tools/supbaseTool";

export async function emailAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  // Only email for journaling and report — not chat or data queries
  const shouldEmail =
    state.agentType === "journaling" || 
    state.agentType === "report" ||
    state.agentType === "data";

  console.log(`[emailAgent] Incoming state: agentType=${state.agentType}, hasResponse=${!!state.response}, sentiment=${state.sentiment}`);

  if (!shouldEmail) {
    console.log("[emailAgent] Skipping email: agentType is not journaling or report");
    return {};
  }

  if (!state.response) {
    console.warn(`[emailAgent] Skipping email: response is missing from state.`);
    return {};
  }

  // Default to a safe sentiment if missing (e.g. for data/report modes)
  const finalSentiment = state.sentiment || "positive";

  try {
    // Fetch the user's email from your Supabase users table.
    // This was synced from Clerk via the webhook at app/api/webhooks/clerk/route.ts
    // when the user first signed up or updated their account.
    const { data: user } = await dbHelpers.getUser(state.userId);
    if (!user?.email) {
      console.warn(`[emailAgent] User ${state.userId} NOT found in Supabase (cannot send email)`);
      return { emailSent: false };
    }

    if (state.sessionId && state.response) {
       await saveChatMessage(state.userId, state.sessionId, state.response, false);
    }

    console.log(`[emailAgent] Sending wellness email to: ${user.email}`);
    
    const sent = await sendWellnessSummaryEmail({
      to: user.email,
      userName: user.full_name || "there",
      response: state.response,
      sentiment: finalSentiment as SentimentType,
      journalDate: new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    console.log(`[emailAgent] Email tool returned: ${sent}`);
    return { emailSent: sent, email: user.email };
  } catch (err: any) {
    console.error("[emailAgent] CRITICAL ERROR:", err.message);
    return { emailSent: false, error: err.message };
  }
}
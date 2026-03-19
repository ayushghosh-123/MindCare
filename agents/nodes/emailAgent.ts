// STEP 17 — agents/nodes/emailAgent.ts
// Sends the wellness email ONLY after human has approved.
// Runs only for journaling and report — not for plain chat or data queries.
// Uses humanFeedback (edited version) if the user edited before approving.

import { AgentState } from "../types/state";
import { sendWellnessSummaryEmail } from "../tools/emailTool";
import { dbHelpers } from "@/lib/supabase";

export async function emailAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  // Only send for journaling and report — chat and data don't get emailed
  const shouldEmail =
    state.agentType === "journaling" || state.agentType === "report";

  if (!shouldEmail || !state.response || !state.sentiment) {
    return {};
  }

  try {
    // Get user's email from your users table
    const { data: user } = await dbHelpers.getUser(state.userId);
    if (!user?.email) {
      console.warn("[emailAgent] No email found for user:", state.userId);
      return { emailSent: false };
    }

    const sent = await sendWellnessSummaryEmail({
      to: user.email,
      userName: user.full_name ?? user.username ?? "there",
      // Use human's edited version if they edited before approving
      response: state.humanFeedback ?? state.response,
      sentiment: state.sentiment,
      journalDate: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    return { emailSent: sent };
  } catch (err) {
    // Email failure must NEVER block the main response from showing
    console.error("[emailAgent]", err);
    return { emailSent: false };
  }
}
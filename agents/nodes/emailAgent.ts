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

  // ── Step 1: Resolve Email Address ─────────────────────────────────────────
  // Prioritize the email already in state (resolved during HITL approval)
  let recipientEmail = state.email;
  let userName = "there";

  try {
    // If state.email is missing, fallback to Supabase lookup (shouldn't happen for approved reports)
    if (!recipientEmail) {
      console.log(`[emailAgent] state.email missing, fetching from Supabase for user: ${state.userId}`);
      const { data: user } = await dbHelpers.getUser(state.userId);
      recipientEmail = user?.email || null;
      userName = user?.full_name || "there";
    } else {
      // If we have state.email, we should still try to get the user's name for a nice greeting
      const { data: user } = await dbHelpers.getUser(state.userId);
      userName = user?.full_name || "there";
    }

    if (!recipientEmail) {
      console.warn(`[emailAgent] NO RECIPIENT EMAIL FOUND for user ${state.userId}. Cannot send.`);
      return { emailSent: false };
    }

    // ── Step 2: Save to Chat History ──────────────────────────────────────────
    if (state.sessionId && state.response) {
       await saveChatMessage(state.userId, state.sessionId, state.response, false);
    }

    // ── Step 3: Send the Email ────────────────────────────────────────────────
    console.log(`[emailAgent] Sending report to: ${recipientEmail}`);
    
    const sent = await sendWellnessSummaryEmail({
      to: recipientEmail,
      userName: userName,
      response: state.response,
      sentiment: finalSentiment as SentimentType,
      journalDate: new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    // Optional: If a "main address" is defined in env, you could CC it here or send separately.
    // For now, we ensure the primary email works.

    console.log(`[emailAgent] Delivery result: ${sent ? "Success" : "Failed"}`);
    return { emailSent: sent, email: recipientEmail };
  } catch (err: any) {
    console.error("[emailAgent] CRITICAL ERROR during email delivery:", err.message);
    return { emailSent: false, error: err.message };
  }
}
// agents/nodes/email/emailNode.ts
import { AgentState } from "../../types/state";
import { sendWellnessSummaryEmail } from "../../tools/emailTool";
import { dbHelpers } from "@/lib/supabase";

/**
 * Node for final email delivery via Nodemailer.
 * Logs the email details to Supabase email_logs.
 */
export async function emailNode(state: AgentState): Promise<Partial<AgentState>> {
  let recipientEmail = state.email || process.env.GMAIL_USER || process.env.EMAIL_FROM || null;

  if (!recipientEmail || !state.emailBody || !state.emailSubject) {
    console.error(`[emailNode] Missing delivery details. email=${recipientEmail}, body=${!!state.emailBody}, subject=${!!state.emailSubject}`);
    return { emailSent: false, error: "Missing email details for delivery." };
  }

  console.log(`[emailNode] Sending email to: ${state.email}`);

  try {
    // 1. Fetch user profile for name
    const { data: user } = await dbHelpers.getUser(state.userId);
    const greetingName = user?.full_name || "Valued Member";

    // 2. Send using the Gmail tool
    const sent = await sendWellnessSummaryEmail({
      to: recipientEmail,
      userName: greetingName,
      response: state.emailBody,
      sentiment: state.sentiment || "positive",
      journalDate: new Date().toLocaleDateString("en-GB")
    });

    // 2. Log to Database email_logs
    await dbHelpers.logEmail({
      user_id: state.userId,
      subject: state.emailSubject,
      body: state.emailBody,
      status: sent ? 'sent' : 'pending'
    });

    return { emailSent: sent, error: sent ? null : "Email failed to send. Log saved." };

  } catch (err: any) {
    console.error("[emailNode] Critical delivery error:", err.message);
    return { emailSent: false, error: `Email delivery failed: ${err.message}` };
  }
}

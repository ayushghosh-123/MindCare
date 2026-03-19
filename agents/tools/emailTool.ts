interface WellnessSummaryEmail {
  to: string;
  userName: string;
  sentiment: "positive" | "negative";
  response: string;
  journalDate: string;
}
 
// wellnessSummary model 
export async function sendWellnessSummaryEmail(payload: WellnessSummaryEmail): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
 
    const color = payload.sentiment === "positive" ? "#10b981" : "#6366f1";
    const emoji = payload.sentiment === "positive" ? "🌟" : "💙";
 
    const { error } = await resend.emails.send({
      from: "MindCare <noreply@yourdomain.com>",
      to: payload.to,
      subject: `${emoji} Your MindCare Wellness Insight — ${payload.journalDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h1 style="color:${color};">${emoji} MindCare Wellness Insight</h1>
          <p style="color:#6b7280;">Hi ${payload.userName}, here's your insight from ${payload.journalDate}:</p>
          <div style="background:#f9fafb;border-left:4px solid ${color};padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;color:#111827;white-space:pre-line;">${payload.response}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            If you're in crisis, please contact a mental health professional or call a crisis helpline.
          </p>
        </div>
      `,
    });
 
    if (error) { console.error("[emailTool]", error); return false; }
    return true;
  } catch (err) {
    console.error("[emailTool] Failed:", err);
    return false;
  }
}
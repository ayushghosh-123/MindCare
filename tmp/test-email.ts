// tmp/test-email.ts
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGmail() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  console.log(`[Test] Using User: ${user}`);
  console.log(`[Test] Using Pass: ${pass ? "****" : "MISSING"}`);

  if (!user || !pass) {
    console.error("[Error] Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env.local");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    console.log("[Test] Verifying transporter...");
    await transporter.verify();
    console.log("[Test] ✅ Transporter is ready to send emails.");

    console.log("[Test] Sending dummy email...");
    const info = await transporter.sendMail({
      from: user,
      to: user, // Send to self
      subject: "MindCare Email Agent - Transporter Test",
      text: "This is a dummy email to verify your Nodemailer configuration. If you see this, your Gmail SMTP is working correctly!",
      html: "<b>MindCare Email Agent - Transporter Test</b><p>This is a dummy email to verify your Nodemailer configuration. If you see this, your Gmail SMTP is working correctly!</p>"
    });

    console.log(`[Test] ✅ Email sent successfully! MessageId: ${info.messageId}`);
  } catch (error: any) {
    console.error("[Test] ❌ Error sending email:", error.message);
    if (error.response) console.error("[Test] SMTP Response:", error.response);
  }
}

testGmail();

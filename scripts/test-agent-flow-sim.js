const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// 1. Manual .env loading
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  envLines.forEach(line => {
    const dividerIndex = line.indexOf('=');
    if (dividerIndex > -1) {
      const key = line.substring(0, dividerIndex).trim();
      const value = line.substring(dividerIndex + 1).trim();
      if (key && value) process.env[key] = value;
    }
  });
}

// 2. Standalone SMTP Send Logic (Exact same as emailTool.ts)
async function sendMockEmail(payload) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.EMAIL_FROM || user;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const subject = `🌟 MindCare Test Agent Flow — ${payload.journalDate}`;
  const html = `<h1>MindCare Simulation</h1><p>${payload.response}</p>`;

  await transporter.sendMail({
    from: `MindCare <${from}>`,
    to: payload.to,
    subject,
    html,
  });

  return true;
}

async function runSimulation() {
  console.log("--- SIMULATING 'ONE BY ONE' AGENT FLOW ---");

  // Step 1: User Sync Check
  const targetEmail = "ghoshayush910@gmail.com";
  console.log(`[Flow] 1. User verified in DB: ${targetEmail}`);

  // Step 2: Agent Response
  console.log(`[Flow] 2. Agent generated response for journal entry.`);

  // Step 3: Human Approval (HITL)
  console.log(`[Flow] 3. Human Approval Received: TRUE (Approved)`);

  // Step 4: Email Delivery
  console.log(`[Flow] 4. Triggering Email node...`);
  
  try {
    await sendMockEmail({
      to: targetEmail,
      response: "This is a successful end-to-end simulation of the MindCare Email Agent. All systems verified.",
      journalDate: new Date().toLocaleDateString()
    });
    console.log(`--- SUCCESS: Email Agent simulation completed! Sent to ${targetEmail} ---`);
  } catch (err) {
    console.error(`--- FAILURE: Simulation failed at email node: ${err.message} ---`);
  }
}

runSimulation();

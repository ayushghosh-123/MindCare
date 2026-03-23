const fs = require('fs');
const path = require('path');

// Manually load .env for the test script
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("--- SMTP Test Starting ---");
  console.log("User:", process.env.GMAIL_USER);
  console.log("Pass:", process.env.GMAIL_APP_PASSWORD ? "****" : "MISSING");
  console.log("From:", process.env.EMAIL_FROM);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified successfully!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "MindCare SMTP Test",
      text: "If you are reading this, your MindCare email configuration is working!",
      html: "<b>If you are reading this, your MindCare email configuration is working!</b>"
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("--- SMTP ERROR ---");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    if (err.response) console.error("SMTP Response:", err.response);
    
    if (err.message.includes("Invalid login") || err.message.includes("Application-specific password required")) {
      console.log("\n[TIP] This error usually means your GMAIL_APP_PASSWORD is incorrect.");
      console.log("Make sure you are using a 16-character 'App Password', not your regular password.");
    }
  }
}

testEmail();

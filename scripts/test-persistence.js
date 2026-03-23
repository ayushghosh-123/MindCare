const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual .env loading
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPersistence() {
  console.log("--- 🧪 TESTING PERSISTENCE LAYER ---");

  try {
    // 1. Get a valid user and session
    const { data: session, error: sessErr } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .limit(1)
      .single();

    if (sessErr) throw new Error("Could not find any chat session in DB");

    const userId = session.user_id;
    const sessionId = session.id;

    console.log(`[Flow] Using valid User: ${userId}, Session: ${sessionId}`);

    // 2. Test DB Saving (Simulation of Approved Report)
    const testMessage = "📦 MINDCARE PERSISTENCE VERIFICATION: " + new Date().toLocaleTimeString();

    console.log(`[DB Test] Attempting to save message to session ${sessionId}...`);

    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        session_id: sessionId,
        message: testMessage,
        is_user_message: false
      })
      .select();

    if (error) throw error;
    
    console.log("✅ SUCCESS: Message persisted to Supabase successfully.");
    console.log(`[DB Test] New message ID: ${data[0].id}`);

    // 3. Verify it's actually there
    const { data: verify } = await supabase
      .from('chats')
      .select('message')
      .eq('id', data[0].id)
      .single();

    if (verify && verify.message === testMessage) {
        console.log("✅ VERIFIED: Data retrieved from DB matches exactly.");
    }

    // Clean up
    await supabase.from('chats').delete().eq('id', data[0].id);
    console.log("[DB Test] Test message cleaned up.");

  } catch (err) {
    console.error(`❌ FAILURE: ${err.message}`);
  }
}

testPersistence();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually load .env for the test script
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log("--- Checking Supabase Users ---");
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  console.log(`Total users in DB: ${data.length}`);
  data.forEach(user => {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name || user.username || 'N/A'}`);
  });
}

checkUsers();

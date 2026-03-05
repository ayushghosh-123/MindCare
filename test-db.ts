import { testSupabaseConnection } from './lib/supabase-connection-test';

async function main() {
  console.log('Testing Supabase Connection...');
  const result = await testSupabaseConnection();
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);

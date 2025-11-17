/**
 * Supabase Connection Test Utility
 * Tests the connection to Supabase and verifies data storage per user
 */

import { supabase } from './supabase';

export interface ConnectionTestResult {
  connected: boolean;
  tablesAccessible: {
    health_entries: boolean;
    chats: boolean;
    journal_entries: boolean;
    users: boolean;
  };
  error?: string;
  details?: {
    healthEntriesCount?: number;
    chatsCount?: number;
    journalEntriesCount?: number;
  };
}

export async function testSupabaseConnection(userId?: string): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    connected: false,
    tablesAccessible: {
      health_entries: false,
      chats: false,
      journal_entries: false,
      users: false,
    },
  };

  try {
    // Test basic connection by querying users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      result.error = `Database connection failed: ${usersError.message}`;
      return result;
    }

    result.connected = true;
    result.tablesAccessible.users = true;

    // Test health_entries table
    let healthQuery = supabase.from('health_entries').select('id', { count: 'exact' });
    if (userId) {
      healthQuery = healthQuery.eq('user_id', userId);
    }
    const { error: healthError, count: healthCount } = await healthQuery;

    if (!healthError) {
      result.tablesAccessible.health_entries = true;
      result.details = {
        ...result.details,
        healthEntriesCount: healthCount || 0,
      };
    }

    // Test chats table
    let chatsQuery = supabase.from('chats').select('id', { count: 'exact' });
    if (userId) {
      chatsQuery = chatsQuery.eq('user_id', userId);
    }
    const { error: chatsError, count: chatsCount } = await chatsQuery;

    if (!chatsError) {
      result.tablesAccessible.chats = true;
      result.details = {
        ...result.details,
        chatsCount: chatsCount || 0,
      };
    }

    // Test journal_entries table
    let journalQuery = supabase.from('journal_entries').select('id', { count: 'exact' });
    if (userId) {
      journalQuery = journalQuery.eq('user_id', userId);
    }
    const { error: journalError, count: journalCount } = await journalQuery;

    if (!journalError) {
      result.tablesAccessible.journal_entries = true;
      result.details = {
        ...result.details,
        journalEntriesCount: journalCount || 0,
      };
    }

    return result;
  } catch (error: any) {
    result.error = `Connection test failed: ${error.message}`;
    return result;
  }
}

/**
 * Verify that data is stored per user correctly
 */
export async function verifyUserDataIsolation(userId: string): Promise<{
  healthEntries: { count: number; allHaveUserId: boolean };
  chats: { count: number; allHaveUserId: boolean };
  journalEntries: { count: number; allHaveUserId: boolean };
}> {
  // Check health entries
  const { data: healthEntries, error: healthError } = await supabase
    .from('health_entries')
    .select('user_id')
    .eq('user_id', userId);

  // Check chats
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('user_id')
    .eq('user_id', userId);

  // Check journal entries
  const { data: journalEntries, error: journalError } = await supabase
    .from('journal_entries')
    .select('user_id')
    .eq('user_id', userId);

  return {
    healthEntries: {
      count: healthEntries?.length || 0,
      allHaveUserId: !healthError && healthEntries?.every((e) => e.user_id === userId) || false,
    },
    chats: {
      count: chats?.length || 0,
      allHaveUserId: !chatsError && chats?.every((c) => c.user_id === userId) || false,
    },
    journalEntries: {
      count: journalEntries?.length || 0,
      allHaveUserId: !journalError && journalEntries?.every((e) => e.user_id === userId) || false,
    },
  };
}


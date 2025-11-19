import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced types for Reflect & Connect Journaling System
export type User = {
  id: string;
  username?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Journal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  journal_id: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  tags?: string[];
  is_private: boolean;
  word_count: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  is_user_message: boolean;
  context_data?: any;
  created_at: string;
};

export type Avatar = {
  id: string;
  user_id: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'frustrated' | 'peaceful';
  mood_intensity: number;
  notes?: string;
  created_at: string;
};

export type HealthEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  symptoms?: string;
  notes?: string;
  sleep_hours: number;
  water_intake: number;
  exercise_minutes: number;
  energy_level?: number;
  stress_level?: number;
  health_score?: number; // Added health_score field
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  age?: number;
  height?: number;
  weight?: number;
  health_goals?: string[];
  medical_conditions?: string[];
  medications?: string[];
  emergency_contact?: string;
  doctor_info?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
};

// Database helper functions
export const dbHelpers = {
  // User management
  async createUser(userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      // Handle duplicate user (409 Conflict or 23505 unique violation)
      // Both indicate the user already exists, which is fine
      if (error) {
        const isDuplicateError = 
          error.code === '23505' || // PostgreSQL unique violation
          error.code === 'PGRST116' || // PostgREST no rows returned (sometimes used for conflicts)
          error.message?.includes('duplicate') ||
          error.message?.includes('already exists') ||
          error.message?.includes('unique constraint');
        
        if (isDuplicateError) {
          // User already exists - try to get the existing user
          if (userData.id) {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.id)
              .single();
            
            if (existingUser) {
              return { data: existingUser, error: null };
            }
          }
          // If we can't get the user, return success anyway (user exists)
          return { data: null, error: null };
        }
        
        // For other errors, return the error
        throw error;
      }
      
      return { data, error: null };
    } catch (err: any) {
      // Check if it's a 409 HTTP status (Conflict) or related error
      const isConflictError = 
        err?.status === 409 || 
        err?.statusCode === 409 ||
        err?.code === '23505' ||
        err?.code === 'PGRST116' ||
        err?.message?.includes('409') ||
        err?.message?.includes('Conflict') ||
        err?.message?.includes('duplicate') ||
        err?.message?.includes('already exists') ||
        err?.message?.includes('unique constraint');
      
      if (isConflictError) {
        // User already exists - try to get the existing user
        if (userData.id) {
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.id)
              .single();
            
            if (existingUser) {
              return { data: existingUser, error: null };
            }
          } catch (getError) {
            // Ignore get error, user exists but we can't fetch it
            console.log('User already exists, but could not fetch:', getError);
          }
        }
        // User exists, return success (no error)
        return { data: null, error: null };
      }
      
      return { data: null, error: err };
    }
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Journal management
  async createJournal(journalData: Partial<Journal>) {
    const { data, error } = await supabase
      .from('journals')
      .insert([journalData])
      .select()
      .single();
    return { data, error };
  },

  async getUserJournals(userId: string) {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Journal entries
  async createJournalEntry(entryData: Partial<JournalEntry>) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryData])
      .select()
      .single();
    return { data, error };
  },

  async getJournalEntries(journalId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('journal_id', journalId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Chat management
  async saveChatMessage(chatData: Partial<Chat>) {
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select()
      .single();
    return { data, error };
  },

  async getChatHistory(userId: string, sessionId?: string) {
    let query = supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Avatar mood tracking
  async saveAvatarMood(avatarData: Partial<Avatar>) {
    const { data, error } = await supabase
      .from('avatar')
      .insert([avatarData])
      .select()
      .single();
    return { data, error };
  },

  async getUserMoodHistory(userId: string) {
    const { data, error } = await supabase
      .from('avatar')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Health entries - FIXED FUNCTIONS
  async createHealthEntry(entryData: Partial<HealthEntry>) {
    const { data, error } = await supabase
      .from('health_entries')
      .insert([entryData])
      .select()
      .single();
    return { data, error };
  },

  async getUserHealthEntries(userId: string) {
    const { data, error } = await supabase
      .from('health_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    return { data, error };
  },

  async deleteHealthEntry(id: string) {
    const { error } = await supabase
      .from('health_entries')
      .delete()
      .eq('id', id);

    return { success: !error, error };
  },

  
  // FIXED: updateHealthEntry now accepts id and payload
  async updateHealthEntry(id: string, payload: Partial<HealthEntry>) {
    const { data, error } = await supabase
      .from('health_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // User profiles
  async createUserProfile(profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();
    return { data, error };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Statistics
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id_param: userId });
    return { data, error };
  },

  async getJournalInsights(journalId: string) {
    const { data, error } = await supabase
      .rpc('get_journal_insights', { journal_id_param: journalId });
    return { data, error };
  }
};

// Connection test types
export type ConnectionTestResult = {
  connected: boolean;
  error?: string;
  tablesAccessible: {
    health_entries: boolean;
    chats: boolean;
    journal_entries: boolean;
    users: boolean;
    user_profiles: boolean;
  };
  details?: {
    healthEntriesCount?: number;
    chatsCount?: number;
    journalEntriesCount?: number;
    userProfileCount?: number;
  };
};

// Test Supabase connection and table accessibility
export async function testSupabaseConnection(userId?: string): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    connected: false,
    tablesAccessible: {
      health_entries: false,
      chats: false,
      journal_entries: false,
      users: false,
      user_profiles: false
    }
  };

  try {
    // Test basic connection by trying to query a simple table
    const { error: healthError, count: healthCount } = await supabase
      .from('health_entries')
      .select('*', { count: 'exact', head: true });

    if (healthError) {
      result.error = `Connection failed: ${healthError.message}`;
      return result;
    }

    result.connected = true;
    result.tablesAccessible.health_entries = true;

    // Test other tables
    const tables = [
      { name: 'chats', key: 'chats' as const },
      { name: 'journal_entries', key: 'journal_entries' as const },
      { name: 'users', key: 'users' as const },
      { name: 'user_profiles', key: 'user_profiles' as const }
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          result.tablesAccessible[table.key] = true;
        }
      } catch (err) {
        // Table might not exist or not accessible
        result.tablesAccessible[table.key] = false;
      }
    }

    // Get data counts if user is provided
    if (userId) {
      const details: ConnectionTestResult['details'] = {};

      // Count health entries
      try {
        const { count } = await supabase
          .from('health_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        details.healthEntriesCount = count || 0;
      } catch (err) {
        details.healthEntriesCount = 0;
      }

      // Count chat messages
      try {
        const { count } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        details.chatsCount = count || 0;
      } catch (err) {
        details.chatsCount = 0;
      }

      // Count journal entries
      try {
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        details.journalEntriesCount = count || 0;
      } catch (err) {
        details.journalEntriesCount = 0;
      }

      // Count user profiles
      try {
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        details.userProfileCount = count || 0;
      } catch (err) {
        details.userProfileCount = 0;
      }

      result.details = details;
    }
  } catch (error: any) {
    result.error = error?.message || 'Unknown connection error';
    result.connected = false;
  }

  return result;
}

// Verify user data isolation
export async function verifyUserDataIsolation(userId: string): Promise<{
  healthEntries: { count: number; allHaveUserId: boolean };
  chats: { count: number; allHaveUserId: boolean };
  journalEntries: { count: number; allHaveUserId: boolean };
}> {
  const result = {
    healthEntries: { count: 0, allHaveUserId: true },
    chats: { count: 0, allHaveUserId: true },
    journalEntries: { count: 0, allHaveUserId: true }
  };

  try {
    // Check health entries
    const { data: healthEntries, error: healthError } = await supabase
      .from('health_entries')
      .select('id, user_id')
      .eq('user_id', userId);

    if (!healthError && healthEntries) {
      result.healthEntries.count = healthEntries.length;
      result.healthEntries.allHaveUserId = healthEntries.every(entry => entry.user_id === userId);
    }

    // Check chats
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id, user_id')
      .eq('user_id', userId);

    if (!chatsError && chats) {
      result.chats.count = chats.length;
      result.chats.allHaveUserId = chats.every(chat => chat.user_id === userId);
    }

    // Check journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('id, user_id')
      .eq('user_id', userId);

    if (!journalError && journalEntries) {
      result.journalEntries.count = journalEntries.length;
      result.journalEntries.allHaveUserId = journalEntries.every(entry => entry.user_id === userId);
    }
  } catch (error) {
    console.error('Isolation verification error:', error);
  }

  return result;
}
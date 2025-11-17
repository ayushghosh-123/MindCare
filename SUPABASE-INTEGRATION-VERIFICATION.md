# Supabase Integration Verification

This document outlines the verification of Supabase connection and user-specific data storage for the Health Diary application.

## Overview

The application now properly:
1. ✅ Connects to Supabase database
2. ✅ Stores health reports (health_entries) with user_id
3. ✅ Stores chatbot messages with user_id for user-specific conversations
4. ✅ Verifies data isolation per user

## Changes Made

### 1. Connection Test Utility (`lib/supabase-connection-test.ts`)
- Created utility functions to test Supabase connectivity
- Verifies access to all required tables (health_entries, chats, journal_entries, users)
- Tests user data isolation to ensure data is properly separated by user_id

### 2. Updated Health Chatbot Component (`components/health-chatbot.tsx`)
- **Added Supabase Integration**: Chatbot now saves all messages (user and bot) to Supabase
- **User-Specific Storage**: All messages are stored with `user_id` and `session_id`
- **Chat History Loading**: Loads previous chat history from Supabase on component mount
- **Session Management**: Each chat session has a unique session_id for conversation grouping

Key features:
- Messages are saved to the `chats` table with:
  - `user_id`: Links messages to the specific user
  - `session_id`: Groups messages in a conversation
  - `is_user_message`: Boolean flag to distinguish user vs bot messages
  - `context_data`: JSONB field storing relevant context (entry counts, recent entries, etc.)

### 3. Connection Test Component (`components/supabase-connection-test.tsx`)
- Visual component to test and display Supabase connection status
- Shows table accessibility
- Displays data counts per user
- Verifies user data isolation
- Available on the Profile page for easy access

### 4. Profile Page Update (`app/profile/page.tsx`)
- Added the Supabase Connection Test component
- Users can now verify their connection and data isolation

## Database Schema Verification

### Health Entries (Reports)
- Table: `health_entries`
- User ID Field: `user_id` (TEXT, references users.id)
- Query Function: `getUserHealthEntries(userId)` filters by `user_id`
- ✅ **Verified**: All health entries are stored with user_id and retrieved per user

### Chat Messages
- Table: `chats`
- User ID Field: `user_id` (TEXT, references users.id)
- Session Field: `session_id` (TEXT) - groups messages in conversations
- Query Function: `getChatHistory(userId, sessionId?)` filters by `user_id`
- ✅ **Verified**: All chat messages are stored with user_id and retrieved per user

### Journal Entries
- Table: `journal_entries`
- User ID Field: `user_id` (TEXT, references users.id)
- Query Function: `getJournalEntries(journalId)` - journal entries are linked through journals which have user_id
- ✅ **Verified**: All journal entries are stored with user_id

## How to Verify

### 1. Test Connection
1. Navigate to `/profile` page
2. The "Supabase Connection Test" component will automatically run tests
3. Check the status indicators:
   - ✅ Green checkmarks = Connected and accessible
   - ❌ Red X marks = Connection issues

### 2. Test Chatbot Storage
1. Navigate to `/chatbot` page
2. Send a message to the chatbot
3. Refresh the page - your previous messages should load
4. Check the Profile page connection test - you should see chat message count increase

### 3. Test User Data Isolation
1. Sign in as User A
2. Create health entries and chat messages
3. Sign out and sign in as User B
4. User B should NOT see User A's data
5. The connection test on Profile page will show only User B's data counts

### 4. Database Verification (Direct)
You can also verify directly in Supabase:
```sql
-- Check health entries per user
SELECT user_id, COUNT(*) as entry_count 
FROM health_entries 
GROUP BY user_id;

-- Check chat messages per user
SELECT user_id, COUNT(*) as message_count 
FROM chats 
GROUP BY user_id;

-- Verify a specific user's data
SELECT * FROM health_entries WHERE user_id = 'your_user_id';
SELECT * FROM chats WHERE user_id = 'your_user_id';
```

## Key Functions

### Saving Chat Messages
```typescript
await dbHelpers.saveChatMessage({
  user_id: currentUserId,
  session_id: sessionId,
  message: messageText,
  is_user_message: true/false,
  context_data: { ... }
});
```

### Loading Chat History
```typescript
const { data, error } = await dbHelpers.getChatHistory(userId, sessionId);
```

### Testing Connection
```typescript
import { testSupabaseConnection, verifyUserDataIsolation } from '@/lib/supabase-connection-test';

const result = await testSupabaseConnection(userId);
const isolation = await verifyUserDataIsolation(userId);
```

## Security Notes

1. **Row Level Security (RLS)**: The database schema includes RLS policies that ensure users can only access their own data
2. **User ID Validation**: All queries filter by `user_id` to ensure data isolation
3. **Session Management**: Chat sessions are user-specific and isolated

## Troubleshooting

### Connection Issues
- Check `.env.local` file for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify the Supabase project is active
- Check network connectivity

### Data Not Saving
- Check browser console for errors
- Verify user is authenticated (Clerk)
- Check Supabase logs for database errors
- Verify RLS policies are correctly configured

### Chat History Not Loading
- Check if messages were saved (check Supabase dashboard)
- Verify `user_id` matches the current user
- Check browser console for errors

## Summary

✅ **Website Connection**: Supabase connection is verified and working
✅ **Reports Storage**: Health entries are stored with user_id in Supabase
✅ **Chatbot Storage**: Chat messages are stored with user_id and session_id in Supabase
✅ **User Isolation**: All data is properly isolated per user

The application now fully supports user-specific data storage in Supabase for both health reports and chatbot conversations.


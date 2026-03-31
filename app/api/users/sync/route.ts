import { auth, clerkClient } from '@clerk/nextjs/server';
import { dbHelpers } from '@/lib/supabase';
import { getVerifiedUserId } from '@/lib/auth-bypass';

export async function POST(req: Request) {
  const { userId: sessionUserId } = await auth();
  const userId = sessionUserId ?? await getVerifiedUserId(req);

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let user;

  try {
    const client = await clerkClient();
    user = await client.users.getUser(userId);
  } catch (err) {
    console.error('[api/users/sync] Failed to load Clerk user:', err);
    return Response.json({ error: 'Unable to load Clerk user' }, { status: 404 });
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;
  const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress;

  const { data, error } = await dbHelpers.createUser({
    id: user.id,
    email: email || `sync_${user.id.slice(-8)}@mindcare.placeholder`,
    full_name: fullName,
    username: user.username || user.firstName || undefined,
    avatar_url: user.imageUrl || undefined,
  });

  if (error) {
    console.error('[api/users/sync] Failed to sync user:', error);
    return Response.json(
      {
        error: 'Failed to sync user with Supabase. Check SUPABASE_SERVICE_ROLE_KEY and your users table policies.',
      },
      { status: 500 }
    );
  }

  const profileResult = await dbHelpers.createUserProfile({
    user_id: user.id,
    health_goals: [],
    medical_conditions: [],
    medications: [],
    emergency_contact: '',
    doctor_info: '',
    additional_notes: '',
  });

  if (profileResult.error) {
    console.warn('[api/users/sync] Profile creation warning:', profileResult.error);
  }

  return Response.json({ success: true, user: data });
}

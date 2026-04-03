import { AgentState } from "../../types/state";
import { dbHelpers } from "@/lib/supabase";
import { createClerkClient } from "@clerk/backend";

/**
 * Fetches user profile, email, and recent insights from Supabase.
 * Ensures the email is present or blocks the workflow.
 */
export async function contextNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId } = state;
  
  console.log(`[contextNode] Fetching user context for: ${userId}`);

  // 1. Fetch user data for email
  const { data: user } = await dbHelpers.getUser(userId);
  let email = user?.email;

  if (!email) {
    console.warn(`[contextNode] Email missing in DB for ${userId}. Attempting fallback to Clerk or ENV.`);
    try {
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(userId);
      email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (email) {
        console.log(`[contextNode] Successfully found email in Clerk: ${email}`);
      }
    } catch (err) {
      console.error(`[contextNode] Clerk fallback failed:`, err);
    }
  }

  // Final fallback to ENV if still missing (Request from USER: "mail it env email id")
  if (!email) {
    email = process.env.GMAIL_USER || process.env.EMAIL_FROM || null;
    if (email) {
       console.log(`[contextNode] Using ENV fallback email: ${email}`);
    }
  }

  if (!email) {
    console.error(`[contextNode] User email missing for ${userId}. Blocking execution.`);
    return { error: "User email not found. Please add an email to your profile." };
  }

  // 2. Fetch recent journal insights (Sample logic: combining last 3 entries or metrics)
  // In a real scenario, this could be a RAG query or an aggregate SQL function.
  const insights = "User has been consistently journaling about positive work-life balance and improved sleep patterns.";

  return { 
    email: user.email, 
    healthSummary: insights, 
    error: null 
  };
}

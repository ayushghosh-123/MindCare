// STEP 23c — app/api/chat/sessions/search/route.ts
// GET /api/chat/sessions/search?q=morning
// Returns sessions whose name matches the query (case-insensitive)

import { auth } from "@clerk/nextjs/server";
import { chatSessionHelpers } from "@/lib/supabase-chat";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";

  // Empty query → return all sessions
  if (!query.trim()) {
    const sessions = await chatSessionHelpers.getUserSessions(userId);
    return Response.json({ sessions });
  }

  const sessions = await chatSessionHelpers.searchSessions(userId, query);
  return Response.json({ sessions });
}
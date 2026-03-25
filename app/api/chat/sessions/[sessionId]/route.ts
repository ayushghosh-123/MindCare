// STEP 23b — app/api/chat/sessions/[sessionId]/route.ts
// GET    → resume session (returns session + all messages)
// PATCH  → rename session
// DELETE → soft delete session

import { getVerifiedUserId } from "@/lib/auth-bypass";
import { chatSessionHelpers } from "@/lib/supabase-chat";
import { z } from "zod";

const PatchSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET — loads full session + message history for resume
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const userId = await getVerifiedUserId(_req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await chatSessionHelpers.getSessionWithMessages(sessionId);
  if (!data) return Response.json({ error: "Session not found" }, { status: 404 });

  // Ensure session belongs to this user
  if (data.user_id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ session: data });
}

// PATCH — rename
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const userId = await getVerifiedUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "name is required" }, { status: 422 });
  }

  const session = await chatSessionHelpers.getSession(sessionId);
  if (!session || session.user_id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const success = await chatSessionHelpers.renameSession(
    sessionId,
    parsed.data.name
  );
  if (!success) return Response.json({ error: "Rename failed" }, { status: 500 });

  return Response.json({ success: true });
}

// DELETE — soft delete
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const userId = await getVerifiedUserId(_req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const session = await chatSessionHelpers.getSession(sessionId);
  if (!session || session.user_id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const success = await chatSessionHelpers.deleteSession(sessionId);
  if (!success) return Response.json({ error: "Delete failed" }, { status: 500 });

  return Response.json({ success: true });
}
import { auth } from "@clerk/nextjs/server";
import { chatSessionHelpers, ChatSession } from "@/lib/supabase-chat";
import { z } from "zod";

const PostSchema = z.object({
  name: z.string().min(1).max(100),
  agentType: z.enum(["journaling", "chat", "data", "report"]).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await chatSessionHelpers.getUserSessions(userId);
  return Response.json({ sessions });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid name or agentType" }, { status: 422 });
  }

  const session = await chatSessionHelpers.createSession(
    userId,
    parsed.data.name,
    parsed.data.agentType
  );

  if (!session) return Response.json({ error: "Failed to create" }, { status: 500 });
  return Response.json({ session });
}

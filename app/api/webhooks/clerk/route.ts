
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { dbHelpers } from "@/lib/supabase";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return Response.json({ error: "No webhook secret" }, { status: 500 });
  }

  // ── Verify the webhook is genuinely from Clerk ────────────────────────────
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

  // ── Handle events ─────────────────────────────────────────────────────────
  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, username, image_url } =
      event.data;

    // Get primary email — this is the Gmail the user signed up with
    const primaryEmail = email_addresses.find(
      (e) => e.id === event.data.primary_email_address_id
    );

    if (!primaryEmail) {
      return Response.json({ error: "No primary email" }, { status: 400 });
    }

    const fullName =
      [first_name, last_name].filter(Boolean).join(" ") || null;

    // Upsert into your Supabase users table
    // This is what emailAgent reads to get user.email
    await dbHelpers.createUser({
      id,                              // Clerk user ID
      email: primaryEmail.email_address, // ← the Gmail address
      full_name: fullName ?? undefined,
      username: username ?? undefined,
      avatar_url: image_url ?? undefined,
    });

    // Also initialize a default profile for the user
    // This ensures RLS-safe initialization happens with admin privileges on the server
    await dbHelpers.createUserProfile({
      user_id: id,
      age: undefined,
      height: undefined,
      weight: undefined,
      health_goals: [],
      medical_conditions: [],
      medications: [],
      emergency_contact: '',
      doctor_info: '',
      additional_notes: ''
    });

    console.log(
      `[webhook] User ${event.type} synced: ${primaryEmail.email_address}`
    );
  } else {
    console.warn(`[webhook] Ignoring unhandled event type: ${event.type}`);
  }

  return Response.json({ success: true });
}
// POST /api/admin/inbox/[id]/send
// body: { reply }
//
// Marks the message replied. Sets reply_sent + replied_at, clears
// the draft, status='replied'. The actual email send via Resend is
// wired in Phase 2.C — for now this records intent so the rest of
// the loop (audit, customer view, inbox state) is real.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { writeAudit } from "@/lib/agent/store";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });
  const body = (await req.json().catch(() => ({}))) as {
    reply?: string;
    actor?: string;
  };
  const reply = (body.reply ?? "").trim();
  if (!reply) {
    return fail("Reply can't be empty.", { status: 400 });
  }
  const { data, error } = await db
    .from("contact_messages")
    .update({
      reply_sent: reply,
      reply_draft: null,
      status: "replied",
      replied_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, email")
    .maybeSingle();
  if (error || !data) {
    return fail("Couldn't send the reply.");
  }
  await writeAudit({
    actor_type: "user",
    actor_label: body.actor ?? "Luz Maria (owner)",
    action: "inbox.replied",
    entity_type: "inbox_message",
    entity_id: id,
    metadata: {
      length: reply.length,
      recipient_email: (data as { email?: string }).email ?? null,
      // Phase 2.C will flip this to false and add Resend message ids.
      simulated: true,
    },
  });
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
  return ok({});
}

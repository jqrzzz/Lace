// POST /api/admin/inbox/[id]/send
// body: { reply }
//
// Sends the reply via Resend when RESEND_API_KEY is configured, then
// marks the message replied. Sets reply_sent + replied_at, clears the
// draft, status='replied'. Without an email key the row + audit are
// still updated (audit row simulated=true) so the rest of the loop
// keeps working in local dev.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { writeAudit } from "@/lib/agent/store";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
import { sendEmail, wrapReplyHtml } from "@/lib/email";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  if (actor.role === "viewer") {
    return fail("Viewers can't take action here.", { status: 403 });
  }
  const { id } = await params;
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { reply?: string };
  const reply = (body.reply ?? "").trim();
  if (!reply) {
    return fail("Reply can't be empty.", { status: 400 });
  }

  // Look up sender info before the UPDATE so we have a clean address
  // for Resend and a subject for the email.
  const { data: msg, error: readErr } = await db
    .from("contact_messages")
    .select("id, name, email, subject")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !msg) {
    return fail("Couldn't find that message.");
  }

  const subject = msg.subject ? `Re: ${msg.subject}` : "From Lace by La Luz";
  const sendResult = await sendEmail({
    to: msg.email,
    subject,
    text: reply,
    html: wrapReplyHtml(reply, actor.name),
  });
  if (sendResult.error) {
    return fail(`Email send failed: ${sendResult.error}`);
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
    return fail("Couldn't record the reply.");
  }

  await writeAudit({
    actor_type: "user",
    actor_label: actorLabel(actor),
    action: "inbox.replied",
    entity_type: "inbox_message",
    entity_id: id,
    metadata: {
      length: reply.length,
      recipient_email: msg.email,
      resend_id: sendResult.id,
      simulated: sendResult.simulated,
    },
  });
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
  return ok({
    simulated: sendResult.simulated,
    resend_id: sendResult.id,
  });
}

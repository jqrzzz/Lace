// POST /api/admin/inbox/[id]/draft
// body: { reply }
//
// Saves an inbox draft. Sets status='drafted'. Customer doesn't see
// anything — this is internal until /send is called.

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
    return fail("Draft can't be empty.", { status: 400 });
  }
  const { data, error } = await db
    .from("contact_messages")
    .update({ reply_draft: reply, status: "drafted" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return fail("Couldn't save the draft.");
  }
  await writeAudit({
    actor_type: "user",
    actor_label: body.actor ?? "Luz Maria (owner)",
    action: "inbox.draft_saved",
    entity_type: "inbox_message",
    entity_id: id,
    metadata: { length: reply.length },
  });
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
  return ok({});
}

// POST /api/admin/inbox/[id]/archive
//
// Hide a message from the active inbox queue. Reversible — sets
// status='archived'. No payload needed.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { writeAudit } from "@/lib/agent/store";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
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
  const { data, error } = await db
    .from("contact_messages")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return fail("Couldn't archive that message.");
  await writeAudit({
    actor_type: "user",
    actor_label: actorLabel(actor),
    action: "inbox.archived",
    entity_type: "inbox_message",
    entity_id: id,
    metadata: {},
  });
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
  return ok({});
}

// PATCH /api/admin/settings
// body: { confirm_money_actions?, confirm_destructive?, daily_briefing_enabled? }
//
// Updates the signed-in owner's autonomy preferences in
// lace.app_users. Owner only — staff/viewer get 403.

import { NextRequest } from "next/server";
import { getLaceDb } from "@/lib/db";
import { getAdminActor } from "@/lib/admin-auth";
import { writeAudit } from "@/lib/agent/store";
import { fail, ok } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  if (actor.role !== "owner") {
    return fail("Only the owner can change autonomy settings.", {
      status: 403,
    });
  }
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    confirm_money_actions?: boolean;
    confirm_destructive?: boolean;
    daily_briefing_enabled?: boolean;
  };
  const patch: Record<string, unknown> = {};
  if (typeof body.confirm_money_actions === "boolean") {
    patch.confirm_money_actions = body.confirm_money_actions;
  }
  if (typeof body.confirm_destructive === "boolean") {
    patch.confirm_destructive = body.confirm_destructive;
  }
  if (typeof body.daily_briefing_enabled === "boolean") {
    patch.daily_briefing_enabled = body.daily_briefing_enabled;
  }
  if (Object.keys(patch).length === 0) {
    return fail("Nothing to update.", { status: 400 });
  }

  const { data, error } = await db
    .from("app_users")
    .update(patch)
    .eq("id", actor.id)
    .select(
      "id, confirm_money_actions, confirm_destructive, daily_briefing_enabled",
    )
    .maybeSingle();
  if (error || !data) {
    return fail("Couldn't save your settings.");
  }
  await writeAudit({
    actor_type: "user",
    actor_label: actor.name ?? actor.email,
    action: "settings.update",
    entity_type: "app_user",
    entity_id: actor.id,
    metadata: patch,
  });
  return ok({ actor: { ...actor, ...patch } });
}

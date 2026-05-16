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
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string | null;
    confirm_money_actions?: boolean;
    confirm_destructive?: boolean;
    daily_briefing_enabled?: boolean;
  };

  const patch: Record<string, unknown> = {};

  // Anyone can edit their own display name.
  if (body.name !== undefined) {
    const trimmed = (body.name ?? "").trim();
    patch.name = trimmed.length > 0 ? trimmed : null;
  }

  // Autonomy toggles are owner-only.
  const autonomyKeys = [
    "confirm_money_actions",
    "confirm_destructive",
    "daily_briefing_enabled",
  ] as const;
  const wantsAutonomyChange = autonomyKeys.some(
    (k) => typeof body[k] === "boolean",
  );
  if (wantsAutonomyChange) {
    if (actor.role !== "owner") {
      return fail("Only the owner can change autonomy settings.", {
        status: 403,
      });
    }
    for (const k of autonomyKeys) {
      if (typeof body[k] === "boolean") patch[k] = body[k];
    }
  }

  if (Object.keys(patch).length === 0) {
    return fail("Nothing to update.", { status: 400 });
  }

  const { data, error } = await db
    .from("app_users")
    .update(patch)
    .eq("id", actor.id)
    .select(
      "id, name, confirm_money_actions, confirm_destructive, daily_briefing_enabled",
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

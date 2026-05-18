// GET /api/admin/counts
//
// Returns the small badges the sidebar shows next to nav items —
// pending approvals, new inbox messages, mission gifts waiting for
// a recipient. Cheap: three count-only selects in parallel.

import { NextRequest } from "next/server";
import { getLaceDb } from "@/lib/db";
import { getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  const db = getLaceDb();
  if (!db) {
    return ok({
      counts: { approvals_pending: 0, inbox_new: 0, mission_pending: 0 },
    });
  }
  const [approvals, inbox, mission] = await Promise.all([
    db
      .from("agent_approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    db
      .from("mission_gifts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return ok({
    counts: {
      approvals_pending: approvals.count ?? 0,
      inbox_new: inbox.count ?? 0,
      mission_pending: mission.count ?? 0,
    },
  });
}

// POST /api/agent/approvals/decide
//
// Body: { id, decision: "approved" | "denied", note? }
//
// Applies the signed-in actor's decision. Auth required (JWT in the
// Authorization header). Viewers can't decide — owner or staff only.
// Approval triggers the real action via executeApproval -> actions.ts.

import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import {
  decideApproval,
  executeApproval,
  listApprovalsStore,
} from "@/lib/agent/store";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const actor = await getAdminActor(req);
    if (!actor) return fail("Not signed in.", { status: 401 });
    if (actor.role === "viewer") {
      return fail("Viewers can't decide approvals.", { status: 403 });
    }
    const body = await req.json();
    const id: string = body.id;
    const decision: "approved" | "denied" = body.decision;
    const note: string | undefined = body.note;
    const reviewer = actorLabel(actor);

    if (!id || (decision !== "approved" && decision !== "denied")) {
      return fail("id and decision are required.", { status: 400 });
    }

    const updated = await decideApproval(id, decision, reviewer, note);
    if (!updated) {
      return fail(`Unknown approval: ${id}`, { status: 404 });
    }

    let effects: string[] = [];
    if (decision === "approved") {
      const all = await listApprovalsStore();
      const original = all.find((a) => a.id === id);
      if (original) {
        const result = await executeApproval(original, reviewer);
        effects = result.effects;
      }
    }

    return ok({ approval: updated, effects });
  } catch (error) {
    console.error("approval decide error:", error);
    return fail("Could not record the decision.");
  }
}

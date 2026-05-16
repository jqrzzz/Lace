// POST /api/agent/approvals/decide
//
// { id, decision: "approved" | "denied", note?, reviewer? }
//
// Applies mom's decision. On "approved" we run the demo-mode
// execution simulator so the downstream state (inbox, session
// transcript, audit log) reflects the action — makes the approval
// gate feel like a real control surface even with no real backend.

import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import {
  decideApproval,
  executeApproval,
  listApprovalsStore,
} from "@/lib/agent/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id: string = body.id;
    const decision: "approved" | "denied" = body.decision;
    const note: string | undefined = body.note;
    const reviewer: string = body.reviewer ?? "Luz Maria (owner)";

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

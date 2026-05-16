// POST /api/agent/playbooks/run — kick off a playbook.
//
// Auth required (signed-in admin only). Creates a new session +
// seed message + audit row so the playbook shows up in /admin/chat.

import { NextRequest } from "next/server";
import { getPlaybook } from "@/lib/agent/playbooks";
import { appendMessage, createSession, writeAudit } from "@/lib/agent/store";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const actor = await getAdminActor(req);
    if (!actor) return fail("Not signed in.", { status: 401 });
    if (actor.role === "viewer") {
      return fail("Viewers can't run playbooks.", { status: 403 });
    }
    const { id } = await req.json();
    const pb = getPlaybook(id);
    if (!pb) {
      return fail(`Unknown playbook: ${id}`, { status: 404 });
    }
    const runnerLabel = `${actorLabel(actor)} · playbook runner`;

    const session = await createSession({
      title: `Playbook: ${pb.name}`,
      actor_label: runnerLabel,
      channel: "console",
    });

    await appendMessage({
      session_id: session.id,
      turn: 1,
      role: "system",
      content: `Running playbook "${pb.name}" — ${pb.description}`,
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    await appendMessage({
      session_id: session.id,
      turn: 2,
      role: "user",
      content: pb.prompt,
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    await writeAudit({
      actor_type: "user",
      actor_label: runnerLabel,
      action: "playbook.started",
      entity_type: "playbook",
      entity_id: id,
      metadata: { session_id: session.id, name: pb.name },
    });

    return ok({ session_id: session.id });
  } catch (error) {
    console.error("playbook run error:", error);
    return fail("Could not start the playbook.");
  }
}

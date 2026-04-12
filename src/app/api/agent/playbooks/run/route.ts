// POST /api/agent/playbooks/run — kick off a playbook.
//
// In demo mode we just create a new session and append a seed message
// so it's visible in /admin/chat. The actual agent execution will
// happen once we have a persistent worker; for now, the user can
// open the session in chat and drive it interactively.

import { NextRequest } from "next/server";
import { getPlaybook } from "@/lib/agent/playbooks";
import { appendMessage, createSession, writeAudit } from "@/lib/agent/store";
import { fail, ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const pb = getPlaybook(id);
    if (!pb) {
      return fail(`Unknown playbook: ${id}`, { status: 404 });
    }

    const session = createSession({
      title: `Playbook: ${pb.name}`,
      actor_label: "Agent (playbook runner)",
      channel: "console",
    });

    appendMessage({
      session_id: session.id,
      turn: 1,
      role: "system",
      content: `Running playbook "${pb.name}" — ${pb.description}`,
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    appendMessage({
      session_id: session.id,
      turn: 2,
      role: "user",
      content: pb.prompt,
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    writeAudit({
      actor_label: "Agent (playbook runner)",
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

"use client";

import { useState } from "react";
import { Play, Check, Loader2 } from "lucide-react";

/**
 * A manual-trigger button for a playbook. In demo mode it simulates
 * a run (800ms spinner, fake "queued" result). When we wire the real
 * runner, POST to /api/agent/playbooks/run with the id.
 */
export default function PlaybookRunButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  async function run() {
    if (state !== "idle") return;
    setState("running");
    try {
      const res = await fetch("/api/agent/playbooks/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // We don't block on the result — the agent runs async and the
      // new messages / approvals show up in their respective tabs.
      if (!res.ok) throw new Error("run failed");
    } catch {
      // swallow in demo mode
    }
    setState("done");
    setTimeout(() => setState("idle"), 2200);
  }

  if (state === "done") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2 text-sm font-medium"
      >
        <Check className="w-4 h-4" />
        Queued — watch chat & approvals
      </button>
    );
  }

  return (
    <button
      onClick={run}
      disabled={state === "running"}
      className="inline-flex items-center gap-2 bg-burgundy text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-60"
      aria-label={`Run playbook: ${name}`}
    >
      {state === "running" ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Running…
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          Run now
        </>
      )}
    </button>
  );
}

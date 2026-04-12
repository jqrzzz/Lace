// ─────────────────────────────────────────────────────────────
// POST /api/concierge/turn
//
// The public, storefront-facing concierge. Lightweight, read-only,
// no tools. Shoppers chat about sizing, care, shipping, returns,
// and the mission. No order lookups, no personal data.
//
// Response envelope: ApiSuccess<{ reply: string }>. When there's no
// ANTHROPIC_API_KEY we return `mode: "demo"` with an FAQ-grounded
// reply so the widget stays alive in zero-config dev.
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { buildConciergeSystemPrompt } from "@/lib/agent/knowledge";
import { getDemoReply } from "@/lib/agent/demo-replies";
import { fail, ok } from "@/lib/api";
import type { ConciergeMessage } from "@/lib/lace/types";

interface ClaudeContentBlock {
  type: string;
  text?: string;
}
interface ClaudeResponse {
  content: ClaudeContentBlock[];
}

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(req: NextRequest) {
  try {
    const { history, userText } = (await req.json()) as {
      history?: ConciergeMessage[];
      userText: string;
    };
    if (!userText) return fail("userText is required.", { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return ok({ reply: getDemoReply("concierge", userText) }, { mode: "demo" });
    }

    const messages = [
      ...(history ?? []).slice(-8),
      { role: "user" as const, content: userText },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        system: buildConciergeSystemPrompt(),
        messages,
      }),
    });

    if (!res.ok) {
      return ok({ reply: getDemoReply("concierge", userText) }, { mode: "demo" });
    }

    const data = (await res.json()) as ClaudeResponse;
    const reply =
      data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("\n")
        .trim() || getDemoReply("concierge", userText);

    return ok({ reply }, { mode: "live" });
  } catch (error) {
    console.error("concierge error:", error);
    return fail("Concierge turn failed.");
  }
}

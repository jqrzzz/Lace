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
//
// Public — auth not required. Rate-limited per IP to keep any single
// visitor from burning through Anthropic tokens with a script:
// 30 turns / hour and 8 / minute. Limit is in-memory per serverless
// instance (see src/lib/rate-limit.ts for the upgrade path).
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { buildConciergeSystemPrompt } from "@/lib/agent/knowledge";
import { getDemoReply } from "@/lib/agent/demo-replies";
import { fail, ok } from "@/lib/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import type { ConciergeMessage } from "@/lib/lace/types";

interface ClaudeContentBlock {
  type: string;
  text?: string;
}
interface ClaudeResponse {
  content: ClaudeContentBlock[];
}

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const HOUR_MS = 60 * 60_000;
const MINUTE_MS = 60_000;
const HOURLY_CAP = 30;
const PER_MINUTE_CAP = 8;

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    // Two-tier guard: a tight per-minute burst cap plus a looser
    // hourly cap. Both must allow.
    const minute = checkRateLimit(
      `concierge:m:${ip}`,
      PER_MINUTE_CAP,
      MINUTE_MS,
    );
    const hour = checkRateLimit(`concierge:h:${ip}`, HOURLY_CAP, HOUR_MS);
    if (!minute.allowed || !hour.allowed) {
      const resetAt = !minute.allowed ? minute.resetAt : hour.resetAt;
      return fail(
        "You've been chatty — give it a few minutes and try again.",
        { status: 429, retryAfter: Math.ceil((resetAt - Date.now()) / 1000) },
      );
    }

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

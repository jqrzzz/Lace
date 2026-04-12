// ─────────────────────────────────────────────────────────────
// POST /api/concierge/turn
//
// The public, storefront-facing concierge. Lightweight, read-only,
// no tools. Shoppers chat about sizing, care, shipping, returns,
// and the mission. No order lookups, no personal data.
//
// If ANTHROPIC_API_KEY is missing we return a canned reply grounded
// in the FAQ so the widget stays alive in zero-config dev.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { buildConciergeSystemPrompt, FAQ } from "@/lib/agent/knowledge";

interface ClaudeContentBlock {
  type: string;
  text?: string;
}
interface ClaudeResponse {
  content: ClaudeContentBlock[];
}

interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
}

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(req: NextRequest) {
  try {
    const { history, userText } = (await req.json()) as {
      history?: ConciergeMessage[];
      userText: string;
    };
    if (!userText) {
      return NextResponse.json(
        { error: "userText is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        mode: "demo",
        reply: cannedReply(userText),
      });
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
      return NextResponse.json({
        mode: "demo",
        reply: cannedReply(userText),
      });
    }

    const data = (await res.json()) as ClaudeResponse;
    const reply =
      data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("\n")
        .trim() || cannedReply(userText);

    return NextResponse.json({ mode: "live", reply });
  } catch (error) {
    console.error("concierge error:", error);
    return NextResponse.json(
      { error: "Concierge turn failed." },
      { status: 500 }
    );
  }
}

/** FAQ-grounded fallback so the widget is useful without an API key. */
function cannedReply(text: string): string {
  const t = text.toLowerCase();
  const hit = FAQ.find((f) => {
    const kws = f.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    return kws.some((k) => t.includes(k));
  });
  if (hit) return hit.a;
  if (t.includes("ship")) {
    return "Free US shipping on orders $50+, otherwise $6 flat. International is $14 flat. Domestic arrives in 2–4 business days; international in 7–14.";
  }
  if (t.includes("return") || t.includes("refund")) {
    return "Yes — 30 days to return an unworn veil in its original silk pouch. We refund to your original card within 5 business days of receiving it back.";
  }
  if (t.includes("gift") || t.includes("give")) {
    return "Every veil you buy gifts one to a sister in one of our partner church communities. A few weeks after delivery you'll get an email introducing you to the sister who received yours.";
  }
  return "Happy to help — could you tell me a bit more about what you're looking for? If you'd rather hear from a person, leave your email at our contact page and we'll write back within a business day.";
}

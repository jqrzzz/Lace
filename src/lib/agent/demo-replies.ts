// ─────────────────────────────────────────────────────────────
// Lace — canned replies for demo mode.
//
// Three places used to keep their own keyword tables: the agent
// turn API, the concierge turn API, and the admin chat client.
// This module consolidates them. `getDemoReply(context, text)`
// returns a reasonable, on-brand fallback string grounded in the
// brand FAQ when the real Claude call is unavailable.
// ─────────────────────────────────────────────────────────────

import { FAQ } from "./knowledge";

export type DemoContext = "agent" | "concierge";

/** Keyword → reply for the owner-facing agent chat. */
const AGENT_RULES: Array<{ test: (t: string) => boolean; reply: string }> = [
  {
    test: (t) => t.includes("today") || t.includes("doing") || t.includes("morning"),
    reply:
      "Today: 2 new orders ($166), 1 still to ship, 3 approvals waiting, 2 new messages. The centennial edition is pacing 40% above last week. (Demo mode — set ANTHROPIC_API_KEY for real answers.)",
  },
  {
    test: (t) => t.includes("esperanza"),
    reply:
      "The Esperanza Veil had 1 new order this week from Maria López in Texas. She's a 3-time customer — tagged VIP. Want me to send her a handwritten thank-you note?",
  },
  {
    test: (t) => t.includes("refund"),
    reply:
      "I'll draft a refund and put it in your approvals queue. (Demo mode — set ANTHROPIC_API_KEY for a real Claude-powered turn.)",
  },
  {
    test: (t) => t.includes("draft") || t.includes("reply"),
    reply:
      "Drafted a warm, bilingual-friendly reply. It's in the approvals queue — tap to review before I save it as the reply draft.",
  },
  {
    test: (t) => t.includes("instagram") || t.includes("caption"),
    reply:
      'Suggestion:\n\n"One hundred years of Sunday mornings. One hundred years of grandmothers folding tissue paper. The Centennial Edition — 100 numbered veils, each a small vessel of that inheritance."\n\nWant me to queue it for the social calendar?',
  },
  {
    test: (t) => t.includes("nairobi"),
    reply:
      "Sisters of Nairobi: 30 veils gifted across 2 shipments. Sister Grace replied to your thank-you note yesterday — it's in your inbox.",
  },
];

/** Keyword → reply for the public shopper concierge. */
const CONCIERGE_RULES: Array<{ test: (t: string) => boolean; reply: string }> = [
  {
    test: (t) => t.includes("ship"),
    reply:
      "Free US shipping on orders $50+, otherwise $6 flat. International is $14 flat. Domestic arrives in 2–4 business days; international in 7–14.",
  },
  {
    test: (t) => t.includes("return") || t.includes("refund"),
    reply:
      "Yes — 30 days to return an unworn veil in its original silk pouch. We refund to your original card within 5 business days of receiving it back.",
  },
  {
    test: (t) => t.includes("gift") || t.includes("give"),
    reply:
      "Every veil you buy gifts one to a sister in one of our partner church communities. A few weeks after delivery you'll get an email introducing you to the sister who received yours.",
  },
];

const AGENT_DEFAULT =
  "I can help with that — but I'm in demo mode right now. Set ANTHROPIC_API_KEY in your environment and I'll start reasoning for real.";
const CONCIERGE_DEFAULT =
  "Happy to help — could you tell me a bit more about what you're looking for? If you'd rather hear from a person, leave your email at our contact page and we'll write back within a business day.";

export function getDemoReply(context: DemoContext, userText: string): string {
  const t = userText.toLowerCase();

  if (context === "concierge") {
    // Try FAQ first — the shopper concierge is FAQ-driven.
    const faqHit = FAQ.find((f) => {
      const kws = f.q
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);
      return kws.some((k) => t.includes(k));
    });
    if (faqHit) return faqHit.a;
    const kwHit = CONCIERGE_RULES.find((r) => r.test(t));
    if (kwHit) return kwHit.reply;
    return CONCIERGE_DEFAULT;
  }

  const kwHit = AGENT_RULES.find((r) => r.test(t));
  if (kwHit) return kwHit.reply;
  return AGENT_DEFAULT;
}

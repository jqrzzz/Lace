// ─────────────────────────────────────────────────────────────
// Small heuristic to pick 2–3 follow-up question chips to surface
// after the concierge responds. Runs client-side; no API call.
//
// Not trying to be clever — just match keywords in the last user
// turn + assistant reply against a short list of FAQ-grounded
// follow-ups, and fall back to a sensible default set.
// ─────────────────────────────────────────────────────────────

interface FollowupRule {
  test: (text: string) => boolean;
  chips: string[];
}

const RULES: FollowupRule[] = [
  {
    test: (t) => t.includes("ship") || t.includes("delivery"),
    chips: [
      "How fast is international?",
      "Do you ship in a gift box?",
      "Can I track my order?",
    ],
  },
  {
    test: (t) => t.includes("return") || t.includes("refund"),
    chips: [
      "How do I start a return?",
      "Is the veil exchangeable?",
      "Do you cover return shipping?",
    ],
  },
  {
    test: (t) => t.includes("size") || t.includes("length") || t.includes("big"),
    chips: [
      "Which length for a quinceañera?",
      "Which for a wedding?",
      "Can I see a size diagram?",
    ],
  },
  {
    test: (t) => t.includes("wash") || t.includes("care") || t.includes("clean"),
    chips: [
      "Can I iron it?",
      "How do I store it between wears?",
      "What if it snags?",
    ],
  },
  {
    test: (t) => t.includes("gift") || t.includes("give") || t.includes("mission"),
    chips: [
      "How do recipients get chosen?",
      "Can I direct my gift to a specific community?",
      "Will I hear about my gifted veil?",
    ],
  },
  {
    test: (t) =>
      t.includes("centennial") || t.includes("100 year") || t.includes("anniversary"),
    chips: [
      "Is the centennial edition numbered?",
      "What makes it different?",
      "How many are being made?",
    ],
  },
  {
    test: (t) => t.includes("lace") || t.includes("fabric") || t.includes("mater"),
    chips: [
      "Where is the lace made?",
      "Is it hand-stitched?",
      "What colors are available?",
    ],
  },
];

const DEFAULT_CHIPS = [
  "How big are the veils?",
  "How fast is shipping?",
  "Tell me about the gifting",
];

export function pickFollowups(
  lastUserText: string,
  lastAssistantText: string
): string[] {
  const hay = `${lastUserText} ${lastAssistantText}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.test(hay)) return rule.chips;
  }
  return DEFAULT_CHIPS;
}

/**
 * Drip / Nurture sequence configuration for Lace by La Luz.
 *
 * This file is the single source of truth for WHICH email goes to WHOM and
 * WHEN. It is inspired by the best-in-class luxury ecommerce cadences
 * (Aesop, Jenni Kayne, Celine, M.Gemi, Parachute) with a TOMS-style
 * mission-impact loop, adapted to our niche (veil / faith / sisterhood).
 *
 * The consuming layer (a queue worker, Resend campaign, Klaviyo flow, etc.)
 * should:
 *   1. Subscribe to the trigger event
 *   2. Enqueue each step at `delayHours` after the trigger
 *   3. Render the template with the provided props
 *   4. Respect global quiet hours + unsubscribe state
 *
 * No email should ever be hard-coded in a cron — it should all flow through
 * here so editorial changes are one commit away.
 */

export type DripTrigger =
  | "newsletter_signup"
  | "account_created"
  | "cart_abandoned"
  | "order_placed"
  | "order_delivered"
  | "gifted_match_delivered" // mission-loop: the paired gifted veil was delivered
  | "centennial_launch";

export type EmailTemplate =
  | "welcome_1"
  | "welcome_2"
  | "welcome_3"
  | "abandoned_cart_1"
  | "abandoned_cart_2"
  | "veil_arrived"
  | "review_request"
  | "gifted_update"
  | "centennial_invite"
  | "one_month_quiet"; // brand health: a no-product letter at 30d

export interface DripStep {
  template: EmailTemplate;
  delayHours: number;
  // Conditions to run this step — all must be true
  skipIfPurchased?: boolean; // skip if user has bought in meantime
  skipIfUnsubscribed?: boolean; // always true in practice
  subject: string;
  description: string; // internal note / why this step exists
}

export interface DripSequence {
  id: string;
  trigger: DripTrigger;
  description: string;
  steps: DripStep[];
}

/* ──────────────────────────────────────────────────────────────
   Sequences
   ────────────────────────────────────────────────────────────── */

export const WELCOME_SEQUENCE: DripSequence = {
  id: "welcome",
  trigger: "newsletter_signup",
  description:
    "A three-letter welcome from our founder. Slow, editorial. No discounts. First product link appears only in letter three.",
  steps: [
    {
      template: "welcome_1",
      delayHours: 0,
      skipIfUnsubscribed: true,
      subject: "A quiet hello, sister",
      description:
        "Immediate. Warm. Establishes voice. Sets expectation that two more letters follow.",
    },
    {
      template: "welcome_2",
      delayHours: 72, // 3 days
      skipIfUnsubscribed: true,
      subject: "The women who taught us",
      description:
        "Craft story — Bali to Guadalajara. Zero product push, deep brand authority.",
    },
    {
      template: "welcome_3",
      delayHours: 168, // 7 days total (4 days after letter 2)
      skipIfUnsubscribed: true,
      skipIfPurchased: false, // still send — it's the Nairobi story, no hard sell
      subject: "A morning in Nairobi",
      description:
        "Emotional mission peak. First soft product link + centennial teaser.",
    },
  ],
};

export const ABANDONED_CART_SEQUENCE: DripSequence = {
  id: "abandoned_cart",
  trigger: "cart_abandoned",
  description:
    "Two-touch gentle recovery. No aggressive countdown timers. Single free-shipping incentive, mission-reminder close.",
  steps: [
    {
      template: "abandoned_cart_1",
      delayHours: 4,
      skipIfPurchased: true,
      skipIfUnsubscribed: true,
      subject: "Your veil is waiting",
      description:
        "Gentle first touch. Product card + single CTA + mission line.",
    },
    {
      template: "abandoned_cart_2",
      delayHours: 24,
      skipIfPurchased: true,
      skipIfUnsubscribed: true,
      subject: "One more note — whenever you're ready",
      description:
        "Final touch at 24h. Same template, different copy; stops after this.",
    },
  ],
};

export const POST_PURCHASE_SEQUENCE: DripSequence = {
  id: "post_purchase",
  trigger: "order_delivered",
  description:
    "The heart of the brand. Three touches over 6 weeks, designed around the customer feeling the gift they caused.",
  steps: [
    {
      template: "veil_arrived",
      delayHours: 0, // fires on delivery webhook
      skipIfUnsubscribed: true,
      subject: "Your veil has landed",
      description:
        "Arrival ritual + unboxing guide. Voice = tender, ceremonial.",
    },
    {
      template: "review_request",
      delayHours: 336, // ~14 days after delivery
      skipIfUnsubscribed: true,
      subject: "Would you tell us?",
      description:
        "Review ask + return reminder. Low-friction 1–5 star click.",
    },
    {
      template: "one_month_quiet",
      delayHours: 720, // ~30 days after delivery
      skipIfUnsubscribed: true,
      subject: "A small note from Guadalajara",
      description:
        "Zero-product letter. Pure relationship maintenance. Signals we are not a funnel.",
    },
  ],
};

export const GIFTED_IMPACT_LOOP: DripSequence = {
  id: "gifted_impact",
  trigger: "gifted_match_delivered",
  description:
    "The mission closure. When the paired gifted veil is physically received by a sister, we tell the buyer. Real name, real place, real story.",
  steps: [
    {
      template: "gifted_update",
      delayHours: 0, // triggered by ops when delivery is confirmed
      skipIfUnsubscribed: true,
      subject: "Her name is...",
      description:
        "Closes the mission loop. This is the single most important email we send — it is proof the buy-one-give-one actually happened.",
    },
  ],
};

export const CENTENNIAL_CAMPAIGN: DripSequence = {
  id: "centennial",
  trigger: "centennial_launch",
  description:
    "One-shot broadcast to the full engaged list. Heirloom drop, not a flash sale.",
  steps: [
    {
      template: "centennial_invite",
      delayHours: 0,
      skipIfUnsubscribed: true,
      subject: "One hundred veils. One hundred years.",
      description:
        "Commemorative edition announce. Scarcity framed as heritage, not panic.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────────
   Global policy
   ────────────────────────────────────────────────────────────── */

export const DRIP_POLICY = {
  // Quiet hours (recipient local time) — no sends during this window.
  quietHours: { startHour: 21, endHour: 7 },

  // Minimum gap between any two non-transactional sends to a single user.
  minGapHours: 48,

  // Hard cap on nurture sends per user per calendar month (transactional
  // emails like "veil_arrived" don't count).
  maxMarketingPerMonth: 4,

  // Preferred send days for broadcasts. Sundays reserved — our audience
  // worships on Sunday morning and we will not intrude on that.
  preferredBroadcastDays: [
    "tuesday",
    "wednesday",
    "thursday",
    "saturday",
  ] as const,

  // Templates that count as transactional (always sent, never throttled).
  transactional: [
    "veil_arrived",
    "abandoned_cart_1",
    "abandoned_cart_2",
  ] as EmailTemplate[],

  // Templates that count as mission-loop and should never be throttled.
  mission: ["gifted_update"] as EmailTemplate[],
} as const;

/* ──────────────────────────────────────────────────────────────
   Registry — everything in one place for the worker
   ────────────────────────────────────────────────────────────── */

export const ALL_SEQUENCES: DripSequence[] = [
  WELCOME_SEQUENCE,
  ABANDONED_CART_SEQUENCE,
  POST_PURCHASE_SEQUENCE,
  GIFTED_IMPACT_LOOP,
  CENTENNIAL_CAMPAIGN,
];

export function getSequenceForTrigger(trigger: DripTrigger): DripSequence | undefined {
  return ALL_SEQUENCES.find((s) => s.trigger === trigger);
}

export function isTransactional(template: EmailTemplate): boolean {
  return (DRIP_POLICY.transactional as EmailTemplate[]).includes(template);
}

export function isMission(template: EmailTemplate): boolean {
  return (DRIP_POLICY.mission as EmailTemplate[]).includes(template);
}

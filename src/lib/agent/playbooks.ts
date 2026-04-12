// ─────────────────────────────────────────────────────────────
// Lace — Playbooks (agent workflows).
//
// Named, reusable sequences of agent work. Each playbook is either:
//
//   - manual: the owner launches it from a button ("Run morning triage")
//   - scheduled: a cron/worker runs it (e.g. 8am every day)
//   - trigger: fires on an event (order delivered, cart abandoned)
//
// A playbook is a recipe, not code — it's a prompt + a starter tool
// the agent is allowed to call. The approval router still gates every
// mutating tool call inside the playbook, so even autonomous
// workflows never bypass mom's human-in-the-loop on money actions.
//
// This is the pattern Gorgias / Sierra / Retool Agents use for
// "AI agents that actually do the work" — thin recipes, fat guardrails.
// ─────────────────────────────────────────────────────────────

export type PlaybookTrigger =
  | { kind: "manual" }
  | { kind: "scheduled"; cron: string; description: string }
  | { kind: "event"; on: string };

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: "ops" | "marketing" | "customers" | "editorial" | "mission";
  trigger: PlaybookTrigger;
  /** Tools the playbook is allowed to call. Empty = any. */
  allowedTools: string[];
  /** The prompt the agent runs with. */
  prompt: string;
  /** Estimated tokens so we can budget / cost. */
  estTokens: number;
}

export const PLAYBOOKS: Playbook[] = [
  // ── Ops ────────────────────────────────────────────────────────
  {
    id: "morning_triage",
    name: "Morning triage",
    description:
      "Summarize today, surface anything urgent, queue drafts for every new inbox message.",
    category: "ops",
    trigger: {
      kind: "scheduled",
      cron: "0 8 * * *",
      description: "Every day at 8am local",
    },
    allowedTools: [
      "briefing_today",
      "list_orders",
      "list_inbox",
      "draft_inbox_reply",
    ],
    prompt: `Run the morning triage:
1. Call briefing_today and summarize the numbers in one paragraph.
2. Call list_orders with status=paid to surface any unshipped orders older than 48h — flag them.
3. Call list_inbox with status=new. For each new message, call draft_inbox_reply with a warm, in-voice draft. The owner will review each draft in the approvals queue.
Finish with a single-line bottom line: what most deserves the owner's attention first.`,
    estTokens: 2000,
  },
  {
    id: "unshipped_sweep",
    name: "Unshipped order sweep",
    description:
      "Find orders paid but not shipped, group by age, flag anything past SLA.",
    category: "ops",
    trigger: {
      kind: "scheduled",
      cron: "0 15 * * 1-5",
      description: "Weekdays at 3pm",
    },
    allowedTools: ["list_orders"],
    prompt: `Call list_orders for statuses paid and processing. Any order older than 72 hours without shipment is past SLA — list them with order numbers, customer names, and age in hours. Recommend which should be escalated to the atelier.`,
    estTokens: 800,
  },

  // ── Customers ─────────────────────────────────────────────────
  {
    id: "vip_thank_yous",
    name: "VIP thank-you notes",
    description:
      "For each VIP customer with an order in the last 7 days, draft a personal thank-you email.",
    category: "customers",
    trigger: { kind: "manual" },
    allowedTools: ["list_customers", "list_orders", "draft_inbox_reply"],
    prompt: `Find customers tagged "vip" with an order in the last 7 days. For each, draft a personal thank-you email referencing something specific (their repeat purchases, which veil they chose, how long they've been with us). Queue each draft through draft_inbox_reply for owner review.`,
    estTokens: 1800,
  },
  {
    id: "inbox_autotriage",
    name: "Triage the inbox",
    description:
      "Draft a reply for every new contact-form message, grouped by urgency.",
    category: "customers",
    trigger: { kind: "event", on: "inbox.message.created" },
    allowedTools: ["list_inbox", "draft_inbox_reply", "list_orders"],
    prompt: `Call list_inbox with status=new. For each message:
- Classify urgency (urgent / normal / FYI).
- If it references an order, look up that order for context.
- Draft a reply through draft_inbox_reply. Stay in brand voice, under 120 words unless the situation warrants more.
- Escalate (do NOT draft) anything matching the escalation rules in your system prompt.`,
    estTokens: 2200,
  },

  // ── Marketing ─────────────────────────────────────────────────
  {
    id: "weekly_newsletter",
    name: "Draft the weekly newsletter",
    description:
      "Compose Friday's newsletter — new journal post, gifting highlight, one product spotlight.",
    category: "marketing",
    trigger: {
      kind: "scheduled",
      cron: "0 10 * * 5",
      description: "Fridays at 10am",
    },
    allowedTools: ["list_mission_recipients", "send_broadcast"],
    prompt: `Draft the weekly newsletter. Structure:
- A short "this week" hello (2–3 sentences).
- One featured journal post (use the most recent).
- One gifting highlight from list_mission_recipients — pick the community with the most recent activity.
- One product spotlight with a tactile detail about the lace.
- Signoff from Luz Maria.
Queue it through send_broadcast for owner approval. Audience: all active subscribers.`,
    estTokens: 2500,
  },
  {
    id: "abandoned_cart_sweep",
    name: "Abandoned cart re-engagement",
    description:
      "Identify carts abandoned 4+ hours ago and draft personalized re-engagement emails.",
    category: "marketing",
    trigger: {
      kind: "scheduled",
      cron: "0 */4 * * *",
      description: "Every 4 hours",
    },
    allowedTools: ["list_orders", "draft_inbox_reply"],
    prompt: `(Placeholder until carts table exists.) For each abandoned cart 4+ hours old and <48h old, draft a gentle re-engagement email — no urgency tactics, just a warm reminder and the care story behind the veil they viewed.`,
    estTokens: 1500,
  },

  // ── Editorial ─────────────────────────────────────────────────
  {
    id: "journal_monthly_pitch",
    name: "Monthly journal pitches",
    description:
      "Generate 3 post ideas in each category (Heritage, Craft, Sisterhood, Mission, Rituals) for owner pick.",
    category: "editorial",
    trigger: {
      kind: "scheduled",
      cron: "0 9 1 * *",
      description: "1st of each month at 9am",
    },
    allowedTools: [],
    prompt: `Propose 3 journal post ideas in each category (Heritage, Craft, Sisterhood, Mission, Rituals). For each idea give: title, 1-sentence angle, why it belongs now, and an estimated read time. No drafts yet — the owner will pick which to expand.`,
    estTokens: 1200,
  },

  // ── Mission ───────────────────────────────────────────────────
  {
    id: "gift_matching_report",
    name: "Weekly gift-matching report",
    description:
      "Reconcile veils sold vs gifted this week; flag any allocation gap.",
    category: "mission",
    trigger: {
      kind: "scheduled",
      cron: "0 11 * * 1",
      description: "Mondays at 11am",
    },
    allowedTools: ["list_orders", "list_mission_recipients"],
    prompt: `Count veils sold in the last 7 days (orders with status in paid/processing/shipped/delivered). Count gifts allocated in the same window (mission_recipients.veils_gifted delta). Report the running buyer→recipient ratio. If any recipient has received 0 gifts in 30+ days, recommend moving allocation their way.`,
    estTokens: 1400,
  },
];

export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.id === id);
}

export function playbooksByCategory(): Record<string, Playbook[]> {
  const out: Record<string, Playbook[]> = {};
  for (const p of PLAYBOOKS) {
    (out[p.category] ??= []).push(p);
  }
  return out;
}

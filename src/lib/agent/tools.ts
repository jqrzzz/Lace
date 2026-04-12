// ─────────────────────────────────────────────────────────────
// Lace — Agent tool catalog.
//
// This file defines every action the AI assistant can take on
// mom's behalf. Each tool declares:
//
//   - name:         what Claude calls it
//   - description:  what Claude reads to decide when to call it
//   - input_schema: JSON Schema (for Claude's tool-use API)
//   - risk:         low | normal | money | destructive
//   - readonly:     true if it cannot change state
//   - category:     for console UX grouping
//   - summarize:    turn a call into one mom-readable sentence
//
// The `risk` field is load-bearing. Anything above `normal` is
// routed through `lace.agent_approvals` and paused until mom taps
// approve. See src/lib/agent/router.ts for the decision logic.
//
// When we add a new capability, we add a tool here first — every
// path to state change goes through this registry. That is the
// whole audit story.
// ─────────────────────────────────────────────────────────────

export type ToolRisk = "low" | "normal" | "money" | "destructive";

export type ToolCategory =
  | "catalog"
  | "orders"
  | "customers"
  | "marketing"
  | "mission"
  | "editorial"
  | "ops";

/**
 * Minimal subset of JSON Schema we actually use — keeps the tool
 * definitions readable. Matches what Claude's tool-use API accepts.
 */
export interface JsonSchema {
  type: "object";
  properties: Record<
    string,
    {
      type: "string" | "number" | "integer" | "boolean" | "array";
      description?: string;
      enum?: readonly string[];
      items?: { type: "string" | "number" };
      minimum?: number;
      maximum?: number;
    }
  >;
  required?: readonly string[];
  additionalProperties?: boolean;
}

export interface ToolDefinition<TInput = Record<string, unknown>> {
  name: string;
  description: string;
  input_schema: JsonSchema;
  risk: ToolRisk;
  readonly: boolean;
  category: ToolCategory;
  /** One-line summary shown on the approval card / audit log. */
  summarize: (input: TInput) => string;
}

// ── Read tools ─────────────────────────────────────────────────
// Anything that only queries data. Safe for the agent to call
// without approval — mom still sees the call in the chat log.

const listOrders: ToolDefinition<{
  status?: string;
  limit?: number;
  search?: string;
}> = {
  name: "list_orders",
  description:
    "List recent orders. Use when mom asks about sales, pending shipments, or a specific customer's order history. Optional status filter.",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: [
          "pending",
          "paid",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
          "failed",
        ],
      },
      limit: { type: "integer", minimum: 1, maximum: 50 },
      search: {
        type: "string",
        description: "Match against order number, customer name, or email.",
      },
    },
  },
  risk: "low",
  readonly: true,
  category: "orders",
  summarize: (i) =>
    `Look up orders${i.status ? ` with status ${i.status}` : ""}${
      i.search ? ` matching "${i.search}"` : ""
    }.`,
};

const getOrder: ToolDefinition<{ order_number: string }> = {
  name: "get_order",
  description:
    "Fetch a single order by its human-readable number (e.g. LL-2026-1042). Returns items, shipping address, status, totals, and notes.",
  input_schema: {
    type: "object",
    properties: { order_number: { type: "string" } },
    required: ["order_number"],
  },
  risk: "low",
  readonly: true,
  category: "orders",
  summarize: (i) => `Look up order ${i.order_number}.`,
};

const listCustomers: ToolDefinition<{ search?: string; limit?: number }> = {
  name: "list_customers",
  description:
    "Search the customer list by name or email, or list the most recent.",
  input_schema: {
    type: "object",
    properties: {
      search: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 50 },
    },
  },
  risk: "low",
  readonly: true,
  category: "customers",
  summarize: (i) =>
    i.search ? `Search customers for "${i.search}".` : "List recent customers.",
};

const listInbox: ToolDefinition<{ status?: string }> = {
  name: "list_inbox",
  description: "Show contact-form messages. Use when mom asks 'what came in?'",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["new", "drafted", "replied", "archived"],
      },
    },
  },
  risk: "low",
  readonly: true,
  category: "customers",
  summarize: (i) => `Show ${i.status ?? "new"} inbox messages.`,
};

const listMissionRecipients: ToolDefinition<Record<string, never>> = {
  name: "list_mission_recipients",
  description:
    "List the church communities currently receiving gifted veils, with their running totals.",
  input_schema: { type: "object", properties: {} },
  risk: "low",
  readonly: true,
  category: "mission",
  summarize: () => "List gifted communities.",
};

const briefingToday: ToolDefinition<Record<string, never>> = {
  name: "briefing_today",
  description:
    "Summarize today: new orders, revenue, unshipped orders, pending approvals, new inbox messages, newsletter signups. Use for the morning briefing or when mom asks 'how's the store today?'",
  input_schema: { type: "object", properties: {} },
  risk: "low",
  readonly: true,
  category: "ops",
  summarize: () => "Pull today's briefing.",
};

// ── Normal-risk tools (edits, require approval only if mom opts in) ──

const replyToInboxDraft: ToolDefinition<{
  message_id: string;
  reply: string;
}> = {
  name: "draft_inbox_reply",
  description:
    "Draft a reply to a contact message. This does NOT send — it writes to reply_draft and sets status to 'drafted'. Mom reviews and hits send.",
  input_schema: {
    type: "object",
    properties: {
      message_id: { type: "string" },
      reply: { type: "string", description: "The draft reply, in English." },
    },
    required: ["message_id", "reply"],
  },
  risk: "normal",
  readonly: false,
  category: "customers",
  summarize: (i) =>
    `Draft reply to inbox message ${i.message_id.slice(0, 8)}…`,
};

const draftJournalPost: ToolDefinition<{
  title: string;
  category: string;
  excerpt: string;
  body_markdown: string;
}> = {
  name: "draft_journal_post",
  description:
    "Create a journal post in 'draft' status. Never auto-publishes. Mom reviews and promotes to 'published'.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      category: {
        type: "string",
        enum: ["Heritage", "Craft", "Sisterhood", "Mission", "Rituals"],
      },
      excerpt: { type: "string" },
      body_markdown: {
        type: "string",
        description: "Post body as markdown — the server converts it.",
      },
    },
    required: ["title", "category", "excerpt", "body_markdown"],
  },
  risk: "normal",
  readonly: false,
  category: "editorial",
  summarize: (i) => `Draft journal post: "${i.title}".`,
};

const tagCustomer: ToolDefinition<{ customer_id: string; tag: string }> = {
  name: "tag_customer",
  description:
    "Add a tag to a customer (e.g. 'vip', 'centennial-buyer', 'bulk-ordered'). Useful for later segmentation.",
  input_schema: {
    type: "object",
    properties: {
      customer_id: { type: "string" },
      tag: { type: "string" },
    },
    required: ["customer_id", "tag"],
  },
  risk: "normal",
  readonly: false,
  category: "customers",
  summarize: (i) => `Tag customer ${i.customer_id.slice(0, 8)}… as "${i.tag}".`,
};

const markGiftDelivered: ToolDefinition<{ gift_id: string; story?: string }> = {
  name: "mark_gift_delivered",
  description:
    "Mark a mission gift as delivered. Triggers the 'Her name is…' update email to the original buyer.",
  input_schema: {
    type: "object",
    properties: {
      gift_id: { type: "string" },
      story: {
        type: "string",
        description:
          "Optional dispatch story — 2–3 sentences about the community / sister receiving the veil.",
      },
    },
    required: ["gift_id"],
  },
  risk: "normal",
  readonly: false,
  category: "mission",
  summarize: (i) => `Mark gift ${i.gift_id.slice(0, 8)}… delivered.`,
};

// ── Money-risk tools (always require mom's explicit approval) ──

const refundOrder: ToolDefinition<{
  order_number: string;
  amount_cents?: number;
  reason: string;
}> = {
  name: "refund_order",
  description:
    "Refund an order via Stripe. If amount_cents is omitted, full refund. Always requires mom's approval.",
  input_schema: {
    type: "object",
    properties: {
      order_number: { type: "string" },
      amount_cents: {
        type: "integer",
        minimum: 1,
        description: "Partial refund amount in cents. Omit for full refund.",
      },
      reason: {
        type: "string",
        description: "Short internal note — why this refund is being issued.",
      },
    },
    required: ["order_number", "reason"],
  },
  risk: "money",
  readonly: false,
  category: "orders",
  summarize: (i) =>
    i.amount_cents
      ? `Refund $${(i.amount_cents / 100).toFixed(2)} on order ${i.order_number}.`
      : `Full refund on order ${i.order_number}.`,
};

const updateProductPrice: ToolDefinition<{
  slug: string;
  price_cents: number;
}> = {
  name: "update_product_price",
  description:
    "Change a product's published price. Money-risk because it affects new-order totals.",
  input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      price_cents: { type: "integer", minimum: 0 },
    },
    required: ["slug", "price_cents"],
  },
  risk: "money",
  readonly: false,
  category: "catalog",
  summarize: (i) =>
    `Change ${i.slug} price to $${(i.price_cents / 100).toFixed(2)}.`,
};

const sendBroadcast: ToolDefinition<{
  template: string;
  subject: string;
  audience: string;
  scheduled_for?: string;
}> = {
  name: "send_broadcast",
  description:
    "Queue an email broadcast campaign. Always requires approval and records audience size at approval time.",
  input_schema: {
    type: "object",
    properties: {
      template: { type: "string" },
      subject: { type: "string" },
      audience: {
        type: "string",
        description:
          "Plain-English audience description (e.g. 'subscribers who joined in the last 6 months').",
      },
      scheduled_for: {
        type: "string",
        description: "ISO timestamp. Omit to send on approval.",
      },
    },
    required: ["template", "subject", "audience"],
  },
  risk: "money",
  readonly: false,
  category: "marketing",
  summarize: (i) => `Send "${i.subject}" to ${i.audience}.`,
};

// ── Destructive tools (always require approval; cannot be auto-run) ──

const deleteProduct: ToolDefinition<{ slug: string; reason: string }> = {
  name: "archive_product",
  description:
    "Soft-delete a product (sets active = false). We never hard-delete — historical orders still need to render their line items.",
  input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      reason: { type: "string" },
    },
    required: ["slug", "reason"],
  },
  risk: "destructive",
  readonly: false,
  category: "catalog",
  summarize: (i) => `Archive product ${i.slug} (${i.reason}).`,
};

const unsubscribeCustomer: ToolDefinition<{
  email: string;
  reason: string;
}> = {
  name: "unsubscribe_customer",
  description:
    "Unsubscribe an email from the newsletter. Destructive because it removes someone from marketing permanently.",
  input_schema: {
    type: "object",
    properties: {
      email: { type: "string" },
      reason: { type: "string" },
    },
    required: ["email", "reason"],
  },
  risk: "destructive",
  readonly: false,
  category: "marketing",
  summarize: (i) => `Unsubscribe ${i.email}.`,
};

// ── Registry ───────────────────────────────────────────────────

export const TOOL_REGISTRY = {
  list_orders: listOrders,
  get_order: getOrder,
  list_customers: listCustomers,
  list_inbox: listInbox,
  list_mission_recipients: listMissionRecipients,
  briefing_today: briefingToday,
  draft_inbox_reply: replyToInboxDraft,
  draft_journal_post: draftJournalPost,
  tag_customer: tagCustomer,
  mark_gift_delivered: markGiftDelivered,
  refund_order: refundOrder,
  update_product_price: updateProductPrice,
  send_broadcast: sendBroadcast,
  archive_product: deleteProduct,
  unsubscribe_customer: unsubscribeCustomer,
} as const;

export type ToolName = keyof typeof TOOL_REGISTRY;

export const ALL_TOOLS: ToolDefinition[] = Object.values(
  TOOL_REGISTRY
) as unknown as ToolDefinition[];

/** Shape accepted by Claude's tool-use API. */
export function toolsForClaude() {
  return ALL_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
}

export function getTool(name: string): ToolDefinition | undefined {
  const registry = TOOL_REGISTRY as unknown as Record<string, ToolDefinition>;
  return registry[name];
}

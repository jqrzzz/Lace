// ─────────────────────────────────────────────────────────────
// Lace — shared formatting helpers.
//
// Centralizes the small display utilities that crop up across the
// admin console and the storefront. Keep pure + sync only; if you
// need locale awareness, accept a locale parameter rather than
// reading navigator.
// ─────────────────────────────────────────────────────────────

/** Format an integer cents amount as a whole-dollar string, e.g. 12345 → "$123". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

/** Exact-dollars-and-cents variant, e.g. 12345 → "$123.45". */
export function formatCentsExact(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Relative-past time from an ISO string — "5m ago", "3h ago", "2d ago". */
export function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Relative-future time until an ISO string — "30m left", "expired". */
export function timeLeft(iso: string): string {
  const h = (new Date(iso).getTime() - Date.now()) / 3_600_000;
  if (h < 0) return "expired";
  if (h < 1) return `${Math.round(h * 60)}m left`;
  if (h < 24) return `${Math.round(h)}h left`;
  return `${Math.round(h / 24)}d left`;
}

/** Safe stringifier for unknown payload values (objects, nulls, numbers, etc.). */
export function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// Keys that are plumbing, not something the owner needs to read on an
// approval card. Hidden from the humanized payload view.
const HIDDEN_PAYLOAD_KEYS = new Set([
  "id",
  "tool",
  "tool_call",
  "tool_name",
  "actor",
  "actor_id",
  "actor_label",
  "approval_id",
  "idempotency_key",
]);

function titleCase(key: string): string {
  const spaced = key.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Turn a raw action payload (the JSON an agent tool would execute) into a
 * short list of plain-language label/value pairs for the approvals card.
 * Cents become dollars, booleans become Yes/No, internal IDs are dropped.
 */
export function humanizePayload(
  payload: Record<string, unknown>,
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  for (const [key, raw] of Object.entries(payload ?? {})) {
    if (HIDDEN_PAYLOAD_KEYS.has(key) || key.endsWith("_id")) continue;
    if (raw === null || raw === undefined || raw === "") continue;

    if (key.endsWith("_cents") && typeof raw === "number") {
      out.push({ label: titleCase(key.replace(/_cents$/, "")), value: formatCentsExact(raw) });
      continue;
    }
    if (typeof raw === "boolean") {
      out.push({ label: titleCase(key), value: raw ? "Yes" : "No" });
      continue;
    }
    out.push({ label: titleCase(key), value: formatValue(raw) });
  }
  return out;
}

const TOOL_PHRASES: Record<string, string> = {
  refund_order: "Issue a refund",
  update_product_price: "Update a price",
  mark_order_shipped: "Mark an order shipped",
  add_tracking_number: "Add tracking",
  tag_customer: "Tag a customer",
  draft_inbox_reply: "Draft a reply",
  draft_journal_post: "Draft a journal post",
  assign_mission_gift: "Match a gift to a community",
  mark_gift_delivered: "Mark a gift delivered",
  send_broadcast: "Prepare an email",
  archive_product: "Archive a product",
  unsubscribe_customer: "Unsubscribe a customer",
  create_product: "Add a product",
  add_mission_recipient: "Add a community",
};

/** Friendly, plain-language phrase for an agent tool name. */
export function humanizeToolName(tool: string | null | undefined): string {
  if (!tool) return "Took an action";
  return TOOL_PHRASES[tool] ?? "Took an action";
}

// ─────────────────────────────────────────────────────────────
// Lace — Agent approval router.
//
// The single function every agent tool call flows through before
// execution. Given (tool, input, actor preferences), decide:
//
//   - "execute_now"     → run immediately, log to audit_log
//   - "require_approval" → write a row to lace.agent_approvals
//                          with status='pending', pause the turn
//   - "deny"            → refuse (tool unknown, or actor lacks role)
//
// Policy (from mom's direction):
//
//   1. readonly tools always execute_now.
//   2. `destructive` tools ALWAYS require approval. No override.
//   3. `money` tools require approval unless:
//        - actor is owner AND confirm_money_actions=false AND
//          the amount is below actor.auto_approve_money_limit_cents
//      (mom's defaults: confirm_money_actions=true, so all money
//       routes through her — which is what we want.)
//   4. `normal` tools require approval only if
//      actor.confirm_destructive=true (mom's default) AND the tool
//      is irreversible-ish. Otherwise execute_now.
//
// This function is pure — no IO — so it's trivially testable.
// ─────────────────────────────────────────────────────────────

import { type ToolDefinition, getTool } from "./tools";

export interface ActorPolicy {
  /** `lace.app_users.role` — must be 'owner' or 'staff' to run mutations. */
  role: "owner" | "staff" | "viewer";
  /** Mom's `confirm_money_actions` column. True = every money action goes to approvals. */
  confirm_money_actions: boolean;
  /** Mom's `confirm_destructive` column. Destructive always gates regardless — this controls `normal` tools too. */
  confirm_destructive: boolean;
  /** Optional $ ceiling below which money actions can auto-execute when confirm_money_actions=false. */
  auto_approve_money_limit_cents?: number;
}

export type RouterDecision =
  | { kind: "execute_now"; reason: string }
  | {
      kind: "require_approval";
      risk: "normal" | "money" | "destructive";
      reason: string;
    }
  | { kind: "deny"; reason: string };

/**
 * Extracts an amount hint from a tool input if the tool is a money
 * action where we can read a $ figure. Used for the auto-approve
 * cap. Returns null if the amount isn't knowable from input alone
 * (e.g. full refund where total comes from the order row).
 */
function amountHintCents(
  tool: ToolDefinition,
  input: Record<string, unknown>
): number | null {
  if (tool.name === "refund_order" && typeof input.amount_cents === "number") {
    return input.amount_cents;
  }
  if (
    tool.name === "update_product_price" &&
    typeof input.price_cents === "number"
  ) {
    return input.price_cents;
  }
  return null;
}

export function routeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  actor: ActorPolicy
): RouterDecision {
  const tool = getTool(toolName);
  if (!tool) {
    return { kind: "deny", reason: `Unknown tool: ${toolName}.` };
  }

  // Viewers can only read. Everyone else is fine for readonly tools.
  if (tool.readonly) {
    return { kind: "execute_now", reason: "Read-only tool." };
  }

  if (actor.role === "viewer") {
    return {
      kind: "deny",
      reason: "Viewers cannot make changes. Ask an owner or staff to do this.",
    };
  }

  // Destructive: always gate, no exceptions.
  if (tool.risk === "destructive") {
    return {
      kind: "require_approval",
      risk: "destructive",
      reason: "Destructive action — requires explicit approval.",
    };
  }

  // Money: gate unless actor has opted out AND the amount is below cap.
  if (tool.risk === "money") {
    if (!actor.confirm_money_actions) {
      const cap = actor.auto_approve_money_limit_cents ?? 0;
      const amount = amountHintCents(tool, input);
      if (amount !== null && amount <= cap) {
        return {
          kind: "execute_now",
          reason: `Money action under $${(cap / 100).toFixed(
            2
          )} auto-approve cap.`,
        };
      }
    }
    return {
      kind: "require_approval",
      risk: "money",
      reason: "Money action — requires owner approval.",
    };
  }

  // Normal: gate if actor wants destructive-style caution for everything.
  if (tool.risk === "normal") {
    if (actor.confirm_destructive) {
      return {
        kind: "require_approval",
        risk: "normal",
        reason: "Cautious mode — every edit routes through approvals.",
      };
    }
    return { kind: "execute_now", reason: "Normal edit auto-approved." };
  }

  // Low-risk writes (shouldn't be common — all low-risk is readonly).
  return { kind: "execute_now", reason: "Low-risk action." };
}

/**
 * Default policy for mom. Matches the schema defaults in 0004_lace_editorial_and_agent.sql
 * (confirm_money_actions=true, confirm_destructive=true).
 */
export const MOM_DEFAULT_POLICY: ActorPolicy = {
  role: "owner",
  confirm_money_actions: true,
  confirm_destructive: true,
};

/**
 * Default policy for staff — can make normal edits without prompting,
 * money and destructive still route through mom.
 */
export const STAFF_DEFAULT_POLICY: ActorPolicy = {
  role: "staff",
  confirm_money_actions: true,
  confirm_destructive: false,
};

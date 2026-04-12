// ─────────────────────────────────────────────────────────────
// Lace — Mom-readable formatters.
//
// One place to phrase things consistently across:
//   - the in-console approval card
//   - the WhatsApp confirmation message (future)
//   - the audit log human_summary field
//
// Keep the voice warm and plain. No jargon.
// ─────────────────────────────────────────────────────────────

import { type ToolDefinition, type ToolRisk } from "./tools";

const RISK_LABELS: Record<ToolRisk, string> = {
  low: "Read-only",
  normal: "Small edit",
  money: "Money",
  destructive: "Destructive",
};

const RISK_EMOJIS: Record<ToolRisk, string> = {
  low: "·",
  normal: "✎",
  money: "$",
  destructive: "⚠",
};

export function riskLabel(risk: ToolRisk): string {
  return RISK_LABELS[risk];
}

export function riskEmoji(risk: ToolRisk): string {
  return RISK_EMOJIS[risk];
}

export function humanSummary(
  tool: ToolDefinition,
  input: Record<string, unknown>
): string {
  // We type this loosely at the edge; individual tools type their own input.
  return tool.summarize(input as never);
}

/**
 * WhatsApp-sized confirmation message. Kept under ~160 chars when
 * possible so it fits in a single notification bubble. Mom replies
 * "yes" / "no" / "si" / "approve" — the handler (future) normalizes.
 */
export function whatsappApprovalMessage(opts: {
  tool: ToolDefinition;
  input: Record<string, unknown>;
  actorLabel?: string;
}): string {
  const summary = humanSummary(opts.tool, opts.input);
  const who = opts.actorLabel ? ` (via ${opts.actorLabel})` : "";
  const prefix = opts.tool.risk === "money" ? "💰 " : opts.tool.risk === "destructive" ? "⚠️ " : "✎ ";
  return `${prefix}${summary}${who}\n\nReply *yes* to approve, *no* to deny.`;
}

/**
 * Short label shown on cards / list rows when we have 1 line.
 */
export function approvalCardTitle(
  tool: ToolDefinition,
  input: Record<string, unknown>
): string {
  return humanSummary(tool, input);
}

/**
 * Longer description for the approval card's body.
 */
export function approvalCardBody(
  tool: ToolDefinition,
  input: Record<string, unknown>
): string {
  const lines: string[] = [];
  lines.push(`**What**: ${humanSummary(tool, input)}`);
  lines.push(`**Type**: ${riskLabel(tool.risk)}`);
  if (!tool.readonly) {
    const keys = Object.keys(input);
    if (keys.length > 0) {
      lines.push(`**Details**:`);
      for (const k of keys) {
        const v = input[k];
        if (v === undefined || v === null || v === "") continue;
        lines.push(`  • ${k}: ${formatValue(v)}`);
      }
    }
  }
  return lines.join("\n");
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return v.length > 120 ? v.slice(0, 117) + "…" : v;
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "yes" : "no";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/**
 * Shape the morning briefing into one plain-English paragraph mom
 * can read before her coffee. Pass the raw numbers; we do the prose.
 */
export interface BriefingInput {
  dayLabel: string; // "Sunday, April 12"
  newOrders: number;
  revenueCents: number;
  unshippedOrders: number;
  pendingApprovals: number;
  newInboxMessages: number;
  newSubscribers: number;
}

export function briefingProse(b: BriefingInput): string {
  const parts: string[] = [`Good morning — here is ${b.dayLabel}.`];

  if (b.newOrders === 0) {
    parts.push("No new orders yet today.");
  } else {
    const revenue = (b.revenueCents / 100).toFixed(0);
    parts.push(
      `${b.newOrders} new order${b.newOrders === 1 ? "" : "s"} — $${revenue} in revenue.`
    );
  }

  if (b.unshippedOrders > 0) {
    parts.push(
      `${b.unshippedOrders} order${b.unshippedOrders === 1 ? "" : "s"} still to ship.`
    );
  }

  if (b.pendingApprovals > 0) {
    parts.push(
      `${b.pendingApprovals} thing${b.pendingApprovals === 1 ? "" : "s"} waiting for your approval.`
    );
  }

  if (b.newInboxMessages > 0) {
    parts.push(
      `${b.newInboxMessages} new message${b.newInboxMessages === 1 ? "" : "s"} from customers.`
    );
  }

  if (b.newSubscribers > 0) {
    parts.push(
      `${b.newSubscribers} new subscriber${b.newSubscribers === 1 ? "" : "s"}.`
    );
  }

  return parts.join(" ");
}

// Discriminated status pill — one component covers every kind of
// status chip the admin shows. The tone registries live in
// src/lib/status-styles.ts.
//
// Usage:
//   <StatusBadge kind="order" status="paid" />
//   <StatusBadge kind="inbox" status="new" />
//   <StatusBadge kind="mission_gift" status="allocated" />
//   <StatusBadge kind="approval" status="pending" />
//
// Override the rendered text via `label` when the plain status word
// isn't quite right (e.g. "Needs a reply" instead of "new").
//
// Pure presentation — no state. Server-component-safe.

import { cn } from "@/lib/utils";
import {
  APPROVAL_STATUS_TONE,
  INBOX_STATUS_TONE,
  MISSION_GIFT_STATUS_TONE,
  ORDER_STATUS_TONE,
} from "@/lib/status-styles";
import type {
  ApprovalStatus,
  InboxStatus,
  MissionGiftStatus,
  OrderStatus,
} from "@/lib/lace/types";

type StatusBadgeProps =
  | { kind: "order"; status: OrderStatus; label?: string; className?: string }
  | { kind: "inbox"; status: InboxStatus; label?: string; className?: string }
  | {
      kind: "mission_gift";
      status: MissionGiftStatus;
      label?: string;
      className?: string;
    }
  | {
      kind: "approval";
      status: ApprovalStatus;
      label?: string;
      className?: string;
    };

const TONE_MAP = {
  order: ORDER_STATUS_TONE,
  inbox: INBOX_STATUS_TONE,
  mission_gift: MISSION_GIFT_STATUS_TONE,
  approval: APPROVAL_STATUS_TONE,
} as const;

export default function StatusBadge(props: StatusBadgeProps) {
  const { kind, status, label, className } = props;
  // Indexed access on the discriminated tone maps — TS can't narrow
  // through the union here without a switch, so we cast at the
  // boundary. The runtime check is sound because each map keys are
  // the corresponding status type.
  const tone =
    (TONE_MAP[kind] as Record<string, string>)[status] ??
    "bg-cream text-warm-gray border-border";
  return (
    <span
      className={cn(
        "text-xs px-3 py-1 rounded-full border capitalize whitespace-nowrap",
        tone,
        className,
      )}
    >
      {label ?? status}
    </span>
  );
}

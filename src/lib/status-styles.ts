// Single source of truth for status tone + label maps used across
// the admin. Three files used to duplicate the OrderStatus map
// verbatim (orders list, order detail, customer detail, inbox
// detail); inbox status had two separate maps for "dot" vs "tone"
// rendering. Centralizing keeps the brand palette consistent and
// makes status copy easy to retune later.

import type {
  ApprovalRisk,
  ApprovalStatus,
  InboxStatus,
  MissionGiftStatus,
  OrderStatus,
} from "@/lib/lace/types";

/** Pill chip — bg + text + border classes. Used by <StatusBadge>. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-cream text-warm-gray border-border",
  paid: "bg-blush/30 text-burgundy border-burgundy/20",
  processing: "bg-gold/15 text-gold-dark border-gold/30",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300",
  refunded: "bg-amber-100 text-amber-800 border-amber-300",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export const INBOX_STATUS_TONE: Record<InboxStatus, string> = {
  new: "bg-blush/30 text-burgundy border-burgundy/20",
  drafted: "bg-gold/20 text-gold-dark border-gold/40",
  replied: "bg-emerald-100 text-emerald-800 border-emerald-300",
  archived: "bg-stone-100 text-stone-700 border-stone-300",
};

/** Plain-language label for an inbox row — "Needs a reply" reads
    better than "new" in a context-rich header. */
export const INBOX_STATUS_LABEL: Record<InboxStatus, string> = {
  new: "Needs a reply",
  drafted: "Draft saved",
  replied: "Replied",
  archived: "Archived",
};

/** Two-character solid dots used in the inbox list (more glanceable
    in a table-of-rows context than a full pill). */
export const INBOX_STATUS_DOT: Record<InboxStatus, string> = {
  new: "bg-burgundy",
  drafted: "bg-gold",
  replied: "bg-emerald-600",
  archived: "bg-soft-gray",
};

export const MISSION_GIFT_STATUS_TONE: Record<MissionGiftStatus, string> = {
  pending: "bg-blush/30 text-burgundy border-burgundy/20",
  allocated: "bg-gold/15 text-gold-dark border-gold/30",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export const APPROVAL_STATUS_TONE: Record<ApprovalStatus, string> = {
  pending: "bg-gold/15 text-gold-dark border-gold/30",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-stone-100 text-stone-700 border-stone-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300",
};

/** Risk band on an approval card. Distinct from status — answers
    "how cautious should mom be?" rather than "where is it in the
    flow?" */
export const APPROVAL_RISK_TONE: Record<ApprovalRisk, string> = {
  low: "bg-soft-gray/10 text-warm-gray",
  normal: "bg-gold/10 text-gold-dark",
  money: "bg-burgundy/10 text-burgundy",
  destructive: "bg-red-50 text-red-700",
};

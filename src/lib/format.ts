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

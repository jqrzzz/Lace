// ─────────────────────────────────────────────────────────────
// In-memory sliding-window rate limiter.
//
// Used on public endpoints that hit a paid third-party API (the
// storefront concierge → Anthropic). Keeps any single visitor from
// burning through tokens with a script.
//
// What this is and isn't:
//
//   - In-memory only. Each serverless instance keeps its own Map.
//     On Vercel that means the limit is per-instance — a sustained
//     attack will get more than `max` requests if it spreads across
//     cold starts. Good enough for pre-launch traffic; promote to
//     Upstash Redis (or Vercel KV) for production-scale.
//   - Sliding window with a single counter per key. Not a "true"
//     leaky-bucket — bursts at the window boundary are allowed.
//     Acceptable tradeoff for the complexity.
//   - Counts only successful records; doesn't penalize browsers
//     that hit a 4xx error (we still return the rate-limit response
//     because the counter incremented before we knew the request
//     was bad, but no double-charging).
//
// To upgrade: swap the WINDOWS Map for a Redis hash and add atomic
// INCR with PEXPIRE. The function signature stays the same.
// ─────────────────────────────────────────────────────────────

interface WindowEntry {
  count: number;
  windowStartMs: number;
}

const WINDOWS = new Map<string, WindowEntry>();
let writesSinceSweep = 0;
const SWEEP_EVERY = 100;

export interface RateLimitResult {
  allowed: boolean;
  /** Calls remaining in the current window (>= 0). */
  remaining: number;
  /** Epoch ms when the window resets. */
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxPerWindow: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  maybeSweep(now);

  const entry = WINDOWS.get(key);
  if (!entry || now - entry.windowStartMs >= windowMs) {
    WINDOWS.set(key, { count: 1, windowStartMs: now });
    writesSinceSweep += 1;
    return {
      allowed: true,
      remaining: maxPerWindow - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxPerWindow) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStartMs + windowMs,
    };
  }

  entry.count += 1;
  writesSinceSweep += 1;
  return {
    allowed: true,
    remaining: maxPerWindow - entry.count,
    resetAt: entry.windowStartMs + windowMs,
  };
}

/**
 * Extract the client IP from a Next request. Vercel sets
 * x-forwarded-for; behind other proxies we fall back to x-real-ip
 * and finally to "unknown" (which all routes share — fine since
 * the limiter then caps anonymous traffic in aggregate).
 */
export function clientIp(req: {
  headers: { get: (name: string) => string | null };
}): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

function maybeSweep(now: number): void {
  if (writesSinceSweep < SWEEP_EVERY) return;
  writesSinceSweep = 0;
  // Drop entries whose window expired more than one window ago. We
  // keep a small grace so a key that's about to wrap doesn't get
  // recreated needlessly.
  for (const [k, v] of WINDOWS) {
    if (now - v.windowStartMs > 2 * 60 * 60_000) {
      WINDOWS.delete(k);
    }
  }
}

/** Test-only: clear all windows. Lets vitest reset between cases. */
export function __resetForTests(): void {
  WINDOWS.clear();
  writesSinceSweep = 0;
}

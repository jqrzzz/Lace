// Tests for the in-memory sliding-window rate limiter.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetForTests,
  checkRateLimit,
  clientIp,
} from "./rate-limit";

beforeEach(() => {
  __resetForTests();
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows the first call within a fresh window", () => {
    const r = checkRateLimit("a", 3, 1000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("counts down to zero remaining and then denies", () => {
    expect(checkRateLimit("k", 3, 1000).remaining).toBe(2);
    expect(checkRateLimit("k", 3, 1000).remaining).toBe(1);
    expect(checkRateLimit("k", 3, 1000).remaining).toBe(0);
    const denied = checkRateLimit("k", 3, 1000);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it("resets when the window has fully elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T12:00:00Z"));
    checkRateLimit("k", 2, 1000);
    checkRateLimit("k", 2, 1000);
    expect(checkRateLimit("k", 2, 1000).allowed).toBe(false);
    vi.setSystemTime(new Date("2026-05-18T12:00:02Z"));
    const next = checkRateLimit("k", 2, 1000);
    expect(next.allowed).toBe(true);
    expect(next.remaining).toBe(1);
  });

  it("isolates limits between distinct keys", () => {
    checkRateLimit("alice", 1, 1000);
    expect(checkRateLimit("alice", 1, 1000).allowed).toBe(false);
    expect(checkRateLimit("bob", 1, 1000).allowed).toBe(true);
  });

  it("reports the correct resetAt while in a window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T12:00:00Z"));
    const r = checkRateLimit("k", 5, 10_000);
    expect(r.resetAt).toBe(Date.now() + 10_000);
  });
});

describe("clientIp", () => {
  it("returns the first hop from x-forwarded-for", () => {
    const req = {
      headers: {
        get: (n: string) =>
          n === "x-forwarded-for" ? "203.0.113.5, 10.0.0.1" : null,
      },
    };
    expect(clientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const req = {
      headers: {
        get: (n: string) => (n === "x-real-ip" ? "203.0.113.10" : null),
      },
    };
    expect(clientIp(req)).toBe("203.0.113.10");
  });

  it("returns 'unknown' when no header is present", () => {
    const req = { headers: { get: () => null } };
    expect(clientIp(req)).toBe("unknown");
  });
});

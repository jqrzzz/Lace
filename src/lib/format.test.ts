import { describe, expect, it, vi } from "vitest";
import { formatCents, formatCentsExact, formatValue, timeAgo, timeLeft } from "./format";

describe("formatCents", () => {
  it("formats whole dollars from cents", () => {
    expect(formatCents(12345)).toBe("$123");
    expect(formatCents(0)).toBe("$0");
    expect(formatCents(99)).toBe("$1");
  });
});

describe("formatCentsExact", () => {
  it("preserves cents", () => {
    expect(formatCentsExact(12345)).toBe("$123.45");
    expect(formatCentsExact(100)).toBe("$1.00");
    expect(formatCentsExact(7)).toBe("$0.07");
  });
});

describe("timeAgo", () => {
  it("returns minutes within an hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00Z"));
    expect(timeAgo("2026-05-16T11:55:00Z")).toBe("5m ago");
    vi.useRealTimers();
  });

  it("returns hours within a day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00Z"));
    expect(timeAgo("2026-05-16T09:00:00Z")).toBe("3h ago");
    vi.useRealTimers();
  });

  it("returns days beyond a day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00Z"));
    expect(timeAgo("2026-05-14T12:00:00Z")).toBe("2d ago");
    vi.useRealTimers();
  });
});

describe("timeLeft", () => {
  it("returns expired for past timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00Z"));
    expect(timeLeft("2026-05-16T11:00:00Z")).toBe("expired");
    vi.useRealTimers();
  });

  it("returns minutes/hours/days as appropriate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00Z"));
    expect(timeLeft("2026-05-16T12:30:00Z")).toBe("30m left");
    expect(timeLeft("2026-05-16T15:00:00Z")).toBe("3h left");
    expect(timeLeft("2026-05-19T12:00:00Z")).toBe("3d left");
    vi.useRealTimers();
  });
});

describe("formatValue", () => {
  it("renders em-dash for empty values", () => {
    expect(formatValue(null)).toBe("—");
    expect(formatValue(undefined)).toBe("—");
    expect(formatValue("")).toBe("—");
  });

  it("passes through primitives", () => {
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue(42)).toBe("42");
    expect(formatValue(true)).toBe("true");
  });

  it("json-stringifies objects", () => {
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
    expect(formatValue([1, 2])).toBe("[1,2]");
  });
});

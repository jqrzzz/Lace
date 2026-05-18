// Tests for src/lib/email.ts.
//
// Covers the three branches of sendEmail():
//   1. RESEND_API_KEY missing → simulated (id: null, simulated: true)
//   2. RESEND_API_KEY set + 200 from Resend → real send with id
//   3. RESEND_API_KEY set + non-200 → returns { simulated: false, error }
//
// Also a quick check on the HTML escape behavior of wrapReplyHtml so
// a malicious customer can't slip <script> into mom's outbound email.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isEmailConfigured, sendEmail, senderHeader, wrapReplyHtml } from "./email";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.LACE_FROM_EMAIL;
  delete process.env.LACE_FROM_NAME;
  delete process.env.LACE_REPLY_TO_EMAIL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("sendEmail", () => {
  it("returns simulated=true when RESEND_API_KEY is missing", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const result = await sendEmail({
      to: "maria@example.com",
      subject: "Hi",
      text: "Hello",
    });
    expect(result).toEqual({ id: null, simulated: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to Resend and returns the message id on success", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.LACE_FROM_EMAIL = "orders@lacebylaluz.com";
    process.env.LACE_FROM_NAME = "Lace by La Luz";

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "resend_abc123" }),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await sendEmail({
      to: "maria@example.com",
      subject: "Re: Question",
      text: "Hola Maria — yes, it'll arrive in time.",
    });

    expect(result).toEqual({ id: "resend_abc123", simulated: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      from: "Lace by La Luz <orders@lacebylaluz.com>",
      to: "maria@example.com",
      subject: "Re: Question",
      text: "Hola Maria — yes, it'll arrive in time.",
    });
  });

  it("falls back to text in <pre> when html isn't provided", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "x" }),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    await sendEmail({
      to: "a@b.com",
      subject: "Plain only",
      text: "Just text\n<not-real-html>",
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    // HTML is wrapped in <pre> with the text escaped.
    expect(body.html).toContain("<pre>");
    expect(body.html).toContain("&lt;not-real-html&gt;");
  });

  it("returns { simulated:false, error } when Resend responds non-200", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: () => Promise.resolve("Invalid `from` address"),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await sendEmail({
      to: "a@b.com",
      subject: "x",
      text: "y",
    });
    expect(result.id).toBeNull();
    expect(result.simulated).toBe(false);
    expect(result.error).toContain("Invalid `from`");
  });

  it("returns { simulated:false, error } when fetch throws", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchSpy = vi.fn().mockRejectedValue(new Error("network down"));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const result = await sendEmail({
      to: "a@b.com",
      subject: "x",
      text: "y",
    });
    expect(result.simulated).toBe(false);
    expect(result.error).toBe("network down");
  });

  it("uses the LACE_REPLY_TO_EMAIL env when set", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.LACE_REPLY_TO_EMAIL = "hello@lacebylaluz.com";
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "x" }),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    await sendEmail({ to: "a@b.com", subject: "x", text: "y" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.reply_to).toBe("hello@lacebylaluz.com");
  });

  it("honors explicit replyTo override on the input", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.LACE_REPLY_TO_EMAIL = "hello@lacebylaluz.com";
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "x" }),
    } as unknown as Response);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    await sendEmail({
      to: "a@b.com",
      subject: "x",
      text: "y",
      replyTo: "mom@personal.example.com",
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.reply_to).toBe("mom@personal.example.com");
  });
});

describe("senderHeader / isEmailConfigured", () => {
  it("falls back to brand defaults when env is missing", () => {
    expect(senderHeader()).toBe("Lace by La Luz <orders@lacebylaluz.com>");
  });

  it("uses env values when set", () => {
    process.env.LACE_FROM_NAME = "Mom";
    process.env.LACE_FROM_EMAIL = "mom@example.com";
    expect(senderHeader()).toBe("Mom <mom@example.com>");
  });

  it("isEmailConfigured tracks RESEND_API_KEY", () => {
    expect(isEmailConfigured()).toBe(false);
    process.env.RESEND_API_KEY = "re_test";
    expect(isEmailConfigured()).toBe(true);
  });
});

describe("wrapReplyHtml", () => {
  it("escapes HTML in the body so user content can't inject markup", () => {
    const html = wrapReplyHtml(
      '<script>alert(1)</script> & "hi"',
      "Luz Maria",
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
    expect(html).toContain("Luz Maria");
  });

  it("omits the name line when signedBy is null", () => {
    const html = wrapReplyHtml("body", null);
    expect(html).not.toMatch(/Luz Maria|null/);
    expect(html).toContain("Lace by La Luz");
  });
});

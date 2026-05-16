// ─────────────────────────────────────────────────────────────
// Lace — Email send helper.
//
// One place to send transactional email. Uses Resend when
// RESEND_API_KEY is configured; otherwise returns a "simulated"
// result so local dev and pre-launch demos keep working without
// real delivery.
//
// Env vars:
//   RESEND_API_KEY        — provider key
//   LACE_FROM_EMAIL       — verified sender address
//   LACE_FROM_NAME        — display name on the "from" line
//   LACE_REPLY_TO_EMAIL   — optional reply-to override
//
// Callers (inbox reply, webhook order confirmation, future drips
// and broadcasts) get a uniform { id, simulated, error? } back so
// they can audit the outcome without re-implementing branching.
// ─────────────────────────────────────────────────────────────

export interface SendEmailInput {
  to: string;
  subject: string;
  /** Plain-text body. Strongly recommended for deliverability. */
  text: string;
  /** Optional HTML body — falls back to text wrapped in <pre>. */
  html?: string;
  /** Reply-To override. Defaults to LACE_REPLY_TO_EMAIL or the from address. */
  replyTo?: string;
}

export interface SendEmailResult {
  /** Resend message id when the send was real. */
  id: string | null;
  /** True when RESEND_API_KEY wasn't set — the call was a no-op. */
  simulated: boolean;
  /** Provider error message when the send actually failed. */
  error?: string;
}

const DEFAULT_FROM_EMAIL = "orders@lacebylaluz.com";
const DEFAULT_FROM_NAME = "Lace by La Luz";

function envOrDefault(name: string, fallback: string): string {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : fallback;
}

/** From address in the "Name <email>" format Resend expects. */
export function senderHeader(): string {
  const email = envOrDefault("LACE_FROM_EMAIL", DEFAULT_FROM_EMAIL);
  const name = envOrDefault("LACE_FROM_NAME", DEFAULT_FROM_NAME);
  return `${name} <${email}>`;
}

/** True when the email send path will actually deliver. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { id: null, simulated: true };
  }
  const fromEmail = envOrDefault("LACE_FROM_EMAIL", DEFAULT_FROM_EMAIL);
  const replyTo =
    input.replyTo ?? envOrDefault("LACE_REPLY_TO_EMAIL", fromEmail);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderHeader(),
        to: input.to,
        reply_to: replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html ?? `<pre>${escapeHtml(input.text)}</pre>`,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const message = detail.slice(0, 400) || `Resend ${res.status}`;
      console.error("[email] Resend failed:", message);
      return { id: null, simulated: false, error: message };
    }
    const json = (await res.json().catch(() => null)) as
      | { id?: string }
      | null;
    return { id: json?.id ?? null, simulated: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Resend threw:", message);
    return { id: null, simulated: false, error: message };
  }
}

/** Wrap a plain-text reply in our standard email styling. */
export function wrapReplyHtml(body: string, signedBy: string | null): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #2C2527;">
      <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(
        body,
      )}</div>
      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E8E0DC; color: #8B7A7E; font-size: 13px; line-height: 1.6;">
        ${signedBy ? `${escapeHtml(signedBy)}<br/>` : ""}
        Lace by La Luz
      </div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

import { NextRequest, NextResponse } from "next/server";
import { getLaceDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: unknown;
      email?: unknown;
      subject?: unknown;
      message?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length > MAX_NAME) {
      return NextResponse.json(
        { error: "Please share your name (under 120 characters)." },
        { status: 400 },
      );
    }
    if (
      !email ||
      email.length > MAX_EMAIL ||
      !EMAIL_RE.test(email)
    ) {
      return NextResponse.json(
        { error: "Please share a valid email address." },
        { status: 400 },
      );
    }
    if (subject.length > MAX_SUBJECT) {
      return NextResponse.json(
        { error: "Subject is too long (max 200 characters)." },
        { status: 400 },
      );
    }
    if (!message || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: "Please share a message (under 5,000 characters)." },
        { status: 400 },
      );
    }

    const db = getLaceDb();
    if (db) {
      const { error } = await db.from("contact_messages").insert({
        name,
        email,
        subject: subject || "General",
        message,
      });
      if (error) {
        console.error("[contact] insert failed:", error);
      }

      // Drop a lightweight customer row so the inbox detail page can
      // link to a profile. ignoreDuplicates → existing customer
      // records (with tags, lifetime spend, etc) are left untouched.
      const [firstName, ...rest] = name.split(/\s+/);
      const lastName = rest.join(" ") || null;
      const { error: customerErr } = await db.from("customers").upsert(
        {
          email: email.toLowerCase(),
          first_name: firstName || null,
          last_name: lastName,
        },
        { onConflict: "email", ignoreDuplicates: true },
      );
      if (customerErr) {
        console.error("[contact] customer upsert failed:", customerErr);
      }
    }

    // Forward to the support inbox if email is configured. All user
    // input is escaped before interpolation — these strings come from
    // the form and can contain anything.
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || "General");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    await sendEmail({
      to: "hello@lacebylaluz.com",
      subject: `[Contact] ${subject || "General"} — ${name}`,
      replyTo: email,
      text: [
        `From: ${name} <${email}>`,
        `Subject: ${subject || "General"}`,
        "",
        message,
      ].join("\n"),
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <p>${safeMessage}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}

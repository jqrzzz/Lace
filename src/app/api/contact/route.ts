import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, consent } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required before we can process your message." },
        { status: 400 }
      );
    }

    // Try to save to Supabase if configured. Log consent + timestamp for
    // audit — proof that the user agreed before we stored their message.
    const supabase = getServiceClient();
    if (supabase) {
      await supabase.from("contact_messages").insert({
        name,
        email,
        subject: subject || "General",
        message,
        consent_given: true,
        consent_at: new Date().toISOString(),
      });
    }

    // Try to send email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Lace by La Luz <noreply@lacebylaluz.com>",
          to: "hello@lacebylaluz.com",
          reply_to: email,
          subject: `[Contact] ${subject || "General"} — ${name}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || "General"}</p>
            <hr />
            <p>${message.replace(/\n/g, "<br />")}</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

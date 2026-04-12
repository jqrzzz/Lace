import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, consent } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required to subscribe." },
        { status: 400 }
      );
    }

    // Save to Supabase if configured. Store the consent timestamp as
    // evidence for GDPR/CAN-SPAM audits; without it a marketing email
    // sent later has no paper trail.
    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          {
            email,
            subscribed_at: new Date().toISOString(),
            consent_given: true,
            consent_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
          }
        );

      if (error) {
        console.error("Newsletter subscribe error:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

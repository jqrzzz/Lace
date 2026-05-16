import { NextRequest, NextResponse } from "next/server";
import { getLaceDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = (await req.json()) as {
      email?: string;
      source?: string;
    };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    const db = getLaceDb();
    if (db) {
      const { error } = await db.from("newsletter_subscribers").upsert(
        {
          email: email.toLowerCase(),
          status: "active",
          source: source || "footer",
        },
        { onConflict: "email" },
      );
      if (error) {
        console.error("[newsletter] subscribe failed:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] handler error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}

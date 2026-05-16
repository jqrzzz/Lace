import { NextRequest, NextResponse } from "next/server";
import { getLaceDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set([
  "footer",
  "popup",
  "checkout",
  "whatsapp",
  "shop",
  "home",
]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: unknown;
      source?: unknown;
    };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const sourceRaw =
      typeof body.source === "string" ? body.source.trim() : "";

    if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }
    const source = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : "footer";

    const db = getLaceDb();
    if (db) {
      const { error } = await db.from("newsletter_subscribers").upsert(
        { email, status: "active", source },
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

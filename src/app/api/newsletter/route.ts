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
  "inline",
  "journal",
]);
// Journal post placements pass a namespaced source like "journal:<slug>" so we
// can attribute signups to the post that converted them. Match conservatively.
const NAMESPACED_SOURCE_RE = /^[a-z]+:[a-z0-9-]{1,80}$/;

export function normalizeSource(raw: string): string {
  if (ALLOWED_SOURCES.has(raw)) return raw;
  if (NAMESPACED_SOURCE_RE.test(raw)) return raw;
  return "footer";
}

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
    const source = normalizeSource(sourceRaw);

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

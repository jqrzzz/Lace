// POST /api/admin/mission/gifts/[id]/assign
// body: { recipient_id }

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { assignMissionGift } from "@/lib/agent/actions";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });
  const body = (await req.json().catch(() => ({}))) as {
    recipient_id?: string;
    actor?: string;
  };
  if (!body.recipient_id) {
    return fail("Pick a community first.", { status: 400 });
  }
  const result = await assignMissionGift(
    db,
    { gift_id: id, recipient_id: body.recipient_id },
    { actorLabel: body.actor ?? "Luz Maria (owner)", actorType: "user" },
  );
  if (!result.ok) return fail(result.error ?? "Could not assign the gift.");
  revalidatePath("/admin/mission");
  return ok({ effects: result.effects });
}

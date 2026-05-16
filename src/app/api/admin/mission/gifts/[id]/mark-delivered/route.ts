// POST /api/admin/mission/gifts/[id]/mark-delivered
// body: { story? }

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { markGiftDelivered } from "@/lib/agent/actions";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });
  const body = (await req.json().catch(() => ({}))) as {
    story?: string;
    actor?: string;
  };
  const result = await markGiftDelivered(
    db,
    { gift_id: id, story: body.story?.trim() || undefined },
    { actorLabel: body.actor ?? "Luz Maria (owner)", actorType: "user" },
  );
  if (!result.ok) return fail(result.error ?? "Could not mark delivered.");
  revalidatePath("/admin/mission");
  return ok({ effects: result.effects });
}

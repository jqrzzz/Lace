// POST /api/admin/orders/[orderNumber]/add-tracking
//
// Attach a tracking number / carrier without changing status.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { addTrackingNumber } from "@/lib/agent/actions";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });
  const body = (await req.json().catch(() => ({}))) as {
    tracking_number?: string;
    carrier?: string;
    actor?: string;
  };
  if (!body.tracking_number) {
    return fail("Tracking number is required.", { status: 400 });
  }
  const result = await addTrackingNumber(
    db,
    {
      order_number: orderNumber,
      tracking_number: body.tracking_number,
      carrier: body.carrier,
    },
    { actorLabel: body.actor ?? "Luz Maria (owner)", actorType: "user" },
  );
  if (!result.ok) return fail(result.error ?? "Could not add tracking.");
  revalidatePath(`/admin/orders/${raw}`);
  return ok({ effects: result.effects });
}

// POST /api/admin/orders/[orderNumber]/refund
//
// Refunds are still simulated — Phase 2.C wires Stripe into the shared
// refundOrder handler. From the UI's perspective the response shape is
// already final, so 2.C is a swap-in.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { refundOrder } from "@/lib/agent/actions";
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
    amount_cents?: number;
    reason?: string;
    actor?: string;
  };
  if (!body.reason || !body.reason.trim()) {
    return fail("Please add a short reason for the refund.", { status: 400 });
  }
  const result = await refundOrder(
    db,
    {
      order_number: orderNumber,
      amount_cents:
        typeof body.amount_cents === "number" ? body.amount_cents : undefined,
      reason: body.reason,
    },
    { actorLabel: body.actor ?? "Luz Maria (owner)", actorType: "user" },
  );
  if (!result.ok) return fail(result.error ?? "Could not start the refund.");
  revalidatePath(`/admin/orders/${raw}`);
  return ok({ effects: result.effects });
}

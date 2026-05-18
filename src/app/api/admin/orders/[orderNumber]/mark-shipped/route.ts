// POST /api/admin/orders/[orderNumber]/mark-shipped
//
// Mom-initiated action from the order detail page. Skips the approval
// gate (she's the principal actor); writes the order update and an
// audit row inside the shared markOrderShipped() handler.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { markOrderShipped } from "@/lib/agent/actions";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  if (actor.role === "viewer") {
    return fail("Viewers can't take action here.", { status: 403 });
  }
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);
  const db = getLaceDb();
  if (!db) {
    return fail("Database is not configured.", { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    tracking_number?: string;
    carrier?: string;
  };
  const result = await markOrderShipped(
    db,
    {
      order_number: orderNumber,
      tracking_number: body.tracking_number,
      carrier: body.carrier,
    },
    { actorLabel: actorLabel(actor), actorType: "user" },
  );
  if (!result.ok) return fail(result.error ?? "Could not mark shipped.");
  revalidatePath(`/admin/orders/${raw}`);
  revalidatePath("/admin/orders");
  return ok({ effects: result.effects });
}

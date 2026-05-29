import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getLaceDb, type LaceServiceClient } from "@/lib/db";
import { sendEmail } from "@/lib/email";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

interface ShippingAddressJson {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

function stripeAddrToJson(
  a: Stripe.Address | null | undefined,
): ShippingAddressJson | null {
  if (!a) return null;
  return {
    line1: a.line1 ?? null,
    line2: a.line2 ?? null,
    city: a.city ?? null,
    state: a.state ?? null,
    zip: a.postal_code ?? null,
    country: a.country ?? null,
  };
}

// Idempotent on stripe_session_id: if we've already recorded this
// session, skip the whole insert chain. Stripe redelivers events,
// so the webhook must be safe to run twice.
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
  db: LaceServiceClient,
): Promise<{ orderId: string | null; skipped?: "duplicate" }> {
  const existing = await db
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing.data) {
    return { orderId: existing.data.id as string, skipped: "duplicate" };
  }

  const email = (
    session.customer_email ||
    session.customer_details?.email ||
    ""
  ).toLowerCase();
  const name = session.customer_details?.name || null;
  const [firstName, ...rest] = (name ?? "").split(" ");
  const lastName = rest.join(" ") || null;

  let customerId: string | null = null;
  if (email) {
    const upsert = await db
      .from("customers")
      .upsert(
        {
          email,
          first_name: firstName || null,
          last_name: lastName,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();
    if (upsert.error || !upsert.data) {
      console.error("[webhook] customer upsert failed", upsert.error);
      throw upsert.error ?? new Error("customer upsert returned no row");
    }
    customerId = upsert.data.id as string;
  }

  const sessionWithShipping = session as Stripe.Checkout.Session & {
    shipping_details?: {
      address?: Stripe.Address | null;
      name?: string | null;
    } | null;
  };
  const shippingAddress = stripeAddrToJson(
    sessionWithShipping.shipping_details?.address,
  );

  const subtotal = session.amount_subtotal ?? 0;
  const total = session.amount_total ?? 0;
  const shipping =
    session.total_details?.amount_shipping ?? Math.max(0, total - subtotal);
  const tax = session.total_details?.amount_tax ?? 0;
  const discount = session.total_details?.amount_discount ?? 0;

  const order = await db
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      customer_id: customerId,
      customer_email: email,
      customer_name: name,
      status: "paid",
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      tax_cents: tax,
      discount_cents: discount,
      total_cents: total,
      currency: (session.currency ?? "USD").toUpperCase(),
      shipping_address: shippingAddress,
      // Gift note (set at checkout) surfaces on the order so the admin's
      // "Gift note" panel shows it. Falls back to null for non-gift orders.
      gift_note: session.metadata?.gift_message || null,
      metadata: { stripe_session_metadata: session.metadata ?? {} },
    })
    .select("id")
    .single();
  if (order.error || !order.data) {
    console.error("[webhook] order insert failed", order.error);
    throw order.error ?? new Error("order insert returned no row");
  }
  const orderId = order.data.id as string;

  const itemRows = lineItems.map((li) => {
    const product =
      typeof li.price?.product === "object" &&
      li.price.product &&
      !("deleted" in li.price.product)
        ? (li.price.product as Stripe.Product)
        : null;
    const productMeta = (product?.metadata ?? {}) as Record<string, string>;
    const unit = li.price?.unit_amount ?? 0;
    const qty = li.quantity ?? 1;
    return {
      order_id: orderId,
      sku: productMeta.sku || productMeta.product_id || null,
      name: product?.name || li.description || "Veil",
      variant_name: productMeta.color || null,
      unit_price_cents: unit,
      quantity: qty,
      line_total_cents: unit * qty,
      gifts_matched: qty,
      metadata: productMeta,
    };
  });

  if (itemRows.length) {
    const items = await db
      .from("order_items")
      .insert(itemRows)
      .select("id, quantity");
    if (items.error || !items.data) {
      console.error("[webhook] order_items insert failed", items.error);
      throw items.error ?? new Error("order_items insert returned no rows");
    }

    const giftRows = items.data.map((r) => ({
      order_id: orderId,
      order_item_id: r.id as string,
      quantity: r.quantity as number,
      status: "pending" as const,
    }));
    const gifts = await db.from("mission_gifts").insert(giftRows);
    if (gifts.error) {
      console.error("[webhook] mission_gifts insert failed", gifts.error);
      throw gifts.error;
    }
  }

  await db.from("audit_log").insert({
    actor_type: "webhook",
    actor_id: "stripe",
    actor_label: "Stripe webhook",
    action: "order.created",
    entity_type: "order",
    entity_id: orderId,
    after_data: {
      stripe_session_id: session.id,
      total_cents: total,
      item_count: itemRows.length,
    },
    metadata: { stripe_session_id: session.id },
  });

  return { orderId };
}

async function sendConfirmationEmail(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
): Promise<void> {
  const email = session.customer_email || session.customer_details?.email;
  if (!email) return;

  const totalVeils = lineItems.reduce((s, li) => s + (li.quantity ?? 1), 0);
  const veilWord = totalVeils === 1 ? "veil" : "veils";
  const text = [
    "Thank you, Sister.",
    "",
    `Your order is confirmed. A beautiful veil is on its way to you — and ${totalVeils} matching ${veilWord} will be gifted to a sister in need.`,
    "",
    "We'll send you an update when your gifted veil is assigned to a destination church. Later, you'll receive a photo of the sisters who received your gift.",
    "",
    "Buy one. Give one. — Lace by La Luz",
  ].join("\n");
  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-size: 28px; color: #2C2527; margin-bottom: 8px;">Thank You, Sister</h1>
      <p style="color: #8B7A7E; font-size: 15px; line-height: 1.8;">
        Your order is confirmed. A beautiful veil is on its way to you — and
        ${totalVeils} matching ${veilWord} will be gifted to a sister in need.
      </p>
      <hr style="border: none; border-top: 1px solid #E8E0DC; margin: 24px 0;" />
      <p style="color: #8B7A7E; font-size: 13px; line-height: 1.8;">
        We&apos;ll send you an update when your gifted veil is assigned to a destination church.
        Later, you&apos;ll receive a photo of the sisters who received your gift.
      </p>
      <p style="color: #C9A96E; font-size: 12px; margin-top: 32px; text-align: center;">
        Buy one. Give one. — Lace by La Luz
      </p>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: "Thank you, Sister — Your order is confirmed",
    text,
    html,
  });
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const db = getLaceDb();
    if (!db) {
      console.warn(
        "[webhook] checkout completed but no DB configured; skipping persistence",
      );
      return NextResponse.json({ received: true, persisted: false });
    }
    const items = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 100,
    });
    try {
      const result = await handleCheckoutCompleted(session, items.data, db);
      if (result.skipped !== "duplicate") {
        await sendConfirmationEmail(session, items.data);
      }
    } catch (err) {
      console.error("[webhook] handleCheckoutCompleted failed", err);
      return NextResponse.json(
        { error: "Persistence failed" },
        { status: 500 },
      );
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    // Record failed charges in audit_log so a missed payment is visible
    // to mom without going to the Stripe dashboard. Best-effort: if the
    // DB isn't configured we silently drop (matches the rest of the
    // webhook's tolerance for zero-config dev).
    const db = getLaceDb();
    if (db) {
      const lastErr = intent.last_payment_error;
      await db.from("audit_log").insert({
        actor_type: "webhook",
        actor_id: "stripe",
        actor_label: "Stripe webhook",
        action: "payment.failed",
        entity_type: "payment_intent",
        entity_id: intent.id,
        metadata: {
          amount_cents: intent.amount,
          currency: intent.currency,
          customer_email:
            typeof intent.receipt_email === "string"
              ? intent.receipt_email
              : null,
          decline_code: lastErr?.decline_code ?? null,
          error_code: lastErr?.code ?? null,
          error_message: lastErr?.message ?? null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

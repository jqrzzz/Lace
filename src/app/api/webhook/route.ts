import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getServiceClient();

  console.log("Order completed:", {
    sessionId: session.id,
    email: session.customer_email || session.customer_details?.email,
    total: session.amount_total,
    giftedVeils: session.metadata?.gifted_veils,
  });

  if (!supabase) return;

  const email =
    session.customer_email || session.customer_details?.email || "";
  const totalVeils = parseInt(session.metadata?.total_veils || "0", 10);
  // `shipping_details` lives on the Checkout Session but isn't in the
  // older `Stripe.Checkout.Session` type we're still pinned to; narrow
  // locally so the rest of the handler stays typed.
  const sessionWithShipping = session as Stripe.Checkout.Session & {
    shipping_details?: {
      address?: Stripe.Address | null;
    } | null;
  };
  const shippingAddress = sessionWithShipping.shipping_details?.address;

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      customer_email: email,
      customer_name: session.customer_details?.name || "",
      shipping_address: shippingAddress
        ? `${shippingAddress.line1}${shippingAddress.line2 ? ", " + shippingAddress.line2 : ""}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`
        : "",
      subtotal: (session.amount_subtotal || 0) / 100,
      shipping_cost:
        ((session.amount_total || 0) - (session.amount_subtotal || 0)) / 100,
      total: (session.amount_total || 0) / 100,
      total_veils: totalVeils,
      gifted_veils: totalVeils,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Failed to create order:", orderError);
    return;
  }

  // Create mission gift record
  await supabase.from("mission_gifts").insert({
    order_id: order.id,
    veils_count: totalVeils,
    status: "pending",
  });

  // Send confirmation email via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lace by La Luz <orders@lacebylaluz.com>",
        to: email,
        subject: "Thank you, Sister — Your order is confirmed",
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 28px; color: #2C2527; margin-bottom: 8px;">Thank You, Sister</h1>
            <p style="color: #8B7A7E; font-size: 15px; line-height: 1.8;">
              Your order is confirmed. A beautiful veil is on its way to you — and
              ${totalVeils} matching veil${totalVeils > 1 ? "s" : ""} will be gifted to a sister in need.
            </p>
            <hr style="border: none; border-top: 1px solid #E8E0DC; margin: 24px 0;" />
            <p style="color: #8B7A7E; font-size: 13px; line-height: 1.8;">
              We'll send you an update when your gifted veil is assigned to a destination church.
              Later, you'll receive a photo of the sisters who received your gift.
            </p>
            <p style="color: #C9A96E; font-size: 12px; margin-top: 32px; text-align: center;">
              Buy one. Give one. — Lace by La Luz
            </p>
          </div>
        `,
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment failed:", intent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

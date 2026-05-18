import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { listProducts } from "@/lib/lace/queries";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

interface CartItem {
  productId: string;
  // Note: name and price are deliberately ignored — server resolves
  // both from PRODUCTS to prevent client-tampered totals.
  name?: string;
  price?: number;
  color: string;
  quantity: number;
}

const MAX_QUANTITY_PER_LINE = 20;
const MAX_LINES = 20;

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.",
      },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const { items, email } = (await req.json()) as {
      items: CartItem[];
      email?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (items.length > MAX_LINES) {
      return NextResponse.json(
        { error: "That's too many items for one cart." },
        { status: 400 },
      );
    }

    // Resolve every line from the canonical catalog. Prices NEVER come
    // from the client; we look them up server-side. The color must be
    // one we actually offer for that product.
    interface ResolvedLine {
      productId: string;
      name: string;
      color: string;
      quantity: number;
      unit_amount_cents: number;
    }
    // Resolve once — checkout typically has 1-3 lines so the in-memory
    // filter is fine. listProducts() returns from lace.products when
    // configured, mock catalog otherwise.
    const catalog = await listProducts();
    const resolved: ResolvedLine[] = [];
    for (const item of items) {
      if (!item || typeof item.productId !== "string") {
        return NextResponse.json(
          { error: "Each item needs a product id." },
          { status: 400 },
        );
      }
      const product = catalog.find(
        (p) => p.id === item.productId || p.slug === item.productId,
      );
      if (!product) {
        return NextResponse.json(
          { error: `Unknown product: ${item.productId}` },
          { status: 400 },
        );
      }
      const variant = product.variants.find((v) => v.color === item.color);
      if (!variant) {
        return NextResponse.json(
          {
            error: `${product.name} doesn't come in "${item.color}".`,
          },
          { status: 400 },
        );
      }
      const qty = Math.floor(Number(item.quantity));
      if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QUANTITY_PER_LINE) {
        return NextResponse.json(
          { error: `Quantity for ${product.name} must be between 1 and ${MAX_QUANTITY_PER_LINE}.` },
          { status: 400 },
        );
      }
      resolved.push({
        productId: product.id,
        name: product.name,
        color: variant.color,
        quantity: qty,
        unit_amount_cents: Math.round(product.price * 100),
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const subtotalCents = resolved.reduce(
      (s, r) => s + r.unit_amount_cents * r.quantity,
      0,
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: resolved.map((r) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: r.name,
            description: `Color: ${r.color} · One Size`,
            metadata: {
              product_id: r.productId,
              color: r.color,
            },
          },
          unit_amount: r.unit_amount_cents,
        },
        quantity: r.quantity,
      })),
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: subtotalCents >= 7500 ? 0 : 599,
              currency: "usd",
            },
            display_name:
              subtotalCents >= 7500 ? "Free Shipping" : "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      metadata: {
        total_veils: resolved.reduce((s, r) => s + r.quantity, 0).toString(),
        gifted_veils: resolved.reduce((s, r) => s + r.quantity, 0).toString(),
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}

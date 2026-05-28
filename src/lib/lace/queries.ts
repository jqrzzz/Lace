// ─────────────────────────────────────────────────────────────
// Lace — Query layer (DB when configured, mock data otherwise).
//
// The console, email workers, and agent tools all call through
// these functions. They're the seam between the UI and storage.
//
// Dev-mode contract: if SUPABASE_SERVICE_ROLE_KEY is missing, we
// return in-memory mock data so the console renders fully without
// any env vars. Once the lace.* migrations are applied, each function
// switches to a real select transparently.
//
// Every function is async even when currently mocked, so we can
// add real DB calls later without touching the call sites.
// ─────────────────────────────────────────────────────────────

import { getLaceDb, isLaceDbConfigured } from "@/lib/db";
import { MOCK_BRIEFING, MOCK_CUSTOMERS, MOCK_ORDERS } from "./mock";
import {
  listApprovalsStore,
  listInboxStore,
  listMessagesStore,
  listSessionsStore,
} from "@/lib/agent/store";
import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  CustomerFull,
  CustomerInboxRow,
  CustomerOrderRow,
  CustomerSummary,
  InboxMessage,
  InboxMessageDetail,
  InboxStatus,
  MissionGiftConsoleRow,
  MissionGiftStatus,
  MissionRecipientSummary,
  OrderCustomerCard,
  OrderFull,
  OrderGiftRow,
  OrderItemRow,
  OrderShippingAddress,
  OrderStatus,
  OrderSummary,
} from "./types";
import { GIFTED_COMMUNITIES } from "@/lib/gifted";
import {
  PRODUCTS,
  type PersonalityTag,
  type Product,
  type ProductVariant,
} from "@/lib/products";

const PERSONALITY_TAGS: PersonalityTag[] = [
  "classic",
  "floral",
  "minimal",
  "special",
  "limited",
  "pure",
  "warm",
  "soft",
  "bold",
];
import { colorHexFor } from "@/lib/product-colors";

/** Is the live DB backing the queries? Useful for UI hints ("demo mode"). */
export function isLiveData(): boolean {
  return isLaceDbConfigured();
}

// ── Catalog ────────────────────────────────────────────────────

interface ProductDbRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  price_cents: number;
  active: boolean;
  featured: boolean;
  sort: number;
  accent_gradient: string | null;
  hero_copy: string | null;
  metadata: Record<string, unknown> | null;
  product_variants:
    | Array<{
        id: string;
        sku: string;
        variant_name: string;
        stock: number;
        is_default: boolean;
        sort: number;
      }>
    | null;
}

const PRODUCT_COLS = `
  id, slug, name, subtitle, description, category, price_cents,
  active, featured, sort, accent_gradient, hero_copy, metadata,
  product_variants ( id, sku, variant_name, stock, is_default, sort )
`;

const CATEGORY_LABEL: Record<string, string> = {
  signature: "Signature",
  essentials: "Essentials",
  limited: "Limited",
  centennial: "Centennial",
  accessories: "Accessories",
};

const GRADIENT_TO_ACCENT: Record<string, string> = {
  "from-amber-50 via-orange-50 to-yellow-50": "bg-amber-100",
  "from-pink-50 via-rose-50 to-pink-100": "bg-pink-100",
  "from-stone-50 via-amber-50 to-stone-100": "bg-stone-100",
  "from-gray-50 via-white to-gray-50": "bg-gray-100",
  "from-yellow-50 via-amber-50 to-orange-50": "bg-yellow-100",
  "from-rose-50 via-pink-50 to-amber-50": "bg-rose-100",
};

function toProduct(row: ProductDbRow): Product {
  const meta = (row.metadata ?? {}) as {
    style?: string;
    preOrder?: boolean;
    features?: string[];
    care?: string[];
    personality?: string[];
  };
  const variants: ProductVariant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((v) => ({
      color: v.variant_name,
      colorHex: colorHexFor(v.variant_name),
      inStock: v.stock > 0,
    }));
  return {
    // Storefront treats slug as the public identifier (cart items
    // reference it, the URL uses it). Keep id===slug for compat with
    // the existing checkout / cart flow.
    id: row.slug,
    slug: row.slug,
    name: row.name,
    tagline: row.subtitle ?? row.hero_copy ?? "",
    description: row.description ?? "",
    price: row.price_cents / 100,
    collection: CATEGORY_LABEL[row.category] ?? row.category,
    style: meta.style ?? "",
    preOrder: meta.preOrder ?? true,
    variants,
    features: Array.isArray(meta.features) ? meta.features : [],
    care: Array.isArray(meta.care) ? meta.care : [],
    personality: Array.isArray(meta.personality)
      ? (meta.personality.filter((t): t is PersonalityTag =>
          PERSONALITY_TAGS.includes(t as PersonalityTag),
        ))
      : undefined,
    placeholder: {
      gradient:
        row.accent_gradient ??
        "from-stone-50 via-amber-50 to-stone-100",
      accent: row.accent_gradient
        ? (GRADIENT_TO_ACCENT[row.accent_gradient] ?? "bg-stone-100")
        : "bg-stone-100",
    },
  };
}

export async function listProducts(opts?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  const db = getLaceDb();
  if (!db) return PRODUCTS;
  const activeOnly = opts?.activeOnly ?? true;
  let q = db
    .from("products")
    .select(PRODUCT_COLS)
    .order("sort", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listProducts failed:", error);
    return PRODUCTS;
  }
  return ((data ?? []) as unknown as ProductDbRow[]).map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const db = getLaceDb();
  if (!db) return PRODUCTS.find((p) => p.slug === slug) ?? null;
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_COLS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.error("[queries] getProductBySlug failed:", error);
    return null;
  }
  return data ? toProduct(data as unknown as ProductDbRow) : null;
}

// ── Orders ─────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  shipped_at: string | null;
  tracking_number: string | null;
  order_items: { id: string }[] | null;
}

function toOrderSummary(r: OrderRow): OrderSummary {
  return {
    id: r.id,
    order_number: r.order_number ?? r.id.slice(0, 8),
    customer_name: r.customer_name ?? "",
    customer_email: r.customer_email,
    status: r.status,
    total_cents: r.total_cents,
    item_count: r.order_items?.length ?? 0,
    created_at: r.created_at,
    shipped_at: r.shipped_at,
    tracking_number: r.tracking_number,
  };
}

export async function listOrders(opts?: {
  status?: OrderSummary["status"];
  limit?: number;
}): Promise<OrderSummary[]> {
  const db = getLaceDb();
  if (!db) {
    const rows = opts?.status
      ? MOCK_ORDERS.filter((o) => o.status === opts.status)
      : MOCK_ORDERS;
    return rows.slice(0, opts?.limit ?? rows.length);
  }

  let q = db
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, status, total_cents, created_at, shipped_at, tracking_number, order_items(id)",
    )
    .order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listOrders failed:", error);
    return [];
  }
  return ((data ?? []) as OrderRow[]).map(toOrderSummary);
}

interface OrderFullDbRow {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  carrier: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: OrderShippingAddress | null;
  gift_note: string | null;
  internal_notes: string | null;
  customer_id: string | null;
  customer_email: string;
  customer_name: string | null;
  order_items: Array<{
    id: string;
    sku: string | null;
    name: string;
    variant_name: string | null;
    unit_price_cents: number;
    quantity: number;
    line_total_cents: number;
  }> | null;
  mission_gifts: Array<{
    id: string;
    quantity: number;
    status: OrderGiftRow["status"];
    allocated_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    mission_recipients: {
      community: string;
      city: string;
      country: string;
    } | null;
  }> | null;
  customers: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    total_orders: number;
    total_spent_cents: number;
    tags: string[] | null;
  } | null;
}

const ORDER_FULL_COLS = `
  id, order_number, status, created_at, shipped_at, delivered_at,
  tracking_number, carrier,
  subtotal_cents, shipping_cents, tax_cents, discount_cents, total_cents, currency,
  shipping_address, gift_note, internal_notes,
  customer_id, customer_email, customer_name,
  order_items ( id, sku, name, variant_name, unit_price_cents, quantity, line_total_cents ),
  mission_gifts ( id, quantity, status, allocated_at, shipped_at, delivered_at,
    mission_recipients ( community, city, country )
  ),
  customers ( id, email, first_name, last_name, total_orders, total_spent_cents, tags )
`;

function toOrderFull(r: OrderFullDbRow): OrderFull {
  const fallbackName =
    [r.customers?.first_name, r.customers?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || null;
  const customerName = r.customer_name ?? fallbackName;
  const customer: OrderCustomerCard = {
    id: r.customers?.id ?? r.customer_id,
    email: r.customer_email,
    name: customerName,
    total_orders: r.customers?.total_orders ?? 0,
    total_spent_cents: r.customers?.total_spent_cents ?? 0,
    tags: r.customers?.tags ?? [],
  };
  const items: OrderItemRow[] = (r.order_items ?? []).map((i) => ({
    id: i.id,
    sku: i.sku,
    name: i.name,
    variant_name: i.variant_name,
    unit_price_cents: i.unit_price_cents,
    quantity: i.quantity,
    line_total_cents: i.line_total_cents,
  }));
  const gifts: OrderGiftRow[] = (r.mission_gifts ?? []).map((g) => ({
    id: g.id,
    quantity: g.quantity,
    status: g.status,
    recipient_community: g.mission_recipients?.community ?? null,
    recipient_city: g.mission_recipients?.city ?? null,
    recipient_country: g.mission_recipients?.country ?? null,
    allocated_at: g.allocated_at,
    shipped_at: g.shipped_at,
    delivered_at: g.delivered_at,
  }));
  return {
    id: r.id,
    order_number: r.order_number ?? r.id.slice(0, 8),
    status: r.status,
    created_at: r.created_at,
    shipped_at: r.shipped_at,
    delivered_at: r.delivered_at,
    tracking_number: r.tracking_number,
    carrier: r.carrier,
    subtotal_cents: r.subtotal_cents,
    shipping_cents: r.shipping_cents,
    tax_cents: r.tax_cents,
    discount_cents: r.discount_cents,
    total_cents: r.total_cents,
    currency: r.currency,
    shipping_address: r.shipping_address,
    gift_note: r.gift_note,
    internal_notes: r.internal_notes,
    customer,
    items,
    gifts,
  };
}

/** Full order graph — items + gifts (with recipient) + customer card. */
export async function getOrderFull(
  orderNumber: string,
): Promise<OrderFull | null> {
  const db = getLaceDb();
  if (!db) {
    const summary = MOCK_ORDERS.find((o) => o.order_number === orderNumber);
    if (!summary) return null;
    return {
      id: summary.id,
      order_number: summary.order_number,
      status: summary.status,
      created_at: summary.created_at,
      shipped_at: summary.shipped_at ?? null,
      delivered_at: null,
      tracking_number: summary.tracking_number ?? null,
      carrier: null,
      subtotal_cents: summary.total_cents,
      shipping_cents: 0,
      tax_cents: 0,
      discount_cents: 0,
      total_cents: summary.total_cents,
      currency: "USD",
      shipping_address: null,
      gift_note: null,
      internal_notes: null,
      customer: {
        id: null,
        email: summary.customer_email,
        name: summary.customer_name || null,
        total_orders: 1,
        total_spent_cents: summary.total_cents,
        tags: [],
      },
      items: [],
      gifts: [],
    };
  }
  const { data, error } = await db
    .from("orders")
    .select(ORDER_FULL_COLS)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) {
    console.error("[queries] getOrderFull failed:", error);
    return null;
  }
  return data ? toOrderFull(data as unknown as OrderFullDbRow) : null;
}

export async function getOrder(
  orderNumber: string,
): Promise<OrderSummary | null> {
  const db = getLaceDb();
  if (!db) {
    return MOCK_ORDERS.find((o) => o.order_number === orderNumber) ?? null;
  }
  const { data, error } = await db
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, status, total_cents, created_at, shipped_at, tracking_number, order_items(id)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) {
    console.error("[queries] getOrder failed:", error);
    return null;
  }
  return data ? toOrderSummary(data as OrderRow) : null;
}

// ── Customers ──────────────────────────────────────────────────

interface CustomerRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  total_orders: number;
  total_spent_cents: number;
  last_ordered_at: string | null;
  tags: string[] | null;
}

function toCustomerSummary(r: CustomerRow): CustomerSummary {
  const name = [r.first_name, r.last_name].filter(Boolean).join(" ").trim();
  return {
    id: r.id,
    email: r.email,
    name: name || null,
    total_orders: r.total_orders,
    total_spent_cents: r.total_spent_cents,
    last_ordered_at: r.last_ordered_at,
    tags: r.tags ?? [],
  };
}

export async function listCustomers(opts?: {
  search?: string;
  limit?: number;
}): Promise<CustomerSummary[]> {
  const db = getLaceDb();
  if (!db) {
    const q = opts?.search?.toLowerCase();
    const rows = q
      ? MOCK_CUSTOMERS.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
            (c.name ?? "").toLowerCase().includes(q),
        )
      : MOCK_CUSTOMERS;
    return rows.slice(0, opts?.limit ?? rows.length);
  }
  let q = db
    .from("customers")
    .select(
      "id, email, first_name, last_name, total_orders, total_spent_cents, last_ordered_at, tags",
    )
    .order("last_ordered_at", { ascending: false, nullsFirst: false });
  if (opts?.search) {
    const s = opts.search.replace(/[%_]/g, "\\$&");
    q = q.or(`email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listCustomers failed:", error);
    return [];
  }
  return ((data ?? []) as CustomerRow[]).map(toCustomerSummary);
}

interface CustomerFullDbRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  notes: string | null;
  tags: string[] | null;
  total_orders: number;
  total_spent_cents: number;
  first_ordered_at: string | null;
  last_ordered_at: string | null;
  created_at: string;
  orders:
    | Array<{
        id: string;
        order_number: string | null;
        status: OrderStatus;
        total_cents: number;
        created_at: string;
        order_items: { id: string }[] | null;
      }>
    | null;
}

const CUSTOMER_FULL_COLS = `
  id, email, first_name, last_name, phone, marketing_opt_in, notes, tags,
  total_orders, total_spent_cents, first_ordered_at, last_ordered_at, created_at,
  orders ( id, order_number, status, total_cents, created_at, order_items(id) )
`;

interface CustomerInboxDbRow {
  id: string;
  subject: string | null;
  message: string;
  status: InboxStatus;
  created_at: string;
}

/** Full customer graph: profile + order history + inbox messages by email. */
export async function getCustomerFull(
  id: string,
): Promise<CustomerFull | null> {
  const db = getLaceDb();
  if (!db) {
    const c = MOCK_CUSTOMERS.find((x) => x.id === id);
    if (!c) return null;
    const orders: CustomerOrderRow[] = MOCK_ORDERS.filter(
      (o) => o.customer_email.toLowerCase() === c.email.toLowerCase(),
    ).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total_cents: o.total_cents,
      created_at: o.created_at,
      item_count: o.item_count,
    }));
    return {
      id: c.id,
      email: c.email,
      name: c.name,
      phone: null,
      marketing_opt_in: false,
      notes: null,
      tags: c.tags,
      total_orders: c.total_orders,
      total_spent_cents: c.total_spent_cents,
      first_ordered_at: null,
      last_ordered_at: c.last_ordered_at,
      created_at: c.last_ordered_at ?? new Date().toISOString(),
      orders,
      inbox_messages: [],
    };
  }

  const { data: cRow, error: cErr } = await db
    .from("customers")
    .select(CUSTOMER_FULL_COLS)
    .eq("id", id)
    .maybeSingle();
  if (cErr) {
    console.error("[queries] getCustomerFull failed:", cErr);
    return null;
  }
  if (!cRow) return null;
  const c = cRow as unknown as CustomerFullDbRow;

  const { data: msgRows } = await db
    .from("contact_messages")
    .select("id, subject, message, status, created_at")
    .eq("email", c.email)
    .order("created_at", { ascending: false })
    .limit(50);
  const inbox: CustomerInboxRow[] = ((msgRows ?? []) as CustomerInboxDbRow[]).map(
    (m) => ({
      id: m.id,
      subject: m.subject,
      message: m.message,
      status: m.status,
      created_at: m.created_at,
    }),
  );

  const orders: CustomerOrderRow[] = (c.orders ?? [])
    .map((o) => ({
      id: o.id,
      order_number: o.order_number ?? o.id.slice(0, 8),
      status: o.status,
      total_cents: o.total_cents,
      created_at: o.created_at,
      item_count: o.order_items?.length ?? 0,
    }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const name =
    [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || null;

  return {
    id: c.id,
    email: c.email,
    name,
    phone: c.phone,
    marketing_opt_in: c.marketing_opt_in,
    notes: c.notes,
    tags: c.tags ?? [],
    total_orders: c.total_orders,
    total_spent_cents: c.total_spent_cents,
    first_ordered_at: c.first_ordered_at,
    last_ordered_at: c.last_ordered_at,
    created_at: c.created_at,
    orders,
    inbox_messages: inbox,
  };
}

// ── Inbox ──────────────────────────────────────────────────────

export async function listInbox(
  status?: InboxMessage["status"],
): Promise<InboxMessage[]> {
  const rows = await listInboxStore();
  return status ? rows.filter((m) => m.status === status) : rows;
}

interface InboxDetailDbRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: InboxStatus;
  reply_draft: string | null;
  reply_sent: string | null;
  replied_at: string | null;
  created_at: string;
}

/** Inbox detail: message + sender's customer profile + last few orders. */
export async function getInboxMessageWithContext(
  id: string,
): Promise<InboxMessageDetail | null> {
  const db = getLaceDb();
  if (!db) {
    const all = await listInboxStore();
    const m = all.find((x) => x.id === id);
    if (!m) return null;
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status,
      reply_draft: m.reply_draft,
      reply_sent: null,
      replied_at: null,
      created_at: m.created_at,
      customer: null,
    };
  }

  const { data: msgRow, error: msgErr } = await db
    .from("contact_messages")
    .select(
      "id, name, email, subject, message, status, reply_draft, reply_sent, replied_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (msgErr || !msgRow) {
    if (msgErr) console.error("[queries] getInboxMessageWithContext:", msgErr);
    return null;
  }
  const m = msgRow as InboxDetailDbRow;

  // Best-effort customer lookup by email (citext, so case-insensitive).
  const { data: cRow } = await db
    .from("customers")
    .select(
      "id, first_name, last_name, total_orders, total_spent_cents, tags, " +
        "orders ( id, order_number, status, total_cents, created_at, order_items(id) )",
    )
    .eq("email", m.email)
    .maybeSingle();

  let customer: InboxMessageDetail["customer"] = null;
  if (cRow) {
    const c = cRow as unknown as {
      id: string;
      first_name: string | null;
      last_name: string | null;
      total_orders: number;
      total_spent_cents: number;
      tags: string[] | null;
      orders:
        | Array<{
            id: string;
            order_number: string | null;
            status: OrderStatus;
            total_cents: number;
            created_at: string;
            order_items: { id: string }[] | null;
          }>
        | null;
    };
    const name =
      [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || null;
    const recent: CustomerOrderRow[] = (c.orders ?? [])
      .map((o) => ({
        id: o.id,
        order_number: o.order_number ?? o.id.slice(0, 8),
        status: o.status,
        total_cents: o.total_cents,
        created_at: o.created_at,
        item_count: o.order_items?.length ?? 0,
      }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 3);
    customer = {
      id: c.id,
      name,
      total_orders: c.total_orders,
      total_spent_cents: c.total_spent_cents,
      tags: c.tags ?? [],
      recent_orders: recent,
    };
  }

  return {
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    status: m.status,
    reply_draft: m.reply_draft,
    reply_sent: m.reply_sent,
    replied_at: m.replied_at,
    created_at: m.created_at,
    customer,
  };
}

// ── Mission ────────────────────────────────────────────────────

interface MissionRecipientRow {
  id: string;
  community: string;
  city: string;
  country: string;
  flag_emoji: string | null;
  veils_requested: number;
  veils_gifted: number;
  active: boolean;
}

export async function listMissionRecipients(): Promise<
  MissionRecipientSummary[]
> {
  const db = getLaceDb();
  if (!db) {
    return GIFTED_COMMUNITIES.map((c) => ({
      id: c.id,
      community: c.community,
      city: c.city,
      country: c.country,
      flag_emoji: c.flag,
      veils_requested: c.veilsGifted,
      veils_gifted: c.veilsGifted,
      active: true,
    }));
  }
  const { data, error } = await db
    .from("mission_recipients")
    .select(
      "id, community, city, country, flag_emoji, veils_requested, veils_gifted, active",
    )
    .eq("active", true)
    .order("community", { ascending: true });
  if (error) {
    console.error("[queries] listMissionRecipients failed:", error);
    return [];
  }
  return ((data ?? []) as MissionRecipientRow[]).map((r) => ({
    id: r.id,
    community: r.community,
    city: r.city,
    country: r.country,
    flag_emoji: r.flag_emoji,
    veils_requested: r.veils_requested,
    veils_gifted: r.veils_gifted,
    active: r.active,
  }));
}

interface MissionGiftDbRow {
  id: string;
  quantity: number;
  status: MissionGiftStatus;
  created_at: string;
  allocated_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  story: string | null;
  order_id: string | null;
  orders: {
    id: string;
    order_number: string | null;
    customer_email: string;
  } | null;
  recipient_id: string | null;
  mission_recipients: {
    community: string;
    city: string;
    country: string;
  } | null;
}

const MISSION_GIFT_COLS = `
  id, quantity, status, created_at, allocated_at, shipped_at, delivered_at, story,
  order_id, orders ( id, order_number, customer_email ),
  recipient_id, mission_recipients ( community, city, country )
`;

function toMissionGiftRow(r: MissionGiftDbRow): MissionGiftConsoleRow {
  return {
    id: r.id,
    quantity: r.quantity,
    status: r.status,
    created_at: r.created_at,
    allocated_at: r.allocated_at,
    shipped_at: r.shipped_at,
    delivered_at: r.delivered_at,
    story: r.story,
    order_id: r.orders?.id ?? r.order_id,
    order_number: r.orders?.order_number ?? null,
    customer_email: r.orders?.customer_email ?? null,
    recipient_id: r.recipient_id,
    recipient_community: r.mission_recipients?.community ?? null,
    recipient_city: r.mission_recipients?.city ?? null,
    recipient_country: r.mission_recipients?.country ?? null,
  };
}

/** Mission gifts for the admin console, optionally filtered by status. */
export async function listMissionGifts(opts?: {
  status?: MissionGiftStatus;
  statuses?: MissionGiftStatus[];
  limit?: number;
}): Promise<MissionGiftConsoleRow[]> {
  const db = getLaceDb();
  if (!db) return [];
  let q = db
    .from("mission_gifts")
    .select(MISSION_GIFT_COLS)
    .order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.statuses && opts.statuses.length)
    q = q.in("status", opts.statuses);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listMissionGifts failed:", error);
    return [];
  }
  return ((data ?? []) as unknown as MissionGiftDbRow[]).map(toMissionGiftRow);
}

// ── Approvals ──────────────────────────────────────────────────

export async function listApprovals(
  status: ApprovalRow["status"] = "pending",
): Promise<ApprovalRow[]> {
  return listApprovalsStore(status);
}

// ── Agent sessions + messages ──────────────────────────────────

export async function listSessions(): Promise<AgentSession[]> {
  return listSessionsStore();
}

export async function listMessages(
  sessionId: string,
): Promise<AgentMessage[]> {
  return listMessagesStore(sessionId);
}

// ── Briefing (today's numbers) ─────────────────────────────────

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function dayLabel(d: Date): string {
  return `${DAY_LABELS[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

interface DailyMetricRow {
  day: string; // ISO date
  new_orders: number;
  revenue_cents: number;
  new_inbox_messages: number;
  new_subscribers: number;
  new_approvals: number;
  unshipped_orders: number;
}

export async function getTodayBriefing() {
  const db = getLaceDb();
  if (!db) return MOCK_BRIEFING;

  const now = new Date();

  const [metricsResp, pendingApprovals, unshipped] = await Promise.all([
    db
      .from("daily_metrics")
      .select(
        "day, new_orders, revenue_cents, new_inbox_messages, new_subscribers, new_approvals, unshipped_orders",
      )
      .order("day", { ascending: true }),
    db
      .from("agent_approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
  ]);

  const metrics = (metricsResp.data ?? []) as DailyMetricRow[];
  const today = metrics.at(-1);
  const last7 = metrics.slice(-7);

  return {
    dayLabel: dayLabel(now),
    newOrders: today?.new_orders ?? 0,
    revenueCents: today?.revenue_cents ?? 0,
    unshippedOrders: unshipped.count ?? 0,
    pendingApprovals: pendingApprovals.count ?? 0,
    newInboxMessages: today?.new_inbox_messages ?? 0,
    newSubscribers: today?.new_subscribers ?? 0,
    trends: {
      newOrders: last7.map((r) => r.new_orders),
      // Trend uses approvals created per day, not snapshot pending count
      // (snapshots would require event-sourced history). Good-enough proxy.
      pendingApprovals: last7.map((r) => r.new_approvals),
      newInboxMessages: last7.map((r) => r.new_inbox_messages),
      // Same shape: count of orders created per day that are currently still
      // unshipped — pile-up signal rather than literal snapshot history.
      unshippedOrders: last7.map((r) => r.unshipped_orders),
    },
  };
}

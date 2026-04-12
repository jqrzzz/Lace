-- ─────────────────────────────────────────────────────────────
-- Lace — Customers, orders, order items
--
-- Customers are the canonical person record. One row per unique
-- email. Stripe customer id stored here for billing continuity.
--
-- Orders capture the full shipping snapshot and totals at the
-- moment of purchase — we deliberately denormalize so later
-- price/shipping-policy changes don't rewrite history.
-- ─────────────────────────────────────────────────────────────

-- ── Customers ──────────────────────────────────────────────────
create table lace.customers (
  id                  uuid primary key default gen_random_uuid(),
  email               citext unique not null,
  first_name          text,
  last_name           text,
  phone               text,
  stripe_customer_id  text unique,
  marketing_opt_in    boolean not null default false,
  total_orders        integer not null default 0,
  total_spent_cents   bigint  not null default 0,
  first_ordered_at    timestamptz,
  last_ordered_at     timestamptz,
  notes               text,   -- mom can leave a note: "allergic to rose scent"
  tags                text[] not null default '{}',
  metadata            jsonb  not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger customers_updated before update on lace.customers
  for each row execute function lace.tg_set_updated_at();

-- ── Orders ─────────────────────────────────────────────────────
create table lace.orders (
  id                     uuid primary key default gen_random_uuid(),
  -- Human-readable order number, e.g. "LL-2026-0184". Generated
  -- by trigger below so we never have to coordinate app-side.
  order_number           text unique,
  customer_id            uuid references lace.customers(id) on delete set null,
  customer_email         citext not null,
  customer_name          text,

  status                 lace.order_status not null default 'pending',

  -- Stripe / payment
  stripe_session_id      text unique,
  stripe_payment_intent  text,
  stripe_charge_id       text,

  -- Totals (all in cents, all frozen at order time)
  subtotal_cents         integer not null default 0,
  shipping_cents         integer not null default 0,
  tax_cents              integer not null default 0,
  discount_cents         integer not null default 0,
  total_cents            integer not null default 0,
  currency               text    not null default 'USD',

  -- Shipping
  shipping_address       jsonb,          -- { line1, line2, city, state, zip, country }
  billing_address        jsonb,
  tracking_number        text,
  carrier                text,
  shipped_at             timestamptz,
  delivered_at           timestamptz,

  -- Ops / notes
  internal_notes         text,           -- mom-only notes
  gift_note              text,           -- customer-provided gift message

  metadata               jsonb  not null default '{}'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index orders_customer_idx        on lace.orders (customer_id);
create index orders_status_idx          on lace.orders (status, created_at desc);
create index orders_created_idx         on lace.orders (created_at desc);
create trigger orders_updated before update on lace.orders
  for each row execute function lace.tg_set_updated_at();

-- Order number generator: LL-YYYY-NNNN, per-year counter.
create sequence if not exists lace.order_number_seq_2026 start 1000;
create or replace function lace.tg_order_number()
returns trigger language plpgsql as $$
declare
  yr int := extract(year from coalesce(new.created_at, now()));
  seq_name text := format('lace.order_number_seq_%s', yr);
  n bigint;
begin
  if new.order_number is not null then
    return new;
  end if;
  -- Lazily create a per-year sequence so each year starts fresh.
  execute format(
    'create sequence if not exists lace.order_number_seq_%s start 1000',
    yr
  );
  execute format('select nextval(''%s'')', seq_name) into n;
  new.order_number := format('LL-%s-%s', yr, lpad(n::text, 4, '0'));
  return new;
end;
$$;
create trigger orders_set_number before insert on lace.orders
  for each row execute function lace.tg_order_number();

-- ── Order items ────────────────────────────────────────────────
create table lace.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references lace.orders(id) on delete cascade,
  product_id        uuid references lace.products(id) on delete set null,
  variant_id        uuid references lace.product_variants(id) on delete set null,
  -- Snapshotted at order time so historical orders render correctly
  -- even if we rename / delete products later.
  sku               text,
  name              text not null,
  variant_name      text,
  unit_price_cents  integer not null,
  quantity          integer not null check (quantity > 0),
  line_total_cents  integer not null,
  gifts_matched     integer not null default 0, -- how many gifted veils this item has generated
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);
create index order_items_order_idx on lace.order_items (order_id);

-- ── Maintain customer lifetime-value rollup on order transitions ──
create or replace function lace.tg_customer_rollup()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or
     (tg_op = 'UPDATE' and (new.status is distinct from old.status or new.total_cents is distinct from old.total_cents))
  then
    if new.customer_id is not null then
      update lace.customers c
        set total_orders =
              (select count(*) from lace.orders o
                 where o.customer_id = c.id and o.status in ('paid','processing','shipped','delivered')),
            total_spent_cents =
              (select coalesce(sum(total_cents),0) from lace.orders o
                 where o.customer_id = c.id and o.status in ('paid','processing','shipped','delivered')),
            first_ordered_at =
              (select min(created_at) from lace.orders o
                 where o.customer_id = c.id and o.status in ('paid','processing','shipped','delivered')),
            last_ordered_at =
              (select max(created_at) from lace.orders o
                 where o.customer_id = c.id and o.status in ('paid','processing','shipped','delivered'))
      where c.id = new.customer_id;
    end if;
  end if;
  return new;
end;
$$;
create trigger orders_customer_rollup
  after insert or update on lace.orders
  for each row execute function lace.tg_customer_rollup();

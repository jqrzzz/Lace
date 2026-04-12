-- ─────────────────────────────────────────────────────────────
-- Lace by La Luz — Schema, enums, helper triggers, catalog tables
--
-- Everything lives in a dedicated `lace` schema so it is fully
-- isolated from the Nomadex `public` schema. To migrate to a
-- standalone Supabase project later:
--     pg_dump --schema=lace --no-owner > lace.sql
--
-- Apply order: this file first, then 0002, 0003, 0004, 0005.
-- ─────────────────────────────────────────────────────────────

create schema if not exists lace;
comment on schema lace is
  'Lace by La Luz — e-commerce, mission tracking, editorial, agent console. Isolated from Nomadex public schema. Migrate standalone with: pg_dump --schema=lace';

-- Extensions — no-op if already installed at cluster level.
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ──────────────────────────────────────────────────────
create type lace.product_category as enum (
  'signature', 'essentials', 'limited', 'centennial', 'accessories'
);

create type lace.order_status as enum (
  'pending', 'paid', 'processing', 'shipped', 'delivered',
  'cancelled', 'refunded', 'failed'
);

create type lace.subscriber_status as enum (
  'active', 'unsubscribed', 'bounced', 'complained'
);

create type lace.contact_status as enum (
  'new', 'drafted', 'replied', 'archived'
);

create type lace.mission_gift_status as enum (
  'pending', 'allocated', 'shipped', 'delivered'
);

create type lace.mission_region as enum (
  'Africa', 'Latin America', 'Asia',
  'North America', 'Europe', 'Oceania', 'Middle East'
);

create type lace.agent_channel as enum (
  'console', 'whatsapp', 'web', 'email'
);

create type lace.agent_role as enum (
  'system', 'user', 'assistant', 'tool'
);

create type lace.approval_status as enum (
  'pending', 'approved', 'denied', 'expired', 'cancelled'
);

create type lace.actor_type as enum (
  'user', 'agent', 'system', 'customer', 'webhook'
);

create type lace.user_role as enum ('owner', 'staff', 'viewer');

-- ── Helper: updated_at trigger fn in lace schema ───────────────
create or replace function lace.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Products ───────────────────────────────────────────────────
create table lace.products (
  id               uuid primary key default gen_random_uuid(),
  slug             citext unique not null,
  name             text not null,
  subtitle         text,
  description      text,
  category         lace.product_category not null default 'essentials',
  price_cents      integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= price_cents),
  active           boolean not null default true,
  featured         boolean not null default false,
  sort             integer not null default 0,
  accent_gradient  text,
  hero_copy        text,
  -- Free-form bag for marketing metadata, care instructions,
  -- fabric composition, etc. Keeps the table lean.
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index products_active_idx on lace.products (active, sort);
create index products_category_idx on lace.products (category) where active;
create trigger products_updated before update on lace.products
  for each row execute function lace.tg_set_updated_at();

-- ── Product variants (size, colorway, etc.) ────────────────────
create table lace.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references lace.products(id) on delete cascade,
  sku               citext unique not null,
  variant_name      text not null,
  price_cents       integer,              -- null = inherit from product
  stock             integer not null default 0 check (stock >= 0),
  low_stock_alert   integer not null default 3,
  is_default        boolean not null default false,
  sort              integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index variants_product_idx on lace.product_variants (product_id, sort);
create unique index variants_one_default_per_product
  on lace.product_variants (product_id) where is_default;
create trigger variants_updated before update on lace.product_variants
  for each row execute function lace.tg_set_updated_at();

-- ── Product images ─────────────────────────────────────────────
create table lace.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references lace.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort        integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index images_product_idx on lace.product_images (product_id, sort);
create unique index images_one_primary_per_product
  on lace.product_images (product_id) where is_primary;

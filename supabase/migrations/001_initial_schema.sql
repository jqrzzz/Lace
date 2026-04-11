-- Lace by La Luz — Initial Database Schema
-- Run this in your Supabase SQL editor to set up all tables

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  customer_email text not null,
  customer_name text default '',
  shipping_address text default '',
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) default 0,
  total numeric(10,2) not null,
  total_veils integer default 1,
  gifted_veils integer default 1,
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Mission gifts tracking
create table if not exists mission_gifts (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  veils_count integer not null default 1,
  destination_church text,
  destination_location text,
  destination_country text,
  shipped_at timestamptz,
  arrived_at timestamptz,
  photo_url text,
  status text default 'pending', -- pending, assigned, shipped, arrived, photo_shared
  created_at timestamptz default now()
);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- Contact messages
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text default 'General',
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table orders enable row level security;
alter table mission_gifts enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

-- Policies: Users can read their own orders
create policy "Users can view own orders"
  on orders for select
  using (customer_email = auth.jwt() ->> 'email');

-- Policies: Users can view their own mission gifts
create policy "Users can view own mission gifts"
  on mission_gifts for select
  using (
    order_id in (
      select id from orders
      where customer_email = auth.jwt() ->> 'email'
    )
  );

-- Service role can do everything (for webhooks and admin)
-- These are automatically allowed via service_role key

-- Indexes for common queries
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_mission_gifts_status on mission_gifts(status);
create index if not exists idx_newsletter_email on newsletter_subscribers(email);

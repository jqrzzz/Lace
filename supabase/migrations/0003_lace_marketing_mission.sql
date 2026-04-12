-- ─────────────────────────────────────────────────────────────
-- Lace — Marketing (newsletter, contact, email events) and
-- Mission (recipient communities, veil gifts).
-- ─────────────────────────────────────────────────────────────

-- ── Newsletter subscribers ─────────────────────────────────────
create table lace.newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             citext unique not null,
  status            lace.subscriber_status not null default 'active',
  first_name        text,
  source            text,  -- 'footer', 'popup', 'checkout', 'whatsapp', ...
  -- Drip sequence tracking
  welcome_step      integer not null default 0,  -- 0 = not started, 1/2/3 = last sent
  welcome_sent_at   timestamptz[],               -- audit of each step send
  tags              text[] not null default '{}',
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unsubscribed_at   timestamptz
);
create index subs_status_idx on lace.newsletter_subscribers (status);
create trigger subs_updated before update on lace.newsletter_subscribers
  for each row execute function lace.tg_set_updated_at();

-- ── Contact form messages ──────────────────────────────────────
create table lace.contact_messages (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          citext not null,
  subject        text,
  message        text not null,
  status         lace.contact_status not null default 'new',
  -- Agent-drafted reply, pending mom's approval/edit
  reply_draft    text,
  reply_sent     text,
  replied_at     timestamptz,
  replied_by     uuid,        -- lace.app_users.id
  tags           text[] not null default '{}',
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index contact_status_idx on lace.contact_messages (status, created_at desc);
create trigger contact_updated before update on lace.contact_messages
  for each row execute function lace.tg_set_updated_at();

-- ── Email events (send log for the drip/broadcast system) ──────
create table lace.email_events (
  id              uuid primary key default gen_random_uuid(),
  email           citext not null,
  template        text not null,     -- 'welcome_1', 'abandoned_cart_1', 'gifted_update', ...
  subject         text,
  provider        text,              -- 'resend', 'postmark', ...
  provider_id     text,              -- message-id returned by provider
  status          text not null default 'queued',
  -- 'queued'|'sent'|'delivered'|'opened'|'clicked'|'bounced'|'complained'|'failed'
  error           text,
  related_order   uuid references lace.orders(id) on delete set null,
  related_subscriber uuid references lace.newsletter_subscribers(id) on delete set null,
  metadata        jsonb not null default '{}'::jsonb,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index email_events_email_idx    on lace.email_events (email, created_at desc);
create index email_events_template_idx on lace.email_events (template, created_at desc);

-- ── Mission recipients (church communities receiving gifts) ────
create table lace.mission_recipients (
  id              uuid primary key default gen_random_uuid(),
  community       text not null,
  city            text not null,
  country         text not null,
  region          lace.mission_region not null,
  flag_emoji      text,
  -- Map plot on our 0..1 / 0..1 world svg
  map_x           numeric(4,3) check (map_x between 0 and 1),
  map_y           numeric(4,3) check (map_y between 0 and 1),
  contact_name    text,
  contact_email   citext,
  contact_phone   text,
  established_date date,
  -- Running totals kept accurate by the mission_gifts trigger
  veils_requested integer not null default 0,
  veils_gifted    integer not null default 0,
  story           text,
  photo_url       text,
  accent_gradient text,
  active          boolean not null default true,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index recipients_active_idx on lace.mission_recipients (active, region);
create trigger recipients_updated before update on lace.mission_recipients
  for each row execute function lace.tg_set_updated_at();

-- ── Mission gifts (the actual matched gifted veils) ────────────
create table lace.mission_gifts (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references lace.orders(id) on delete set null,
  order_item_id   uuid references lace.order_items(id) on delete set null,
  recipient_id    uuid references lace.mission_recipients(id) on delete set null,
  quantity        integer not null default 1 check (quantity > 0),
  status          lace.mission_gift_status not null default 'pending',
  -- Drip: whether the "Her name is..." update email has gone out
  update_sent_at  timestamptz,
  allocated_at    timestamptz,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  -- Dispatch story the buyer eventually receives
  story           text,
  photo_url       text,
  notes           text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index gifts_status_idx    on lace.mission_gifts (status);
create index gifts_recipient_idx on lace.mission_gifts (recipient_id);
create index gifts_order_idx     on lace.mission_gifts (order_id);
create trigger gifts_updated before update on lace.mission_gifts
  for each row execute function lace.tg_set_updated_at();

-- Keep recipient rollup accurate on status changes.
create or replace function lace.tg_recipient_rollup()
returns trigger language plpgsql as $$
begin
  if new.recipient_id is not null then
    update lace.mission_recipients r
      set veils_gifted = (
        select coalesce(sum(g.quantity),0) from lace.mission_gifts g
         where g.recipient_id = r.id and g.status = 'delivered')
    where r.id = new.recipient_id;
  end if;
  if tg_op = 'UPDATE' and old.recipient_id is not null and old.recipient_id is distinct from new.recipient_id then
    update lace.mission_recipients r
      set veils_gifted = (
        select coalesce(sum(g.quantity),0) from lace.mission_gifts g
         where g.recipient_id = r.id and g.status = 'delivered')
    where r.id = old.recipient_id;
  end if;
  return new;
end;
$$;
create trigger gifts_recipient_rollup
  after insert or update on lace.mission_gifts
  for each row execute function lace.tg_recipient_rollup();

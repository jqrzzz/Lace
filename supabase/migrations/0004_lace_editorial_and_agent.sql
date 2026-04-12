-- ─────────────────────────────────────────────────────────────
-- Lace — Editorial (journal) + Agent console tables.
--
-- The agent tables are deliberately simple at this stage. The goal
-- is a transparent audit trail: every agent turn is logged, every
-- action that touches money or customer state requires an explicit
-- `agent_approvals` row that mom can approve/deny.
-- ─────────────────────────────────────────────────────────────

-- ── Journal posts (blog) ───────────────────────────────────────
create table lace.journal_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            citext unique not null,
  title           text not null,
  dek             text,
  excerpt         text,
  category        text not null,
  author          text not null,
  author_role     text,
  published_date  date not null,
  read_minutes    integer not null default 5,
  cover_gradient  text,
  cover_accent    text,
  featured        boolean not null default false,
  -- body is stored as the array of JournalSection objects we render
  body            jsonb not null default '[]'::jsonb,
  tags            text[] not null default '{}',
  -- Draft/published lifecycle so mom can draft via agent, review, publish
  status          text not null default 'published',
  -- 'draft'|'scheduled'|'published'|'archived'
  scheduled_for   timestamptz,
  seo_title       text,
  seo_description text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index journal_status_idx  on lace.journal_posts (status, published_date desc);
create index journal_featured_idx on lace.journal_posts (featured) where status = 'published';
create trigger journal_updated before update on lace.journal_posts
  for each row execute function lace.tg_set_updated_at();

-- ── Application users (the console/agent operator roster) ──────
-- Distinct from auth.users so we can assign role + preferences
-- without touching Supabase Auth's managed table.
create table lace.app_users (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid unique,       -- maps to auth.users.id when signed in
  email          citext unique not null,
  name           text,
  role           lace.user_role not null default 'viewer',
  whatsapp_e164  text unique,        -- mom's WhatsApp number once wired
  preferred_language text default 'en',
  -- Agent behavior toggles (mom-mode vs staff-mode)
  confirm_money_actions  boolean not null default true,
  confirm_destructive    boolean not null default true,
  daily_briefing_enabled boolean not null default false,
  last_seen_at   timestamptz,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger app_users_updated before update on lace.app_users
  for each row execute function lace.tg_set_updated_at();

-- ── Agent sessions (one row per conversation) ──────────────────
create table lace.agent_sessions (
  id              uuid primary key default gen_random_uuid(),
  actor_user_id   uuid references lace.app_users(id) on delete set null,
  actor_label     text,                        -- 'Luz Maria', 'System', 'Customer'
  channel         lace.agent_channel not null default 'console',
  -- Optional external thread ids
  whatsapp_from   text,
  whatsapp_thread text,
  title           text,
  summary         text,
  message_count   integer not null default 0,
  tool_call_count integer not null default 0,
  approvals_pending integer not null default 0,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index agent_sessions_actor_idx   on lace.agent_sessions (actor_user_id, started_at desc);
create index agent_sessions_channel_idx on lace.agent_sessions (channel, started_at desc);
create trigger agent_sessions_updated before update on lace.agent_sessions
  for each row execute function lace.tg_set_updated_at();

-- ── Agent messages (the turn-by-turn log) ──────────────────────
create table lace.agent_messages (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references lace.agent_sessions(id) on delete cascade,
  turn          integer not null,  -- monotonic within session
  role          lace.agent_role not null,
  -- For role='user' / 'assistant' / 'system'
  content       text,
  -- For role='tool' (both directions)
  tool_name     text,
  tool_input    jsonb,
  tool_output   jsonb,
  tokens_in     integer,
  tokens_out    integer,
  latency_ms    integer,
  -- If this message is an action that needs approval, link to the
  -- row in agent_approvals.
  approval_id   uuid,
  created_at    timestamptz not null default now()
);
create index agent_messages_session_idx on lace.agent_messages (session_id, turn);
create unique index agent_messages_turn_unique on lace.agent_messages (session_id, turn);

-- ── Agent approvals (human-in-the-loop gate) ───────────────────
-- Whenever the agent is about to do something that costs money or
-- is destructive, it writes a pending row here and pauses. Mom
-- approves/denies from the console or WhatsApp. Row is the single
-- source of truth for what is/isn't safe to auto-execute.
create table lace.agent_approvals (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references lace.agent_sessions(id) on delete set null,
  message_id      uuid references lace.agent_messages(id) on delete set null,
  action_type     text not null,
  -- e.g. 'refund_order', 'send_broadcast', 'update_product_price',
  --      'delete_product', 'mark_gift_delivered', 'reply_to_customer'
  action_payload  jsonb not null default '{}'::jsonb,
  human_summary   text not null,          -- one-line, mom-readable
  risk            text not null default 'normal',
  -- 'low'|'normal'|'money'|'destructive'
  status          lace.approval_status not null default 'pending',
  requested_by    uuid,                   -- app_users.id (or null = agent)
  reviewed_by     uuid references lace.app_users(id),
  reviewed_at     timestamptz,
  review_comment  text,
  expires_at      timestamptz not null default (now() + interval '24 hours'),
  executed_at     timestamptz,
  execution_result jsonb,
  created_at      timestamptz not null default now()
);
create index approvals_status_idx   on lace.agent_approvals (status, created_at desc);
create index approvals_session_idx  on lace.agent_approvals (session_id);

alter table lace.agent_messages
  add constraint agent_messages_approval_fk
  foreign key (approval_id) references lace.agent_approvals(id) on delete set null;

-- ── Audit log (everything that changes state) ──────────────────
-- The single tail every ops question can be answered from:
-- "what happened to order X?", "who refunded Y?", "did the agent
-- change this price?" It's append-only; never update or delete.
create table lace.audit_log (
  id             uuid primary key default gen_random_uuid(),
  actor_type     lace.actor_type not null,
  actor_id       text,                   -- app_user.id, agent-session.id, 'stripe', etc.
  actor_label    text,                   -- human-readable
  action         text not null,          -- 'order.refund', 'product.update', 'gift.deliver'...
  entity_type    text,                   -- 'order', 'product', 'gift', 'customer'...
  entity_id      text,
  before_data    jsonb,
  after_data     jsonb,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index audit_entity_idx  on lace.audit_log (entity_type, entity_id, created_at desc);
create index audit_actor_idx   on lace.audit_log (actor_type, actor_id, created_at desc);
create index audit_action_idx  on lace.audit_log (action, created_at desc);

-- ── Broadcast campaigns (email blasts) ─────────────────────────
-- When mom says "send the centennial announce to everyone who
-- subscribed in the last 6 months", the agent drafts this row,
-- asks for approval, and on approval hands it to the drip worker.
create table lace.broadcast_campaigns (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  template         text not null,
  subject          text not null,
  preheader        text,
  -- Postgres expression evaluated against newsletter_subscribers
  audience_filter  jsonb not null default '{}'::jsonb,
  -- Snapshot of audience size at approval time
  audience_count   integer,
  -- Lifecycle
  status           text not null default 'draft',
  -- 'draft'|'pending_approval'|'approved'|'scheduled'|'sending'|'sent'|'cancelled'|'failed'
  approval_id      uuid references lace.agent_approvals(id),
  scheduled_for    timestamptz,
  started_at       timestamptz,
  finished_at      timestamptz,
  sent_count       integer not null default 0,
  failed_count     integer not null default 0,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index broadcast_status_idx on lace.broadcast_campaigns (status, created_at desc);
create trigger broadcast_updated before update on lace.broadcast_campaigns
  for each row execute function lace.tg_set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Lace — RLS policies + schema grants.
--
-- Approach: RLS is enabled on every table. Public storefront
-- reads (shop, product, journal, journey) go through server-only
-- service-role calls — the anon key never hits lace.* directly.
-- This keeps the surface area tight; mom's console runs under a
-- user session and is gated by lace.app_users.role = 'owner'.
--
-- For now we default-deny everything under anon and let the
-- service role bypass RLS. Later we can open specific read paths
-- (e.g. anon can read active products directly) if performance
-- demands it.
-- ─────────────────────────────────────────────────────────────

-- Let the API roles see the schema.
grant usage on schema lace to anon, authenticated, service_role;

-- Default-deny everything for anon/authenticated; service_role
-- bypasses RLS so our server-side code keeps working.
alter default privileges in schema lace
  revoke all on tables from anon, authenticated;

-- Grant select/insert/update/delete to service_role on all current
-- AND future tables + sequences. Server code uses the service key.
grant all on all tables    in schema lace to service_role;
grant all on all sequences in schema lace to service_role;
grant all on all functions in schema lace to service_role;

alter default privileges in schema lace
  grant all on tables to service_role;
alter default privileges in schema lace
  grant all on sequences to service_role;
alter default privileges in schema lace
  grant all on functions to service_role;

-- ── Enable RLS on everything ───────────────────────────────────
alter table lace.products              enable row level security;
alter table lace.product_variants      enable row level security;
alter table lace.product_images        enable row level security;
alter table lace.customers             enable row level security;
alter table lace.orders                enable row level security;
alter table lace.order_items           enable row level security;
alter table lace.newsletter_subscribers enable row level security;
alter table lace.contact_messages      enable row level security;
alter table lace.email_events          enable row level security;
alter table lace.mission_recipients    enable row level security;
alter table lace.mission_gifts         enable row level security;
alter table lace.journal_posts         enable row level security;
alter table lace.app_users             enable row level security;
alter table lace.agent_sessions        enable row level security;
alter table lace.agent_messages        enable row level security;
alter table lace.agent_approvals       enable row level security;
alter table lace.audit_log             enable row level security;
alter table lace.broadcast_campaigns   enable row level security;

-- ── Helper: is current auth user an owner/staff in lace? ───────
create or replace function lace.is_owner()
returns boolean language sql stable security definer set search_path = lace, public as $$
  select exists (
    select 1 from lace.app_users u
     where u.auth_user_id = auth.uid()
       and u.role = 'owner'
  );
$$;

create or replace function lace.is_staff()
returns boolean language sql stable security definer set search_path = lace, public as $$
  select exists (
    select 1 from lace.app_users u
     where u.auth_user_id = auth.uid()
       and u.role in ('owner','staff')
  );
$$;

-- ── Owner/staff full access to every lace table ────────────────
-- Generic policy: authenticated users who are app_users with
-- role 'owner' or 'staff' get full access. Viewer gets select only.
do $$
declare
  t record;
begin
  for t in
    select table_name from information_schema.tables
     where table_schema = 'lace' and table_type = 'BASE TABLE'
  loop
    execute format(
      'create policy "%1$s_owner_all" on lace.%1$I
         for all to authenticated using (lace.is_owner()) with check (lace.is_owner())',
      t.table_name
    );
    execute format(
      'create policy "%1$s_staff_read" on lace.%1$I
         for select to authenticated using (lace.is_staff())',
      t.table_name
    );
  end loop;
end $$;

-- ── Public read exceptions (anon / authenticated non-staff) ────
-- The storefront renders fine via service-role server routes,
-- but these make the data API directly readable for later use
-- (e.g. product detail page fetching). Read-only.

create policy "products_public_read" on lace.products
  for select using (active = true);

create policy "product_variants_public_read" on lace.product_variants
  for select using (
    exists (select 1 from lace.products p
             where p.id = product_variants.product_id and p.active)
  );

create policy "product_images_public_read" on lace.product_images
  for select using (
    exists (select 1 from lace.products p
             where p.id = product_images.product_id and p.active)
  );

create policy "journal_public_read" on lace.journal_posts
  for select using (status = 'published');

create policy "mission_recipients_public_read" on lace.mission_recipients
  for select using (active = true);

-- ── Self-read for app_users (so the console can look up its own row) ──
create policy "app_users_self_read" on lace.app_users
  for select to authenticated using (auth_user_id = auth.uid());

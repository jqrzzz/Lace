-- ─────────────────────────────────────────────────────────────
-- Lace — Customer self-read RLS.
--
-- Migration 0005 default-denied everything for non-owner roles.
-- That works for the admin console (service role bypasses RLS) but
-- leaves the storefront's /account pages with no way to read the
-- signed-in user's own orders without a server round-trip.
--
-- These four policies let an authenticated buyer read just their
-- own rows — matched by email — across customers, orders, order
-- items, and mission gifts. customer_email is citext, so the
-- comparison with auth.email()::text is case-insensitive.
-- ─────────────────────────────────────────────────────────────

create policy "customers_self_read" on lace.customers
  for select to authenticated
  using (email = auth.email());

create policy "orders_buyer_read" on lace.orders
  for select to authenticated
  using (customer_email = auth.email());

create policy "order_items_buyer_read" on lace.order_items
  for select to authenticated
  using (
    exists (
      select 1 from lace.orders o
       where o.id = order_items.order_id
         and o.customer_email = auth.email()
    )
  );

create policy "mission_gifts_buyer_read" on lace.mission_gifts
  for select to authenticated
  using (
    exists (
      select 1 from lace.orders o
       where o.id = mission_gifts.order_id
         and o.customer_email = auth.email()
    )
  );

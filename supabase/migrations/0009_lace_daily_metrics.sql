-- ─────────────────────────────────────────────────────────────
-- Lace — Daily rollup view for the dashboard.
--
-- Returns one row per day for the last 14 days (index 0 = today,
-- index 13 = thirteen days ago). The /admin overview reads the last
-- 7 rows for sparklines and the today row for the headline numbers.
--
-- Regular view, runs on demand. At current volume the underlying
-- count() queries are sub-millisecond; if traffic grows we can
-- promote this to a materialized view with a refresh trigger.
--
-- pendingApprovals and unshippedOrders are not included here — both
-- are snapshot metrics (current count, not "created on day X") so
-- they stay as fresh count queries inside getTodayBriefing.
-- ─────────────────────────────────────────────────────────────

create or replace view lace.daily_metrics as
with days as (
  select (current_date - i)::date as day
  from generate_series(0, 13) as i
)
select
  d.day,
  (select count(*)::int from lace.orders o
     where o.created_at::date = d.day) as new_orders,
  (select coalesce(sum(total_cents), 0)::bigint from lace.orders o
     where o.created_at::date = d.day
       and o.status in ('paid','processing','shipped','delivered')) as revenue_cents,
  (select count(*)::int from lace.contact_messages m
     where m.created_at::date = d.day) as new_inbox_messages,
  (select count(*)::int from lace.newsletter_subscribers s
     where s.created_at::date = d.day and s.status = 'active') as new_subscribers,
  (select count(*)::int from lace.agent_approvals a
     where a.created_at::date = d.day) as new_approvals,
  (select count(*)::int from lace.orders o
     where o.created_at::date = d.day
       and o.status in ('paid','processing')) as unshipped_orders
from days d
order by d.day;

grant select on lace.daily_metrics to service_role;

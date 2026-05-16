# Lace by La Luz — Production Readiness Audit

*Conducted 2026-05-16 against commit on branch `claude/review-progress-AvJd3`.*

This is a deep review of the codebase against what a launch-day store actually
needs. Findings are graded P0 (blocks launch / data risk), P1 (must-fix before
real customers), P2 (polish that affects daily use), P3 (minor / future). Items
already addressed in this audit pass are marked **fixed in this pass**.

---

## Executive summary

The order loop is real end-to-end: webhook persists to `lace.*`, refunds call
Stripe, inbox replies call Resend, the agent's tool catalog runs real DB
mutations through the approval gate. The admin console has the daily-use
surfaces (orders, customers, inbox, mission, approvals, audit, settings) all
backed by real queries and write actions, with first-owner bootstrap and JWT
auth on every write endpoint.

Two structural gaps remain. **One is critical: every `/admin/*` page renders
server-side with data baked into the HTML before the client-side auth check
runs, so unauthenticated visitors can curl any admin URL and see real customer
data.** The other is the hardcoded `PRODUCTS` catalog (Phase 1.B), which is
known and lower-risk.

Five audit-grade issues were fixed in this pass before this write-up:

- `/api/checkout` trusted client-supplied prices (price tampering)
- `/api/agent/*` and `/api/ai` were unauthenticated (action + token cost)
- `/login?next=` was open-redirect via protocol-relative URLs
- `/api/contact` forwarded unescaped HTML to the support inbox (XSS / phishing)
- `/api/contact` and `/api/newsletter` had weak input validation

The recommended next phase is **2.K.2 — server-side admin auth** to close the
data leak. After that, Phase 1.B (catalog migration) becomes the last
launch-blocker.

---

## P0 — Critical

### 1. Server-side admin pages leak data to anonymous visitors

Every `/admin/*` page is a server component with `export const dynamic =
"force-dynamic"` that fetches data via the service-role client (which bypasses
RLS). The data is rendered into the HTML response **before** the client-side
`AdminProvider` runs its `/api/admin/me` check and decides to redirect to
`/login`.

Result: an unauthenticated `curl https://yoursite/admin/orders` returns a
fully-rendered HTML page containing order numbers, customer emails, totals,
addresses, etc.

**Affected pages** (11):

- `/admin` (briefing aggregates)
- `/admin/orders` and `/admin/orders/[orderNumber]`
- `/admin/customers` and `/admin/customers/[id]`
- `/admin/inbox` and `/admin/inbox/[id]`
- `/admin/audit`
- `/admin/mission`
- `/admin/approvals`
- `/admin/chat`

**Root cause**: client-side `AdminProvider` checks auth, but server-side
rendering happens first and has no auth context. The Supabase auth session
lives in browser localStorage (default) so the server has nothing to read.

**Remediation (Phase 2.K.2)**:

1. Install `@supabase/ssr` (official Supabase Next.js helper).
2. Switch `src/lib/auth.tsx` to `createBrowserClient` (writes the session to
   cookies the server can read).
3. Convert `src/app/admin/layout.tsx` into a server component that calls
   `createServerClient`, validates the session against `lace.app_users`, and
   `redirect("/login?next=...")` when there's no actor or the role is
   `viewer`. The existing client `AdminShell` can receive the actor as a prop
   so `AdminProvider` no longer needs the `/api/admin/me` round-trip on first
   load.
4. Optional: Next.js middleware on `/admin/*` for a defensive second layer.

Estimated effort: half a day. This is the single highest-priority follow-up.

---

## P1 — Important

### 2. Test coverage is thin against new surface area

`vitest` runs 31 tests across four files. Coverage is essentially the agent
router, the in-memory store dispatch, the webhook handler, and formatting
helpers. Nothing covers:

- `src/lib/agent/actions.ts` (markOrderShipped, addTrackingNumber,
  refundOrder, assignMissionGift, markGiftDelivered, tagCustomer) — these now
  call Stripe and write real audit rows; a mocked test pinned to the response
  shape would catch refactor breakage immediately.
- `src/lib/admin-auth.ts` (JWT validation + first-owner bootstrap + RLS-bound
  app_user lookup) — the most security-sensitive code in the repo.
- `src/lib/email.ts` (Resend fetch, escape behavior, simulated fallback).
- `src/lib/lace/queries.ts` (PostgREST joins, mock fallbacks) — there are 7
  `as unknown as` casts here that hide real shape mismatches if the schema
  drifts.
- Any of the 11 admin API routes (validation, role enforcement, audit shape).

**Remediation**: add a `route.test.ts` next to each admin write route using
the same mock-Supabase pattern from `webhook/route.test.ts`. Target ~30
additional tests covering the happy path + the 401 / 403 / 400 branches.

### 3. Hardcoded `PRODUCTS` catalog (Phase 1.B)

`src/lib/products.ts` still owns prices, variants, and copy. `/api/checkout`
now resolves products from this list server-side (price tampering fixed), but
admin product editing is a placeholder and the storefront/shop/product/sitemap
read the constant directly. Until 1.B lands, every catalog change is a code
deploy.

**Remediation**: ship Phase 1.B — `lace.products` reads in `/shop`,
`/product/[slug]`, home featured row, `/admin/products`, sitemap, checkout
resolver, plus admin add/edit/archive UI.

### 4. No global error / not-found boundaries

`src/app/` has no `error.tsx` or `not-found.tsx`. Uncaught server-component
errors fall back to Next's default error page; `notFound()` calls from order
and customer detail pages render Next's default 404. Both look out-of-brand.

**Remediation**: add `src/app/error.tsx` (calm "something went wrong" with a
"go home" link) and `src/app/not-found.tsx` (similarly warm). Optional:
`src/app/admin/error.tsx` for admin-scoped errors.

### 5. `/api/concierge/turn` is unauthenticated and unbounded per-session

The storefront concierge widget is designed as a public surface (no tools, no
PII access), which is the right call. But there's no rate limit — anyone can
hit `/api/concierge/turn` in a loop and burn Anthropic tokens. The
`max_tokens: 400` cap helps, but a determined script could still rack up
costs.

**Remediation**: add a simple per-IP rate limit (Upstash Redis or an in-memory
sliding window on a single-instance deploy). Bound: 20 concierge turns per
visitor per hour.

### 6. Sign-in flow doesn't auto-redirect after magic link

When mom clicks the magic link, Supabase redirects to `?next` or `/account`.
But the `LoginPage`'s "already signed in" branch shows a button rather than
automatically navigating. For someone re-clicking an old magic link or already
having a session, this is one extra tap.

**Remediation**: in `LoginPage`'s `user` branch, `router.replace(destination)`
in a `useEffect` so the redirect is automatic.

---

## P2 — Polish that affects daily use

### 7. Mobile admin lacks a real navigation drawer

The mobile header is a strip with horizontal-scrolling tabs and a sign-out
button. The desktop sidebar (with avatar, "Ask Luz" card, quick switch hint)
isn't reachable on phone. Mom likely uses an iPad sometimes.

**Remediation**: a `lg:hidden` slide-in drawer that mirrors the desktop
sidebar contents, opened by a hamburger button. Existing `lg:flex` sidebar
stays as-is.

### 8. Audit page renders raw action strings

`/admin/audit` shows entries like `order.mark_shipped` and
`approval.executed`. The metadata is available but unused for readability.

**Remediation**: a small mapper in `src/lib/audit-format.ts` that turns
`{action: "order.mark_shipped", entity_id: "...", metadata: { order_number,
tracking_number }}` into "You marked LL-2026-1042 shipped with tracking
9405511899223456789001". Same surface, far more glanceable.

### 9. Dashboard sparkline proxies

`getTodayBriefing` uses `new_approvals` (approvals *created* on a day) as a
proxy for "pending approvals trend" and `unshipped_orders` (orders created on
a day that are *currently* unshipped) as a proxy for the unshipped trend.
Neither is a real snapshot — they shift retroactively as state changes. The
labels in the UI ("Pending approvals · last 7 days") imply snapshot data.

**Remediation**: either a `lace.daily_snapshots` materialized view captured by
a nightly cron, or update the UI labels to "new approvals / day" and "orders
piling up / day" to match what's actually computed.

### 10. Empty states on `/admin/playbooks` and `/admin/products`

`/admin/products` still uses the original placeholder copy (count of
hardcoded PRODUCTS, no edit affordance). `/admin/playbooks` was untouched in
this round. Both feel like demo pages compared to orders/customers/mission.

**Remediation**: defer until catalog (1.B) lands; redo both with the same
warmth-first treatment as the new pages.

### 11. Mobile header sign-out crowds the actor email

On phones the header is `Admin · <actor email> | Sign out`. Long emails wrap
or push the sign-out button off-screen.

**Remediation**: use the actor's `name` when available, fall back to the
local-part of the email, never the full address. Small change in
`AdminShell`.

### 12. `LaceOwnerEmail` documentation only in `.env.example`

`LACE_OWNER_EMAIL` is the first-owner bootstrap key. If it's set wrong, the
visitor lands as `viewer` and the autonomy toggles are locked. There's no
inline reminder in the admin where this would show up.

**Remediation**: if a signed-in actor is a `viewer` and there's no owner in
`lace.app_users` yet, show a small banner in `/admin/settings` explaining how
to promote the first owner. Defensive in case the env var was mis-set.

---

## P3 — Minor / future

### 13. `as unknown as` casts in `queries.ts`

Seven occurrences. They're papering over PostgREST's inferred shape for
nested joins (single-row relationships are typed as arrays, etc.). The casts
are correct at runtime but make schema drift silent — a column rename in a
migration won't fail TypeScript.

**Remediation**: enable `supabase gen types` and check the generated types
into the repo. Replace the hand-written DB interfaces with the generated
ones; the casts become unnecessary or visibly wrong.

### 14. `console.log` in webhook on payment_intent.payment_failed

`src/app/api/webhook/route.ts:292` logs failed payments. It should be either
recorded as an `audit_log` row or routed to whatever monitoring the user
eventually adopts.

### 15. Test mocks duplicated across files

`webhook/route.test.ts` and `agent/store.test.ts` each ship their own
hand-rolled Supabase client mock. They have the same shape with minor
differences. Future test additions will copy them again.

**Remediation**: a `src/lib/test/supabase-mock.ts` helper.

### 16. Product images are gradient placeholders

Every product card and product detail page uses a `bg-gradient-to-br` placeholder
rather than real photography. Functional but visibly "demo" — and the
storefront's most prominent surface.

**Remediation**: Supabase Storage bucket + admin upload UI (depends on
Phase 1.B).

### 17. `tag_customer` is read-modify-write

`tagCustomer` in `src/lib/agent/actions.ts` reads `customers.tags`, appends,
writes back. Two simultaneous tag operations on the same customer would race.
Tolerable for a single-admin store; worth knowing.

**Remediation**: a Postgres RPC `lace.append_customer_tag(customer_id, tag)`
or use `array_append` semantics through PostgREST when it lands.

### 18. Pre-launch banner is permanent

The "Pre-launch mode — Connect Stripe and Supabase…" banner shows on every
admin page even after Stripe + Supabase are live. Two options: gate it on
`!isLaceDbConfigured()` or make it dismissible per-actor with a flag in
`app_users.metadata`.

---

## Things working well (kept honest)

These came up in the audit and held up.

- **Schema migrations are well-structured.** 0001–0009 are idempotent
  (`create if not exists`, `on conflict do nothing` where relevant). Helpful
  triggers (order_number generation, customer rollup, recipient rollup, gift
  rollup) keep aggregate columns accurate without app-side coordination. The
  `lace` schema namespace keeps Nomadex untouched.
- **Audit log is comprehensive.** Every webhook insert, agent approval
  decision, agent action, admin direct action, and settings change writes a
  row with `actor_type / actor_label / action / entity_type / entity_id /
  metadata`. The actor label uses the real signed-in user's name (with role
  suffix) rather than a hardcoded placeholder.
- **Webhook idempotency.** `handleCheckoutCompleted` checks
  `stripe_session_id` first; Stripe redeliveries don't duplicate. Tested.
- **Auth on admin write APIs is consistent.** All 11 routes call
  `getAdminActor(req)`, return 401 on missing/invalid JWT, 403 on
  insufficient role, and use the actor's audit-friendly label. No
  client-supplied actor name is trusted.
- **Approval gate is real.** When the agent calls a write tool the router
  decides `execute_now | require_approval | deny`. Money and destructive
  actions always require approval; approving runs the same handler the admin
  UI calls directly, with audit `executed='real'` vs `'simulated'` so the
  trail shows which path ran.
- **Single source of truth for state mutations.** `src/lib/agent/actions.ts`
  houses each handler; the agent approval path and the admin REST routes
  both delegate to it. Identical payloads, identical audit rows.
- **Mom-friendly copy throughout.** "Always ask me before money goes out",
  "Nevermind", "All matched up", "Wrapped up — nothing to do here". The
  voice is consistent across order actions, mission, inbox, and settings.
- **Stripe webhook verifies signatures.** `stripe.webhooks.constructEvent`
  rejects requests without a valid `stripe-signature` header.
- **Email helper centralized.** `src/lib/email.ts` is the only place that
  calls Resend; webhook order confirmation and inbox reply both go through
  it. Simulated fallback when `RESEND_API_KEY` is missing.

---

## Recommended next phases (in order)

1. **Phase 2.K.2 — Server-side admin auth.** Close finding #1. Half a day.
2. **Phase 2.L — Admin polish.** Findings #4, #6, #7, #8 (#6 quick win,
   others a couple hours each).
3. **Phase 1.B — Catalog migration.** Closes the storefront read loop and
   unblocks the admin products page. Mechanical, ~7 files.
4. **Phase 2.M — Test backfill.** Adds tests for actions, admin-auth, email,
   and one happy-path test per admin write route. Half a day.
5. **Phase 2.N — Concierge rate limit + audit log readability.** Findings
   #5 and #8. Couple hours.

After (2.K.2 + 2.L + 1.B), the store is launch-ready for real customers and
mom can run it on her own.

---

## Audit-driven fixes already in this branch

Commits since the audit started:

| Commit | What |
|---|---|
| `b2bc4c6` | Gate every `/api/agent/*` + `/api/ai` route behind admin auth |
| `4246f07` | Checkout price tampering, login open-redirect, `/api/contact` HTML escaping, newsletter validation, env example refresh |

These are listed against P0 / P1 in the relevant sections above so the audit
reflects the true *current* state, not the pre-audit state.

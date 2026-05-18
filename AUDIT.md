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

### 1. Server-side admin pages leak data to anonymous visitors — **CLOSED (commit `174fbc8`, Phase 2.K.2)**

Was: every `/admin/*` page rendered data into HTML before the client-side
auth check ran, so anonymous `curl` returned customer emails and order
totals.

Closed by:

1. Installed `@supabase/ssr`.
2. `src/lib/db.ts:getAuthClient()` switched to `createBrowserClient` — the
   Supabase session is now persisted to cookies the server can read.
3. `src/lib/admin-auth.ts` grew `getAdminActorFromCookies()` and a shared
   `provisionOrFetchAppUser()` helper used by both JWT and cookie flows.
4. `src/app/admin/layout.tsx` is now a server component that validates the
   actor up front and `redirect("/login?next=...")` when missing or
   `redirect("/?notice=admin-access-needed")` for viewers. The client
   chrome moved into `src/app/admin/AdminShell.tsx` and receives the
   validated actor as `initialActor` — no first-load round-trip, no
   client-side loading flash.
5. `src/middleware.ts` adds an edge-level second gate on `/admin/:path*`.

Net: `curl -i https://yoursite/admin/orders` without a session gets a 307
to `/login`. No HTML, no data, no exposure.

---

## P1 — Important

### 2. Test coverage is thin against new surface area — **CLOSED (commit pending, Phase 2.M)**

Was: 31 tests across four files; the agent's `actions.ts`, `admin-auth.ts`,
`email.ts`, and the 8 admin write routes were unverified.

Closed by Phase 2.M. A shared `src/test/supabase-mock.ts` records every
operation and returns canned responses, and four new test files use it:

- `src/lib/agent/actions.test.ts` — 13 tests covering the happy path
  plus error/edge cases for every state-mutation handler.
- `src/lib/admin-auth.test.ts` — 12 tests for JWT validation, role
  enforcement, first-owner bootstrap (by env, by empty-table fallback,
  viewer assignment), and the cookie path.
- `src/lib/email.test.ts` — 12 tests for the Resend send path: simulated
  fallback, real success, non-200 error, fetch throw, replyTo override,
  HTML escaping in `wrapReplyHtml`.
- `src/app/api/admin/admin-routes.test.ts` — 12 tests, one happy path per
  admin write route plus a 401/403/400 sweep.

Total: 80 tests across 8 files. Still room to grow (queries.ts, the
webhook's full flow, agent turn) but the critical mutation surface is
now covered.

### 3. Hardcoded `PRODUCTS` catalog (Phase 1.B) — **CLOSED (commit `dcc78ec`, Phase 1.B)**

Was: `src/lib/products.ts` owned prices and variants; the storefront and
sitemap read the constant directly.

Closed by:

- `src/lib/lace/queries.ts` grew `listProducts()` and `getProductBySlug()`
  that read from `lace.products` (with embedded `product_variants`) when
  configured, fall back to the in-code MOCK fallback otherwise. A small
  `src/lib/product-colors.ts` keeps the color-name → hex lookup.
- `/shop`, `/`, `/product/[slug]`, `/admin/products`, `/sitemap.xml`, and
  `/api/checkout` all read through the new query. Shop and product detail
  pages now follow a server-page + client-view split so the data fetch
  happens server-side and the interactive bits stay client.
- Admin add/edit/archive UI for products is still outstanding — separate
  follow-up.

### 4. No global error / not-found boundaries — **CLOSED (commit `b7858b8`, Phase 2.L)**

`src/app/error.tsx` and `src/app/not-found.tsx` ship with on-brand copy and
recovery CTAs. `src/app/admin/error.tsx` scoped to the console.

### 5. `/api/concierge/turn` is unauthenticated and unbounded per-session

The storefront concierge widget is designed as a public surface (no tools, no
PII access), which is the right call. But there's no rate limit — anyone can
hit `/api/concierge/turn` in a loop and burn Anthropic tokens. The
`max_tokens: 400` cap helps, but a determined script could still rack up
costs.

**Remediation**: add a simple per-IP rate limit (Upstash Redis or an in-memory
sliding window on a single-instance deploy). Bound: 20 concierge turns per
visitor per hour.

### 6. Sign-in flow doesn't auto-redirect after magic link — **CLOSED (commit `b7858b8`, Phase 2.L)**

`LoginPage`'s `user` branch now `router.replace(safeNext ?? "/account")` in
a `useEffect` and shows a "Welcoming you in…" line while routing.

---

## P2 — Polish that affects daily use

### 7. Mobile admin lacks a real navigation drawer — **CLOSED (commit `b7858b8`, Phase 2.L)**

Mobile header now has a hamburger button that opens a 72-wide slide-in
drawer with the same nav, avatar, and footer actions as the desktop
sidebar. Backdrop closes it; pathname change auto-closes it.

### 8. Audit page renders raw action strings — **CLOSED (commit `b7858b8`, Phase 2.L)**

`AuditView`'s row now renders a humanized sentence per row ("Marked
LL-2026-1042 shipped with USPS tracking 9405511…") with a short action
chip ("Shipped") and a clear actor line. Every action type the audit_log
currently emits has a template; new ones fall through to a kv summary.

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

Phases 2.K.2, 2.L, 1.B, and 2.M from the original audit list have shipped.
What remains:

1. **Phase 2.N — Concierge rate limit.** Finding #5. Couple hours
   (Upstash Redis sliding window per IP).
2. **Phase 2.O — Admin product CRUD.** Add/edit/archive UI on
   `/admin/products` now that catalog reads from `lace.products`. Half to
   a full day depending on image upload scope.
3. **Phase 3 — End-to-end against a real Supabase test branch.** Stripe
   test event → row → admin sees it.

Beyond that, the structural roadmap stays: WhatsApp inbound (#6 of original
P3), Resend drip worker, real product photography (Supabase Storage).

---

## Audit-driven fixes shipped on this branch

| Commit | What |
|---|---|
| `b2bc4c6` | Gate every `/api/agent/*` + `/api/ai` route behind admin auth |
| `4246f07` | Checkout price tampering, login open-redirect, `/api/contact` HTML escaping, newsletter validation, env example refresh |
| `174fbc8` | Phase 2.K.2: server-side admin auth — closes the P0 SSR data leak (#1) |
| `b7858b8` | Phase 2.L: error pages, auto-redirect after sign-in, mobile drawer, readable audit (#4, #6, #7, #8) |
| `dcc78ec` | Phase 1.B: catalog migration — `lace.products` reads across storefront + admin (#3) |
| (pending) | Phase 2.M: test backfill — 49 new tests across actions, admin-auth, email, admin routes (#2) |

These are reflected in the per-finding entries above so the audit shows the
true *current* state, not the pre-audit state.

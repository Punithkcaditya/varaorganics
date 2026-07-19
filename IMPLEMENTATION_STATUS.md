# IMPLEMENTATION_STATUS.md

Status as built. Verified locally in mock mode: `npm run lint` ✓, `npm run typecheck` ✓,
`npm run test` ✓ (44 unit), `npm run build` ✓ (34 routes), `npm run test:e2e` ✓ (11 scenarios ×
chromium + mobile = 22). A live production server (`npm run start`) was smoke-tested: SSR HTML,
canonicals, JSON-LD, single-H1, verify states, COD + online order pipeline (server-recomputed
totals, idempotency), and the order-confirmed page all render correctly.

Legend: ✅ Completed · 🟡 Partial · 🔑 Requires credentials · 📝 Requires final content · 🏢 Requires
business confirmation.

## Completed ✅

- Next.js 16 App Router project, TS strict, Tailwind v4 tokens, Cormorant+Jost fonts.
- Runtime env validation (Zod, fail-fast, mock-tolerant); `.env.example`.
- Supabase server/admin clients; data-access layer with **mock fallback** for every read.
- 13-table normalized schema, RLS, triggers, constraints, indexes, seed (`supabase/`).
- Homepage — all 14 sections converted 1:1 from the design HTML; ISR 60s; Organization/WebSite JSON-LD.
- Sticky cart via IntersectionObserver; consent-gated analytics; aria-live cart announcer; skip link.
- Shop (all + per-category), product page (gallery, inline variant price, trust bar, batch info, lab
  table, nutrition, ingredients, FAQ, related, learn links), bundle page.
- Ghee 500ml & 1L both indexable (C3); inline size switch updates price without reload.
- Cart (Zustand + localStorage), checkout (RHF + Zod, Indian phone/PIN), order-confirmed.
- Payment abstraction: Razorpay order/verify/webhook + COD, idempotent, server-recomputed totals.
- Shiprocket service (auth+token cache, shipment, retry, redacted logs); Resend 6 templates.
- Learn hub + article template (markdown `#`→H2/`##`→H3/`###`→H4, sanitized, next/image); on-demand
  revalidation via `x-revalidate-secret` header.
- `/verify/[batchId]` (valid/inactive/unknown/error/no-report states) + batch Product schema.
- `/lp/[slug]` (no nav, single CTA, noindex, UTM passthrough, gated Pixel ViewContent).
- Lab-reports, FAQs, Our Story, Contact (form + address cards + click-to-call + maps + honeypot),
  B2B, Privacy/Shipping/Returns, branded 404.
- SEO: metadata API, canonical (no trailing slash), OG/Twitter, safe JSON-LD serializer, all schema
  types, `sitemap.ts`, `robots.ts`. **No `aggregateRating`, no fake claims.**
- Security: Zod on all inputs, HMAC verify (callback + webhook), idempotency, rate-limit, redaction,
  CSP + security headers, markdown sanitization, RLS, `/products/*`→`/shop/*` redirect.
- Tests: 44 unit (Vitest) + 11 e2e scenarios (Playwright). All 11 docs.

## Added from the July-17 docs (Tech Stack + Landing Page Copy) ✅

- **GTM-first tracking** — single container; GA4 / Meta Pixel / Clarity / Klaviyo all configured
  inside GTM. Ecommerce + Klaviyo events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`,
  `klaviyo_*`, `identify`) pushed to `dataLayer`. Direct GA4/Pixel/Clarity retained as fallback.
  Everything still consent-gated; Purchase still fires only from server-verified order data.
- **Inventory + reorder points** (`inventory` table, `inventory_status` view) with low-stock email +
  WhatsApp alerts and a 12-hour per-variant cooldown.
- **Batch traceability per order** — `orders.batch_number` captured at order creation, plus an
  `/admin/batch-lookup` recall tool showing every customer who received a batch.
- **Shiprocket status webhook** (`/api/shiprocket/webhook`) — maps milestones, appends
  `shipment_events`, notifies the customer, and raises an NDR alert on failed delivery.
- **Customer order tracking** at `/order/[orderId]` with a progress timeline and shipment history.
- **WATI WhatsApp service** — order confirmed / shipped / delivered / NDR + operator alerts.
- **Google Merchant Center feed** at `/feed.xml` (one entry per purchasable variant, hourly).
- **Reports** — `/api/monthly-report?month=YYYY-MM` (P&L sheet) and `/api/reports/weekly`
  (Monday email: orders, revenue, AOV, top product, stock alerts). Both admin-secret protected.
- **Two full landing pages** — `/lp/ghee-bangalore` and `/lp/pure-ghee-truth` with the supplied copy
  and a database-driven section-toggle system (lab card, comparison table, pain points, process,
  founder story, honest note, FAQ, sticky mobile bar, minimal footer).
- **Admin dashboard + Supabase Auth** — middleware-protected `/admin` with email/password login,
  revenue/orders/stock snapshot, orders list, inventory view, batch lookup, and a SimpleMDE
  article editor that writes to `learn_content` and revalidates the live pages.

## Gap-closing pass (all previously-flagged code gaps now closed) ✅

- **UTM attribution persisted** — `utm_source/medium/campaign` now flow from the landing page
  through checkout onto the order row (previously captured then dropped).
- **Real scannable QR codes** — generated server-side as inline SVG (no external service, works
  offline) linking to `/verify/[batchNumber]`, on both the product batch panel and the verify page.
- **Admin completed** — added Products (copy, price, stock, visibility), Batches (with lab
  parameters; activating one deactivates the rest), Landing pages (section toggles), and Settings
  (announcement bar, hero copy, free-delivery threshold). Nine sections total, all write-gated by
  Supabase Auth and validated with Zod.
- **Tests expanded 44 → 69** — new suites cover Shiprocket status mapping (including the
  "undelivered" vs "delivered" ordering trap), consent-gated dataLayer/Klaviyo events, landing-page
  integrity (noindex, real product, section/content consistency), WhatsApp number normalization and
  QR/canonical URL generation.
- **Scheduled jobs documented** — DEPLOYMENT.md now has the Monday 09:00 IST cron for the weekly
  report (VPS crontab, Hostinger cron, and a Supabase `pg_cron` variant), the Apps Script for the
  monthly P&L sheet, and the three inbound webhook registrations.

## Partial 🟡

- **Order persistence in mock mode** is an in-memory store on `globalThis` (shared across bundles,
  verified working) but does not survive a process restart. Real Supabase makes it durable — the DB
  code path exists but was not exercised against a live Supabase instance in this environment.
- **Shiprocket payload** uses placeholder weight/dimensions (1 kg, 15³ cm) — set real per-product
  values before go-live.
- **Consent default**: analytics load after an accept click. If India needs no gate at launch, flip
  to load-immediately (🏢 confirm).
- **Performance**: built to the guidance (next/image, minimal client JS, ISR). Lighthouse not run
  here — verify on staging.

## Requires credentials 🔑

Supabase URL/anon/service-role · Razorpay key id/secret/webhook secret · Shiprocket
email/password/pickup · Resend API key + verified `EMAIL_FROM` · GA4 / Meta Pixel / Search-Console
IDs · `REVALIDATE_SECRET`. All wired via env; app runs without them in mock mode.

## Requires final content 📝

- Product photography (4+ real images/product) — placeholders in `public/placeholders/`.
- Real batch numbers, MFG/best-before dates, and **lab-report PDF URLs** (currently sample/none).
- Ingredient statements, nutritional values, FSSAI licence number (Label Spec not supplied).
- Final Learn article copy, product long-descriptions, meta titles/descriptions, alt text.
- Policy pages (privacy/shipping/returns) legal review.

## Requires business confirmation 🏢

- Prices flagged CONFIRM: **Ghee 1L ₹2,699, Honey 500g ₹749, Sesame 1L ₹1,149** (design only gave
  other sizes). Bundle contents (design lists honey 250g, not a launch SKU).
- Whether design-only extras (**coconut oil, mustard honey, ghee 250ml, honey 250g/1kg**) launch —
  currently seeded `active=false`.
- Which `lead.txt` Bengaluru address is customer-facing vs the Shiprocket pickup.
- Official logo SVG (a text wordmark is used now).

## Not started (out of scope for launch)

- Admin dashboard (marketing manages via the Supabase dashboard, per the brief).
- WhatsApp notifications (email only at launch).
- UAE Phase 2 (currency/i18n) — consent structure is ready.

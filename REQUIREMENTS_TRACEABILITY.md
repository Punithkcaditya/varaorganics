# REQUIREMENTS_TRACEABILITY.md — Vara Organics

Maps every requirement (from the build prompt §1–§24, Developer Kit, and Learn Hub Brief) to a
Route / Component / DB table / API route / Test, with a status. Status legend:
**PLANNED** (designed, not yet coded) · **DONE** · **PARTIAL** · **BLOCKED-CREDS** · **BLOCKED-CONTENT**.

At this Phase-1/2 checkpoint everything is **PLANNED** pending your approval to implement.

## Modernization map (Pages Router → App Router)

| Doc example (legacy) | App Router equivalent used |
|---|---|
| `getStaticProps` | Server Component fetch + `export const revalidate` |
| `getStaticPaths` + `fallback:'blocking'` | `generateStaticParams` + `export const dynamicParams = true` |
| `pages/api/revalidate.js` (`res.revalidate`) | `app/api/revalidate/route.ts` → `revalidatePath()` (header secret) |
| `next-sitemap` package | native `app/sitemap.ts` / `app/robots.ts` |
| Razorpay "React SDK" on client | server `razorpay` SDK (order/verify) + client `checkout.js` (public key only) |
| Supabase webhook `?secret=` | webhook custom header `x-revalidate-secret` |

## Storefront & pages

| Requirement | Route | Component(s) | DB | API | Test | Status |
|---|---|---|---|---|---|---|
| Homepage w/ 14 sections | `/` | home/* (Hero…FirstOrderCTA), layout/* | products, product_variants, site_settings | — | e2e: home loads; unit: n/a | PLANNED |
| AnnouncementBar (env/DB config) | `/` | layout/AnnouncementBar | site_settings | — | — | PLANNED |
| Navbar sticky + cart count + a11y | all | layout/Navbar, MobileNavigation | — | — | e2e: mobile menu | PLANNED |
| StickyCart via IntersectionObserver | `/` | layout/StickyCart | — | — | — | PLANNED |
| ProductGrid (DB, inline size, states) | `/` | home/ProductGrid, shop/ProductCard | products, product_variants | — | e2e: variant price change | PLANNED |
| Shop all + per category | `/shop`, `/shop/[category]` | shop/* | products, product_variants | — | e2e: learn/shop render | PLANNED |
| Product page (all above/below fold) | `/ghee|honey|oils/[slug]` | product/* | products, variants, images, batches, lab_parameters | — | e2e: ATC, variant price | PLANNED |
| Bundle | `/bundles/wellness-starter` | home/Bundle + product view | products(bundle) | — | — | PLANNED |
| Cart (Zustand, localStorage persist) | client | cart/*, features/cart | — | — | unit: cart calc; e2e: persist | PLANNED |
| Checkout (RHF+Zod, IN phone/PIN) | client → api | checkout/*, forms/* | orders, order_items, customers, addresses | razorpay/order, orders/cod | unit: checkout zod | PLANNED |
| Order confirmation | `/order-confirmed/[orderId]` | checkout/OrderSummary | orders | — | — | PLANNED |
| Our Story / Lab Reports / FAQs | `/our-story` `/lab-reports` `/faqs` | ui + schema | site_settings, batches | — | — | PLANNED |
| Contact (form, cards, maps, spam) | `/contact` | forms/*, config/contact | contact_submissions | contact | — | PLANNED / BLOCKED-CONTENT(addr) |
| Policies | `/privacy` `/shipping` `/returns` | ui | site_settings | — | e2e: — | PLANNED / BLOCKED-CONTENT |
| B2B | `/b2b` | ui | — | — | — | PLANNED |

## Learn Hub (Brief §01–§09)

| Requirement | Route | Component | DB | API | Test | Status |
|---|---|---|---|---|---|---|
| Hub grouped by ghee/oils/honey, ISR 300 | `/learn` | learn/CategorySection, ArticleCard, VerifyCTA, Faq | learn_content | — | e2e: categories shown | PLANNED |
| Article page + schema + markdown H2→H4 | `/learn/[slug]` | learn/ArticleHero, ArticleBody, ArticleFAQ, ProductCTA, RelatedArticles, BackToLearn, Breadcrumb | learn_content | — | e2e: semantic headings; unit: heading map | PLANNED |
| Article card uses title as anchor (not "read more") | `/learn` | learn/ArticleCard | learn_content | — | unit/e2e | PLANNED |
| On-demand revalidation (header secret) | — | — | learn_content | revalidate | unit: secret check | PLANNED |
| 7 launch articles seeded | `/learn/*` | — | learn_content(seed) | — | — | PLANNED / BLOCKED-CONTENT(final copy) |

## Trust / verification

| Requirement | Route | Component | DB | API | Test | Status |
|---|---|---|---|---|---|---|
| Batch verify (valid/unknown/inactive/no-report/db-fail) | `/verify/[batchId]` | verify/BatchResult, VerifyStates | product_batches, lab_parameters, products | — | e2e: valid+invalid batch | PLANNED |
| Product JSON-LD w/ batch, no medical claims | `/verify/[batchId]` | schema/Product | batches | — | unit: jsonld | PLANNED |

## Landing pages (§14)

| Requirement | Route | Component | DB | API | Test | Status |
|---|---|---|---|---|---|---|
| `/lp/[slug]` no-nav, single CTA, noindex, UTM preserved, Pixel gated | `/lp/[slug]` | lp layout, cta | landing_pages (+ typed fallback JSON) | — | e2e: noindex | PLANNED |

## Integrations (§8–§10, §18)

| Requirement | API route | lib | DB | Test | Status |
|---|---|---|---|---|---|
| Razorpay create order (server total recompute) | razorpay/order | lib/razorpay | orders | unit: total calc | PLANNED / BLOCKED-CREDS |
| Razorpay verify signature | razorpay/verify | lib/razorpay | orders | unit: signature verify | PLANNED |
| Razorpay webhook (idempotent, source of truth) | razorpay/webhook | lib/razorpay | orders | unit: idempotency | PLANNED / BLOCKED-CREDS |
| COD order | orders/cod | features/payments | orders | unit | PLANNED |
| Shiprocket (auth+cache, shipment, awb, retry, redacted logs) | shiprocket/retry (+ called in webhook/cod) | lib/shiprocket | orders | unit: token cache | PLANNED / BLOCKED-CREDS |
| Resend templates (6) | (called server-side) | lib/resend | — | — | PLANNED / BLOCKED-CREDS |
| GA4 + Meta Pixel + consent, ecommerce events | client | lib/analytics | — | — | PLANNED / BLOCKED-CREDS |

## SEO/AEO, security, a11y, perf, testing, docs, env

| Requirement | Where | Test | Status |
|---|---|---|---|
| Metadata API, canonical no-slash, OG/Twitter/robots | seo/*, per-route generateMetadata | unit: canonical helper | PLANNED |
| JSON-LD components (Product/FAQ/Breadcrumb/Org/Article/HowTo/CollectionPage) + safe serializer | schema/* , lib/security/jsonld | unit: jsonld escape | PLANNED |
| sitemap.xml / robots.txt (disallow api/admin, exclude noindex) | app/sitemap.ts, robots.ts | unit | PLANNED |
| Env validation fail-fast, no NEXT_PUBLIC leak | lib/validation/env | unit | PLANNED |
| Rate limit, redaction, CSP, headers, markdown sanitize, RLS | lib/security/*, middleware, migrations | unit: redact | PLANNED |
| next/image everywhere, sizes, priority, alt | product/Gallery, shop/ProductCard, learn/* | — | PLANNED |
| WCAG AA (landmarks, focus, aria-live cart, skip link, reduced motion) | layout/*, ui/* | e2e/a11y | PLANNED |
| Unit tests (cart, totals, variant price, checkout zod, jsonld, canonical, rzp signature, heading map) | tests/unit | vitest | PLANNED |
| Playwright 11 e2e scenarios | tests/e2e | playwright | PLANNED |
| Docs (README, ARCHITECTURE, DATABASE, DEPLOYMENT, ENVIRONMENT, SEO-AEO, PAYMENTS, SHIPROCKET, TESTING, ASSUMPTIONS, IMPLEMENTATION_STATUS) | repo root | — | PARTIAL (this doc set) |
| `.env.example` + runtime validation | root, lib/validation/env | unit | PLANNED |
| Hostinger deploy (Node + VPS), no static export | DEPLOYMENT.md | — | PLANNED |

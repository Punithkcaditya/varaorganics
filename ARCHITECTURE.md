# ARCHITECTURE.md — Vara Organics (Varixa Global)

D2C storefront. **Next.js 15 App Router · React 19 · TypeScript strict · Tailwind · Supabase ·
Razorpay · Shiprocket · Resend.** SSR/SSG/ISR on a Node runtime (Hostinger). No static export.

---

## 1. Rendering strategy per route

| Route | Strategy | Why |
|---|---|---|
| `/` | **ISR, `revalidate = 60`** | Dev Kit §06: homepage SSG+ISR 60 s for price freshness. Organization + product data in initial HTML for AEO. |
| `/shop`, `/shop/[category]` | **ISR, `revalidate = 300`** + `generateStaticParams` | Collection pages must be fully-rendered HTML for SEO. |
| `/ghee/…`, `/honey/…`, `/oils/…` product pages | **SSG via `generateStaticParams`, `revalidate = 300`, `dynamicParams = true`** | Fixed launch SKUs pre-rendered; new SKUs render on-demand then cache. Price/stock revalidated server-side at checkout regardless. |
| `/bundles/wellness-starter` | ISR 300 | As above. |
| `/learn` | **ISR `revalidate = 300`** (Learn brief §04) | Refreshes when DM publishes. |
| `/learn/[slug]` | **`generateStaticParams` for published + `dynamicParams=true`, on-demand revalidation** (Learn brief §05/§07) | Known articles static; new ones render-then-cache; webhook revalidates. No time-based ISR (per brief), relies on on-demand. |
| `/verify/[batchId]` | **Dynamic (SSR, `dynamic = 'force-dynamic'` / `revalidate=0`)** | Batch is scanned live; must reflect DB truth incl. inactive/unknown states. |
| `/lp/[slug]` | **SSR** + `robots: noindex,nofollow` | Personalized per campaign, paid-only (Dev Kit §07). |
| `/order-confirmed/[orderId]` | **SSR, no cache, noindex** | Per-order private data. |
| `/our-story`, `/lab-reports`, `/faqs`, `/contact`, `/privacy`, `/shipping`, `/returns`, `/b2b` | Static / ISR 3600 | Mostly static content. Contact form posts to a Route Handler. |
| `not-found` (404) | Static | Branded, links back to `/shop`. |
| `/api/*` Route Handlers | **Node runtime, dynamic** | Payments, webhooks, revalidate, contact, shipping. `Disallow` in robots. |

Server Components by default. `"use client"` only for: cart store, size/variant selectors,
carousel, accordions, mobile menu, sticky cart (IntersectionObserver), checkout form, Razorpay
launcher, consent banner.

---

## 2. Route tree (App Router)

```
src/app/
  layout.tsx                     Root: fonts, <Analytics/>, <ConsentGate/>, skip-link, Announcement+Nav+Footer via (store)
  page.tsx                       Homepage (ISR 60) — assembles all home sections
  sitemap.ts  robots.ts          Native metadata routes
  not-found.tsx                  Branded 404
  (store)/                       Layout group sharing Nav/Footer/StickyCart chrome
    shop/page.tsx                        /shop            (all)
    shop/[category]/page.tsx             /shop/ghee|honey|oils
    ghee/[slug]/page.tsx                 /ghee/a2-gir-cow-bilona-ghee-500ml | -1l
    honey/[slug]/page.tsx                /honey/raw-wild-forest-honey-500g
    oils/[slug]/page.tsx                 /oils/wood-pressed-sesame-oil-1l | -groundnut-oil-1l
    bundles/[slug]/page.tsx              /bundles/wellness-starter
    our-story/page.tsx  lab-reports/page.tsx  faqs/page.tsx  contact/page.tsx
    verify/[batchId]/page.tsx
    privacy|shipping|returns/page.tsx
    b2b/page.tsx
    order-confirmed/[orderId]/page.tsx
    learn/page.tsx
    learn/[slug]/page.tsx
  lp/[slug]/page.tsx             Standalone layout (no nav), noindex
  api/
    razorpay/order/route.ts             POST create pending order + RZP order
    razorpay/verify/route.ts            POST verify signature (client callback path)
    razorpay/webhook/route.ts           POST idempotent webhook (source of truth)
    orders/cod/route.ts                 POST create COD order + fulfilment
    shiprocket/retry/route.ts           POST manual shipment retry
    contact/route.ts                    POST contact submission + email
    revalidate/route.ts                 POST header-secret on-demand revalidation
    health/route.ts
```

The `/ghee`, `/honey`, `/oils` segments each resolve their `[slug]` through a shared
`resolveProductRoute(category, slug)` helper backed by the DB, so the three route files are thin
wrappers over one product-page renderer.

---

## 3. Component tree (feature-based)

```
components/
  layout/    AnnouncementBar Navbar MobileNavigation Footer StickyCart SkipLink LayoutChrome
  home/      Hero TrustStrip PainPoints ProductGrid WhyVara QRProof Process Bundle FirstOrderCTA
  product/   Gallery ThumbnailStrip VariantSelector PriceBlock StockBadge QtySelector AddToCart
             TrustBar BatchInfo LabParamsTable NutritionTable IngredientList Faq RelatedProducts LearnLinks
  shop/      CollectionHeader ProductCard CategoryFilter
  cart/      CartDrawer CartLineItem CartSummary
  checkout/  CheckoutForm AddressFields PaymentMethodSelect OrderSummary
  learn/     ArticleCard CategorySection ArticleHero ArticleBody(Markdown) ArticleFAQ ProductCTA
             RelatedArticles BackToLearn VerifyCTA Breadcrumb
  verify/    BatchResult LabResultRow VerifyStates
  seo/       Metadata helpers (buildMetadata, canonical)
  schema/    JsonLd Product FAQPage BreadcrumbList Organization Article HowTo CollectionPage
  forms/     Field ErrorSummary (RHF + Zod wired)
  ui/        Button Pill Badge Accordion Tabs Container Section Eyebrow Icon(inline SVG set)
```

Business logic lives in `features/*` and `lib/*`, never in page components.

```
features/  cart(zustand store + selectors) products orders payments shipping articles batches
lib/       supabase(server/browser/admin clients) razorpay shiprocket resend analytics
           validation(zod schemas) security(rate-limit, redact, csp, jsonld-escape) utils
types/  config/  data/(typed fallback JSON for LP + contact + settings)
supabase/ migrations/  seed.sql
tests/  unit/  e2e/
```

---

## 4. Data model (normalized — overrides Dev Kit's denormalized JSON columns)

Tables: `products`, `product_variants`, `product_images`, `product_batches`, `lab_parameters`,
`orders`, `order_items`, `customers`, `addresses`, `learn_content`, `landing_pages`,
`contact_submissions`, `site_settings`.

- **products** 1─∞ **product_variants** (size, sku UNIQUE, price, compare_at_price, stock, unit_label, active)
- **products** 1─∞ **product_images** (url, alt, position)
- **products** 1─∞ **product_batches** (batch_number UNIQUE, mfg_date, best_before, lab_report_url, active) 1─∞ **lab_parameters** (name, result, status Pass/Premium/Fail)
- **orders** 1─∞ **order_items**; orders → customers, → addresses; carries razorpay/shiprocket/awb fields, `payment_status`, `fulfillment_status`, UTM columns, `idempotency_key` UNIQUE.
- Constraints: FKs, unique (slug, sku, batch_number, order_number), CHECK (price ≥ 0, stock ≥ 0, category ∈ ghee|honey|oils, status enums), `updated_at` triggers, **RLS** (public read only where `active/published = true`; orders/customers/contact write via service role only; no public read of orders).

Full DDL → `supabase/migrations/*` and DATABASE.md.

Data fetching: server-only `lib/supabase/server` (anon key, RLS-safe, cached reads via React
`cache()` + route `revalidate`); `lib/supabase/admin` (service-role, **server Route Handlers
only**) for order writes/stock decrement. Browser client only for nothing sensitive (none needed
at launch). **Client-provided totals are never trusted** — recomputed from DB at order creation.

---

## 5. Order / payment flow (idempotent, server-authoritative)

```
Cart → Checkout(RHF+Zod) → POST /api/razorpay/order
   server: read variant prices+stock from DB → recompute total → insert pending order (idempotency_key)
           → create RZP order → return {orderId, rzpOrderId, publicKey}
Client Razorpay checkout → success → POST /api/razorpay/verify (verify HMAC signature server-side)
Razorpay → POST /api/razorpay/webhook  ← SOURCE OF TRUTH (idempotent on rzp_payment_id)
   server: verify webhook secret → mark paid (once) → decrement stock safely → create Shiprocket
           shipment (store awb/courier/tracking; on failure store fulfilment=failed for retry)
           → send Resend confirmation → done
COD path: POST /api/orders/cod → same order creation + fulfilment, payment_status=cod_pending.
Redirect → /order-confirmed/[orderId] (reads DB, never the client callback, as proof).
```

Payment-provider abstraction (`features/payments`) exposes `createOrder`/`confirm` so COD and
Razorpay share one order-creation + fulfilment pipeline.

---

## 6. Security plan

Zod validation on every Route Handler input + env (`lib/validation/env.ts`, fail-fast).
HMAC verification for Razorpay callback **and** webhook. Idempotency keys on order create + webhook.
`REVALIDATE_SECRET` sent as a **request header** (`x-revalidate-secret`), not query string
(modernizes Learn brief §07; Supabase webhooks support custom headers). Service-role key server-only.
Rate-limit abstraction on `/api/contact`, `/api/razorpay/*`. Log redaction of tokens/PII. CSP +
security headers in `next.config`/middleware. Markdown sanitized (`rehype-sanitize`, raw HTML off).
No raw DB errors to clients. Secrets never in `NEXT_PUBLIC_*`.

---

## 7. SEO / AEO plan

Metadata API `generateMetadata` per route (title, description, canonical **without trailing
slash**, OG, Twitter, robots) sourced from DB `meta_*` fields with sane fallbacks. Exactly one
`<h1>` per page. Safe JSON-LD serializer (escapes `<`/`>`/`&` to prevent `</script>` breakout).
Schema placement: Organization (home), BreadcrumbList (all except home), Product+FAQPage (product),
Article+Breadcrumb+FAQPage+conditional HowTo (article), CollectionPage+Breadcrumb+FAQPage (learn hub),
Product w/ batch (verify). `sitemap.ts` includes products + published articles, **excludes**
noindex LPs; `robots.ts` disallows `/api` + `/order-confirmed` + `/lp`. Full HTML in initial
server response for every indexable page (no client shell).

---

## 8. Deployment plan (Hostinger, no static export)

`next build` → `next start` on Node 20. **Option A**: Hostinger Node.js hosting (build/start
commands, env vars in panel, domain+SSL). **Option B**: Ubuntu VPS + PM2 + Nginx reverse proxy +
Certbot HTTPS + git deploy + zero-downtime reload + rollback. Both in DEPLOYMENT.md. Shared static
hosting is insufficient (needs a Node server for SSR/API/ISR/webhooks).

---

## 9. Contradictions found in the source documents

| # | Contradiction | Resolution |
|---|---|---|
| **C1** | Dev Kit → **Vercel** + `next-sitemap` + `pages/api/revalidate.js` (Pages Router). Build prompt → **Hostinger** + App Router. | Build for **Hostinger + App Router**. Translate `getStaticProps/getStaticPaths/pages/api` → `generateStaticParams`/`revalidate`/Route Handlers/`revalidatePath`. Native `sitemap.ts`/`robots.ts`. |
| **C2** | Dev Kit "Next.js 14". Prompt "latest stable". | **Next.js 15 / React 19.** |
| **C3** | Fixed routes list ghee **500 ml and 1 L as two separate slugs**, but SEO rules say **sizes are `?size=` query params with canonical → base**. | One `products` row + `product_variants`; **both required slugs are real indexable URLs** each bound to a variant; inline switching uses `?size=`, canonical = the fixed slug of the selected variant. Honors both rules. |
| **C4** | Dev Kit product schema uses **denormalized JSON** (`variants`, `images`, `lab_params`, `faq` on the row). Prompt requires **normalized tables**. | **Normalized** schema (variants/images/batches/lab_parameters/... tables). |
| **C5** | Dev Kit: Product JSON-LD "`aggregateRating` empty at launch". Prompt + Dev Kit checklist: **no fake ratings**. | **Omit `aggregateRating` entirely** until real reviews exist (empty is invalid schema). |
| **C6** | Learn slugs differ **between the two docs**: Dev Kit §07 has `/learn/a2-vs-a1-ghee`, `/learn/how-to-verify-organic-honey`; Learn Brief + prompt have `-difference`, `how-to-check-honey-is-pure`, `what-is-raw-honey`, `what-is-ghani-pressing`. | Follow **Learn Brief + prompt** slug list (7 launch articles). |
| **C7** | Learn brief §07 puts `REVALIDATE_SECRET` **in the URL query string**. Prompt: don't use query string if a header works. | Send secret via **`x-revalidate-secret` header** (Supabase webhooks support custom headers). |
| **C8** | Design HTML shows **Coconut Oil, Mustard Honey, ghee 250 ml, honey 250 g/1 kg** not in the fixed launch list. | Seed as **`active=false`** placeholders; not routed at launch. **CONFIRM.** |
| **C9** | Dev Kit "own farm" vs "Gau Organics **supplies**" narrative; several **prices/batches are sample data**; FSSAI "apply pending". | Treat as **editable seed content / placeholders**, none fabricated as schema claims. Priced/dated items flagged **CONFIRM** (see ASSUMPTIONS §C, D). |
| **C10** | Dev Kit "Razorpay React SDK — `npm install razorpay`" (that package is **server-side**). | Server SDK for order-create/verify; **client uses Razorpay `checkout.js` with the public key id only**. |
| **C11** | Revalidate timings: homepage 60 s (Dev Kit) vs learn 300 s (brief); product "SSR or SSG". | Per-route table §1. Homepage 60, collections/products/learn 300, verify/LP/order dynamic. |
| **C12** | Missing Brand Book / Label Spec / Shopify Checklist / logo SVG. | Tokens from design CSS; wordmark rebuilt; label/nutrition/ingredients are placeholders. **CONFIRM.** |

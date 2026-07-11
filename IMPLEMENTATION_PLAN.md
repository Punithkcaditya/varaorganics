# IMPLEMENTATION_PLAN.md — Vara Organics

Ordered build plan following the prompt's Phases 3–8. Each phase ends with lint + typecheck
passing. External services are mocked so `build` and `test` succeed without credentials.

## Phase 3 — Foundation
1. `create-next-app` (Next 15, TS strict, App Router, Tailwind, ESLint) at repo root; add Prettier, Vitest, Playwright, Zustand, Zod, RHF, react-markdown + rehype-sanitize, `razorpay`, `resend`, `@supabase/supabase-js`.
2. `tsconfig` strict (+ `noUncheckedIndexedAccess`), path aliases (`@/*`).
3. Tailwind design tokens from `vara-organics-v2.html` `:root` (navy `#15284C`, gold `#E8961C`, ivory, paper, success, danger, muted, borders, shadows, container widths, type scale, spacing). Cormorant Garamond + Jost via `next/font`.
4. `lib/validation/env.ts` (Zod, fail-fast, mock-tolerant in dev). `.env.example`.
5. Supabase clients (server/admin/browser). `lib/security/*` (jsonld escape, redact, rate-limit, csp), `lib/utils`.
6. Root layout: fonts, skip-link, ConsentGate, Analytics scripts, `(store)` chrome (AnnouncementBar, Navbar, MobileNavigation, Footer, StickyCart). `ui/*` primitives + inline SVG icon set (no icon library).

## Phase 4 — Database
7. Migrations: 13 tables (§4 ARCHITECTURE), FKs, unique/check constraints, indexes, `updated_at` triggers, RLS policies (public read active/published; writes service-role only).
8. `seed.sql`: 5 launch SKUs + variants + images(alt) + sample batches + lab params, Wellness Starter bundle, 2 contact locations, site_settings, 7 learn articles (placeholder copy flagged), inactive design-only SKUs.
9. `types/database.ts` (hand-maintained, matches DDL) + domain types in `types/`.

## Phase 5 — Storefront
10. Home sections as components (1:1 with design), wired to Supabase with loading/empty/error states + mock fallback.
11. `/shop`, `/shop/[category]`, shared ProductCard.
12. Product page (`resolveProductRoute` + one renderer for ghee/honey/oils): gallery (4+ placeholders), variant selector (`?size=`), price/unit-price, stock, qty, ATC, trust bar; below-fold description, batch info, lab table, nutrition, ingredients, FAQ accordion, related, learn links.
13. Cart (Zustand + localStorage, aria-live), CartDrawer, checkout UI (RHF+Zod, IN phone/PIN), payment method select, order summary.
14. `/order-confirmed/[orderId]`.

## Phase 6 — Content & trust
15. Learn hub + article template (markdown H2→H4 mapping, sanitized, next/image wrapper, internal/external link rules), schema.
16. `/verify/[batchId]` with all five states. `/lab-reports`, `/faqs`, `/our-story`, `/contact` (+ contact API), `/privacy` `/shipping` `/returns`, `/b2b`.
17. `/lp/[slug]` standalone template (noindex, UTM passthrough, gated Pixel).

## Phase 7 — Integrations
18. Payments abstraction; `razorpay/order|verify|webhook`, `orders/cod` (idempotent, server total recompute, safe stock decrement).
19. Shiprocket service (auth+token cache, create shipment, AWB, tracking, retry, redacted logs) + `shiprocket/retry`.
20. Resend 6 templates. Analytics + consent + ecommerce events (Purchase only after server verification).
21. `sitemap.ts`, `robots.ts`, `revalidate` route (header secret).

## Phase 8 — Quality
22. Unit tests (cart, totals, variant price, checkout zod, jsonld escape, canonical, rzp signature, heading map). Playwright 11 scenarios (services mocked).
23. A11y pass, responsive review (375 px), CSP/security headers, perf (image sizes, minimal client JS).
24. Docs (README, DATABASE, DEPLOYMENT, ENVIRONMENT, SEO-AEO, PAYMENTS, SHIPROCKET, TESTING, IMPLEMENTATION_STATUS). Run `npm install && lint && typecheck && test && build`; fix until green.

## Definition of done
All five commands pass; every fixed route renders full server HTML; no fabricated claims/ratings;
secrets only via env; IMPLEMENTATION_STATUS.md lists Completed / Partial / Blocked-creds /
Blocked-content / Needs-confirmation honestly.

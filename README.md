# Vara Organics — D2C Storefront

Production-ready e-commerce site for **Vara Organics** (by **Varixa Global**): A2 Gir Cow Bilona
ghee, wood-pressed oils and raw wild forest honey, sold D2C in Bengaluru with UAE as a future
market.

Built with **Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Supabase · Razorpay · Shiprocket · Resend**. Server-rendered for SEO/AEO — **not** a static export.

> **Runs offline out of the box.** With `NEXT_PUBLIC_USE_MOCK_DATA=true` the app serves seeded mock
> data and stubs all external services, so `dev`, `build` and tests work with **zero credentials**.
> See [ENVIRONMENT.md](ENVIRONMENT.md) to connect the real services.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router (SSR/SSG/ISR, Route Handlers) |
| Language | TypeScript strict (`noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Data | Supabase (PostgreSQL + Storage), RLS |
| State | Zustand (cart, localStorage-persisted) |
| Validation | Zod (env, forms, API inputs) |
| Forms | React Hook Form |
| Payments | Razorpay (server SDK + checkout.js) |
| Shipping | Shiprocket API (server-only) |
| Email | Resend |
| Analytics | GA4 + Meta Pixel (consent-gated) |
| Tests | Vitest (unit) + Playwright (e2e) |

## Installation

```bash
npm install
cp .env.example .env.local   # defaults to mock mode — no creds needed
```

## Environment setup

All variables are documented in [.env.example](.env.example) and [ENVIRONMENT.md](ENVIRONMENT.md).
The app validates them at runtime and fails fast in production if required ones are missing.
Server-only secrets must **never** use the `NEXT_PUBLIC_` prefix.

## Supabase: migrations & seed

With the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push                              # applies supabase/migrations/*
psql "$DATABASE_URL" -f supabase/seed.sql     # seeds catalog + articles
```

Or paste `supabase/migrations/0001_init.sql`, `0002_rls.sql`, then `seed.sql` into the Supabase SQL
editor in that order. See [DATABASE.md](DATABASE.md).

## Local development

```bash
npm run dev        # http://localhost:3000 (mock mode via .env.local)
```

## Build & run (production)

```bash
npm run build
npm run start      # Node server — required for SSR/API/ISR (no static export)
```

## Quality commands

```bash
npm run lint        # ESLint (Next core-web-vitals + TS)
npm run typecheck   # tsc --noEmit (strict)
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright (boots dev server in mock mode)
npm run format      # Prettier
```

## Deployment

Hostinger Node.js hosting or VPS (PM2 + Nginx + Certbot). Full steps in
[DEPLOYMENT.md](DEPLOYMENT.md). Static shared hosting is **not** sufficient.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — rendering strategy, routes, data model, contradictions
- [DATABASE.md](DATABASE.md) — schema, RLS, migrations, seed
- [ENVIRONMENT.md](ENVIRONMENT.md) — every env var
- [PAYMENTS.md](PAYMENTS.md) — Razorpay + COD order flow
- [SHIPROCKET.md](SHIPROCKET.md) — shipping integration
- [SEO-AEO.md](SEO-AEO.md) — metadata, schema, sitemap, revalidation
- [TESTING.md](TESTING.md) — unit + e2e strategy
- [DEPLOYMENT.md](DEPLOYMENT.md) — Hostinger options
- [ASSUMPTIONS.md](ASSUMPTIONS.md) — placeholders & CONFIRM items
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) — what's done / blocked
- [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md) — requirement → code map

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails on a missing env var | You're in non-mock mode without secrets. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` or provide the vars. |
| Product images 404 | Placeholder SVGs live in `public/placeholders/`. Real photography replaces them via Supabase Storage. |
| Cart empty after payment | Expected — the cart clears on order success. |
| Orders vanish after restart (mock mode) | The mock order store is in-memory. Connect Supabase to persist. |
| Razorpay checkout doesn't open locally | Mock mode simulates payment success without the gateway. Provide real keys to use checkout.js. |

## Project structure

```
src/
  app/            App Router routes ((store) group + api + lp + sitemap/robots)
  components/     layout, home, product, shop, cart, checkout, learn, verify, seo, schema, forms, ui
  features/       cart, products, orders, payments, articles, batches, settings (business logic)
  lib/            supabase, razorpay, shiprocket, resend, analytics, validation, security, api, utils
  data/           seeded mock catalog, articles, landing pages, settings
  config/         site, nav, contact, fonts
  types/          domain + database types
supabase/         migrations + seed.sql
tests/            unit (Vitest) + e2e (Playwright)
```

# DATABASE.md

Supabase PostgreSQL. Normalized schema (overrides the docs' denormalized JSON columns — see
[ARCHITECTURE.md](ARCHITECTURE.md) §9 C4). Integer INR prices, `timestamptz` everywhere.

## Files

| File | Purpose |
|---|---|
| `supabase/migrations/0001_init.sql` | Tables, constraints, indexes, `updated_at` triggers |
| `supabase/migrations/0002_rls.sql` | RLS policies + `decrement_variant_stock()` function |
| `supabase/seed.sql` | Catalog, batches, lab params, 7 articles, landing page, settings |

## Apply

```bash
# Supabase CLI
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql

# or paste into the SQL editor in order: 0001 → 0002 → seed
```

TypeScript types are hand-maintained in `src/types/database.ts` (mirrors the DDL). Regenerate with
`supabase gen types typescript` if you prefer.

## Tables

| Table | Key columns | Notes |
|---|---|---|
| `products` | `slug` uniq, `category`, `route_prefix`, `active`, `featured`, `is_bundle`, `nutritional_info` jsonb, `faqs` jsonb, `learn_links` text[] | Public read where `active` |
| `product_variants` | `product_id` fk, `sku` uniq, `price`, `stock`, `route_slug` uniq, `active`, `position` | Both ghee sizes carry their own `route_slug` (C3) |
| `product_images` | `product_id` fk, `url`, `alt`, `position` | |
| `product_batches` | `product_id` fk, `batch_number` uniq, `mfg_date`, `best_before`, `lab_report_url`, `active` | `best_before >= mfg_date` check |
| `lab_parameters` | `batch_id` fk, `name`, `result`, `status` in (Pass/Premium/Fail) | |
| `learn_content` | `slug` uniq, `category`, `body_markdown`, `faqs` jsonb, `published`, `enable_howto_schema` | Public read where `published` |
| `customers` | `email`, `full_name`, `phone` | No public read |
| `addresses` | `customer_id` fk | No public read |
| `orders` | `order_number` uniq, `idempotency_key` uniq, payment/fulfilment status enums, razorpay/shiprocket/awb cols, utm cols | No public read; service-role writes |
| `order_items` | `order_id` fk, `sku`, `quantity`, `unit_price`, `line_total` | |
| `landing_pages` | `slug` uniq, `trust_bullets` text[], `active` | Public read where `active` |
| `contact_submissions` | `name`, `email`, `message` | No public read; service-role insert |
| `site_settings` | `key` pk, `value` jsonb | Public read |

## Integrity

- **FKs** with `on delete cascade` (children) / `set null` (soft links).
- **Unique**: slug, sku, route_slug, batch_number, order_number, idempotency_key.
- **Check**: price/stock ≥ 0, category & status enums, `best_before >= mfg_date`, quantity > 0.
- **Triggers**: `set_updated_at()` on every table with `updated_at`.
- **Indexes**: active/category/product_id/route_slug/batch_number/order lookups.

## RLS (0002)

- Public (anon) may **read** only active products/variants/images/batches/lab-params, published
  articles, active landing pages, and site settings.
- `customers`, `addresses`, `orders`, `order_items`, `contact_submissions` have **no anon policy** →
  reachable only via the service-role key (server route handlers), which bypasses RLS.
- `decrement_variant_stock(sku, qty)` is `security definer`, revoked from `anon`/`authenticated`,
  and only decrements when `stock >= qty` (safe, atomic) — called by the order finalizer.

## Storage

Product images, lab-report PDFs and article covers belong in a public Supabase Storage bucket.
`next.config.ts` allows `NEXT_PUBLIC_SUPABASE_URL` `/storage/v1/object/public/**` for next/image.
At launch, placeholder SVGs in `public/placeholders/` stand in for photography.

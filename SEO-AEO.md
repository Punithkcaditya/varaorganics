# SEO-AEO.md

The developer builds the **structure**; the Digital Marketing Manager owns the **content** (meta
copy, schema values, alt text) — all sourced from the DB / settings so nothing marketing-editable is
hardcoded (Dev Kit §06).

## Rendering (AEO foundation)

Every indexable page returns **fully-rendered HTML** on first load (no client shell). Strategy per
route is in [ARCHITECTURE.md](ARCHITECTURE.md) §1: home ISR 60s; shop/product/bundle/learn ISR 300s
with `generateStaticParams`; verify/lp/order dynamic.

## Metadata

`src/components/seo/metadata.ts` → `buildMetadata()` used by every route's `generateMetadata`:

- `<title>` templated `%s | Vara Organics`.
- **Canonical without trailing slash** (`canonical()` in `config/site.ts`).
- Open Graph + Twitter `summary_large_image`.
- `robots` index/noindex per page (lp, cart, checkout, order-confirmed, verify = noindex).
- Google Search Console verification via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Product/article meta falls back: DB `meta_title`/`meta_description` → title/excerpt.

## JSON-LD (`src/components/schema/`)

Safe serializer (`serializeJsonLd`) escapes `<`, `>`, `&`, U+2028/9 to prevent `</script>` breakout.

| Schema | Placed on |
|---|---|
| `Organization` + `WebSite` | Homepage only |
| `BreadcrumbList` | Every page except homepage |
| `Product` (+ INR offer, **no `aggregateRating`**) | Product pages |
| `FAQPage` | Product, article, learn hub, FAQs |
| `Article` | Learn articles |
| `HowTo` (conditional) | `how-to-*` articles with `enable_howto_schema` — steps derived from `#` headings |
| `CollectionPage` | Shop + learn hub |
| `Product` (+ batch props) | `/verify/[batchId]` |

**No fake ratings** — `aggregateRating` is omitted entirely until genuine reviews exist. No
unsupported medical/certification claims in schema.

## Headings

Exactly one `<h1>` per page. In Learn markdown, `#` → H2, `##` → H3, `###` → H4 (the article title
is the only H1) via `Markdown` `headingOffset={1}`. Content is sanitized (`rehype-sanitize`), raw
HTML disabled; markdown images use a next/image wrapper; external links get
`target="_blank" rel="noopener noreferrer"`.

## Sitemap & robots

- `app/sitemap.ts` — static pages + product URLs + published article URLs. Excludes `/api`,
  `/order-confirmed`, `/cart`, `/checkout`, and noindex `/lp`.
- `app/robots.ts` — disallows `/api/`, `/admin/`, `/order-confirmed/`, `/cart`, `/checkout`, `/lp/`;
  points to `/sitemap.xml`.

## On-demand revalidation (Learn Brief §07, modernized)

`POST /api/revalidate` with the **`x-revalidate-secret` header** (not query string). Supports
`/learn`, `/learn/[slug]`, product and collection pages via `revalidatePath`. Wire a Supabase DB
webhook on `learn_content` (INSERT/UPDATE/DELETE) with that custom header.

## Images / performance (§17)

`next/image` everywhere with explicit sizes, AVIF/WebP, lazy by default, `priority` only on hero and
article cover. Placeholder SVGs allowed via `dangerouslyAllowSVG` (our own trusted assets) with a
strict image CSP. No large icon library — inline SVG set in `components/ui/Icons.tsx`.

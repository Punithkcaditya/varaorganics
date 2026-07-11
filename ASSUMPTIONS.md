# ASSUMPTIONS.md — Vara Organics

Recorded during Phase 1 analysis (2026-07-11). Each assumption is a decision made because a
document was silent, contradictory, or a required asset/credential was unavailable. Anything
marked **CONFIRM** must be validated by Varixa Global before go-live.

## A. Source documents actually available in the workspace

| Referenced by Developer Kit | Present? | Handling |
|---|---|---|
| `vara-organics-v2.html` | ✅ Yes | Primary visual source of truth. Every home section converted 1:1. |
| `lead.txt` | ✅ Yes | Two Bengaluru contact records used as seed config (**CONFIRM**). |
| `Vara_Organics_Developer_Kit.docx` (x2, identical) | ✅ Yes | Technical brief. |
| `Vara_Organics_Learn_Hub_Brief.docx` | ✅ Yes | `/learn` brief. |
| `Vara_Organics_Brand_Book.html` | ❌ **Missing** | Brand tokens reconstructed from the `:root` CSS variables in `vara-organics-v2.html` + the prompt's brand values. Logo is a **text wordmark** ("Vara." + "Organics") from the design; **no SVG logo file supplied** → rebuilt as an accessible inline SVG/HTML wordmark. **CONFIRM** if an official logo SVG exists. |
| `Vara_Organics_Shopify_Checklist.docx` | ❌ **Missing** | Page structure taken from Dev Kit §04–§10 instead (fully covers it). |
| `Vara_Organics_Label_Spec.docx` | ❌ **Missing** | Ingredient statements, manufacturer/FSSAI details, nutritional values are **placeholders** (**CONFIRM / REQUIRES FINAL CONTENT**). |

## B. Platform & stack

1. **Next.js version:** Dev Kit pins "Next.js 14". The build prompt requires "latest stable".
   → Building on **Next.js 15 (App Router) + React 19**. Behaviour identical; App Router APIs modernized (see REQUIREMENTS_TRACEABILITY.md §Modernization).
2. **Hosting:** Dev Kit assumes **Vercel** (+ `next-sitemap`, `pages/api/revalidate.js`). The build prompt requires **Hostinger** (Node runtime, not static export). → Targeting **Hostinger Node / VPS**; using native App Router `sitemap.ts`, `robots.ts`, and a Route Handler for revalidation. `next-sitemap` **not** used. **No static export** (SSR/API/ISR require a Node server).
3. **CMS:** Sanity listed as optional in Dev Kit. → **Not used**; Supabase is the single source of content.
4. **Email:** "Resend or Klaviyo". → **Resend**.
5. **Node runtime:** Node 20 LTS assumed for production (project developed on Node 24). Documented in DEPLOYMENT.md.

## C. Catalog / product modeling

6. **Launch catalog = the fixed URL list only** (5 SKUs + 1 bundle): A2 Gir Cow Bilona Ghee 500 ml & 1 L, Raw Wild Forest Honey 500 g, Wood-Pressed Sesame Oil 1 L, Wood-Pressed Groundnut Oil 1 L, Wellness Starter bundle.
7. The design HTML also shows **Extra Virgin Coconut Oil** and **Mustard Flower Honey**, plus sizes (ghee 250 ml, honey 250 g/1 kg) **not** in the fixed route list. → These are treated as **design placeholders**; seeded as `active = false` (not routable at launch) so nothing 404s and they can be switched on later. **CONFIRM** whether they launch.
8. **Ghee 500 ml vs 1 L route/variant conflict** (see ARCHITECTURE §Contradictions C3): resolved as **one `products` row (ghee) with two `product_variants`**, each variant owning its required indexable slug. A route→variant resolver maps the two fixed slugs. In-page size switch uses `?size=`; canonical resolves to the fixed slug of the selected variant.
9. **Prices for launch SKUs not fully given by the design:**
   - Ghee 500 ml ₹1,399 ✅ (design) · Ghee 1 L → **placeholder ₹2,699** (**CONFIRM**)
   - Honey **500 g** → design only prices 250 g (₹399) → **placeholder ₹749** (**CONFIRM**)
   - Sesame **1 L** → design only prices 500 ml (₹599) → **placeholder ₹1,149** (**CONFIRM**)
   - Groundnut 1 L ₹849 ✅ (design)
   - Wellness Starter bundle ₹1,799 (was ₹1,948) ✅ (design) — note design bundle contains honey **250 g**, which is not a launch SKU; bundle seeded referencing launch SKUs with a **CONFIRM** note.
10. Batch numbers, MFG/best-before dates, and the four lab parameters shown (e.g. Batch `GHE-2024-047`, butyric acid 3.82 %) are **sample/illustrative data from the design**, seeded as clearly-marked sample batches. Real batches + real lab PDF URLs are **REQUIRES FINAL CONTENT**. No lab PDF URL supplied → placeholder path.

## D. Claims & compliance (must not be fabricated)

11. **No ratings/reviews at launch.** Product JSON-LD **omits `aggregateRating` entirely** (an empty `aggregateRating` is invalid and can be penalized) — overrides the Dev Kit note "aggregateRating (empty at launch)".
12. **No invented certifications.** "NABL tested", "70+ parameters", "A2 Gir cow" appear in supplied copy and are rendered as **brand-authored marketing content owned by the DM manager**, not as schema `certification` claims. FSSAI number is "apply pending" in the design → kept as an **empty env-configurable field**, never fabricated.
13. Farm/supplier narrative ("Gau Organics, Kota/Jaipur, Rajasthan") is treated as editable brand-story content, seeded from the design copy.

## E. Contact / business data

14. `lead.txt` two Bengaluru addresses + phones seeded into a typed `contact-locations` config, `needs_confirmation: true`. Google Maps links are generated from the address string (no explicit URLs supplied). **CONFIRM** which is the customer-facing address and which (if any) is the Shiprocket pickup.
15. `ORDER_NOTIFICATION_EMAIL` / `EMAIL_FROM` default to placeholders on `varaorganics.com`; a verified Resend sending domain is **REQUIRES CREDENTIALS**.

## F. Credentials (all absent → env placeholders, runtime-validated)

Supabase URL/keys, Razorpay key id/secret/webhook secret, Shiprocket email/password/pickup, Resend API key, GA4 / Meta Pixel / Search-Console IDs, `REVALIDATE_SECRET`. All in `.env.example`; production boot fails with a clear message if required ones are missing. **The app runs in a mock/degraded mode locally without them** (mock Supabase data fallback, payment/shipping calls stubbed) so the build and tests pass offline.

## G. Analytics / consent

16. India has no blanket cookie-consent mandate, but a **consent-gate abstraction** is built so analytics/Pixel can be deferred (needed for UAE Phase 2 / EU traffic). Default at launch: **CONFIRM** whether to load GA4/Pixel immediately or behind consent. Implemented default = load after a lightweight consent acknowledgement, configurable.

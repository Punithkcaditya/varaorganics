# TESTING.md

Two layers, both runnable **offline** in mock mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`).

## Unit (Vitest) — `tests/unit/`

```bash
npm run test
```

| File | Covers |
|---|---|
| `cart.test.ts` | Cart count, subtotal, shipping threshold, order totals |
| `utils.test.ts` | Price/unit/discount/read-time formatting; canonical no-trailing-slash |
| `checkout-validation.test.ts` | Indian phone + PIN regex; full checkout Zod schema |
| `jsonld.test.ts` | `serializeJsonLd` escaping; Product/FAQ/Breadcrumb/Org builders; **no `aggregateRating`** |
| `razorpay-signature.test.ts` | HMAC signature verify accepts valid / rejects tampered |
| `markdown-headings.test.ts` | `#`-heading extraction for HowTo steps |
| `variant-price.test.ts` | Ghee two-slug pricing (C3); extras inactive (C8); no slug on inactive variants |

`server-only` is aliased to an empty stub in `vitest.config.ts`; the Razorpay test runs in the
`node` environment.

## E2E (Playwright) — `tests/e2e/storefront.spec.ts`

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The config boots `npm run dev` with `NEXT_PUBLIC_USE_MOCK_DATA=true`; external services are stubbed.

| # | Scenario |
|---|---|
| 1 | Homepage loads (hero + products) |
| 2 | Mobile menu opens and navigates |
| 3 | Product variant change updates price (₹1,399 → ₹2,699) |
| 4 | Add to cart updates the cart count |
| 5 | Cart persists after refresh |
| 6 | Checkout validation blocks an empty submit |
| 7 | Learn hub shows category sections |
| 8 | Learn article renders semantic headings (single H1, `#`→H2) |
| 9 | Verify page handles valid + invalid batches |
| 10 | Landing page is noindex and has no site nav |
| 11 | Custom 404 works |

## Mocking

No network in tests. Supabase reads fall back to `src/data/*`; Razorpay/Shiprocket/Resend return
simulated results; orders use the in-memory store. This keeps CI hermetic.

## Suggested CI order

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e   # optional in CI (needs a browser)
```

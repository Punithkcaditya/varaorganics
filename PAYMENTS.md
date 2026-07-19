# PAYMENTS.md

Razorpay (online) + Cash on Delivery, behind one payment-provider abstraction
(`src/features/payments/service.ts`) so both share a single order pipeline. Totals are **always**
recomputed server-side from the database — client-provided prices are never trusted.

## Money handling

- Prices are integer INR (rupees) in the DB and app. Razorpay amounts are converted to **paise**
  (`× 100`) only at the gateway boundary.
- Order totals = server recomputation of `Σ variant.price × qty` + shipping (free ≥ ₹999, else ₹79)
  + tax (0 at launch — GST-inclusive assumed, **CONFIRM**).

## Endpoints (all `runtime = "nodejs"`, `dynamic`)

| Route | Purpose |
|---|---|
| `POST /api/razorpay/order` | Validate (Zod) → recompute totals → create **pending** order → create Razorpay order → return `{ razorpayOrderId, amount, publicKey }`. Idempotent via `Idempotency-Key` header. |
| `POST /api/orders/cod` | Same pipeline, method forced to `cod` server-side; finalizes immediately. |
| `POST /api/razorpay/verify` | Verify the checkout callback **signature** (HMAC-SHA256) → finalize order. Fast user confirmation. |
| `POST /api/razorpay/webhook` | **Source of truth.** Verify webhook signature over the raw body → finalize idempotently. |

## Online flow

```
Checkout form (RHF+Zod)
  → POST /api/razorpay/order
      server: Zod validate → getVariantById (DB prices) → validate stock
              → recompute total → insert pending order (idempotency_key)
              → Razorpay order → return {rzpOrderId, amount, publicKey}
  → client opens Razorpay checkout.js (public key only)
  → on success → POST /api/razorpay/verify (verify HMAC) → finalize → redirect
Razorpay → POST /api/razorpay/webhook  ← authoritative, idempotent
  → verify webhook secret → mark paid (once) → decrement stock (atomic RPC)
    → create Shiprocket shipment → save awb/tracking → send Resend email
Redirect → /order-confirmed/[orderId]  (reads DB — never the client callback)
```

COD skips Razorpay: the order is placed immediately (`payment_status = cod_pending`) and the same
finalize step runs (shipment + email).

## Security (§08, §23)

- `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` never leave the server; the browser only gets
  `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Signature checks use `crypto.timingSafeEqual`.
- `finalizePaidOrder` is **idempotent** — re-invocation (verify + webhook, or webhook retries) is a
  no-op once paid/fulfilled.
- Purchase analytics fires **only** on `/order-confirmed` from server order data, never from a raw
  client callback (§18).
- Rate limiting on order creation; no raw DB errors returned to clients.

## Mock mode

With `NEXT_PUBLIC_USE_MOCK_DATA=true`, `createRazorpayOrder` returns `order_mock_*`, the client skips
checkout.js and calls verify directly (accepted in mock), so the full flow completes offline. Orders
persist in an in-memory store (not across restarts).

## Test checklist (₹1 live test before go-live)

1. UPI/card/netbanking/wallet each open Razorpay and complete.
2. Webhook marks the order paid even if the browser closes after payment.
3. COD places an order and emails confirmation.
4. Stock decrements exactly once per order.

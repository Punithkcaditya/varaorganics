# SHIPROCKET.md

Server-only Shiprocket integration (`src/lib/shiprocket/server.ts`). Never called from the browser.

## Capabilities

- **Auth** with an in-memory token cache (~9-day TTL; Shiprocket tokens last ~10 days).
- **Create shipment** (`/orders/create/adhoc`) from a paid order.
- Returns a typed `ShipmentResult` (`shipmentId`, `awb`, `courier`, `trackingUrl`) — **never throws**.
- Structured logging with sensitive fields **redacted** (`src/lib/security/redact.ts`).

## Flow

Called by `finalizePaidOrder` after payment is confirmed:

1. Authenticate (cached token).
2. Create shipment with the order's address + items + `SHIPROCKET_PICKUP_LOCATION`.
3. On success → save `shiprocket_shipment_id`, `awb_number`, `courier_name`, `tracking_url`;
   set `fulfillment_status = processing`.
4. On failure (API down / not configured) → set `fulfillment_status = failed` so it can be retried.

## Manual retry

`POST /api/shiprocket/retry` with `{ orderId }` and the `x-revalidate-secret` header re-attempts
shipment creation for a failed order (§09).

## Configuration

| Env | Notes |
|---|---|
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` | Dashboard credentials. |
| `SHIPROCKET_PICKUP_LOCATION` | Pickup nickname configured in Shiprocket. **Never hardcode an unconfirmed pickup address** — confirm the Bengaluru pickup before go-live (Dev Kit §09). |

## Tracking webhook

Configure Shiprocket's shipment webhook with this neutral public URL:

```text
https://www.varaorganic.com/api/shipping/status
```

Shiprocket rejects webhook URLs containing reserved provider terms, so do not
use the internal `/api/shiprocket/webhook` path in its dashboard. Select
`x-api-key` as the token type and enter the same secret stored in
`SHIPROCKET_WEBHOOK_SECRET`.

## Mock mode

Returns a simulated shipment (`SHIP-MOCK-*`, random AWB) so orders complete offline without
Shiprocket credentials.

## Notes

- Weight/dimensions are placeholders (1 kg, 15×15×15 cm) — set real values per product before launch.
- Customer notification (email) is sent by the order finalizer via Resend; WhatsApp is out of scope
  at launch.

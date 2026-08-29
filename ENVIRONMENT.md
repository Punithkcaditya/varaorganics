# ENVIRONMENT.md

All variables live in [.env.example](.env.example). Copy to `.env.local` (never commit it).
Validated at runtime by `src/lib/validation/env.ts` — public vars fail fast at import; server
secrets throw a clear error on first use in production if missing.

**Rule:** anything with `NEXT_PUBLIC_` is bundled into the browser. Never put a secret there.

## Public (safe in the browser)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | prod | Absolute origin, no trailing slash. Used for canonicals, sitemap, OG. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_USE_MOCK_DATA` | no | `"true"` serves seeded data + stubs services (offline). Set `"false"` in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | prod | Supabase project URL. Also derives the allowed next/image host. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod | Anon key; RLS-limited public reads only. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | prod | Public Razorpay key id (checkout.js). **Secret is separate.** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | GA4 id. Blank = analytics off. |
| `NEXT_PUBLIC_META_PIXEL_ID` | no | Meta Pixel id. Blank = pixel off. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console verification token. |

## Server-only (never `NEXT_PUBLIC_`)

| Variable | Required for | Notes |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | orders, webhooks | Bypasses RLS. Server route handlers only. |
| `RAZORPAY_KEY_SECRET` | online payments | Order creation + signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | webhooks | Verifies webhook authenticity. |
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` | shipping | Shiprocket auth (token cached in memory). |
| `SHIPROCKET_PICKUP_LOCATION` | shipping | Pickup nickname from the Shiprocket dashboard. **CONFIRM before go-live.** |
| `RESEND_API_KEY` | email | Blank = emails logged, not sent. |
| `RESEND_SEGMENT_ID` | newsletter | ID of the Resend `Website Newsletter` segment. |
| `RESEND_AUDIENCE_ID` | newsletter | Legacy fallback; may contain the Segment ID until production is migrated to `RESEND_SEGMENT_ID`. |
| `ORDER_NOTIFICATION_EMAIL` | email | Internal inbox for order/contact notifications. |
| `EMAIL_FROM` | email | Verified Resend sending identity. |
| `EMAIL_REPLY_TO` | email | Address that receives replies to transactional messages. |
| `REVALIDATE_SECRET` | ISR webhook | Sent as `x-revalidate-secret` header (not query string). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |

## Behaviour by mode

- **Mock mode** (`NEXT_PUBLIC_USE_MOCK_DATA=true`): all reads use seeded data; Razorpay/Shiprocket/
  Resend are simulated; orders held in memory. No secrets needed. Used for local dev, CI, e2e.
- **Production** (`false`): real Supabase reads (RLS), real payments/shipping/email. Missing required
  secrets throw on first use with a descriptive message.

# Combo rollout

The application code and the database setup are deployed separately. Complete these steps in order:

1. Open the Supabase SQL Editor for the Vara Organics project.
2. Run [`supabase/migrations/0006_combos.sql`](supabase/migrations/0006_combos.sql).
3. Run [`supabase/combos_seed.sql`](supabase/combos_seed.sql).
4. Redeploy the application.
5. Sign in to `/admin/combos` and review all seven combos.
6. Turn on **Published on site** for each approved combo and save it.

The seed intentionally creates combo rows as drafts. Publishing from Admin also enables the matching checkout variant and refreshes the homepage and `/combos` page.

## Quick verification

- `/combos` lists only published combos.
- The language toggle starts in Kannada and supports Kannada, Hindi, Telugu, Tamil and English.
- Adding a combo shows every included product in the cart.
- Checkout validates stock for each physical product inside the combo.
- A successful payment reduces the component-product stock, then sends the detailed combo line to the order, customer email and Shiprocket.
- `/admin/combos` can edit names, contents, prices, badge, button text, order and visibility.


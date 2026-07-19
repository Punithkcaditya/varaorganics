-- Vara Organics — table privileges.
--
-- Postgres needs BOTH of these for a client to read a row:
--   1. a table-level GRANT (this file)
--   2. an RLS policy that matches the row (0002_rls.sql)
--
-- 0002 created the policies but not the grants, so the anon key got
-- "permission denied for table products". This file adds the missing grants.
--
-- Safe to re-run.

grant usage on schema public to anon, authenticated, service_role;

-- ── Public catalogue + content: read-only for anon/authenticated. ──
-- RLS still restricts WHICH rows they can see (active/published only).
grant select on table
  public.products,
  public.product_variants,
  public.product_images,
  public.product_batches,
  public.lab_parameters,
  public.learn_content,
  public.landing_pages,
  public.site_settings
to anon, authenticated;

-- ── Private tables: NO anon access. Reached only by the server via the
--    service-role key (which also bypasses RLS). ──
grant select, insert, update, delete on table
  public.orders,
  public.order_items,
  public.customers,
  public.addresses,
  public.contact_submissions,
  public.inventory,
  public.shipment_events
to service_role;

-- Service role also needs full access to the catalogue for admin writes.
grant select, insert, update, delete on table
  public.products,
  public.product_variants,
  public.product_images,
  public.product_batches,
  public.lab_parameters,
  public.learn_content,
  public.landing_pages,
  public.site_settings
to service_role;

-- Views used by the admin dashboard.
grant select on table public.inventory_status to service_role;

-- Helper functions called by the server.
grant execute on function public.decrement_variant_stock(text, integer) to service_role;
grant execute on function public.variants_needing_reorder() to service_role;

-- Future tables created in this schema inherit sensible defaults.
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;

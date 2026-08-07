-- ============================================================================
-- Vara Organics — live data fixes for the brand-owner's 26-item list.
-- Paste this into the Supabase SQL editor (Project → SQL → New query) and run.
-- Safe to run more than once (idempotent).
--
-- Run migration 0005_lab_params_dedupe.sql FIRST (it removes duplicate lab rows
-- and adds the unique constraint that fixes the homepage lab card, Fix #1).
-- ============================================================================

-- Fix #9 — A2 Gir Cow Bilona Ghee 1L: ₹2,699 → ₹2,599
update public.product_variants set price = 2599 where sku = 'VARA-GHEE-1000';

-- Fix #8 — Wood Pressed Sesame Oil 1L: ₹1,149 → ₹899
update public.product_variants set price = 899 where sku = 'VARA-SESAME-1000';

-- Fix #24 — Raw Wild Forest Honey 250g @ ₹399: make it sellable on the grid
update public.product_variants
   set active = true,
       price = 399,
       route_slug = coalesce(route_slug, 'raw-wild-forest-honey-250g')
 where sku = 'VARA-HONEY-250';

-- Fix #2 — remove the wrong stock photos. With no image rows the app now falls
-- back to the on-brand coloured placeholder automatically. Add real photos later
-- (Admin → Products, or insert into product_images) once photography is ready.
delete from public.product_images;

-- ----------------------------------------------------------------------------
-- Sanity check — review after running:
--   select sku, price, active, route_slug from public.product_variants order by sku;
--   select batch_number, count(*) from public.lab_parameters lp
--     join public.product_batches b on b.id = lp.batch_id
--     group by batch_number;   -- each batch should have 4 distinct rows
-- ----------------------------------------------------------------------------

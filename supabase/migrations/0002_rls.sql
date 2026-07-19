-- Row-Level Security (Dev Kit §11).
-- Public (anon) may READ only active products/variants/images/batches/lab
-- params, published articles, active landing pages, and site settings.
-- Everything writable (orders, customers, addresses, contact) is denied to anon
-- and reached only via the service-role key from server route handlers, which
-- bypasses RLS. No public read of orders/customers.

alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.product_images      enable row level security;
alter table public.product_batches     enable row level security;
alter table public.lab_parameters      enable row level security;
alter table public.learn_content       enable row level security;
alter table public.landing_pages       enable row level security;
alter table public.site_settings       enable row level security;
alter table public.customers           enable row level security;
alter table public.addresses           enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.contact_submissions enable row level security;

-- Public read: active products and their children
create policy "public read active products" on public.products
  for select using (active = true);

create policy "public read active variants" on public.product_variants
  for select using (
    active = true and exists (
      select 1 from public.products p where p.id = product_id and p.active = true
    )
  );

create policy "public read images of active products" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.active = true)
  );

create policy "public read active batches" on public.product_batches
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.active = true)
  );

create policy "public read lab params" on public.lab_parameters
  for select using (
    exists (select 1 from public.product_batches b where b.id = batch_id)
  );

-- Public read: published articles only
create policy "public read published articles" on public.learn_content
  for select using (published = true);

-- Public read: active landing pages
create policy "public read active landing pages" on public.landing_pages
  for select using (active = true);

-- Public read: site settings
create policy "public read site settings" on public.site_settings
  for select using (true);

-- No policies for customers/addresses/orders/order_items/contact_submissions →
-- anon has NO access. The service-role key (server-only) bypasses RLS for writes.

-- ── Atomic, safe stock decrement (used by the order finalizer) ──
create or replace function public.decrement_variant_stock(p_sku text, p_qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_variants
    set stock = stock - p_qty
  where sku = p_sku and stock >= p_qty;
  if not found then
    raise exception 'insufficient_stock_or_unknown_sku:%', p_sku;
  end if;
end;
$$;

revoke all on function public.decrement_variant_stock(text, integer) from anon, authenticated;

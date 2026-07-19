-- Vara Organics — operations layer (Tech Stack doc + solo-ops requirements).
-- Adds: inventory with reorder points, batch traceability per order, richer
-- landing pages (lp_pages), and shipment status history.

-- ── inventory: reorder points + low-stock alerting ──
-- Stock itself stays authoritative on product_variants (single source of truth
-- for pricing/availability); this table adds the ops metadata around it.
create table public.inventory (
  id            uuid primary key default gen_random_uuid(),
  variant_id    uuid not null unique references public.product_variants(id) on delete cascade,
  reorder_point integer not null default 10 check (reorder_point >= 0),
  last_alert_at timestamptz,
  updated_at    timestamptz not null default now()
);
create index inventory_variant_idx on public.inventory (variant_id);
create trigger inventory_set_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

-- Convenience view: current stock next to its reorder point.
create or replace view public.inventory_status as
select
  v.id          as variant_id,
  p.product_name,
  v.sku,
  v.size,
  v.stock,
  coalesce(i.reorder_point, 10) as reorder_point,
  (v.stock <= coalesce(i.reorder_point, 10)) as needs_reorder,
  i.last_alert_at
from public.product_variants v
join public.products p on p.id = v.product_id
left join public.inventory i on i.variant_id = v.id
where v.active = true;

-- ── batch traceability per order (which batch went to which customer) ──
alter table public.orders add column if not exists batch_number text;
create index if not exists orders_batch_number_idx on public.orders (batch_number);

-- ── shipment status history (Shiprocket webhook milestones) ──
create table public.shipment_events (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  awb_number   text,
  status       text not null,
  status_detail text,
  occurred_at  timestamptz not null default now(),
  raw          jsonb
);
create index shipment_events_order_idx on public.shipment_events (order_id);

-- ── landing pages: section-toggle model (Landing Page Copy doc §03) ──
-- Extends the existing landing_pages table rather than creating a second one.
-- NOTE: `subheadline`, `headline`, `cta_label`, `trust_bullets`, `product_slug`,
-- `variant_size`, `campaign_id` and `active` already exist from 0001_init.sql.
alter table public.landing_pages add column if not exists headline_em text;
alter table public.landing_pages add column if not exists eyebrow_text text;
alter table public.landing_pages add column if not exists opening_copy text;
alter table public.landing_pages add column if not exists announcement text;
alter table public.landing_pages add column if not exists hero_type text default 'lab_card';
alter table public.landing_pages add column if not exists cta_button_color text default 'navy';
alter table public.landing_pages add column if not exists secondary_cta_label text;
alter table public.landing_pages add column if not exists variant_note text;
alter table public.landing_pages add column if not exists show_lab_card boolean default true;
alter table public.landing_pages add column if not exists show_comparison boolean default false;
alter table public.landing_pages add column if not exists show_pain_points boolean default false;
alter table public.landing_pages add column if not exists show_story boolean default false;
alter table public.landing_pages add column if not exists show_process boolean default false;
alter table public.landing_pages add column if not exists show_honest boolean default false;
alter table public.landing_pages add column if not exists comparison_rows jsonb;
alter table public.landing_pages add column if not exists pain_points jsonb;
alter table public.landing_pages add column if not exists process_steps jsonb;
alter table public.landing_pages add column if not exists story_heading text;
alter table public.landing_pages add column if not exists story_copy text;
alter table public.landing_pages add column if not exists story_attribution text;
alter table public.landing_pages add column if not exists honest_copy text;
alter table public.landing_pages add column if not exists faqs jsonb;
alter table public.landing_pages add column if not exists meta_title text;
alter table public.landing_pages add column if not exists noindex boolean default true;

-- ── RLS for the new tables ──
alter table public.inventory       enable row level security;
alter table public.shipment_events enable row level security;
-- No anon policies: inventory and shipment events are staff-only, reached via
-- the service-role key from server route handlers.

-- ── Low-stock helper: variants at or below their reorder point ──
create or replace function public.variants_needing_reorder()
returns table (variant_id uuid, product_name text, sku text, size text, stock integer, reorder_point integer)
language sql
security definer
set search_path = public
as $$
  select s.variant_id, s.product_name, s.sku, s.size, s.stock, s.reorder_point
  from public.inventory_status s
  where s.needs_reorder
$$;

revoke all on function public.variants_needing_reorder() from anon, authenticated;

-- Seed a default reorder point for every existing active variant.
insert into public.inventory (variant_id, reorder_point)
select id, 10 from public.product_variants where active = true
on conflict (variant_id) do nothing;

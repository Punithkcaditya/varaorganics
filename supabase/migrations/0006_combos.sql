-- Vara Organics — combos table (multilingual product combos).
--
-- Each combo is purchased as ONE discounted line: `checkout_sku` points at a
-- backing is_bundle product_variant priced at combo_price, so the existing
-- server-verified checkout charges the right amount. See combos_seed.sql.
--
-- Safe to re-run.

create table if not exists public.combos (
  id              uuid default gen_random_uuid() primary key,
  slug            text unique not null,
  name_english    text not null,
  name_kannada    text,
  name_hindi      text,
  name_telugu     text,
  name_tamil      text,
  name_malayalam  text,
  tagline         text,
  contents        jsonb not null default '[]'::jsonb,
  mrp_individual  integer not null,
  combo_price     integer not null,
  saving          integer generated always as (mrp_individual - combo_price) stored,
  badge_text      text,
  badge_color     text default 'amber',
  cta_text        text default 'ADD TO CART',
  is_gift_wrapped boolean default false,
  is_export       boolean default false,
  -- SKU of the backing bundle product_variant used for checkout.
  checkout_sku    text,
  sort_order      integer default 0,
  published       boolean default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.combos add column if not exists updated_at timestamptz not null default now();

drop trigger if exists combos_set_updated_at on public.combos;
create trigger combos_set_updated_at before update on public.combos
  for each row execute function public.set_updated_at();

create index if not exists combos_published_idx on public.combos (published, sort_order);

-- RLS: anyone may read PUBLISHED combos; writes are service-role only.
alter table public.combos enable row level security;

drop policy if exists "public read published combos" on public.combos;
create policy "public read published combos" on public.combos
  for select using (published = true);

-- Grants (RLS still restricts which rows anon sees).
grant select on table public.combos to anon, authenticated;
grant select, insert, update, delete on table public.combos to service_role;

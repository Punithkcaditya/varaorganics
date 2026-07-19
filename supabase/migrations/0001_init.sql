-- Vara Organics — schema (Dev Kit §11, Learn Brief §03).
-- Normalized model (overrides the docs' denormalized JSON columns). Integer INR
-- prices. All timestamps timestamptz. See DATABASE.md.

create extension if not exists "pgcrypto";

-- ── updated_at trigger helper ──
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── products ──
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  product_name      text not null,
  slug              text not null unique,
  category          text not null check (category in ('ghee','honey','oils')),
  route_prefix      text not null check (route_prefix in ('ghee','honey','oils')),
  short_description text not null,
  long_description  text not null,
  ingredients       text,
  nutritional_info  jsonb,
  faqs              jsonb,
  learn_links       text[] default '{}',
  meta_title        text,
  meta_description  text,
  active            boolean not null default true,
  featured          boolean not null default false,
  is_bundle         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index products_active_idx on public.products (active);
create index products_category_idx on public.products (category);
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ── product_variants ──
create table public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  size             text not null,
  sku              text not null unique,
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  unit_label       text not null,
  unit_base        integer not null default 0 check (unit_base >= 0),
  unit_type        text not null default 'ml' check (unit_type in ('ml','g')),
  route_slug       text unique,
  active           boolean not null default true,
  position         integer not null default 0
);
create index product_variants_product_idx on public.product_variants (product_id);
create index product_variants_route_slug_idx on public.product_variants (route_slug);

-- ── product_images ──
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  position   integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id);

-- ── product_batches ──
create table public.product_batches (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  batch_number    text not null unique,
  mfg_date        date not null,
  best_before     date not null,
  lab_report_url  text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (best_before >= mfg_date)
);
create index product_batches_product_idx on public.product_batches (product_id);
create index product_batches_number_idx on public.product_batches (batch_number);
create trigger product_batches_set_updated_at before update on public.product_batches
  for each row execute function public.set_updated_at();

-- ── lab_parameters ──
create table public.lab_parameters (
  id        uuid primary key default gen_random_uuid(),
  batch_id  uuid not null references public.product_batches(id) on delete cascade,
  name      text not null,
  result    text not null,
  status    text not null check (status in ('Pass','Premium','Fail')),
  position  integer not null default 0
);
create index lab_parameters_batch_idx on public.lab_parameters (batch_id);

-- ── learn_content ──
create table public.learn_content (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  excerpt             text not null,
  category            text not null check (category in ('ghee','honey','oils')),
  cover_image         text,
  body_markdown       text not null,
  faqs                jsonb,
  meta_title          text,
  meta_description     text,
  read_time           integer,
  related_product     text,
  published           boolean not null default false,
  enable_howto_schema boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index learn_content_published_idx on public.learn_content (published);
create trigger learn_content_set_updated_at before update on public.learn_content
  for each row execute function public.set_updated_at();

-- ── customers ──
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  full_name  text not null,
  phone      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_email_idx on public.customers (email);
create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ── addresses ──
create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references public.customers(id) on delete set null,
  full_name     text not null,
  phone         text not null,
  address_line1 text not null,
  address_line2 text,
  landmark      text,
  city          text not null,
  state         text not null,
  postal_code   text not null,
  country       text not null default 'India'
);

-- ── orders ──
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  order_number           text not null unique,
  customer_id            uuid references public.customers(id) on delete set null,
  email                  text not null,
  shipping_address       jsonb not null,
  subtotal               integer not null check (subtotal >= 0),
  shipping_amount        integer not null default 0 check (shipping_amount >= 0),
  tax_amount             integer not null default 0 check (tax_amount >= 0),
  total_amount           integer not null check (total_amount >= 0),
  currency               text not null default 'INR',
  payment_method         text not null check (payment_method in ('upi','card','netbanking','wallet','cod')),
  payment_status         text not null default 'pending'
                           check (payment_status in ('pending','paid','failed','cod_pending','refunded')),
  fulfillment_status     text not null default 'unfulfilled'
                           check (fulfillment_status in ('unfulfilled','processing','shipped','delivered','failed','cancelled')),
  razorpay_order_id      text,
  razorpay_payment_id    text,
  shiprocket_shipment_id text,
  awb_number             text,
  courier_name           text,
  tracking_url           text,
  idempotency_key        text not null unique,
  notes                  text,
  utm_source             text,
  utm_medium             text,
  utm_campaign           text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index orders_number_idx on public.orders (order_number);
create index orders_razorpay_order_idx on public.orders (razorpay_order_id);
create index orders_email_idx on public.orders (email);
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ── order_items ──
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  variant_id   uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  size         text not null,
  sku          text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null check (unit_price >= 0),
  line_total   integer not null check (line_total >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- ── landing_pages ──
create table public.landing_pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  headline      text not null,
  subheadline   text not null,
  hero_image    text,
  trust_bullets text[] not null default '{}',
  product_slug  text not null,
  variant_size  text not null,
  cta_label     text not null,
  campaign_id   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger landing_pages_set_updated_at before update on public.landing_pages
  for each row execute function public.set_updated_at();

-- ── contact_submissions ──
create table public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ── site_settings (key/value) ──
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

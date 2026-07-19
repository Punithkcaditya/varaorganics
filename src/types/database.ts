/**
 * Hand-maintained Supabase schema types. Kept in sync with
 * supabase/migrations/*. If you regenerate with `supabase gen types`, replace
 * this file — the shapes below mirror the DDL exactly. See DATABASE.md.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export interface ProductsRow extends Timestamps {
  id: string;
  product_name: string;
  slug: string;
  category: "ghee" | "honey" | "oils";
  route_prefix: "ghee" | "honey" | "oils";
  short_description: string;
  long_description: string;
  ingredients: string | null;
  nutritional_info: Json | null;
  faqs: Json | null;
  learn_links: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  active: boolean;
  featured: boolean;
  is_bundle: boolean;
}

export interface ProductVariantsRow {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  unit_label: string;
  unit_base: number;
  unit_type: "ml" | "g";
  route_slug: string | null;
  active: boolean;
  position: number;
}

export interface ProductImagesRow {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductBatchesRow extends Timestamps {
  id: string;
  product_id: string;
  batch_number: string;
  mfg_date: string;
  best_before: string;
  lab_report_url: string | null;
  active: boolean;
}

export interface LabParametersRow {
  id: string;
  batch_id: string;
  name: string;
  result: string;
  status: "Pass" | "Premium" | "Fail";
  position: number;
}

export interface LearnContentRow extends Timestamps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "ghee" | "honey" | "oils";
  cover_image: string | null;
  body_markdown: string;
  faqs: Json | null;
  meta_title: string | null;
  meta_description: string | null;
  read_time: number | null;
  related_product: string | null;
  published: boolean;
  enable_howto_schema: boolean;
}

export interface CustomersRow extends Timestamps {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

export interface AddressesRow {
  id: string;
  customer_id: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrdersRow extends Timestamps {
  id: string;
  order_number: string;
  customer_id: string | null;
  email: string;
  shipping_address: Json;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shiprocket_shipment_id: string | null;
  awb_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  idempotency_key: string;
  notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface OrderItemsRow {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  size: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface LandingPagesRow extends Timestamps {
  id: string;
  slug: string;
  headline: string;
  subheadline: string;
  hero_image: string | null;
  trust_bullets: string[];
  product_slug: string;
  variant_size: string;
  cta_label: string;
  campaign_id: string | null;
  active: boolean;
}

export interface ContactSubmissionsRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export interface SiteSettingsRow {
  key: string;
  value: Json;
  updated_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      products: Table<ProductsRow>;
      product_variants: Table<ProductVariantsRow>;
      product_images: Table<ProductImagesRow>;
      product_batches: Table<ProductBatchesRow>;
      lab_parameters: Table<LabParametersRow>;
      learn_content: Table<LearnContentRow>;
      customers: Table<CustomersRow>;
      addresses: Table<AddressesRow>;
      orders: Table<OrdersRow>;
      order_items: Table<OrderItemsRow>;
      landing_pages: Table<LandingPagesRow>;
      contact_submissions: Table<ContactSubmissionsRow>;
      site_settings: Table<SiteSettingsRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

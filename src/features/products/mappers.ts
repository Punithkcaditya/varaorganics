import type {
  ProductsRow,
  ProductVariantsRow,
  ProductImagesRow,
  ProductBatchesRow,
  LabParametersRow,
} from "@/types/database";
import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductBatch,
  FaqItem,
  NutritionInfo,
  Category,
} from "@/types";

/** Shape returned by the nested Supabase select. */
export interface ProductRowWithRelations extends ProductsRow {
  product_variants: ProductVariantsRow[] | null;
  product_images: ProductImagesRow[] | null;
  product_batches: (ProductBatchesRow & { lab_parameters: LabParametersRow[] | null })[] | null;
}

function mapVariant(v: ProductVariantsRow): ProductVariant {
  return {
    id: v.id,
    productId: v.product_id,
    size: v.size,
    sku: v.sku,
    price: v.price,
    compareAtPrice: v.compare_at_price,
    stock: v.stock,
    unitLabel: v.unit_label,
    unitBase: v.unit_base,
    unitType: v.unit_type,
    active: v.active,
    routeSlug: v.route_slug,
  };
}

function mapImage(i: ProductImagesRow): ProductImage {
  return { id: i.id, url: i.url, alt: i.alt, position: i.position };
}

function mapBatch(
  b: ProductBatchesRow & { lab_parameters: LabParametersRow[] | null },
): ProductBatch {
  return {
    id: b.id,
    productId: b.product_id,
    batchNumber: b.batch_number,
    mfgDate: b.mfg_date,
    bestBefore: b.best_before,
    labReportUrl: b.lab_report_url,
    active: b.active,
    labParameters: (b.lab_parameters ?? [])
      .slice()
      .sort((a, c) => a.position - c.position)
      .map((p) => ({
        id: p.id,
        name: p.name,
        result: p.result,
        status: p.status,
        position: p.position,
      })),
  };
}

export function mapProduct(row: ProductRowWithRelations): Product {
  const variants = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(mapVariant);
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(mapImage);
  const activeBatch = (row.product_batches ?? []).find((b) => b.active) ?? null;

  return {
    id: row.id,
    productName: row.product_name,
    slug: row.slug,
    category: row.category as Category,
    routePrefix: row.route_prefix as Category,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    ingredients: row.ingredients,
    nutritionalInfo: (row.nutritional_info as NutritionInfo | null) ?? null,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    faqs: (row.faqs as FaqItem[] | null) ?? [],
    learnLinks: row.learn_links ?? [],
    active: row.active,
    featured: row.featured,
    isBundle: row.is_bundle,
    variants,
    images,
    currentBatch: activeBatch ? mapBatch(activeBatch) : null,
  };
}

export const PRODUCT_SELECT =
  "*, product_variants(*), product_images(*), product_batches(*, lab_parameters(*))";

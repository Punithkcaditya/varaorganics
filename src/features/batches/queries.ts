import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { allProducts } from "@/data/catalog";
import { mapProduct, PRODUCT_SELECT, type ProductRowWithRelations } from "@/features/products/mappers";
import type { ProductBatch, Product } from "@/types";

export type BatchLookup =
  | { state: "valid"; batch: ProductBatch; product: Product }
  | { state: "inactive"; batch: ProductBatch; product: Product }
  | { state: "unknown" }
  | { state: "error" };

/**
 * Fix #6: the QR codes printed on product labels point at friendly, product-
 * level URLs (/verify/ghee, /verify/honey, /verify/sesame-oil,
 * /verify/groundnut-oil) rather than a raw batch number. Map those keywords to
 * the product slug so the same /verify/[batchId] page resolves them to that
 * product's current active batch.
 */
const PRODUCT_KEYWORD_TO_SLUG: Record<string, string> = {
  ghee: "a2-gir-cow-bilona-ghee",
  honey: "raw-wild-forest-honey",
  "sesame-oil": "wood-pressed-sesame-oil",
  "groundnut-oil": "wood-pressed-groundnut-oil",
};

/**
 * Look up a batch by its batch number for /verify/[batchId]. Distinguishes
 * valid / inactive / unknown / error so the page can render the right state
 * (Dev Kit §13). Never throws to the page.
 */
export const lookupBatch = cache(async (batchNumber: string): Promise<BatchLookup> => {
  const normalized = batchNumber.trim();

  const keywordSlug = PRODUCT_KEYWORD_TO_SLUG[normalized.toLowerCase()];
  if (keywordSlug) return lookupByProductSlug(keywordSlug);

  if (USE_MOCK_DATA) return mockLookup(normalized);

  const sb = getServerSupabase();
  if (!sb) return mockLookup(normalized);

  try {
    // Find the batch, then load its product with the active batch context.
    const { data: batchRowRaw, error } = await sb
      .from("product_batches")
      .select("product_id, active")
      .eq("batch_number", normalized)
      .maybeSingle();
    if (error) throw error;
    const batchRow = batchRowRaw as { product_id: string; active: boolean } | null;
    if (!batchRow) return { state: "unknown" };

    const { data: productRow, error: pErr } = await sb
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", batchRow.product_id)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!productRow) return { state: "unknown" };

    const product = mapProduct(productRow as unknown as ProductRowWithRelations);
    // Re-fetch the specific batch with its params (active batch may differ).
    const { data: full, error: fErr } = await sb
      .from("product_batches")
      .select("*, lab_parameters(*)")
      .eq("batch_number", normalized)
      .maybeSingle();
    if (fErr) throw fErr;
    if (!full) return { state: "unknown" };

    const batch = mapProduct({
      ...(productRow as unknown as ProductRowWithRelations),
      product_batches: [full as never],
    }).currentBatch;

    if (!batch) return { state: "unknown" };
    return batchRow.active
      ? { state: "valid", batch, product }
      : { state: "inactive", batch, product };
  } catch (err) {
    safeError("batches", "lookupBatch failed", { err: String(err) });
    return { state: "error" };
  }
});

/** Resolve a product (by slug) to its current active batch for /verify/<keyword>. */
async function lookupByProductSlug(slug: string): Promise<BatchLookup> {
  const sb = USE_MOCK_DATA ? null : getServerSupabase();
  if (!sb) {
    const product = allProducts.find((p) => p.slug === slug);
    if (!product?.currentBatch) return { state: "unknown" };
    return product.currentBatch.active
      ? { state: "valid", batch: product.currentBatch, product }
      : { state: "inactive", batch: product.currentBatch, product };
  }
  try {
    const { data: productRow, error } = await sb
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!productRow) return { state: "unknown" };
    const product = mapProduct(productRow as unknown as ProductRowWithRelations);
    if (!product.currentBatch) return { state: "unknown" };
    return product.currentBatch.active
      ? { state: "valid", batch: product.currentBatch, product }
      : { state: "inactive", batch: product.currentBatch, product };
  } catch (err) {
    safeError("batches", "lookupByProductSlug failed", { err: String(err) });
    return { state: "error" };
  }
}

function mockLookup(batchNumber: string): BatchLookup {
  for (const product of allProducts) {
    if (product.currentBatch && product.currentBatch.batchNumber === batchNumber) {
      return product.currentBatch.active
        ? { state: "valid", batch: product.currentBatch, product }
        : { state: "inactive", batch: product.currentBatch, product };
    }
  }
  return { state: "unknown" };
}

/** All active batches across active products — for /lab-reports. */
export const getAllActiveBatches = cache(
  async (): Promise<{ product: Product; batch: ProductBatch }[]> => {
    const { getAllProducts } = await import("@/features/products/queries");
    const products = await getAllProducts();
    const out: { product: Product; batch: ProductBatch }[] = [];
    for (const product of products) {
      if (product.active && product.currentBatch?.active) {
        out.push({ product, batch: product.currentBatch });
      }
    }
    return out;
  },
);

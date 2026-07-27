import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { allProducts, bundleProduct, catalog } from "@/data/catalog";
import type { Category, Product, ProductVariant } from "@/types";
import { mapProduct, PRODUCT_SELECT, type ProductRowWithRelations } from "./mappers";

/**
 * Product data access. React `cache()` dedupes within a request.
 *
 * Fallback policy — deliberately strict:
 *  - Mock mode (or no Supabase configured): serve the seeded catalog.
 *  - Supabase configured but the query FAILS: return empty and log loudly.
 *
 * We must never silently substitute demo data for a live catalogue: the seeded
 * prices differ from real ones, and an order built on them would charge the
 * wrong amount. An empty catalogue surfaces the outage; fake prices hide it.
 */

async function fetchProducts(activeOnly: boolean): Promise<Product[]> {
  if (USE_MOCK_DATA) return allProducts.filter((p) => p.active);
  const sb = getServerSupabase();
  if (!sb) return activeOnly ? allProducts.filter((p) => p.active) : allProducts;
  try {
    let query = sb.from("products").select(PRODUCT_SELECT);
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  } catch (err) {
    safeError(
      "products",
      "DATABASE READ FAILED — serving an empty catalogue rather than mock prices",
      { err: String(err) },
    );
    return [];
  }
}

export const getAllProducts = cache(() => fetchProducts(false));

export const getStoreProducts = cache(async (): Promise<Product[]> => {
  const products = await fetchProducts(true);
  return products.filter((p) => !p.isBundle);
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const products = await fetchProducts(true);
  return products.filter((p) => p.featured && !p.isBundle);
});

export const getProductsByCategory = cache(async (category: Category): Promise<Product[]> => {
  const products = await getStoreProducts();
  return products.filter((p) => p.category === category);
});

export const getBundle = cache(async (slug: string): Promise<Product | null> => {
  if (USE_MOCK_DATA) return bundleProduct.slug === slug ? bundleProduct : null;
  const products = await getAllProducts();
  return products.find((p) => p.isBundle && p.slug === slug) ?? null;
});

/**
 * Resolve a fixed product URL (routePrefix + variant slug) to its product and
 * the pre-selected variant. Handles the ghee 500ml/1L two-slug case (C3).
 */
export const resolveProductRoute = cache(
  async (
    routePrefix: Category,
    slug: string,
  ): Promise<{ product: Product; variant: ProductVariant } | null> => {
    const products = await getStoreProducts();
    for (const product of products) {
      if (product.routePrefix !== routePrefix) continue;
      const variant = product.variants.find((v) => v.active && v.routeSlug === slug);
      if (variant) return { product, variant };
    }
    return null;
  },
);

/** All fixed variant slugs for a route prefix — feeds generateStaticParams. */
export const getRouteSlugsForPrefix = cache(async (routePrefix: Category): Promise<string[]> => {
  const products = await getStoreProducts();
  const slugs: string[] = [];
  for (const product of products) {
    if (product.routePrefix !== routePrefix) continue;
    for (const v of product.variants) {
      if (v.active && v.routeSlug) slugs.push(v.routeSlug);
    }
  }
  return slugs;
});

/** Related products in the same category (excludes the given product). */
export const getRelatedProducts = cache(
  async (product: Product, limit = 3): Promise<Product[]> => {
    const products = await getStoreProducts();
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
  },
);

/** Resolve a product + route path from any variant routeSlug (any category). */
export const findByRouteSlug = cache(
  async (
    routeSlug: string,
  ): Promise<{ product: Product; path: string } | null> => {
    const products = await getStoreProducts();
    for (const product of products) {
      const variant = product.variants.find((v) => v.active && v.routeSlug === routeSlug);
      if (variant) return { product, path: `/${product.routePrefix}/${routeSlug}` };
    }
    return null;
  },
);

/** Look up a single variant by id — used for price revalidation at checkout. */
export async function getVariantById(
  variantId: string,
): Promise<{ product: Product; variant: ProductVariant } | null> {
  const products = await fetchProducts(true);
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

/** Mock catalog access (non-cached) for build-time param generation safety. */
export function mockActiveRouteSlugs(routePrefix: Category): string[] {
  return catalog
    .filter((p) => p.active && p.routePrefix === routePrefix)
    .flatMap((p) => p.variants.filter((v) => v.active && v.routeSlug).map((v) => v.routeSlug!));
}

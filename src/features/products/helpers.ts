import type { Product, ProductVariant } from "@/types";

/**
 * The variant a card/listing should show by default: the first active variant
 * that owns an indexable slug, else the first active one, else the first.
 * Shared by ProductCard and the shop toolbar so pricing/sorting agree.
 */
export function getDisplayVariant(product: Product): ProductVariant {
  const active = product.variants.filter((v) => v.active);
  return active.find((v) => v.routeSlug) ?? active[0] ?? product.variants[0]!;
}

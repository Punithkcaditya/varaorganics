"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/store";
import type { Product, ProductVariant } from "@/types";

/**
 * Fix #5: the hero featured card adds the product straight to the cart instead
 * of a "View" link that navigated the buyer off the homepage and broke the flow.
 */
export function HeroAddToCart({ product, variant }: { product: Product; variant: ProductVariant }) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function add() {
    addItem({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      routePrefix: product.routePrefix,
      productName: product.productName,
      size: variant.size,
      price: variant.price,
      unitLabel: variant.unitLabel,
      image: product.images[0]?.url ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={add}
      className="rounded-[2px] bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-gold-lt"
    >
      {added ? "✓ Added" : "Add to Cart"}
    </button>
  );
}

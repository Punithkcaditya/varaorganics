"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/store";
import type { Product, ProductVariant } from "@/types";

/**
 * Fix #5: the hero featured card adds the product straight to the cart instead
 * of a "View" link that navigated the buyer off the homepage and broke the flow.
 */
export function HeroAddToCart({ product, variant }: { product: Product; variant: ProductVariant }) {
  const addItem = useCart((s) => s.addItem);
  const [hasAdded, setHasAdded] = useState(false);

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
    setHasAdded(true);
  }

  return (
    <div className="min-w-[132px]" aria-live="polite">
      {hasAdded ? (
        <Link
          href="/cart"
          aria-label={`${product.productName} added. Proceed to cart`}
          className="border-gold-lt bg-ivory text-navy hover:bg-gold-lt focus-visible:outline-gold-lt flex min-h-11 w-full items-center justify-center rounded-[2px] border px-4 text-[10px] font-bold tracking-[0.11em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Proceed to Cart&nbsp;→
        </Link>
      ) : (
        <button
          type="button"
          onClick={add}
          className="bg-gold text-navy hover:bg-gold-lt focus-visible:outline-gold-lt min-h-11 w-full rounded-[2px] px-4 text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/store";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { Product } from "@/types";

/** Add-to-cart for the bundle SKU (routePrefix "bundles"). */
export function BundleAddToCart({ bundle }: { bundle: Product }) {
  const variant = bundle.variants[0]!;
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const save = discountPercent(variant.price, variant.compareAtPrice);

  function add() {
    addItem({
      variantId: variant.id,
      productId: bundle.id,
      slug: bundle.slug,
      routePrefix: "bundles",
      productName: bundle.productName,
      size: variant.size,
      price: variant.price,
      unitLabel: variant.unitLabel,
      image: bundle.images[0]?.url ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-serif text-3xl font-semibold text-navy">{formatPrice(variant.price)}</span>
        {variant.compareAtPrice && (
          <span className="text-lg font-light text-navy/40 line-through">
            {formatPrice(variant.compareAtPrice)}
          </span>
        )}
        {save && (
          <span className="rounded-[2px] bg-success/15 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-success">
            Save {save}%
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        className="w-full rounded-[2px] bg-navy px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber sm:w-auto"
      >
        {added ? "✓ Added to Cart" : "Add Bundle to Cart"}
      </button>
    </div>
  );
}

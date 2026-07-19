"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/features/cart/store";
import { formatPrice, unitPrice, cn } from "@/lib/utils";
import { trackViewContent } from "@/lib/analytics/events";
import { MinusIcon, PlusIcon, CheckIcon } from "@/components/ui/Icons";
import type { Product, ProductVariant } from "@/types";

const trustItems = ["NABL Tested", "Bilona Method", "No Antibiotics", "Batch Traced"];

/**
 * Above-the-fold purchase controls. Selecting a size updates the price inline
 * (no reload) and, when the variant has its own indexable slug, updates the URL
 * to that canonical path via history (§C3). Add-to-cart wires the global store.
 */
export function PurchasePanel({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId: string;
}) {
  const activeVariants = product.variants.filter((v) => v.active);
  const [variantId, setVariantId] = useState(initialVariantId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const variant =
    activeVariants.find((v) => v.id === variantId) ?? activeVariants[0]!;
  const unit = unitPrice(variant.price, variant.unitBase, variant.unitType);
  const inStock = variant.stock > 0;

  useEffect(() => {
    trackViewContent({ productName: product.productName, price: variant.price, sku: variant.sku });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  function select(v: ProductVariant) {
    setVariantId(v.id);
    if (typeof window !== "undefined") {
      const url = v.routeSlug
        ? `/${product.routePrefix}/${v.routeSlug}`
        : `/${product.routePrefix}/${product.slug}?size=${encodeURIComponent(v.size)}`;
      window.history.replaceState(null, "", url);
    }
  }

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
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3" aria-live="polite">
        <span className="font-serif text-3xl font-semibold text-navy">{formatPrice(variant.price)}</span>
        {variant.compareAtPrice && (
          <span className="text-lg font-light text-navy/40 line-through">
            {formatPrice(variant.compareAtPrice)}
          </span>
        )}
      </div>
      {unit && <p className="mb-5 text-sm font-light text-navy/50">{unit}</p>}

      {activeVariants.length > 1 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-navy/50">Size</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
            {activeVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === variantId}
                onClick={() => select(v)}
                className={cn(
                  "rounded-[2px] border px-4 py-2 text-sm transition-colors",
                  v.id === variantId
                    ? "border-navy bg-navy text-ivory"
                    : "border-navy/15 text-navy/70 hover:border-navy",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={cn("mb-5 text-sm font-medium", inStock ? "text-success" : "text-danger")}>
        {inStock ? `In stock — ships in 48 hours` : "Currently out of stock"}
      </p>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center overflow-hidden rounded-[2px] border border-navy/15">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-navy hover:bg-navy/5"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span className="flex h-11 w-11 items-center justify-center text-navy" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-11 w-11 items-center justify-center text-navy hover:bg-navy/5"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!inStock}
          className="flex-1 rounded-[2px] bg-navy px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-50"
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 border-t border-navy/10 pt-5 sm:grid-cols-4">
        {trustItems.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[11px] font-medium text-navy/65">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckIcon width={10} height={10} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

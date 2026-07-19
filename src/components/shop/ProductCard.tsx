"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/store";
import { getDisplayVariant } from "@/features/products/helpers";
import { formatPrice, unitPrice, discountPercent, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types";

/**
 * Compact retail product card (dense grid layout). Inline size selector updates
 * the price without a reload; full-width add-to-cart at the bottom. Shows a
 * discount badge when there's a compare-at price and an out-of-stock → "Notify
 * me" state.
 *
 * NOTE: no star ratings are rendered — Vara does not display ratings until
 * genuine review data exists (Dev Kit checklist, ASSUMPTIONS §D). The optional
 * `rating` slot below activates automatically once real data is wired in.
 */
export function ProductCard({
  product,
  featured = false,
  tag,
}: {
  product: Product;
  featured?: boolean;
  tag?: string;
}) {
  const activeVariants = product.variants.filter((v) => v.active);
  const defaultVariant = getDisplayVariant(product);
  const [selectedId, setSelectedId] = useState(defaultVariant.id);
  const selected = activeVariants.find((v) => v.id === selectedId) ?? defaultVariant;
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const href = selected.routeSlug
    ? `/${product.routePrefix}/${selected.routeSlug}`
    : `/${product.routePrefix}/${defaultVariant.routeSlug ?? product.slug}`;
  const unit = unitPrice(selected.price, selected.unitBase, selected.unitType);
  const save = discountPercent(selected.price, selected.compareAtPrice);
  const inStock = selected.stock > 0;
  const image = product.images[0];

  function add() {
    addItem({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      routePrefix: product.routePrefix,
      productName: product.productName,
      size: selected.size,
      price: selected.price,
      unitLabel: selected.unitLabel,
      image: image?.url ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[3px] border border-navy/10 bg-white transition-shadow hover:shadow-[0_16px_44px_rgba(21,40,76,0.11)]">
      <Link href={href} className="relative block" aria-label={product.productName}>
        <div className={cn("relative", featured ? "aspect-[4/3]" : "aspect-square")}>
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover"
            />
          )}
          {tag && (
            <span className="absolute left-2.5 top-2.5">
              <Badge tone={tag === "Hero Product" ? "navy" : "amber"}>{tag}</Badge>
            </span>
          )}
          {save && (
            <span className="absolute right-2.5 top-2.5">
              <Badge tone="premium">{save}% off</Badge>
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-x-0 bottom-0 bg-navy/85 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-1 line-clamp-2 min-h-[2.4em] font-serif text-[15px] font-semibold leading-tight text-navy">
          <Link href={href} className="hover:text-amber">
            {product.productName}
          </Link>
        </h3>

        {/* Rating slot — intentionally empty until real review data exists. */}

        <div className="mb-2.5 flex items-baseline gap-2">
          <span className="text-base font-semibold text-navy">{formatPrice(selected.price)}</span>
          {selected.compareAtPrice && (
            <span className="text-xs font-light text-navy/40 line-through">
              {formatPrice(selected.compareAtPrice)}
            </span>
          )}
        </div>
        {unit && <p className="-mt-2 mb-2.5 text-[11px] font-light text-navy/40">{unit}</p>}

        {activeVariants.length > 1 ? (
          <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Select size">
            {activeVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === selectedId}
                onClick={() => setSelectedId(v.id)}
                className={cn(
                  "rounded-[2px] border px-2 py-0.5 text-[11px] transition-colors",
                  v.id === selectedId
                    ? "border-navy bg-navy text-ivory"
                    : "border-navy/15 text-navy/60 hover:border-navy",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-[11px] font-light uppercase tracking-[0.1em] text-navy/40">
            {selected.unitLabel}
          </p>
        )}

        {inStock ? (
          <button
            type="button"
            onClick={add}
            className="mt-auto w-full rounded-[2px] bg-navy py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-amber"
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        ) : (
          <Link
            href={`/contact?product=${encodeURIComponent(product.productName)}`}
            className="mt-auto w-full rounded-[2px] border border-navy/25 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors hover:border-amber hover:text-amber"
          >
            Notify Me
          </Link>
        )}
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/store";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { Product } from "@/types";

const items = [
  "A2 Gir Cow Bilona Ghee · 500ml",
  "Raw Wild Forest Honey",
  "Free delivery anywhere in India",
  "NABL lab reports for both products",
];

/**
 * Wellness Starter bundle. Adding the bundle adds the bundle line item to the
 * cart (priced as one SKU). Design section.
 */
export function Bundle({ bundle }: { bundle: Product }) {
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
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Section tone="ivory" ariaLabel="The Wellness Starter bundle">
      <Eyebrow>Best Value</Eyebrow>
      <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] font-semibold leading-tight text-navy">
        The Wellness <em className="italic text-amber">Starter Bundle</em>
      </h2>

      <div className="mt-11 grid overflow-hidden rounded border border-navy/10 md:grid-cols-2">
        <div className="bg-gradient-to-b from-navy-mid to-navy-deep p-10">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
            Most Popular Bundle
          </p>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-ivory">{bundle.productName}</h3>
          <ul className="mb-7">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 border-b border-white/[0.06] py-1.5 text-[13px] font-light text-ivory/75"
              >
                <span className="font-bold text-gold" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mb-6 flex items-baseline gap-3.5">
            <span className="font-serif text-4xl font-semibold text-gold-lt">
              {formatPrice(variant.price)}
            </span>
            {variant.compareAtPrice && (
              <span className="text-base font-light text-ivory/30 line-through">
                {formatPrice(variant.compareAtPrice)}
              </span>
            )}
            {save && (
              <span className="rounded-[2px] bg-success/20 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-success-lt">
                Save {save}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={add}
            className="rounded-[2px] bg-navy px-10 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber"
          >
            {added ? "✓ Added to Cart" : "Add Bundle to Cart"}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 bg-ivory p-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded border border-navy/10 bg-white text-3xl">
              🫙<span className="text-[9px] uppercase tracking-[0.1em] text-navy/50">Ghee 500ml</span>
            </span>
            <span className="text-2xl text-navy/20" aria-hidden="true">
              +
            </span>
            <span className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded border border-navy/10 bg-white text-3xl">
              🍯<span className="text-[9px] uppercase tracking-[0.1em] text-navy/50">Honey</span>
            </span>
          </div>
          <p className="max-w-[240px] text-[12.5px] font-light leading-relaxed text-navy/50">
            Perfect for daily cooking and your morning routine. Both products carry full NABL lab
            reports — nothing assumed, everything verifiable.
          </p>
        </div>
      </div>
    </Section>
  );
}

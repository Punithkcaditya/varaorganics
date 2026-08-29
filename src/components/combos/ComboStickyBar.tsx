"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/store";
import { formatPrice } from "@/lib/utils";
import type { Combo } from "@/types";

/** Mobile-first sticky purchase shortcut required by the combos brief. */
export function ComboStickyBar({ combo }: { combo: Combo }) {
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function add() {
    addItem({
      variantId: combo.checkout.variantId,
      productId: combo.checkout.productId,
      slug: combo.slug,
      routePrefix: "combos",
      productName: combo.names.english,
      size: "Combo",
      price: combo.comboPrice,
      unitLabel: "combo",
      image: null,
      quantity: 1,
      comboContents: combo.contents,
    });
    setAdded(true);
  }

  return (
    <div className="bg-navy fixed inset-x-0 bottom-0 z-[199] border-t border-white/10 px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.22)] md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ivory truncate text-xs font-medium">Mane Ruchi</p>
          <p className="text-gold font-serif text-lg font-semibold">
            {formatPrice(combo.comboPrice)}
          </p>
        </div>
        {added ? (
          <Link
            href="/cart"
            className="bg-gold text-navy shrink-0 rounded-[2px] px-5 py-3 text-[11px] font-bold tracking-[0.12em] uppercase"
          >
            Proceed to cart →
          </Link>
        ) : (
          <button
            type="button"
            onClick={add}
            className="bg-gold text-navy shrink-0 rounded-[2px] px-6 py-3 text-[11px] font-bold tracking-[0.12em] uppercase"
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}

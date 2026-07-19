"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/store";
import { trackViewContent } from "@/lib/analytics/events";
import { formatPrice } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import type { CartItem } from "@/types";

/**
 * Landing-page sticky add-to-cart bar. Appears once the hero has scrolled out
 * of view (IntersectionObserver, not a pixel threshold). Also fires the
 * ViewContent event once on load — consent-gated inside the analytics layer.
 */
export function LpStickyBar({
  item,
  ctaLabel,
  sku,
  heroId,
}: {
  item: Omit<CartItem, "quantity">;
  ctaLabel: string;
  sku: string;
  heroId: string;
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [visible, setVisible] = useState(false);
  const [qty, setQty] = useState(1);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackViewContent({ productName: item.productName, price: item.price, sku });
  }, [item.productName, item.price, sku]);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroId]);

  function buy() {
    addItem({ ...item, quantity: qty });
    const utm = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    router.push(utm ? `/checkout?${utm}` : "/checkout");
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[199] flex items-center justify-between gap-3 bg-navy px-5 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 md:px-[8%] ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-ivory">
          {item.productName} · {item.size}
        </p>
        <p className="text-xs text-gold">{formatPrice(item.price)} · Free Bangalore delivery</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center overflow-hidden rounded-[2px] border border-white/15 sm:flex">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-8 items-center justify-center bg-white/5 text-ivory"
          >
            <MinusIcon width={15} height={15} />
          </button>
          <span className="flex h-9 w-8 items-center justify-center text-sm text-ivory" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-9 w-8 items-center justify-center bg-white/5 text-ivory"
          >
            <PlusIcon width={15} height={15} />
          </button>
        </div>
        <button
          type="button"
          onClick={buy}
          className="whitespace-nowrap rounded-[2px] bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-deep transition-colors hover:bg-gold-lt"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

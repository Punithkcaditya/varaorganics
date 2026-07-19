"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/store";
import { formatPrice } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import type { CartItem } from "@/types";

/**
 * Sticky add-to-cart bar. Appears only AFTER the referenced product section has
 * left the viewport (Dev Kit §05 — via IntersectionObserver, not a fixed px
 * threshold). Fixed to the bottom on all breakpoints.
 */
export function StickyCart({
  targetId,
  item,
  note,
}: {
  targetId: string;
  item: Omit<CartItem, "quantity">;
  note: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [visible, setVisible] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const sentinelPassed = useRef(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Once the section has scrolled above the viewport, reveal and keep.
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          sentinelPassed.current = true;
        }
        setVisible(sentinelPassed.current && !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  function add() {
    addItem({ ...item, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[199] flex items-center justify-between gap-3 bg-navy px-6 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 md:px-[6%] ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-ivory">
          {item.productName} · {item.size}
        </p>
        <p className="text-xs text-gold">
          {formatPrice(item.price)} · {note}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-[2px] border border-white/15">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-8 items-center justify-center bg-white/5 text-ivory"
          >
            <MinusIcon width={16} height={16} />
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
            <PlusIcon width={16} height={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded-[2px] bg-gold px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-deep transition-colors hover:bg-gold-lt"
        >
          {added ? "✓ Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/store";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

const tones = {
  navy: "bg-navy text-ivory hover:bg-amber",
  gold: "bg-gold text-navy-deep hover:bg-gold-lt",
  "navy-on-dark": "bg-gold text-navy-deep hover:bg-gold-lt",
} as const;

/**
 * Landing-page CTA. Adds the campaign product to the cart and goes straight to
 * checkout, preserving UTM parameters. ViewContent fires once from the sticky
 * bar; Purchase fires later only after server-verified payment (never here).
 */
export function LandingCTA({
  item,
  label,
  tone = "navy",
}: {
  item: Omit<CartItem, "quantity">;
  label: string;
  /** SKU is accepted for call-site symmetry with analytics helpers. */
  sku?: string;
  tone?: keyof typeof tones;
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  function buy() {
    addItem({ ...item, quantity: 1 });
    const utm =
      typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    router.push(utm ? `/checkout?${utm}` : "/checkout");
  }

  return (
    <button
      type="button"
      onClick={buy}
      className={cn(
        "w-full rounded-[2px] px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] transition-colors sm:w-auto",
        tones[tone],
      )}
    >
      {label}
    </button>
  );
}

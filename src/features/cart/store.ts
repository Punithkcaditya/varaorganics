"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { trackAddToCart } from "@/lib/analytics/events";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  /** Swap one variant for another (variant change) preserving quantity. */
  updateVariant: (fromVariantId: string, next: CartItem) => void;
  clear: () => void;
}

/**
 * Global cart (Zustand + localStorage persistence). Prices held here are for
 * display only — the server re-reads variant prices from the DB before creating
 * any order (§07: never trust client totals).
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          trackAddToCart(item);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0),
        })),
      updateVariant: (fromVariantId, next) =>
        set((state) => {
          const current = state.items.find((i) => i.variantId === fromVariantId);
          const quantity = current?.quantity ?? next.quantity;
          const withoutOld = state.items.filter((i) => i.variantId !== fromVariantId);
          const merged = withoutOld.find((i) => i.variantId === next.variantId);
          if (merged) {
            return {
              items: withoutOld.map((i) =>
                i.variantId === next.variantId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...withoutOld, { ...next, quantity }] };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "vara-cart" },
  ),
);

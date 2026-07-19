import type { CartItem } from "@/types";

/** Pure cart math — unit-tested independently of the store (§22). */

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/**
 * Shipping: free at/above the threshold, otherwise a flat fee. COD may add a
 * fee handled server-side. Kept pure for testing.
 */
export function shippingAmount(subtotal: number, freeThreshold: number, flatFee = 79): number {
  if (subtotal === 0) return 0;
  return subtotal >= freeThreshold ? 0 : flatFee;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * Compute order totals. Tax is 0 at launch (GST-inclusive pricing assumed —
 * CONFIRM). Centralized so client display and server recomputation agree.
 */
export function computeTotals(
  items: CartItem[],
  freeThreshold: number,
  opts?: { taxRate?: number; codFee?: number },
): OrderTotals {
  const subtotal = cartSubtotal(items);
  const shipping = shippingAmount(subtotal, freeThreshold) + (opts?.codFee ?? 0);
  const tax = Math.round(subtotal * (opts?.taxRate ?? 0));
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

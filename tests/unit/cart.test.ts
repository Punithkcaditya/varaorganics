import { describe, it, expect } from "vitest";
import {
  cartCount,
  cartSubtotal,
  shippingAmount,
  computeTotals,
} from "@/features/cart/selectors";
import type { CartItem } from "@/types";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: "v1",
    productId: "p1",
    slug: "ghee",
    routePrefix: "ghee",
    productName: "Ghee",
    size: "500ml",
    price: 1399,
    unitLabel: "500ml",
    image: null,
    quantity: 1,
    ...overrides,
  };
}

describe("cart selectors", () => {
  it("counts total quantity across items", () => {
    expect(cartCount([item({ quantity: 2 }), item({ variantId: "v2", quantity: 3 })])).toBe(5);
  });

  it("computes subtotal from price * quantity", () => {
    expect(cartSubtotal([item({ price: 1399, quantity: 2 })])).toBe(2798);
  });

  it("returns 0 subtotal for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
    expect(cartCount([])).toBe(0);
  });

  it("charges flat shipping below the free threshold", () => {
    expect(shippingAmount(500, 999)).toBe(79);
  });

  it("gives free shipping at or above the threshold", () => {
    expect(shippingAmount(999, 999)).toBe(0);
    expect(shippingAmount(1500, 999)).toBe(0);
  });

  it("charges no shipping for an empty cart", () => {
    expect(shippingAmount(0, 999)).toBe(0);
  });

  it("computes full order totals including a COD fee", () => {
    const totals = computeTotals([item({ price: 400, quantity: 1 })], 999, { codFee: 0 });
    expect(totals.subtotal).toBe(400);
    expect(totals.shipping).toBe(79);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(479);
  });

  it("applies free shipping in totals above threshold", () => {
    const totals = computeTotals([item({ price: 1399, quantity: 1 })], 999);
    expect(totals.shipping).toBe(0);
    expect(totals.total).toBe(1399);
  });
});

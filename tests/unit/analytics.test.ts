import { describe, it, expect, beforeEach } from "vitest";
import {
  pushDataLayer,
  trackAddToCart,
  trackPurchase,
  trackBeginCheckout,
} from "@/lib/analytics/events";
import type { CartItem } from "@/types";

interface TestWindow {
  dataLayer?: Record<string, unknown>[];
  __varaConsent?: boolean;
}

function win(): TestWindow {
  return window as unknown as TestWindow;
}

const item: CartItem = {
  variantId: "var-ghee-500",
  productId: "prod-ghee",
  slug: "a2-gir-cow-bilona-ghee",
  routePrefix: "ghee",
  productName: "A2 Gir Cow Bilona Ghee",
  size: "500ml",
  price: 1399,
  unitLabel: "500ml",
  image: null,
  quantity: 2,
};

describe("analytics dataLayer", () => {
  beforeEach(() => {
    win().dataLayer = [];
    win().__varaConsent = false;
  });

  it("pushes nothing before consent is granted", () => {
    pushDataLayer("test_event", { a: 1 });
    trackAddToCart(item);
    expect(win().dataLayer).toHaveLength(0);
  });

  it("pushes once consent is granted", () => {
    win().__varaConsent = true;
    pushDataLayer("test_event", { a: 1 });
    expect(win().dataLayer?.[0]).toMatchObject({ event: "test_event", a: 1 });
  });

  it("sends add_to_cart with line value and a Klaviyo companion event", () => {
    win().__varaConsent = true;
    trackAddToCart(item);
    const events = win().dataLayer ?? [];
    const ga = events.find((e) => e.event === "add_to_cart");
    const klaviyo = events.find((e) => e.event === "klaviyo_added_to_cart");
    expect(ga).toMatchObject({ currency: "INR", value: 2798 }); // 1399 × 2
    expect(klaviyo).toMatchObject({ value: 2798 });
  });

  it("sends purchase with transaction id, value and items", () => {
    win().__varaConsent = true;
    trackPurchase({
      orderNumber: "VARA-20260718-AB12",
      totalAmount: 2798,
      email: "buyer@example.com",
      items: [
        { productName: "Ghee", size: "500ml", quantity: 2, unitPrice: 1399, sku: "VARA-GHEE-500" },
      ],
    });
    const purchase = (win().dataLayer ?? []).find((e) => e.event === "purchase");
    expect(purchase).toMatchObject({
      transaction_id: "VARA-20260718-AB12",
      currency: "INR",
      value: 2798,
    });
    expect((purchase?.items as unknown[]).length).toBe(1);
  });

  it("identifies the shopper at checkout for Klaviyo", () => {
    win().__varaConsent = true;
    trackBeginCheckout(2798, "buyer@example.com");
    const events = win().dataLayer ?? [];
    expect(events.find((e) => e.event === "begin_checkout")).toMatchObject({ value: 2798 });
    expect(events.find((e) => e.event === "klaviyo_identify")).toMatchObject({
      email: "buyer@example.com",
    });
  });
});

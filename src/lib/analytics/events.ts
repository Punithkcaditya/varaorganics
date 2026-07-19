import type { CartItem, Order } from "@/types";

/**
 * Analytics event layer.
 *
 * Primary path is the **GTM dataLayer** (Tech Stack doc: GA4, Meta Pixel and
 * Clarity are all deployed *through* GTM, not as separate script tags). Every
 * event is pushed to `dataLayer` so the marketer can wire tags in GTM without
 * a code change.
 *
 * Fallback: if no GTM container is configured but GA4/Pixel IDs are, we call
 * gtag/fbq directly so tracking still works.
 *
 * Klaviyo events (Placed Order / Added to Cart / Started Checkout / identify)
 * are pushed to the same dataLayer for GTM to forward.
 *
 * Everything is a no-op until consent is granted. Purchase fires only from
 * server-verified order data (never a raw client callback).
 */

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

interface AnalyticsWindow extends Window {
  dataLayer?: Record<string, unknown>[];
  gtag?: Gtag;
  fbq?: Fbq;
  __varaConsent?: boolean;
}

function w(): AnalyticsWindow | null {
  return typeof window === "undefined" ? null : (window as AnalyticsWindow);
}

function consented(): boolean {
  const win = w();
  return !!win && win.__varaConsent === true;
}

/** Push an event onto the GTM dataLayer (no-op without consent). */
export function pushDataLayer(event: string, payload: Record<string, unknown> = {}): void {
  const win = w();
  if (!win || !consented()) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...payload });
}

/** Direct GA4/Pixel fallback used only when GTM is not configured. */
function directGa(event: string, params: Record<string, unknown>) {
  const win = w();
  if (win?.gtag && consented()) win.gtag("event", event, params);
}

function directPixel(event: string, params: Record<string, unknown>) {
  const win = w();
  if (win?.fbq && consented()) win.fbq("track", event, params);
}

export function trackPageView(url: string) {
  pushDataLayer("page_view", { page_location: url });
  directGa("page_view", { page_location: url });
  const win = w();
  if (win?.fbq && consented()) win.fbq("track", "PageView");
}

export function trackViewContent(item: { productName: string; price: number; sku: string }) {
  const payload = {
    currency: "INR",
    value: item.price,
    items: [{ item_id: item.sku, item_name: item.productName, price: item.price }],
  };
  pushDataLayer("view_item", payload);
  directGa("view_item", payload);
  directPixel("ViewContent", {
    content_name: item.productName,
    content_ids: [item.sku],
    value: item.price,
    currency: "INR",
  });
}

export function trackAddToCart(item: CartItem) {
  const value = item.price * item.quantity;
  const payload = {
    currency: "INR",
    value,
    items: [
      {
        item_id: item.variantId,
        item_name: item.productName,
        item_variant: item.size,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  };
  pushDataLayer("add_to_cart", payload);
  // Klaviyo "Added to Cart" — forwarded by GTM.
  pushDataLayer("klaviyo_added_to_cart", {
    value,
    items: [{ ProductName: item.productName, Quantity: item.quantity, ItemPrice: item.price }],
  });
  directGa("add_to_cart", payload);
  directPixel("AddToCart", { content_name: item.productName, value, currency: "INR" });
}

export function trackBeginCheckout(value: number, email?: string) {
  pushDataLayer("begin_checkout", { currency: "INR", value });
  // Klaviyo "Started Checkout" (+ identify when we have an email).
  pushDataLayer("klaviyo_started_checkout", { value, email });
  if (email) pushDataLayer("klaviyo_identify", { email });
  directGa("begin_checkout", { currency: "INR", value });
  directPixel("InitiateCheckout", { value, currency: "INR" });
}

/** Fire ONLY after server-verified payment (from the order-confirmed page). */
export function trackPurchase(
  order: Pick<Order, "orderNumber" | "totalAmount"> & {
    email?: string;
    items?: { productName: string; size: string; quantity: number; unitPrice: number; sku: string }[];
  },
) {
  const items = (order.items ?? []).map((i) => ({
    item_id: i.sku,
    item_name: i.productName,
    item_variant: i.size,
    price: i.unitPrice,
    quantity: i.quantity,
  }));
  const payload = {
    transaction_id: order.orderNumber,
    currency: "INR",
    value: order.totalAmount,
    items,
  };
  pushDataLayer("purchase", payload);
  // Klaviyo "Placed Order" — forwarded by GTM.
  pushDataLayer("klaviyo_placed_order", {
    event_id: order.orderNumber,
    value: order.totalAmount,
    email: order.email,
    items: (order.items ?? []).map((i) => ({
      ProductName: i.productName,
      Quantity: i.quantity,
      ItemPrice: i.unitPrice,
    })),
  });
  if (order.email) pushDataLayer("klaviyo_identify", { email: order.email });
  directGa("purchase", payload);
  directPixel("Purchase", { value: order.totalAmount, currency: "INR" });
}

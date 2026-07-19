"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics/events";
import type { OrderItem } from "@/types";

/**
 * Fires the Purchase event ONCE from server-provided order data (the order only
 * exists after server-side verification — §18). Pushes to the GTM dataLayer so
 * GA4 / Meta Pixel / Klaviyo "Placed Order" can all be wired inside GTM.
 */
export function PurchaseTracker({
  orderNumber,
  totalAmount,
  email,
  items,
}: {
  orderNumber: string;
  totalAmount: number;
  email: string;
  items: OrderItem[];
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackPurchase({
      orderNumber,
      totalAmount,
      email,
      items: items.map((i) => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        sku: i.sku,
      })),
    });
  }, [orderNumber, totalAmount, email, items]);
  return null;
}

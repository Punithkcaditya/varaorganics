import "server-only";
import crypto from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { getAllProducts, getVariantById } from "@/features/products/queries";
import { getComboByCheckoutSku } from "@/features/combos/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { computeTotals } from "@/features/cart/selectors";
import { createShipment } from "@/lib/shiprocket/server";
import { sendEmail, sendResendEvent } from "@/lib/resend/server";
import { sendWhatsAppTemplate } from "@/lib/wati/server";
import { site } from "@/config/site";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { checkLowStock } from "@/features/inventory/service";
import {
  orderConfirmationEmail,
  codConfirmationEmail,
  paymentFailedEmail,
  shipmentCreatedEmail,
} from "@/lib/resend/templates";
import {
  saveOrder,
  getOrder,
  updateOrder,
  findOrderByRazorpayOrderId,
  findOrderIdByIdempotency,
} from "./store";
import type { CreateOrderInput } from "@/lib/validation/checkout";
import type { CartItem, Order, OrderItem, PaymentMethod } from "@/types";

/** Generate a human order number, e.g. VARA-20260711-4F2A. */
function orderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `VARA-${date}-${rand}`;
}

/**
 * Recompute the order from server-side DB prices. NEVER trusts client prices
 * (§07). Validates stock. Returns the line items + totals, or throws if a
 * variant is missing or out of stock.
 */
async function buildOrder(input: CreateOrderInput): Promise<{
  items: OrderItem[];
  cartItems: CartItem[];
  batchNumber: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}> {
  const settings = await getSiteSettings();
  const items: OrderItem[] = [];
  const cartItems: CartItem[] = [];
  // Traceability: record which batch was dispatched with this order so a
  // quality issue can be traced to every affected customer.
  let batchNumber: string | null = null;

  for (const line of input.items) {
    const resolved = await getVariantById(line.variantId);
    if (!resolved) throw new OrderError("invalid_item", `Unknown item: ${line.variantId}`);
    const { product, variant } = resolved;
    if (!variant.active) throw new OrderError("invalid_item", `Item unavailable: ${variant.sku}`);
    const combo = await getComboByCheckoutSku(variant.sku);
    if (combo && variant.price !== combo.comboPrice) {
      throw new OrderError(
        "invalid_item",
        `Combo price is being updated. Please refresh and try again.`,
      );
    }
    if (!combo && variant.stock < line.quantity) {
      throw new OrderError(
        "out_of_stock",
        `Insufficient stock for ${product.productName} ${variant.size}`,
      );
    }
    if (combo) {
      const componentProducts = await resolveComboComponents(combo, line.quantity);
      if (!batchNumber) {
        batchNumber =
          componentProducts.find((entry) => entry.product.currentBatch?.active)?.product
            .currentBatch?.batchNumber ?? null;
      }
    }
    if (!batchNumber && product.currentBatch?.active) {
      batchNumber = product.currentBatch.batchNumber;
    }
    const lineTotal = variant.price * line.quantity;
    items.push({
      productName: product.productName,
      size: combo
        ? combo.contents
            .map(
              (entry) =>
                `${entry.productName} ${entry.variant}${entry.qty > 1 ? ` × ${entry.qty}` : ""}`,
            )
            .join(" + ")
        : variant.size,
      sku: variant.sku,
      quantity: line.quantity,
      unitPrice: variant.price,
      lineTotal,
    });
    cartItems.push({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      routePrefix: product.isBundle ? "bundles" : product.routePrefix,
      productName: product.productName,
      size: variant.size,
      price: variant.price,
      unitLabel: variant.unitLabel,
      image: product.images[0]?.url ?? null,
      quantity: line.quantity,
      comboContents: combo?.contents,
    });
  }

  const codFee = input.customer.paymentMethod === "cod" ? 0 : 0;
  const totals = computeTotals(cartItems, settings.freeShippingThreshold, { codFee });
  return { items, cartItems, batchNumber, ...totals };
}

export class OrderError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Create a pending order in the DB from validated input. Idempotent by
 * `idempotencyKey`: a repeated request returns the existing order.
 */
export async function createPendingOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<{ order: Order; totalRupees: number }> {
  const existingId = await findOrderIdByIdempotency(idempotencyKey);
  if (existingId) {
    const existing = await getOrder(existingId);
    if (existing) return { order: existing, totalRupees: existing.totalAmount };
  }

  const built = await buildOrder(input);
  const method = input.customer.paymentMethod as PaymentMethod;
  const now = new Date().toISOString();

  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: orderNumber(),
    email: input.customer.email,
    address: {
      fullName: input.customer.fullName,
      phone: input.customer.phone,
      addressLine1: input.customer.addressLine1,
      addressLine2: input.customer.addressLine2 || undefined,
      landmark: input.customer.landmark || undefined,
      city: input.customer.city,
      state: input.customer.state,
      postalCode: input.customer.postalCode,
      country: input.customer.country || "India",
    },
    items: built.items,
    subtotal: built.subtotal,
    shippingAmount: built.shipping,
    taxAmount: built.tax,
    totalAmount: built.total,
    currency: "INR",
    paymentMethod: method,
    paymentStatus: method === "cod" ? "cod_pending" : "pending",
    fulfillmentStatus: "unfulfilled",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    shiprocketShipmentId: null,
    awbNumber: null,
    courierName: null,
    trackingUrl: null,
    batchNumber: built.batchNumber,
    utm: {
      source: input.utm?.source || null,
      medium: input.utm?.medium || null,
      campaign: input.utm?.campaign || null,
    },
    notes: input.customer.notes || null,
    createdAt: now,
  };

  await saveOrder(order, idempotencyKey);
  return { order, totalRupees: order.totalAmount };
}

/**
 * Attach a Razorpay order id to a pending order.
 *
 * This link is what lets the payment webhook find the order later, so it must
 * be persisted before the customer reaches the payment modal.
 */
export async function attachRazorpayOrder(orderId: string, rzpOrderId: string): Promise<void> {
  await updateOrder(orderId, { razorpayOrderId: rzpOrderId });

  if (USE_MOCK_DATA) {
    // The in-memory store keeps a separate razorpay→order index; re-saving
    // populates it. Real mode needs none of this — the DB column is indexed.
    const order = await getOrder(orderId);
    if (order) {
      order.razorpayOrderId = rzpOrderId;
      await saveOrder(order, `rzp-${rzpOrderId}`);
    }
  }
}

/**
 * Finalize a paid order (idempotent). Marks paid, decrements stock, creates the
 * shipment, saves tracking, sends confirmation. Safe to call more than once —
 * subsequent calls are no-ops once the order is already paid/fulfilled.
 */
export async function finalizePaidOrder(
  orderId: string,
  paymentId: string | null,
): Promise<Order | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  const paymentAlreadyConfirmed =
    order.paymentStatus === "paid" || order.paymentStatus === "cod_pending";
  if (paymentAlreadyConfirmed && order.fulfillmentStatus !== "unfulfilled") {
    return order; // already processed
  }

  await updateOrder(orderId, {
    paymentStatus: order.paymentMethod === "cod" ? "cod_pending" : "paid",
    razorpayPaymentId: paymentId,
  });
  await decrementStock(order);

  const shipment = await createShipment(order);
  if (shipment.ok) {
    await updateOrder(orderId, {
      fulfillmentStatus: "processing",
      shiprocketShipmentId: shipment.shipmentId,
      awbNumber: shipment.awb,
      courierName: shipment.courier,
      trackingUrl: shipment.trackingUrl,
    });
  } else {
    // Store failure so it can be retried manually (§09).
    await updateOrder(orderId, { fulfillmentStatus: "failed" });
  }

  const updated = (await getOrder(orderId)) ?? order;
  await sendConfirmation(updated, shipment.ok);
  await notifyCustomerWhatsApp(updated, shipment.ok);
  await fireOrderConfirmedEvent(updated);
  // Low-stock check runs after the decrement so alerts reflect real levels.
  await checkLowStock();
  return updated;
}

/**
 * Server-verified order event → triggers the Resend "order confirmed"
 * Automation (delayed steps only: farm story +24h, lab-report reminder +72h —
 * the immediate confirmation email is sent directly above). Fired here rather
 * than from the browser so it can't be lost if the customer closes the tab.
 * Customer data only — never supplier/pricing docs.
 */
async function fireOrderConfirmedEvent(order: Order) {
  const first = order.items[0];
  await sendResendEvent({
    event: "vara/order.confirmed",
    email: order.email,
    payload: {
      customer_name: order.address.fullName,
      order_id: order.orderNumber,
      product_name: first?.productName ?? "",
      variant: first?.size ?? "",
      order_value: order.totalAmount,
      batch_number: order.batchNumber ?? "",
      verify_url: `${site.url}${LAB_REPORTS_PATH}`,
    },
  });
}

/** WhatsApp order confirmation / shipped notice (never blocks the order). */
async function notifyCustomerWhatsApp(order: Order, shipped: boolean) {
  await sendWhatsAppTemplate({
    phone: order.address.phone,
    templateName: shipped ? "order_shipped" : "order_confirmed",
    parameters: [
      { name: "name", value: order.address.fullName },
      { name: "order_number", value: order.orderNumber },
      { name: "amount", value: String(order.totalAmount) },
      { name: "tracking_url", value: order.trackingUrl ?? "" },
    ],
  });
}

async function sendConfirmation(order: Order, shipped: boolean) {
  // A confirmation is sent only from the successful finalization path: after
  // Razorpay signature/webhook verification, or immediately for an accepted
  // COD order. Email delivery is best-effort and never rolls back a paid order.
  const email =
    order.paymentMethod === "cod" ? codConfirmationEmail(order) : orderConfirmationEmail(order);
  await sendEmail({ to: order.email, subject: email.subject, html: email.html });
  if (shipped && order.awbNumber) {
    const ship = shipmentCreatedEmail(order);
    await sendEmail({ to: order.email, subject: ship.subject, html: ship.html });
  }
}

/** Safe stock decrement. In real mode uses an atomic RPC-style update. */
async function decrementStock(order: Order): Promise<void> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) return; // mock: no-op
  try {
    for (const item of order.items) {
      const combo = await getComboByCheckoutSku(item.sku);
      if (combo) {
        const components = await resolveComboComponents(combo, item.quantity);
        for (const component of components) {
          const { error } = await sb.rpc("decrement_variant_stock", {
            p_sku: component.variant.sku,
            p_qty: component.quantity,
          });
          if (error) throw error;
        }
        continue;
      }
      const { error } = await sb.rpc("decrement_variant_stock", {
        p_sku: item.sku,
        p_qty: item.quantity,
      });
      if (error) throw error;
    }
  } catch (err) {
    safeError("orders", "decrementStock failed", { err: String(err), order: order.orderNumber });
  }
}

async function resolveComboComponents(
  combo: Awaited<ReturnType<typeof getComboByCheckoutSku>> & {},
  comboQuantity: number,
) {
  const products = await getAllProducts();
  const components: {
    product: (typeof products)[number];
    variant: (typeof products)[number]["variants"][number];
    quantity: number;
  }[] = [];

  for (const content of combo.contents) {
    // Gift wrapping and handwritten cards are fulfilment extras, not stock SKUs.
    if (content.productSlug === "gift-wrap" || content.productSlug === "gift-card") continue;
    const product = products.find(
      (candidate) => candidate.slug === content.productSlug && !candidate.isBundle,
    );
    const variant = product?.variants.find(
      (candidate) => candidate.size.toLowerCase() === content.variant.toLowerCase(),
    );
    // A component variant may be hidden from standalone sale (for example the
    // 1kg honey reserved for the Export Special) while remaining valid stock
    // inside a published combo.
    if (!product || !product.active || !variant) {
      throw new OrderError(
        "invalid_item",
        `${content.productName} ${content.variant} is unavailable.`,
      );
    }
    const quantity = content.qty * comboQuantity;
    if (variant.stock < quantity) {
      throw new OrderError(
        "out_of_stock",
        `Insufficient stock for ${content.productName} ${content.variant}`,
      );
    }
    components.push({ product, variant, quantity });
  }

  return components;
}

/** For the webhook: resolve an order by Razorpay order id. */
export async function finalizeByRazorpayOrder(
  rzpOrderId: string,
  paymentId: string,
): Promise<Order | null> {
  const order = await findOrderByRazorpayOrderId(rzpOrderId);
  if (!order) return null;
  return finalizePaidOrder(order.id, paymentId);
}

/**
 * Mark a verified Razorpay failure and notify the customer once. Razorpay may
 * retry the webhook, and the checkout modal may allow another payment attempt,
 * so a later successful payment can still move this order to `paid`.
 */
export async function markPaymentFailedByRazorpayOrder(
  rzpOrderId: string,
  paymentId: string | null,
): Promise<Order | null> {
  const order = await findOrderByRazorpayOrderId(rzpOrderId);
  if (!order) return null;
  if (
    order.paymentStatus === "paid" ||
    order.paymentStatus === "cod_pending" ||
    order.paymentStatus === "failed"
  ) {
    return order;
  }

  await updateOrder(order.id, {
    paymentStatus: "failed",
    razorpayPaymentId: paymentId,
  });
  const updated = (await getOrder(order.id)) ?? {
    ...order,
    paymentStatus: "failed" as const,
    razorpayPaymentId: paymentId,
  };
  const email = paymentFailedEmail(updated);
  await sendEmail({ to: updated.email, subject: email.subject, html: email.html });
  return updated;
}

export { getOrder };

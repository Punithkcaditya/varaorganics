import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import type { Order, ShipmentEvent } from "@/types";

/**
 * Order persistence. Uses the Supabase service-role client in production; falls
 * back to an in-memory map in mock mode / when no DB is configured so the app
 * runs offline. The maps live on globalThis so the route-handler bundle and the
 * server-component bundle share ONE instance (otherwise the order-confirmed
 * page can't see an order a route handler just created). NOTE: still per-process
 * — does not survive restarts. Documented in IMPLEMENTATION_STATUS.md.
 */
interface MockOrderStore {
  memory: Map<string, Order>;
  byRazorpayOrder: Map<string, string>;
  byIdempotency: Map<string, string>;
  events: Map<string, ShipmentEvent[]>;
}
const g = globalThis as unknown as { __varaOrderStore?: MockOrderStore };
const mock: MockOrderStore = (g.__varaOrderStore ??= {
  memory: new Map(),
  byRazorpayOrder: new Map(),
  byIdempotency: new Map(),
  events: new Map(),
});
const { memory, byRazorpayOrder, byIdempotency, events: mockEvents } = mock;

export async function saveOrder(order: Order, idempotencyKey: string): Promise<void> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    memory.set(order.id, order);
    if (order.razorpayOrderId) byRazorpayOrder.set(order.razorpayOrderId, order.id);
    byIdempotency.set(idempotencyKey, order.id);
    return;
  }
  try {
    const { error } = await sb.from("orders").insert({
      id: order.id,
      order_number: order.orderNumber,
      email: order.email,
      shipping_address: order.address,
      subtotal: order.subtotal,
      shipping_amount: order.shippingAmount,
      tax_amount: order.taxAmount,
      total_amount: order.totalAmount,
      currency: order.currency,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      razorpay_order_id: order.razorpayOrderId,
      batch_number: order.batchNumber,
      utm_source: order.utm.source,
      utm_medium: order.utm.medium,
      utm_campaign: order.utm.campaign,
      idempotency_key: idempotencyKey,
      notes: order.notes,
    });
    if (error) throw error;
    const { error: itemsError } = await sb.from("order_items").insert(
      order.items.map((i) => ({
        order_id: order.id,
        product_name: i.productName,
        size: i.size,
        sku: i.sku,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        line_total: i.lineTotal,
      })),
    );
    if (itemsError) throw itemsError;
  } catch (err) {
    safeError("orders", "saveOrder failed", { err: String(err), orderId: order.id });
    throw err;
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) return memory.get(id) ?? null;
  try {
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return rowToOrder(data as Record<string, unknown>);
  } catch (err) {
    safeError("orders", "getOrder failed", { err: String(err), id });
    return null;
  }
}

export async function findOrderIdByIdempotency(key: string): Promise<string | null> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) return byIdempotency.get(key) ?? null;
  try {
    const { data } = await sb.from("orders").select("id").eq("idempotency_key", key).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

export async function findOrderByRazorpayOrderId(rzpOrderId: string): Promise<Order | null> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    const id = byRazorpayOrder.get(rzpOrderId);
    return id ? (memory.get(id) ?? null) : null;
  }
  try {
    const { data } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("razorpay_order_id", rzpOrderId)
      .maybeSingle();
    return data ? rowToOrder(data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Find an order by its AWB (Shiprocket status webhook lookup). */
export async function findOrderByAwb(awb: string): Promise<Order | null> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    for (const order of memory.values()) {
      if (order.awbNumber === awb) return order;
    }
    return null;
  }
  try {
    const { data } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("awb_number", awb)
      .maybeSingle();
    return data ? rowToOrder(data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Append a shipment milestone (audit trail for the tracking page). */
export async function recordShipmentEvent(
  orderId: string,
  event: { awb: string | null; status: string; statusDetail?: string; raw?: Record<string, unknown> },
): Promise<void> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    const list = mockEvents.get(orderId) ?? [];
    list.push({
      status: event.status,
      statusDetail: event.statusDetail ?? null,
      occurredAt: new Date().toISOString(),
    });
    mockEvents.set(orderId, list);
    return;
  }
  try {
    const { error } = await sb.from("shipment_events").insert({
      order_id: orderId,
      awb_number: event.awb,
      status: event.status,
      status_detail: event.statusDetail ?? null,
      raw: event.raw ?? null,
    });
    if (error) throw error;
  } catch (err) {
    safeError("orders", "recordShipmentEvent failed", { err: String(err), orderId });
  }
}

/** Shipment milestones for an order, newest last. */
export async function getShipmentEvents(orderId: string): Promise<ShipmentEvent[]> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) return mockEvents.get(orderId) ?? [];
  try {
    const { data, error } = await sb
      .from("shipment_events")
      .select("status, status_detail, occurred_at")
      .eq("order_id", orderId)
      .order("occurred_at", { ascending: true });
    if (error) throw error;
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      status: r.status as string,
      statusDetail: (r.status_detail as string) ?? null,
      occurredAt: r.occurred_at as string,
    }));
  } catch (err) {
    safeError("orders", "getShipmentEvents failed", { err: String(err), orderId });
    return [];
  }
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<void> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    const existing = memory.get(id);
    if (existing) memory.set(id, { ...existing, ...patch });
    return;
  }
  try {
    const { error } = await sb
      .from("orders")
      .update({
        payment_status: patch.paymentStatus,
        fulfillment_status: patch.fulfillmentStatus,
        // The webhook looks orders up by razorpay_order_id — if this is not
        // persisted, a captured payment can never be matched to its order.
        razorpay_order_id: patch.razorpayOrderId,
        razorpay_payment_id: patch.razorpayPaymentId,
        shiprocket_shipment_id: patch.shiprocketShipmentId,
        awb_number: patch.awbNumber,
        courier_name: patch.courierName,
        tracking_url: patch.trackingUrl,
      })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    safeError("orders", "updateOrder failed", { err: String(err), id });
    throw err;
  }
}

/** All orders, newest first (admin lists + reports). `limit` caps the result. */
export async function listOrders(limit = 200): Promise<Order[]> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return [...memory.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  try {
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return ((data as Record<string, unknown>[]) ?? []).map(rowToOrder);
  } catch (err) {
    safeError("orders", "listOrders failed", { err: String(err) });
    return [];
  }
}

/** Orders dispatched with a given batch (recall traceability). */
export async function findOrdersByBatch(batchNumber: string): Promise<Order[]> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return [...memory.values()].filter((o) => o.batchNumber === batchNumber);
  }
  try {
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .eq("batch_number", batchNumber)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as Record<string, unknown>[]) ?? []).map(rowToOrder);
  } catch (err) {
    safeError("orders", "findOrdersByBatch failed", { err: String(err) });
    return [];
  }
}

/** Exported row mapper for other server modules (reports). */
export const mapOrderRow = (row: Record<string, unknown>): Order => rowToOrder(row);

function rowToOrder(row: Record<string, unknown>): Order {
  const items = (row.order_items as Record<string, unknown>[] | null) ?? [];
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    email: row.email as string,
    address: row.shipping_address as Order["address"],
    items: items.map((i) => ({
      productName: i.product_name as string,
      size: i.size as string,
      sku: i.sku as string,
      quantity: i.quantity as number,
      unitPrice: i.unit_price as number,
      lineTotal: i.line_total as number,
    })),
    subtotal: row.subtotal as number,
    shippingAmount: row.shipping_amount as number,
    taxAmount: row.tax_amount as number,
    totalAmount: row.total_amount as number,
    currency: row.currency as string,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    fulfillmentStatus: row.fulfillment_status as Order["fulfillmentStatus"],
    razorpayOrderId: (row.razorpay_order_id as string) ?? null,
    razorpayPaymentId: (row.razorpay_payment_id as string) ?? null,
    shiprocketShipmentId: (row.shiprocket_shipment_id as string) ?? null,
    awbNumber: (row.awb_number as string) ?? null,
    courierName: (row.courier_name as string) ?? null,
    trackingUrl: (row.tracking_url as string) ?? null,
    batchNumber: (row.batch_number as string) ?? null,
    utm: {
      source: (row.utm_source as string) ?? null,
      medium: (row.utm_medium as string) ?? null,
      campaign: (row.utm_campaign as string) ?? null,
    },
    notes: (row.notes as string) ?? null,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import type { Order } from "@/types";

export interface ReportTotals {
  orders: number;
  revenue: number;
  averageOrderValue: number;
  byProduct: { productName: string; sku: string; units: number; revenue: number }[];
  topProduct: string | null;
}

export interface DashboardSnapshot {
  today: { orders: number; revenue: number };
  week: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  averageOrderValue: number;
  topProduct: string | null;
  failedFulfilment: number;
  pendingPayment: number;
}

/** Orders in a date range. Only paid/COD orders count toward revenue. */
async function ordersBetween(fromIso: string, toIso: string): Promise<Order[]> {
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    const { listOrders } = await import("@/features/orders/store");
    return (await listOrders()).filter(
      (o) => o.createdAt >= fromIso && o.createdAt < toIso,
    );
  }
  try {
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .gte("created_at", fromIso)
      .lt("created_at", toIso)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const { mapOrderRow } = await import("@/features/orders/store");
    return ((data as Record<string, unknown>[]) ?? []).map(mapOrderRow);
  } catch (err) {
    safeError("reports", "ordersBetween failed", { err: String(err) });
    return [];
  }
}

function countsRevenue(order: Order): boolean {
  return order.paymentStatus === "paid" || order.paymentStatus === "cod_pending";
}

function summarize(orders: Order[]): ReportTotals {
  const real = orders.filter(countsRevenue);
  const revenue = real.reduce((sum, o) => sum + o.totalAmount, 0);

  const byProductMap = new Map<string, { productName: string; sku: string; units: number; revenue: number }>();
  for (const order of real) {
    for (const item of order.items) {
      const existing = byProductMap.get(item.sku);
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        byProductMap.set(item.sku, {
          productName: item.productName,
          sku: item.sku,
          units: item.quantity,
          revenue: item.lineTotal,
        });
      }
    }
  }

  const byProduct = [...byProductMap.values()].sort((a, b) => b.revenue - a.revenue);
  return {
    orders: real.length,
    revenue,
    averageOrderValue: real.length ? Math.round(revenue / real.length) : 0,
    byProduct,
    topProduct: byProduct[0]?.productName ?? null,
  };
}

/** Report for a calendar month, e.g. "2026-07" (P&L sheet + admin). */
export async function getMonthlyReport(month: string): Promise<ReportTotals & { month: string }> {
  const [y, m] = month.split("-").map(Number);
  const from = new Date(Date.UTC(y!, m! - 1, 1));
  const to = new Date(Date.UTC(y!, m!, 1));
  const orders = await ordersBetween(from.toISOString(), to.toISOString());
  return { month, ...summarize(orders) };
}

/** Rolling report for the last N days (weekly Monday email). */
export async function getRangeReport(days: number): Promise<ReportTotals> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return summarize(await ordersBetween(from.toISOString(), to.toISOString()));
}

/** Today / week / month snapshot for the admin dashboard. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date(now.getTime() + 1000).toISOString();

  const [todayOrders, weekOrders, monthOrders] = await Promise.all([
    ordersBetween(startOfToday, nowIso),
    ordersBetween(weekAgo, nowIso),
    ordersBetween(startOfMonth, nowIso),
  ]);

  const today = summarize(todayOrders);
  const week = summarize(weekOrders);
  const month = summarize(monthOrders);

  return {
    today: { orders: today.orders, revenue: today.revenue },
    week: { orders: week.orders, revenue: week.revenue },
    month: { orders: month.orders, revenue: month.revenue },
    averageOrderValue: month.averageOrderValue,
    topProduct: month.topProduct,
    failedFulfilment: monthOrders.filter((o) => o.fulfillmentStatus === "failed").length,
    pendingPayment: monthOrders.filter((o) => o.paymentStatus === "pending").length,
  };
}

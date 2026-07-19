import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";
import { notifyInternal } from "@/lib/resend/server";
import { alertOperator } from "@/lib/wati/server";
import { getAllProducts } from "@/features/products/queries";
import type { InventoryStatus } from "@/types";

const DEFAULT_REORDER_POINT = 10;
/** Don't re-alert for the same variant more than once per this window. */
const ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000;

/**
 * Inventory / reorder-point tracking. Stock itself lives on product_variants
 * (single source of truth); this layer adds reorder points and low-stock
 * alerting for the solo operator.
 */
export async function getInventoryStatus(): Promise<InventoryStatus[]> {
  const sb = getAdminSupabase();

  if (USE_MOCK_DATA || !sb) {
    const products = await getAllProducts();
    return products.flatMap((p) =>
      p.variants
        .filter((v) => v.active)
        .map((v) => ({
          variantId: v.id,
          productName: p.productName,
          sku: v.sku,
          size: v.size,
          stock: v.stock,
          reorderPoint: DEFAULT_REORDER_POINT,
          needsReorder: v.stock <= DEFAULT_REORDER_POINT,
        })),
    );
  }

  try {
    const { data, error } = await sb.from("inventory_status").select("*");
    if (error) throw error;
    return (data as Record<string, unknown>[]).map((r) => ({
      variantId: r.variant_id as string,
      productName: r.product_name as string,
      sku: r.sku as string,
      size: r.size as string,
      stock: r.stock as number,
      reorderPoint: r.reorder_point as number,
      needsReorder: r.needs_reorder as boolean,
    }));
  } catch (err) {
    safeError("inventory", "getInventoryStatus failed", { err: String(err) });
    return [];
  }
}

/**
 * Alert on any variant at/below its reorder point. Called after an order is
 * finalized (post stock decrement) and by the weekly report. Never throws —
 * alerting must not break order processing. Cooldown prevents alert spam.
 */
export async function checkLowStock(): Promise<InventoryStatus[]> {
  try {
    const status = await getInventoryStatus();
    const low = status.filter((s) => s.needsReorder);
    if (low.length === 0) return [];

    const sb = getAdminSupabase();
    let toAlert = low;

    if (!USE_MOCK_DATA && sb) {
      // Respect the per-variant cooldown recorded in `inventory`.
      const { data } = await sb
        .from("inventory")
        .select("variant_id, last_alert_at")
        .in(
          "variant_id",
          low.map((l) => l.variantId),
        );
      const lastAlerts = new Map(
        ((data as { variant_id: string; last_alert_at: string | null }[]) ?? []).map((r) => [
          r.variant_id,
          r.last_alert_at,
        ]),
      );
      const now = Date.now();
      toAlert = low.filter((l) => {
        const last = lastAlerts.get(l.variantId);
        return !last || now - new Date(last).getTime() > ALERT_COOLDOWN_MS;
      });
      if (toAlert.length > 0) {
        await sb
          .from("inventory")
          .upsert(
            toAlert.map((l) => ({
              variant_id: l.variantId,
              last_alert_at: new Date().toISOString(),
            })),
            { onConflict: "variant_id" },
          );
      }
    }

    if (toAlert.length === 0) return low;

    const rows = toAlert
      .map(
        (l) =>
          `<tr><td style="padding:4px 8px">${l.productName} · ${l.size}</td>` +
          `<td style="padding:4px 8px">${l.sku}</td>` +
          `<td style="padding:4px 8px;text-align:right"><strong>${l.stock}</strong> left (reorder at ${l.reorderPoint})</td></tr>`,
      )
      .join("");

    await notifyInternal(
      `Low stock: ${toAlert.length} item${toAlert.length === 1 ? "" : "s"} need reordering`,
      `<p>These items are at or below their reorder point:</p>
       <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}</table>`,
    );
    await alertOperator(
      "low_stock_alert",
      `${toAlert.length} item(s) low: ${toAlert.map((l) => `${l.sku} (${l.stock})`).join(", ")}`,
    );

    safeLog("inventory", "low stock alerted", { count: toAlert.length });
    return low;
  } catch (err) {
    safeError("inventory", "checkLowStock failed", { err: String(err) });
    return [];
  }
}

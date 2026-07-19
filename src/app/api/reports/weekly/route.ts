import type { NextRequest } from "next/server";
import { getRangeReport } from "@/features/reports/service";
import { getInventoryStatus } from "@/features/inventory/service";
import { notifyInternal } from "@/lib/resend/server";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { formatPrice } from "@/lib/utils";
import { ok, fail, serverError } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly Monday performance email. Trigger with a scheduler (Supabase Edge
 * Function cron, Hostinger cron, or GitHub Action) hitting this endpoint with
 * the admin secret header — see DEPLOYMENT.md.
 */
export async function POST(req: NextRequest) {
  const secret = optionalServerEnv("REVALIDATE_SECRET");
  if (!USE_MOCK_DATA && req.headers.get("x-admin-secret") !== secret) {
    return fail(401, "unauthorized", "Not authorized");
  }

  try {
    const [report, inventory] = await Promise.all([getRangeReport(7), getInventoryStatus()]);
    const low = inventory.filter((i) => i.needsReorder);

    const productRows =
      report.byProduct
        .map(
          (p) =>
            `<tr><td style="padding:4px 8px">${p.productName}</td><td style="padding:4px 8px;text-align:right">${p.units}</td><td style="padding:4px 8px;text-align:right">${formatPrice(p.revenue)}</td></tr>`,
        )
        .join("") || `<tr><td style="padding:4px 8px" colspan="3">No orders this week.</td></tr>`;

    const stockRows =
      low
        .map(
          (l) =>
            `<tr><td style="padding:4px 8px">${l.productName} · ${l.size}</td><td style="padding:4px 8px;text-align:right"><strong>${l.stock}</strong> (reorder at ${l.reorderPoint})</td></tr>`,
        )
        .join("") || `<tr><td style="padding:4px 8px">All products above reorder point.</td></tr>`;

    await notifyInternal(
      `Vara weekly report — ${report.orders} orders, ${formatPrice(report.revenue)}`,
      `<h2 style="font-family:Arial,sans-serif">Last 7 days</h2>
       <p style="font-family:Arial,sans-serif;font-size:14px">
         Orders: <strong>${report.orders}</strong><br/>
         Revenue: <strong>${formatPrice(report.revenue)}</strong><br/>
         Average order value: <strong>${formatPrice(report.averageOrderValue)}</strong><br/>
         Top product: <strong>${report.topProduct ?? "—"}</strong>
       </p>
       <h3 style="font-family:Arial,sans-serif">By product</h3>
       <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${productRows}</table>
       <h3 style="font-family:Arial,sans-serif">Stock alerts</h3>
       <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${stockRows}</table>`,
    );

    return ok({ sent: true, orders: report.orders, lowStock: low.length });
  } catch (err) {
    return serverError("reports/weekly", err);
  }
}

import type { NextRequest } from "next/server";
import { z } from "zod";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { getOrder } from "@/features/orders/service";
import { createShipment } from "@/lib/shiprocket/server";
import { updateOrder } from "@/features/orders/store";
import { ok, fail, serverError } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1) });

/**
 * Manually retry shipment creation for an order whose Shiprocket call failed
 * (§09). Protected by the revalidate secret header to keep it admin-only.
 */
export async function POST(req: NextRequest) {
  const secret = optionalServerEnv("REVALIDATE_SECRET");
  if (!USE_MOCK_DATA && req.headers.get("x-revalidate-secret") !== secret) {
    return fail(401, "unauthorized", "Not authorized");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(422, "validation_error", "orderId required");

  try {
    const order = await getOrder(parsed.data.orderId);
    if (!order) return fail(404, "order_not_found", "Order not found");

    const shipment = await createShipment(order);
    if (!shipment.ok) return fail(502, "shiprocket_unavailable", "Shipment retry failed");

    await updateOrder(order.id, {
      fulfillmentStatus: "processing",
      shiprocketShipmentId: shipment.shipmentId,
      awbNumber: shipment.awb,
      courierName: shipment.courier,
      trackingUrl: shipment.trackingUrl,
    });
    return ok({ shipmentId: shipment.shipmentId, awb: shipment.awb });
  } catch (err) {
    return serverError("shiprocket/retry", err);
  }
}

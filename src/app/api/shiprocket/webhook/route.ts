import type { NextRequest } from "next/server";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { sendWhatsAppTemplate, alertOperator } from "@/lib/wati/server";
import { sendEmail, notifyInternal } from "@/lib/resend/server";
import { shipmentTrackingEmail } from "@/lib/resend/templates";
import { findOrderByAwb, recordShipmentEvent, updateOrder } from "@/features/orders/store";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";
import { mapShiprocketStatus } from "@/lib/shiprocket/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shiprocket status webhook. Fires on every delivery milestone; we update the
 * order, append a shipment_events row, notify the customer on WhatsApp, and
 * alert the operator on a failed delivery (NDR).
 *
 * Shiprocket sends a configurable `x-api-key` header — verified against
 * SHIPROCKET_WEBHOOK_SECRET.
 */

export async function POST(req: NextRequest) {
  const secret = optionalServerEnv("SHIPROCKET_WEBHOOK_SECRET");
  if (!USE_MOCK_DATA && secret && req.headers.get("x-api-key") !== secret) {
    return fail(401, "unauthorized", "Invalid webhook key");
  }

  let body: {
    awb?: string;
    awb_code?: string;
    current_status?: string;
    shipment_status?: string;
    order_id?: string;
    scans?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed webhook body");
  }

  const awb = body.awb ?? body.awb_code ?? null;
  const rawStatus = body.current_status ?? body.shipment_status ?? "";
  if (!awb || !rawStatus) return ok({ received: true, ignored: true });

  try {
    const order = await findOrderByAwb(awb);
    if (!order) {
      safeLog("shiprocket/webhook", "no order for awb", { hasAwb: Boolean(awb) });
      return ok({ received: true, matched: false });
    }

    await recordShipmentEvent(order.id, {
      awb,
      status: rawStatus,
      raw: body as Record<string, unknown>,
    });

    const mapped = mapShiprocketStatus(rawStatus);
    if (mapped && mapped !== order.fulfillmentStatus) {
      await updateOrder(order.id, { fulfillmentStatus: mapped });
    }

    // Customer notification on meaningful milestones.
    if (mapped === "shipped" || mapped === "delivered") {
      await sendWhatsAppTemplate({
        phone: order.address.phone,
        templateName: mapped === "delivered" ? "order_delivered" : "order_shipped",
        parameters: [
          { name: "name", value: order.address.fullName },
          { name: "order_number", value: order.orderNumber },
          { name: "tracking_url", value: order.trackingUrl ?? "" },
        ],
      });
      if (mapped === "shipped") {
        const mail = shipmentTrackingEmail({ ...order, fulfillmentStatus: mapped });
        await sendEmail({ to: order.email, subject: mail.subject, html: mail.html });
      }
    }

    // Failed delivery (NDR) — alert the operator immediately.
    if (mapped === "failed") {
      await alertOperator(
        "ndr_alert",
        `Failed delivery for ${order.orderNumber} (AWB ${awb}): ${rawStatus}`,
      );
      await notifyInternal(
        `NDR — failed delivery for ${order.orderNumber}`,
        `<p>Order <strong>${order.orderNumber}</strong> (AWB ${awb}) reported: ${rawStatus}.</p>
         <p>Reattempt via the Shiprocket dashboard before the customer complains.</p>`,
      );
    }

    safeLog("shiprocket/webhook", "processed", { status: rawStatus, mapped });
    return ok({ received: true, matched: true, status: mapped });
  } catch (err) {
    return serverError("shiprocket/webhook", err);
  }
}

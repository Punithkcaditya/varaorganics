import type { NextRequest } from "next/server";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { sendWhatsAppTemplate, alertOperator } from "@/lib/wati/server";
import { sendEmail, notifyInternal, sendResendEvent } from "@/lib/resend/server";
import { shipmentTrackingEmail, ndrCustomerEmail } from "@/lib/resend/templates";
import { findOrderByAwb, recordShipmentEvent, updateOrder } from "@/features/orders/store";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";
import { mapShiprocketStatus } from "@/lib/shiprocket/status";
import { site } from "@/config/site";
import { LAB_REPORTS_PATH } from "@/config/routes";

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
    // Shiprocket re-sends webhooks for the same status, so notify ONLY on an
    // actual transition — otherwise the customer gets duplicate emails.
    const statusChanged = mapped != null && mapped !== order.fulfillmentStatus;
    if (statusChanged) {
      await updateOrder(order.id, { fulfillmentStatus: mapped });
    }

    // Customer notification on meaningful milestones (once, on transition).
    if (statusChanged && (mapped === "shipped" || mapped === "delivered")) {
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
      if (mapped === "delivered") {
        // Server-verified delivery event → triggers the Resend "order
        // delivered" Automation (review request +3d, reorder nudge +45d).
        // Only fires on the transition to delivered, so it can't double-count.
        await sendResendEvent({
          event: "vara/order.delivered",
          email: order.email,
          payload: {
            customer_name: order.address.fullName,
            order_id: order.orderNumber,
            product_name: order.items[0]?.productName ?? "",
            delivered_at: new Date().toISOString(),
            verify_url: `${site.url}${LAB_REPORTS_PATH}`,
          },
        });
      }
    }

    // Failure states (all mapped to "failed") — distinguish a retriable failed
    // delivery attempt (NDR) from a returned/lost shipment, because the customer
    // message differs. Only email the customer on a transition, and only the
    // "we'll try again" note when a retry is actually expected.
    if (statusChanged && mapped === "failed") {
      const returnedOrLost = /\b(rto|return|lost)\b/.test(rawStatus.toLowerCase());
      if (!returnedOrLost) {
        const ndr = ndrCustomerEmail(order, rawStatus);
        await sendEmail({ to: order.email, subject: ndr.subject, html: ndr.html });
      }
      await alertOperator(
        "ndr_alert",
        `${returnedOrLost ? "Returned/lost" : "Failed delivery"} for ${order.orderNumber} (AWB ${awb}): ${rawStatus}`,
      );
      await notifyInternal(
        `${returnedOrLost ? "Return/lost" : "NDR — failed delivery"} for ${order.orderNumber}`,
        `<p>Order <strong>${order.orderNumber}</strong> (AWB ${awb}) reported: ${rawStatus}.</p>
         <p>${returnedOrLost ? "Shipment is being returned or is lost — contact the customer to arrange a resend or refund." : "Reattempt via the Shiprocket dashboard before the customer complains."}</p>`,
      );
    }

    safeLog("shiprocket/webhook", "processed", { status: rawStatus, mapped });
    return ok({ received: true, matched: true, status: mapped });
  } catch (err) {
    return serverError("shiprocket/webhook", err);
  }
}

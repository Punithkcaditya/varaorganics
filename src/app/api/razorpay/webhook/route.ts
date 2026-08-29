import type { NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay/server";
import {
  finalizeByRazorpayOrder,
  markPaymentFailedByRazorpayOrder,
} from "@/features/orders/service";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the authoritative source of truth for payment (§08).
 * Verifies the signature over the RAW body, then finalizes idempotently. A
 * client callback alone is never trusted as proof of payment.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return fail(400, "invalid_signature", "Invalid webhook signature");
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { order_id?: string; id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_json", "Malformed webhook body");
  }

  try {
    const entity = event.payload?.payment?.entity;
    if (
      (event.event === "payment.captured" || event.event === "order.paid") &&
      entity?.order_id &&
      entity?.id
    ) {
      const order = await finalizeByRazorpayOrder(entity.order_id, entity.id);
      safeLog("razorpay/webhook", "processed", {
        event: event.event,
        finalized: Boolean(order),
      });
    } else if (event.event === "payment.failed" && entity?.order_id) {
      const order = await markPaymentFailedByRazorpayOrder(entity.order_id, entity.id ?? null);
      safeLog("razorpay/webhook", "processed", {
        event: event.event,
        matched: Boolean(order),
      });
    }
    // Always 200 for handled/ignored events so Razorpay stops retrying.
    return ok({ received: true });
  } catch (err) {
    return serverError("razorpay/webhook", err);
  }
}

import type { NextRequest } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature } from "@/lib/razorpay/server";
import { finalizeByRazorpayOrder } from "@/features/orders/service";
import { ok, fail, serverError } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Verify the client payment callback signature server-side and finalize the
 * order. The webhook remains the authoritative source of truth (§08); this
 * gives the user a fast confirmation. finalize is idempotent.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed request body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(422, "validation_error", "Invalid payment payload");

  const valid = verifyPaymentSignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });
  if (!valid) return fail(400, "invalid_signature", "Payment verification failed");

  try {
    const order = await finalizeByRazorpayOrder(
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
    );
    if (!order) return fail(404, "order_not_found", "Order not found");
    return ok({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (err) {
    return serverError("razorpay/verify", err);
  }
}

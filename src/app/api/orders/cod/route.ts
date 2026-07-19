import type { NextRequest } from "next/server";
import { createOrderSchema } from "@/lib/validation/checkout";
import { initiateCheckout } from "@/features/payments/service";
import { OrderError } from "@/features/orders/service";
import { ok, fail, serverError } from "@/lib/api/respond";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cash-on-Delivery order creation. Shares the same order pipeline as Razorpay
 * (payment abstraction) — the method is forced to "cod" server-side so the
 * client can't downgrade a prepaid order.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`cod:${ip}`, 10, 60_000);
  if (!rl.success) return fail(429, "rate_limited", "Too many attempts. Please wait a moment.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed request body.");
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "validation_error", parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const input = { ...parsed.data, customer: { ...parsed.data.customer, paymentMethod: "cod" as const } };
  const idempotencyKey = req.headers.get("idempotency-key") ?? crypto.randomUUID();

  try {
    const result = await initiateCheckout(input, idempotencyKey);
    return ok(result);
  } catch (err) {
    if (err instanceof OrderError) return fail(409, err.code, err.message);
    return serverError("orders/cod", err);
  }
}

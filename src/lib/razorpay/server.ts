import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { optionalServerEnv, publicEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";

/**
 * Server-side Razorpay. The KEY_SECRET and webhook secret never leave the
 * server; the browser only ever receives the public KEY_ID. In mock mode a fake
 * order id is returned so checkout can be exercised without credentials.
 */

let client: Razorpay | null = null;

function getClient(): Razorpay | null {
  if (USE_MOCK_DATA) return null;
  if (client) return client;
  const keyId = publicEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = optionalServerEnv("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) return null;
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export function razorpayPublicKeyId(): string {
  return publicEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/** Create a Razorpay order for `amountInPaise` (INR). */
export async function createRazorpayOrder(
  amountRupees: number,
  receipt: string,
): Promise<RazorpayOrder> {
  const amount = Math.round(amountRupees * 100); // paise
  const rp = getClient();
  if (!rp) {
    // Mock order — lets the flow proceed offline.
    return { id: `order_mock_${receipt}`, amount, currency: "INR" };
  }
  try {
    const order = await rp.orders.create({ amount, currency: "INR", receipt });
    return { id: order.id, amount: Number(order.amount), currency: order.currency };
  } catch (err) {
    safeError("razorpay", "createRazorpayOrder failed", { err: String(err) });
    throw new Error("Payment provider unavailable");
  }
}

/**
 * Verify the checkout callback signature: HMAC-SHA256(order_id|payment_id) with
 * the key secret must equal the returned signature. Pure + unit-tested.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret ?? optionalServerEnv("RAZORPAY_KEY_SECRET");
  if (!secret) return USE_MOCK_DATA; // in mock mode, accept
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, params.signature);
}

/** Verify a Razorpay webhook signature over the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = optionalServerEnv("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return USE_MOCK_DATA;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

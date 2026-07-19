import "server-only";
import { createPendingOrder, attachRazorpayOrder, finalizePaidOrder } from "@/features/orders/service";
import { createRazorpayOrder, razorpayPublicKeyId } from "@/lib/razorpay/server";
import type { CreateOrderInput } from "@/lib/validation/checkout";

/**
 * Payment-provider abstraction (§07). COD and Razorpay share one order-creation
 * pipeline; only the post-create step differs. Returns a discriminated result
 * the client uses to either redirect (COD) or open Razorpay checkout (online).
 */
export type CheckoutResult =
  | { kind: "cod"; orderId: string; orderNumber: string }
  | {
      kind: "online";
      orderId: string;
      orderNumber: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      publicKey: string;
    };

export async function initiateCheckout(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<CheckoutResult> {
  const { order } = await createPendingOrder(input, idempotencyKey);

  if (order.paymentMethod === "cod") {
    // COD is "placed" immediately (payment collected on delivery).
    await finalizePaidOrder(order.id, null);
    return { kind: "cod", orderId: order.id, orderNumber: order.orderNumber };
  }

  const rzp = await createRazorpayOrder(order.totalAmount, order.orderNumber);
  await attachRazorpayOrder(order.id, rzp.id);
  return {
    kind: "online",
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzp.id,
    amount: rzp.amount,
    currency: rzp.currency,
    publicKey: razorpayPublicKeyId(),
  };
}

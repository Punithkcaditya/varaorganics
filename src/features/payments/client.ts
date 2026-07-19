"use client";

import type { CheckoutResult } from "./service";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: { description?: string; reason?: string; step?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout for an online order and verify server-side on success.
 * In mock mode (no real key / mock order id) it skips checkout.js and calls the
 * verify endpoint directly so the flow completes offline.
 */
export async function openRazorpayCheckout(
  result: Extract<CheckoutResult, { kind: "online" }>,
  prefill: { name: string; email: string; contact: string },
  onSuccess: (orderId: string) => void,
  onFailure: (message: string) => void,
): Promise<void> {
  const isMock = !result.publicKey || result.razorpayOrderId.startsWith("order_mock_");

  async function verify(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) onSuccess(data.orderId);
    else onFailure(data.message ?? "Payment verification failed");
  }

  if (isMock) {
    await verify({
      razorpay_order_id: result.razorpayOrderId,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: "mock",
    });
    return;
  }

  const loaded = await loadCheckoutScript();
  if (!loaded || !window.Razorpay) {
    onFailure("Could not load the payment gateway. Please try again.");
    return;
  }

  const rzp = new window.Razorpay({
    key: result.publicKey,
    amount: result.amount,
    currency: result.currency,
    order_id: result.razorpayOrderId,
    name: "Vara Organics",
    description: `Order ${result.orderNumber}`,
    prefill,
    theme: { color: "#15284C" },
    handler: (response) => void verify(response),
    modal: { ondismiss: () => onFailure("Payment was cancelled.") },
  });

  // Razorpay emits this when a payment attempt is declined (bad card, failed
  // 3-D Secure, insufficient funds). The modal stays open so the customer can
  // retry with another method — we only surface the reason.
  rzp.on("payment.failed", (response) => {
    const reason = response.error?.description ?? "Your payment could not be completed.";
    onFailure(`${reason} You can try again with a different payment method.`);
  });

  rzp.open();
}

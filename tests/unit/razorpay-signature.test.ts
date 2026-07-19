// @vitest-environment node
import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyPaymentSignature } from "@/lib/razorpay/server";

/**
 * Razorpay signature verification (§22). Recreates the HMAC the gateway sends
 * and asserts the verifier accepts valid and rejects tampered signatures.
 */
describe("verifyPaymentSignature", () => {
  const secret = "test_secret_key";
  const orderId = "order_ABC123";
  const paymentId = "pay_XYZ789";
  const valid = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  it("accepts a correct signature", () => {
    expect(verifyPaymentSignature({ orderId, paymentId, signature: valid, secret })).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      verifyPaymentSignature({ orderId, paymentId, signature: "deadbeef", secret }),
    ).toBe(false);
  });

  it("rejects a signature computed over different data", () => {
    const wrong = crypto.createHmac("sha256", secret).update(`${orderId}|other`).digest("hex");
    expect(verifyPaymentSignature({ orderId, paymentId, signature: wrong, secret })).toBe(false);
  });
});

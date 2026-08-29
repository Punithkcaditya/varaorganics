// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  codConfirmationEmail,
  orderConfirmationEmail,
  restockRequestAckEmail,
  restockRequestAdminEmail,
} from "@/lib/resend/templates";
import type { Order } from "@/types";

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "f78ead52-0f5b-4fc1-a61c-275ec03c49e7",
    orderNumber: "VARA-20260821-AB12",
    email: "customer@example.com",
    address: {
      fullName: "Renuka Prasad",
      phone: "9876543210",
      addressLine1: "12 Farm Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
    },
    items: [
      {
        productName: "A2 Gir Cow Bilona Ghee",
        size: "500ml",
        sku: "GHE-500",
        quantity: 2,
        unitPrice: 1399,
        lineTotal: 2798,
      },
    ],
    subtotal: 2798,
    shippingAmount: 0,
    taxAmount: 0,
    totalAmount: 2798,
    currency: "INR",
    paymentMethod: "upi",
    paymentStatus: "paid",
    fulfillmentStatus: "processing",
    razorpayOrderId: "order_test",
    razorpayPaymentId: "pay_test",
    shiprocketShipmentId: null,
    awbNumber: null,
    courierName: null,
    trackingUrl: null,
    batchNumber: "GHE-2024-047",
    utm: { source: null, medium: null, campaign: null },
    notes: null,
    createdAt: "2026-08-21T12:00:00.000Z",
    ...overrides,
  };
}

describe("Resend order emails", () => {
  it("includes the complete paid-order summary and customer order link", () => {
    const mail = orderConfirmationEmail(order());

    expect(mail.subject).toContain("VARA-20260821-AB12");
    expect(mail.html).toContain("A2 Gir Cow Bilona Ghee");
    expect(mail.html).toContain("500ml × 2");
    expect(mail.html).toContain("₹2,798");
    expect(mail.html).toContain("12 Farm Road");
    expect(mail.html).toContain("Payment method: UPI");
    expect(mail.html).toContain("/order/f78ead52-0f5b-4fc1-a61c-275ec03c49e7");
  });

  it("shows COD instructions for a cash-on-delivery order", () => {
    const mail = codConfirmationEmail(
      order({ paymentMethod: "cod", paymentStatus: "cod_pending" }),
    );

    expect(mail.subject).toContain("Cash on Delivery");
    expect(mail.html).toContain("ready for cash on delivery");
    expect(mail.html).toContain("₹2,798");
  });

  it("escapes customer-controlled values before rendering HTML", () => {
    const unsafe = order({
      address: {
        ...order().address,
        fullName: '<script>alert("x")</script>',
        addressLine1: "Farm & Field <Unit 2>",
      },
    });
    const mail = orderConfirmationEmail(unsafe);

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(mail.html).toContain("Farm &amp; Field &lt;Unit 2&gt;");
  });
});

describe("Resend restock-request emails", () => {
  it("confirms the exact requested product and size to the customer", () => {
    const mail = restockRequestAckEmail("Anita", "A2 Gir Cow Bilona Ghee", "500ml");

    expect(mail.subject).toContain("Restock request received");
    expect(mail.html).toContain("A2 Gir Cow Bilona Ghee");
    expect(mail.html).toContain("500ml");
    expect(mail.html).toContain("Our team will email you");
  });

  it("gives the admin the customer, product, size, SKU, and note safely", () => {
    const mail = restockRequestAdminEmail({
      name: "Anita <Customer>",
      email: "anita@example.com",
      phone: "9876543210",
      productName: "Sesame & Oil",
      variantName: "1L",
      sku: "OIL-SES-1L",
      message: "Please contact me <soon>.",
    });

    expect(mail.subject).toBe("Restock request: Sesame & Oil (1L)");
    expect(mail.html).toContain("Anita &lt;Customer&gt;");
    expect(mail.html).toContain("anita@example.com");
    expect(mail.html).toContain("9876543210");
    expect(mail.html).toContain("Sesame &amp; Oil");
    expect(mail.html).toContain("OIL-SES-1L");
    expect(mail.html).toContain("Please contact me &lt;soon&gt;.");
    expect(mail.html).not.toContain("<soon>");
  });
});

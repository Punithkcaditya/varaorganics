// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/types";

const mocks = vi.hoisted(() => ({
  order: null as Order | null,
  sendEmail: vi.fn(),
  sendResendEvent: vi.fn(),
  sendWhatsAppTemplate: vi.fn(),
  checkLowStock: vi.fn(),
  createShipment: vi.fn(),
  findOrderByRazorpayOrderId: vi.fn(),
}));

vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: true,
  SITE_URL: "https://www.varaorganic.com",
}));
vi.mock("@/lib/supabase/admin", () => ({ getAdminSupabase: () => null }));
vi.mock("@/features/products/queries", () => ({ getVariantById: vi.fn() }));
vi.mock("@/features/settings/queries", () => ({ getSiteSettings: vi.fn() }));
vi.mock("@/features/inventory/service", () => ({ checkLowStock: mocks.checkLowStock }));
vi.mock("@/lib/resend/server", () => ({
  sendEmail: mocks.sendEmail,
  sendResendEvent: mocks.sendResendEvent,
}));
vi.mock("@/lib/wati/server", () => ({ sendWhatsAppTemplate: mocks.sendWhatsAppTemplate }));
vi.mock("@/lib/shiprocket/server", () => ({ createShipment: mocks.createShipment }));
vi.mock("@/features/orders/store", () => ({
  getOrder: vi.fn(async () => mocks.order),
  updateOrder: vi.fn(async (_id: string, patch: Partial<Order>) => {
    if (mocks.order) mocks.order = { ...mocks.order, ...patch };
  }),
  saveOrder: vi.fn(),
  findOrderByRazorpayOrderId: mocks.findOrderByRazorpayOrderId,
  findOrderIdByIdempotency: vi.fn(),
}));

import { finalizePaidOrder, markPaymentFailedByRazorpayOrder } from "@/features/orders/service";

function pendingOrder(overrides: Partial<Order> = {}): Order {
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
        quantity: 1,
        unitPrice: 1399,
        lineTotal: 1399,
      },
    ],
    subtotal: 1399,
    shippingAmount: 0,
    taxAmount: 0,
    totalAmount: 1399,
    currency: "INR",
    paymentMethod: "upi",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    razorpayOrderId: "order_test",
    razorpayPaymentId: null,
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

describe("successful order email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.order = pendingOrder();
    mocks.sendEmail.mockResolvedValue({ ok: true });
    mocks.sendResendEvent.mockResolvedValue({ ok: true });
    mocks.sendWhatsAppTemplate.mockResolvedValue({ ok: true });
    mocks.checkLowStock.mockResolvedValue(undefined);
    mocks.createShipment.mockResolvedValue({
      ok: false,
      shipmentId: null,
      awb: null,
      courier: null,
      trackingUrl: null,
    });
    mocks.findOrderByRazorpayOrderId.mockImplementation(async () => mocks.order);
  });

  it("emails the customer after payment succeeds even if shipment creation fails", async () => {
    await finalizePaidOrder(mocks.order!.id, "pay_test");

    expect(mocks.order?.paymentStatus).toBe("paid");
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: expect.stringContaining("VARA-20260821-AB12"),
        html: expect.stringContaining("A2 Gir Cow Bilona Ghee"),
      }),
    );
  });

  it("does not resend a previously finalized COD confirmation", async () => {
    mocks.order = pendingOrder({
      paymentMethod: "cod",
      paymentStatus: "cod_pending",
      fulfillmentStatus: "processing",
    });

    await finalizePaidOrder(mocks.order.id, null);

    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.createShipment).not.toHaveBeenCalled();
  });

  it("emails a customer once when Razorpay reports a verified payment failure", async () => {
    await markPaymentFailedByRazorpayOrder("order_test", "pay_failed_test");

    expect(mocks.order?.paymentStatus).toBe("failed");
    expect(mocks.order?.razorpayPaymentId).toBe("pay_failed_test");
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: expect.stringContaining("Payment could not be completed"),
      }),
    );

    // Razorpay retries webhooks; a duplicate must not send another email.
    await markPaymentFailedByRazorpayOrder("order_test", "pay_failed_test");
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
  });

  it("does not mark or email an order that is already paid", async () => {
    mocks.order = pendingOrder({ paymentStatus: "paid" });

    await markPaymentFailedByRazorpayOrder("order_test", "pay_late_failure");

    expect(mocks.order.paymentStatus).toBe("paid");
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});

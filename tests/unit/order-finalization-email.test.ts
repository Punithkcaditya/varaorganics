// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/types";

const mocks = vi.hoisted(() => ({
  order: null as Order | null,
  sendEmail: vi.fn(),
  sendWhatsAppTemplate: vi.fn(),
  checkLowStock: vi.fn(),
  createShipment: vi.fn(),
}));

vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: true,
  SITE_URL: "https://www.varaorganic.com",
}));
vi.mock("@/lib/supabase/admin", () => ({ getAdminSupabase: () => null }));
vi.mock("@/features/products/queries", () => ({ getVariantById: vi.fn() }));
vi.mock("@/features/settings/queries", () => ({ getSiteSettings: vi.fn() }));
vi.mock("@/features/inventory/service", () => ({ checkLowStock: mocks.checkLowStock }));
vi.mock("@/lib/resend/server", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/wati/server", () => ({ sendWhatsAppTemplate: mocks.sendWhatsAppTemplate }));
vi.mock("@/lib/shiprocket/server", () => ({ createShipment: mocks.createShipment }));
vi.mock("@/features/orders/store", () => ({
  getOrder: vi.fn(async () => mocks.order),
  updateOrder: vi.fn(async (_id: string, patch: Partial<Order>) => {
    if (mocks.order) mocks.order = { ...mocks.order, ...patch };
  }),
  saveOrder: vi.fn(),
  findOrderByRazorpayOrderId: vi.fn(),
  findOrderIdByIdempotency: vi.fn(),
}));

import { finalizePaidOrder } from "@/features/orders/service";

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
    mocks.sendWhatsAppTemplate.mockResolvedValue({ ok: true });
    mocks.checkLowStock.mockResolvedValue(undefined);
    mocks.createShipment.mockResolvedValue({
      ok: false,
      shipmentId: null,
      awb: null,
      courier: null,
      trackingUrl: null,
    });
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
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderThankYou } from "@/components/checkout/OrderThankYou";
import type { Order } from "@/types";

const order: Order = {
  id: "f78ead52-0f5b-4fc1-a61c-275ec03c49e7",
  orderNumber: "VARA-20260905-AB12",
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
      sku: "VARA-GHEE-500",
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
  paymentStatus: "paid",
  fulfillmentStatus: "processing",
  razorpayOrderId: "order_test",
  razorpayPaymentId: "pay_test",
  shiprocketShipmentId: "shipment_test",
  awbNumber: "awb_test",
  courierName: "Test Courier",
  trackingUrl: "https://tracking.example.com/awb_test",
  batchNumber: "GHE-2026-047",
  utm: { source: null, medium: null, campaign: null },
  notes: null,
  createdAt: "2026-09-05T10:00:00.000Z",
};

describe("order thank-you page content", () => {
  it("shows the supplied artwork and keeps the customer's useful order details", () => {
    render(<OrderThankYou order={order} />);

    expect(
      screen.getByRole("img", { name: "Thank you — we're delighted you chose Vara Organics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Thank you, Renuka" }),
    ).toBeInTheDocument();
    expect(screen.getByText("VARA-20260905-AB12")).toBeInTheDocument();
    expect(screen.getByText("A2 Gir Cow Bilona Ghee")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View order status" })).toHaveAttribute(
      "href",
      `/order/${order.id}`,
    );
    expect(screen.getByRole("link", { name: "Track shipment" })).toHaveAttribute(
      "href",
      order.trackingUrl,
    );
  });
});

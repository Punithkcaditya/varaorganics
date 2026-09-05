import type { Metadata } from "next";
import { OrderThankYou } from "@/components/checkout/OrderThankYou";
import { Container } from "@/components/ui/layout-primitives";
import type { Order } from "@/types";

export const metadata: Metadata = {
  title: "Order Confirmation Preview",
  robots: { index: false, follow: false },
};

const previewOrder: Order = {
  id: "preview-order",
  orderNumber: "VARA-DEMO-ORDER",
  email: "customer@example.com",
  address: {
    fullName: "Sample Customer",
    phone: "9876543210",
    addressLine1: "12 Sample Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
  },
  items: [
    {
      productName: "A2 Gir Cow Bilona Ghee",
      size: "500ml",
      sku: "DEMO-GHEE-500",
      quantity: 1,
      unitPrice: 1399,
      lineTotal: 1399,
    },
    {
      productName: "Raw Wild Forest Honey",
      size: "500g",
      sku: "DEMO-HONEY-500",
      quantity: 1,
      unitPrice: 749,
      lineTotal: 749,
    },
  ],
  subtotal: 2148,
  shippingAmount: 0,
  taxAmount: 0,
  totalAmount: 2148,
  currency: "INR",
  paymentMethod: "upi",
  paymentStatus: "paid",
  fulfillmentStatus: "processing",
  razorpayOrderId: null,
  razorpayPaymentId: null,
  shiprocketShipmentId: null,
  awbNumber: null,
  courierName: null,
  trackingUrl: null,
  batchNumber: "DEMO-BATCH",
  utm: { source: null, medium: null, campaign: null },
  notes: null,
  createdAt: "2026-09-05T10:00:00.000Z",
};

export default function OrderConfirmationPreviewPage() {
  return (
    <Container className="py-8 md:py-14">
      <p className="border-amber/35 bg-amber/10 text-navy mx-auto mb-5 max-w-[980px] rounded border px-4 py-3 text-center text-sm">
        Client preview — all order and customer details shown below are sample data.
      </p>
      <OrderThankYou order={previewOrder} preview />
    </Container>
  );
}

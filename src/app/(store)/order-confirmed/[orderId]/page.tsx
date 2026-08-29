import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { PurchaseTracker } from "@/components/checkout/PurchaseTracker";
import { getOrder } from "@/features/orders/service";
import { formatPrice } from "@/lib/utils";
import { LAB_REPORTS_PATH } from "@/config/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  const cod = order.paymentMethod === "cod";

  return (
    <Container className="py-16">
      {paid && (
        <PurchaseTracker
          orderNumber={order.orderNumber}
          totalAmount={order.totalAmount}
          email={order.email}
          items={order.items}
        />
      )}

      <div className="mx-auto max-w-[640px] text-center">
        <div className="bg-success/15 text-success mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          ✓
        </div>
        <h1 className="text-navy mb-3 font-serif text-3xl font-semibold">
          Thank you for your order
        </h1>
        <p className="text-navy/70 mb-2">
          Order <strong>{order.orderNumber}</strong> is confirmed
          {cod ? " (Cash on Delivery)" : " and payment received"}.
        </p>
        <p className="text-navy/55 mb-8 text-sm">
          A confirmation email is on its way to {order.email}.
        </p>
      </div>

      <div className="border-navy/10 bg-paper/40 mx-auto max-w-[640px] rounded border p-6 text-left">
        <h2 className="text-navy mb-4 font-serif text-xl font-semibold">Order summary</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.sku} className="text-navy/70 flex justify-between gap-3">
              <span>
                {i.productName} · {i.size} × {i.quantity}
              </span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="border-navy/10 space-y-1.5 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Shipping</dt>
            <dd>{order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}</dd>
          </div>
          <div className="border-navy/10 flex justify-between border-t pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
        </dl>

        <h3 className="text-navy/50 mt-6 mb-1 text-xs font-semibold tracking-[0.1em] uppercase">
          Delivery address
        </h3>
        <p className="text-navy/70 text-sm">
          {order.address.fullName}
          <br />
          {order.address.addressLine1}
          {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
          <br />
          {order.address.city}, {order.address.state} {order.address.postalCode}
          <br />
          {order.address.phone}
        </p>

        {order.trackingUrl ? (
          <p className="mt-6 text-sm">
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber underline"
            >
              Track your shipment →
            </a>
          </p>
        ) : (
          <p className="text-navy/50 mt-6 text-sm">
            You&apos;ll receive a tracking link by email once your order ships.
          </p>
        )}
        <p className="mt-2 text-sm">
          <Link href={LAB_REPORTS_PATH} className="text-amber underline">
            View lab reports & batch verification →
          </Link>
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="text-amber text-sm font-medium tracking-[0.14em] uppercase">
          Continue shopping →
        </Link>
      </div>
    </Container>
  );
}

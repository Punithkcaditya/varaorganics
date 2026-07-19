import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { PurchaseTracker } from "@/components/checkout/PurchaseTracker";
import { getOrder } from "@/features/orders/service";
import { formatPrice } from "@/lib/utils";

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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl text-success">
          ✓
        </div>
        <h1 className="mb-3 font-serif text-3xl font-semibold text-navy">Thank you for your order</h1>
        <p className="mb-2 text-navy/70">
          Order <strong>{order.orderNumber}</strong> is confirmed
          {cod ? " (Cash on Delivery)" : " and payment received"}.
        </p>
        <p className="mb-8 text-sm text-navy/55">A confirmation email is on its way to {order.email}.</p>
      </div>

      <div className="mx-auto max-w-[640px] rounded border border-navy/10 bg-paper/40 p-6 text-left">
        <h2 className="mb-4 font-serif text-xl font-semibold text-navy">Order summary</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-3 text-navy/70">
              <span>
                {i.productName} · {i.size} × {i.quantity}
              </span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-navy/10 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Shipping</dt>
            <dd>{order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-navy/10 pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
        </dl>

        <h3 className="mb-1 mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-navy/50">
          Delivery address
        </h3>
        <p className="text-sm text-navy/70">
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
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-amber underline">
              Track your shipment →
            </a>
          </p>
        ) : (
          <p className="mt-6 text-sm text-navy/50">
            You&apos;ll receive a tracking link by email once your order ships.
          </p>
        )}
        <p className="mt-2 text-sm">
          <Link href="/lab-reports" className="text-amber underline">
            View lab reports & batch verification →
          </Link>
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="text-sm font-medium uppercase tracking-[0.14em] text-amber">
          Continue shopping →
        </Link>
      </div>
    </Container>
  );
}

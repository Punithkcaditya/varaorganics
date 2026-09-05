import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { PurchaseTracker } from "@/components/checkout/PurchaseTracker";
import { OrderThankYou } from "@/components/checkout/OrderThankYou";
import { getOrder } from "@/features/orders/service";

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

  if (!paid && !cod) {
    return (
      <Container className="py-20 text-center">
        <div className="border-navy/10 bg-paper/40 mx-auto max-w-[560px] rounded-xl border p-8">
          <h1 className="text-navy font-serif text-3xl font-semibold">Payment not confirmed</h1>
          <p className="text-navy/60 mt-3 leading-relaxed">
            We have not received a successful payment confirmation for this order yet.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/order/${order.id}`}
              className="bg-navy text-ivory hover:bg-amber rounded-[2px] px-6 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
            >
              View order status
            </Link>
            <Link
              href="/checkout"
              className="border-navy/20 text-navy hover:border-amber hover:text-amber rounded-[2px] border px-6 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
            >
              Return to checkout
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="bg-ivory py-8 md:py-14">
      {paid && (
        <PurchaseTracker
          orderNumber={order.orderNumber}
          totalAmount={order.totalAmount}
          email={order.email}
          items={order.items}
        />
      )}

      <OrderThankYou order={order} />
    </Container>
  );
}

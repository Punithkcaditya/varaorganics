import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { Badge } from "@/components/ui/Badge";
import { getOrder } from "@/features/orders/service";
import { getShipmentEvents } from "@/features/orders/store";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Your Order",
  robots: { index: false, follow: false },
};

const STAGES = [
  { key: "processing", label: "Processing", note: "We're packing your order." },
  { key: "shipped", label: "Shipped", note: "On its way to you." },
  { key: "delivered", label: "Delivered", note: "Enjoy — and scan the QR on your jar." },
] as const;

function stageIndex(status: string): number {
  if (status === "delivered") return 2;
  if (status === "shipped") return 1;
  if (status === "processing") return 0;
  return -1;
}

/**
 * Customer-facing order tracking (Tech Stack doc). Shows live fulfilment
 * status from the Shiprocket webhook milestones. noindex — order-specific.
 */
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();

  const events = await getShipmentEvents(orderId);
  const current = stageIndex(order.fulfillmentStatus);
  const failed = order.fulfillmentStatus === "failed";

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto max-w-[680px]">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Track your order</h1>
        <p className="mb-8 text-navy/60">
          Order <strong>{order.orderNumber}</strong> · placed {formatDate(order.createdAt)}
        </p>

        {failed ? (
          <div className="mb-8 rounded border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
            There was a problem with delivery. We&apos;ve been alerted and will reattempt —{" "}
            <Link href="/contact" className="underline">
              contact us
            </Link>{" "}
            if you need this sooner.
          </div>
        ) : (
          <ol className="mb-8">
            {STAGES.map((stage, i) => {
              const done = current >= i;
              return (
                <li key={stage.key} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        done ? "bg-success text-white" : "border border-navy/20 text-navy/35"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {i < STAGES.length - 1 && (
                      <span className={`mt-1 w-px flex-1 ${done ? "bg-success/40" : "bg-navy/10"}`} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className={`font-medium ${done ? "text-navy" : "text-navy/40"}`}>
                      {stage.label}
                    </p>
                    <p className="text-sm font-light text-navy/55">{stage.note}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <dl className="mb-8 grid grid-cols-2 gap-4 rounded border border-navy/10 bg-paper/40 p-5 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Status</dt>
            <dd className="mt-1">
              <Badge tone={failed ? "muted" : "success"}>{order.fulfillmentStatus}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Total</dt>
            <dd className="mt-1 font-medium text-navy">{formatPrice(order.totalAmount)}</dd>
          </div>
          {order.courierName && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Courier</dt>
              <dd className="mt-1 font-medium text-navy">{order.courierName}</dd>
            </div>
          )}
          {order.awbNumber && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">AWB</dt>
              <dd className="mt-1 font-medium text-navy">{order.awbNumber}</dd>
            </div>
          )}
        </dl>

        {events.length > 0 && (
          <section aria-label="Shipment history" className="mb-8">
            <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Shipment history</h2>
            <ul className="space-y-2 text-sm">
              {events
                .slice()
                .reverse()
                .map((e, i) => (
                  <li key={i} className="flex justify-between gap-4 border-b border-navy/5 pb-2">
                    <span className="text-navy/75">{e.status}</span>
                    <span className="shrink-0 text-navy/45">{formatDate(e.occurredAt)}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {order.trackingUrl && (
          <p className="mb-6 text-sm">
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber underline"
            >
              Track with the courier →
            </a>
          </p>
        )}

        {order.batchNumber && (
          <p className="text-sm">
            <Link href={`/verify/${order.batchNumber}`} className="text-amber underline">
              View the lab report for your batch ({order.batchNumber}) →
            </Link>
          </p>
        )}
      </div>
    </Container>
  );
}

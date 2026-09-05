import Image from "next/image";
import Link from "next/link";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

/** Branded success experience shown only after an accepted COD or verified online payment. */
export function OrderThankYou({ order, preview = false }: { order: Order; preview?: boolean }) {
  const cod = order.paymentMethod === "cod";

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="border-gold/35 bg-gold/10 relative aspect-[3/2] overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(13,35,70,0.12)]">
        <Image
          src="/order-confirmed/thank-you.png"
          alt="Thank you — we're delighted you chose Vara Organics"
          fill
          preload
          sizes="(max-width: 1023px) calc(100vw - 32px), 980px"
          className="object-cover"
        />
      </div>

      <section aria-labelledby="order-confirmed-title" className="mt-8 text-center md:mt-10">
        <span className="bg-success/15 text-success inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
          <span aria-hidden="true">✓</span>
          Order confirmed
        </span>
        <h1
          id="order-confirmed-title"
          className="text-navy mt-4 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-tight font-semibold"
        >
          Thank you, {order.address.fullName.split(" ")[0]}
        </h1>
        <p className="text-navy/70 mt-3 text-base leading-relaxed">
          Order <strong>{order.orderNumber}</strong> is confirmed
          {cod ? " for Cash on Delivery" : " and your payment was received"}.
        </p>
        <p className="text-navy/50 mt-1 text-sm">
          We sent the confirmation and order details to {order.email}.
        </p>
      </section>

      <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section
          aria-labelledby="order-summary-title"
          className="border-navy/10 rounded-xl border bg-white p-5 shadow-[0_12px_35px_rgba(13,35,70,0.05)] sm:p-7"
        >
          <h2 id="order-summary-title" className="text-navy font-serif text-2xl font-semibold">
            Order summary
          </h2>
          <ul className="mt-5 space-y-4">
            {order.items.map((item) => (
              <li
                key={item.sku}
                className="border-navy/10 text-navy/70 flex items-start justify-between gap-4 border-b pb-4 text-sm last:border-0 last:pb-0"
              >
                <span>
                  <strong className="text-navy block font-medium">{item.productName}</strong>
                  <span className="text-navy/50 mt-0.5 block">
                    {item.size} × {item.quantity}
                  </span>
                </span>
                <span className="text-navy shrink-0 font-medium">
                  {formatPrice(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="border-navy/10 mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-navy/55">Subtotal</dt>
              <dd className="text-navy">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-navy/55">Shipping</dt>
              <dd className="text-navy">
                {order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}
              </dd>
            </div>
            <div className="border-navy/10 text-navy flex justify-between gap-4 border-t pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <aside className="bg-navy text-ivory rounded-xl p-5 shadow-[0_12px_35px_rgba(13,35,70,0.12)] sm:p-7">
          <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
            Delivering to
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold">{order.address.fullName}</h2>
          <p className="text-ivory/70 mt-3 text-sm leading-relaxed font-light">
            {order.address.addressLine1}
            {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
            <br />
            {order.address.city}, {order.address.state} {order.address.postalCode}
            <br />
            {order.address.phone}
          </p>

          <div className="border-ivory/15 mt-6 border-t pt-5">
            <p className="text-ivory/55 text-xs leading-relaxed">
              {order.trackingUrl
                ? "Your shipment is ready to track."
                : "We’ll email your tracking link as soon as the order is dispatched."}
            </p>
            <div className="mt-5 grid gap-2">
              {preview ? (
                <span
                  aria-disabled="true"
                  className="bg-gold text-navy cursor-default rounded-[2px] px-5 py-3 text-center text-[11px] font-semibold tracking-[0.14em] uppercase"
                >
                  View order status
                </span>
              ) : (
                <Link
                  href={`/order/${order.id}`}
                  className="bg-gold text-navy hover:bg-gold-lt rounded-[2px] px-5 py-3 text-center text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                >
                  View order status
                </Link>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ivory/35 text-ivory hover:border-gold hover:text-gold rounded-[2px] border px-5 py-3 text-center text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                >
                  Track shipment
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-center text-[11px] font-semibold tracking-[0.12em] uppercase">
        <Link href="/shop" className="text-amber hover:text-navy transition-colors">
          Continue shopping →
        </Link>
        <Link href={LAB_REPORTS_PATH} className="text-navy/55 hover:text-amber transition-colors">
          View lab reports
        </Link>
      </div>
    </div>
  );
}

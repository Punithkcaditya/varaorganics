import Link from "next/link";
import { listOrders } from "@/features/orders/store";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders(200);

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-navy">Orders</h1>

      {orders.length === 0 ? (
        <p className="rounded border border-navy/10 bg-white p-6 text-sm text-navy/55">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-navy/10 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3">Customer</th>
                <th scope="col" className="px-4 py-3">Placed</th>
                <th scope="col" className="px-4 py-3">Batch</th>
                <th scope="col" className="px-4 py-3">Payment</th>
                <th scope="col" className="px-4 py-3">Fulfilment</th>
                <th scope="col" className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/order/${o.id}`} className="font-medium text-navy hover:text-amber">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    {o.address.fullName}
                    <span className="block text-xs text-navy/45">{o.address.city}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/65">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-navy/65">
                    {o.batchNumber ? (
                      <Link
                        href={`/admin/batch-lookup?batch=${encodeURIComponent(o.batchNumber)}`}
                        className="text-amber hover:underline"
                      >
                        {o.batchNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={o.paymentStatus === "paid" ? "success" : "muted"}>
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={o.fulfillmentStatus === "failed" ? "amber" : "muted"}>
                      {o.fulfillmentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-navy">
                    {formatPrice(o.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

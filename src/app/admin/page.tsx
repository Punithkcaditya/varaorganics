import Link from "next/link";
import { getDashboardSnapshot } from "@/features/reports/service";
import { getInventoryStatus } from "@/features/inventory/service";
import { listOrders } from "@/features/orders/store";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

// The first page the operator opens each morning — always fresh.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-navy/10 bg-white p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-navy/45">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-navy">{value}</p>
      {sub && <p className="mt-1 text-xs font-light text-navy/50">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [snapshot, inventory, orders] = await Promise.all([
    getDashboardSnapshot(),
    getInventoryStatus(),
    listOrders(8),
  ]);
  const lowStock = inventory.filter((i) => i.needsReorder);

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-navy">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today"
          value={formatPrice(snapshot.today.revenue)}
          sub={`${snapshot.today.orders} order${snapshot.today.orders === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Last 7 days"
          value={formatPrice(snapshot.week.revenue)}
          sub={`${snapshot.week.orders} order${snapshot.week.orders === 1 ? "" : "s"}`}
        />
        <StatCard
          label="This month"
          value={formatPrice(snapshot.month.revenue)}
          sub={`${snapshot.month.orders} orders · AOV ${formatPrice(snapshot.averageOrderValue)}`}
        />
        <StatCard
          label="Pending payment"
          value={String(snapshot.pendingPayment)}
          sub={snapshot.topProduct ? `Top seller: ${snapshot.topProduct}` : "No sales yet"}
        />
      </div>

      {(lowStock.length > 0 || snapshot.failedFulfilment > 0) && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {lowStock.length > 0 && (
            <div className="rounded border border-warning/30 bg-warning/5 p-5">
              <h2 className="mb-2 font-serif text-lg font-semibold text-warning">
                {lowStock.length} item{lowStock.length === 1 ? "" : "s"} need reordering
              </h2>
              <ul className="space-y-1 text-sm text-navy/70">
                {lowStock.slice(0, 5).map((i) => (
                  <li key={i.variantId} className="flex justify-between gap-3">
                    <span>
                      {i.productName} · {i.size}
                    </span>
                    <span className="font-medium">
                      {i.stock} left (reorder at {i.reorderPoint})
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/inventory" className="mt-3 inline-block text-xs text-amber underline">
                Manage inventory →
              </Link>
            </div>
          )}
          {snapshot.failedFulfilment > 0 && (
            <div className="rounded border border-danger/30 bg-danger/5 p-5">
              <h2 className="mb-2 font-serif text-lg font-semibold text-danger">
                {snapshot.failedFulfilment} failed delivery/shipment
              </h2>
              <p className="text-sm text-navy/70">
                Orders whose shipment failed or were marked undelivered. Retry from the order list.
              </p>
              <Link href="/admin/orders" className="mt-3 inline-block text-xs text-amber underline">
                View orders →
              </Link>
            </div>
          )}
        </div>
      )}

      <section aria-label="Recent orders">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-navy">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-amber underline">
            All orders →
          </Link>
        </div>
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
                  <th scope="col" className="px-4 py-3">Placed</th>
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
                      <span className="block text-xs text-navy/45">{o.email}</span>
                    </td>
                    <td className="px-4 py-3 text-navy/65">{formatDate(o.createdAt)}</td>
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
      </section>
    </div>
  );
}

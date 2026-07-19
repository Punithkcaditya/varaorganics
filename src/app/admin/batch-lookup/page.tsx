import Link from "next/link";
import { findOrdersByBatch } from "@/features/orders/store";
import { getAllActiveBatches } from "@/features/batches/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Batch → customers lookup. If a quality issue arises with a batch, this shows
 * every order dispatched with it so affected customers can be contacted
 * proactively (Tech Stack doc — critical for a food brand).
 */
export default async function BatchLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const { batch } = await searchParams;
  const query = batch?.trim() ?? "";
  const [orders, batches] = await Promise.all([
    query ? findOrdersByBatch(query) : Promise.resolve([]),
    getAllActiveBatches(),
  ]);

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Batch lookup</h1>
      <p className="mb-6 text-sm text-navy/60">
        Enter a batch number to see every order it shipped with.
      </p>

      <form method="get" className="mb-8 flex flex-wrap gap-3">
        <label htmlFor="batch" className="sr-only">
          Batch number
        </label>
        <input
          id="batch"
          name="batch"
          defaultValue={query}
          placeholder="e.g. GHE-2024-047"
          className="w-full max-w-xs rounded-[2px] border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
        />
        <button
          type="submit"
          className="rounded-[2px] bg-navy px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-amber"
        >
          Look up
        </button>
      </form>

      {batches.length > 0 && (
        <p className="mb-8 text-xs text-navy/50">
          Active batches:{" "}
          {batches.map(({ batch: b }, i) => (
            <span key={b.id}>
              {i > 0 && " · "}
              <Link
                href={`/admin/batch-lookup?batch=${encodeURIComponent(b.batchNumber)}`}
                className="text-amber hover:underline"
              >
                {b.batchNumber}
              </Link>
            </span>
          ))}
        </p>
      )}

      {query && (
        <section aria-label={`Orders for batch ${query}`}>
          <h2 className="mb-3 font-serif text-xl font-semibold text-navy">
            {orders.length} order{orders.length === 1 ? "" : "s"} shipped with {query}
          </h2>
          {orders.length === 0 ? (
            <p className="rounded border border-navy/10 bg-white p-6 text-sm text-navy/55">
              No orders recorded for this batch.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-navy/10 bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
                    <th scope="col" className="px-4 py-3">Order</th>
                    <th scope="col" className="px-4 py-3">Customer</th>
                    <th scope="col" className="px-4 py-3">Contact</th>
                    <th scope="col" className="px-4 py-3">Placed</th>
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
                      <td className="px-4 py-3 text-navy/75">{o.address.fullName}</td>
                      <td className="px-4 py-3 text-xs text-navy/60">
                        {o.email}
                        <span className="block">{o.address.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-navy/65">{formatDate(o.createdAt)}</td>
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
      )}
    </div>
  );
}

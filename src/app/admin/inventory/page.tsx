import { getInventoryStatus } from "@/features/inventory/service";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const inventory = await getInventoryStatus();
  const low = inventory.filter((i) => i.needsReorder);

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Inventory</h1>
      <p className="mb-6 text-sm text-navy/60">
        Stock decrements automatically on every paid order. Items at or below their reorder point
        trigger an email + WhatsApp alert.
      </p>

      {low.length > 0 && (
        <p className="mb-6 rounded border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          {low.length} item{low.length === 1 ? "" : "s"} at or below reorder point.
        </p>
      )}

      <div className="overflow-x-auto rounded border border-navy/10 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
              <th scope="col" className="px-4 py-3">Product</th>
              <th scope="col" className="px-4 py-3">SKU</th>
              <th scope="col" className="px-4 py-3 text-right">In stock</th>
              <th scope="col" className="px-4 py-3 text-right">Reorder at</th>
              <th scope="col" className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.variantId} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3 text-navy/80">
                  {i.productName}
                  <span className="block text-xs text-navy/45">{i.size}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-navy/60">{i.sku}</td>
                <td className="px-4 py-3 text-right font-medium text-navy">{i.stock}</td>
                <td className="px-4 py-3 text-right text-navy/60">{i.reorderPoint}</td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={i.needsReorder ? "amber" : "success"}>
                    {i.needsReorder ? "Reorder" : "OK"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-navy/45">
        Reorder points are stored in the <code>inventory</code> table (default 10). Adjust them there
        or via the Supabase dashboard.
      </p>
    </div>
  );
}

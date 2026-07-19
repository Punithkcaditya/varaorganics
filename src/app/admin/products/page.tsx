import Link from "next/link";
import { getAllProducts } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Products</h1>
      <p className="mb-6 text-sm text-navy/60">
        Edit copy, prices, stock and visibility. Slugs and SKUs are fixed — they&apos;re used by SEO
        URLs and past orders.
      </p>

      <div className="overflow-x-auto rounded border border-navy/10 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
              <th scope="col" className="px-4 py-3">Product</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Sizes</th>
              <th scope="col" className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.slug}`} className="font-medium text-navy hover:text-amber">
                    {p.productName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy/65">{p.category}</td>
                <td className="px-4 py-3 text-navy/65">
                  {p.variants
                    .filter((v) => v.active)
                    .map((v) => `${v.size} ${formatPrice(v.price)}`)
                    .join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={p.active ? "success" : "muted"}>{p.active ? "Live" : "Hidden"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

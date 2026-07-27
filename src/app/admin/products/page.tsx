import Link from "next/link";
import { getAllProducts } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CreateProductForm } from "@/components/admin/CreateProductForm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold text-navy">Products</h1>
        <a href="#add-product" className="rounded-[2px] bg-navy px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-amber">+ Add product</a>
      </div>
      <p className="mb-6 text-sm text-navy/60">Edit copy, prices, stock and visibility. Existing slugs and SKUs stay fixed because past orders and SEO URLs use them.</p>

      <div className="overflow-x-auto rounded border border-navy/10 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead><tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
            <th scope="col" className="px-4 py-3">Product</th><th scope="col" className="px-4 py-3">Category</th><th scope="col" className="px-4 py-3">Sizes</th><th scope="col" className="px-4 py-3 text-right">Status</th><th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} className="border-b border-navy/5 last:border-0">
              <td className="px-4 py-3"><Link href={`/admin/products/${p.slug}`} className="font-medium text-navy hover:text-amber">{p.productName}</Link></td>
              <td className="px-4 py-3 text-navy/65">{p.category}</td>
              <td className="px-4 py-3 text-navy/65">{p.variants.filter((v) => v.active).map((v) => `${v.size} ${formatPrice(v.price)}`).join(" · ") || "—"}</td>
              <td className="px-4 py-3 text-right"><Badge tone={p.active ? "success" : "muted"}>{p.active ? "Live" : "Hidden"}</Badge></td>
              <td className="px-4 py-3 text-right"><Link href={`/admin/products/${p.slug}`} className="font-semibold text-amber hover:underline">Edit</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <section id="add-product" className="mt-10 scroll-mt-6">
        <h2 className="mb-2 font-serif text-2xl font-semibold text-navy">Add product</h2>
        <p className="mb-4 text-sm text-navy/60">New products start hidden so you can finish editing before making them live.</p>
        <CreateProductForm />
      </section>
    </div>
  );
}
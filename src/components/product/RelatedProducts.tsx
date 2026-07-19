import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

/** Related products — 3 from the same collection (Dev Kit §08). */
export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-label="Related products">
      <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">You may also like</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

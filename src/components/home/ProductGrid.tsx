import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

/**
 * Home product grid — uniform dense layout matching the shop listing (same
 * ProductCard). Products come from Supabase (server); the data layer's mock
 * fallback guarantees content, and the empty state is handled below.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Section tone="white" ariaLabel="Our products">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>Our Products</Eyebrow>
          <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] font-semibold leading-tight text-navy">
            Made the way it <em className="italic text-amber">always should be</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="whitespace-nowrap border-b border-amber pb-0.5 text-xs font-medium uppercase tracking-[0.16em] text-amber"
        >
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-navy/60">Products are being restocked. Please check back shortly.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              tag={product.featured ? "Bestseller" : i === 1 ? "New" : undefined}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

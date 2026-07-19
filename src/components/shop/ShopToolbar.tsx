"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { getDisplayVariant } from "@/features/products/helpers";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const categories: { label: string; href: string; key: Category | "all" }[] = [
  { label: "All", href: "/shop", key: "all" },
  { label: "Ghee", href: "/shop/ghee", key: "ghee" },
  { label: "Honey", href: "/shop/honey", key: "honey" },
  { label: "Oils", href: "/shop/oils", key: "oils" },
];

/**
 * Dense product listing with a category filter bar + sort control (matching the
 * reference layout), rendered in Vara's palette/typography. Sorting is
 * client-side; category filtering navigates to the collection routes so each
 * stays server-rendered and indexable.
 */
export function ShopToolbar({
  products,
  activeCategory = "all",
}: {
  products: Product[];
  activeCategory?: Category | "all";
}) {
  const [sort, setSort] = useState<SortValue>("featured");

  const sorted = useMemo(() => {
    const copy = [...products];
    switch (sort) {
      case "price-asc":
        return copy.sort((a, b) => getDisplayVariant(a).price - getDisplayVariant(b).price);
      case "price-desc":
        return copy.sort((a, b) => getDisplayVariant(b).price - getDisplayVariant(a).price);
      case "name":
        return copy.sort((a, b) => a.productName.localeCompare(b.productName));
      default:
        return copy;
    }
  }, [products, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y border-navy/10 py-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              aria-current={c.key === activeCategory ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
                c.key === activeCategory
                  ? "border-navy bg-navy text-ivory"
                  : "border-navy/15 text-navy/60 hover:border-navy hover:text-navy",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-navy/50">
            {sorted.length} product{sorted.length === 1 ? "" : "s"}
          </span>
          <label className="flex items-center gap-2 text-xs text-navy/60">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="rounded-[2px] border border-navy/15 bg-white px-2.5 py-1.5 text-xs text-navy outline-none focus:border-navy"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-16 text-center text-navy/60">
          No products in this collection yet. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/types";

interface CategoryLink {
  key: Category;
  label: string;
  count: number;
}

function CategoryIcon({ category }: { category?: Category }) {
  if (category === "ghee") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.6">
        <path d="M7 7h10l1 3v10H6V10l1-3Z" />
        <path d="M8 4h8v3H8zM9 13h6M9 16h6" />
      </svg>
    );
  }
  if (category === "honey") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.6">
        <path d="M8 5h8l1 4-2 11H9L7 9l1-4Z" />
        <path d="M8 9h8M9 13h6M10 17h4" />
      </svg>
    );
  }
  if (category === "oils") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.6">
        <path d="M9 3h6v4l2 3v10H7V10l2-3V3Z" />
        <path d="M9 7h6M9 13h6M9 16h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.6">
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7M12 11v10" />
    </svg>
  );
}

/** Appears after the homepage hero leaves view and links to live collections. */
export function CategoryQuickNav({ categories }: { categories: CategoryLink[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry ? !entry.isIntersecting : false),
      { rootMargin: "-68px 0px 0px", threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Shop by product category"
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-[68px] z-[190] border-y border-gold/25 bg-navy text-ivory shadow-card transition duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-stretch overflow-x-auto px-3 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
        <Link
          href="/shop"
          className="group flex min-w-fit flex-1 items-center justify-center gap-2.5 border-r border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/10 md:justify-start"
        >
          <span className="text-gold-lt"><CategoryIcon /></span>
          <span>All products</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.key}
            href={`/shop/${category.key}`}
            className="group flex min-w-fit flex-1 items-center justify-center gap-2.5 border-r border-white/10 px-5 py-3.5 transition-colors last:border-r-0 hover:bg-white/10"
          >
            <span className="text-gold-lt"><CategoryIcon category={category.key} /></span>
            <span>
              <span className="block whitespace-nowrap font-serif text-lg font-semibold leading-none">{category.label}</span>
              <span className="mt-0.5 hidden text-[9px] uppercase tracking-[0.12em] text-ivory/50 sm:block">
                {category.count} product{category.count === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

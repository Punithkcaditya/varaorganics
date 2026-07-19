import Link from "next/link";
import { ArticleCard } from "./ArticleCard";
import type { Article, Product } from "@/types";

/** Contextual product CTA at the end of an article (Learn Brief §05/§06). */
export function ProductCTA({ product, path }: { product: Product; path: string }) {
  return (
    <aside className="rounded border border-navy/10 bg-paper/50 p-6" aria-label="Related product">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber">
        From the Vara range
      </p>
      <h2 className="mb-2 font-serif text-xl font-semibold text-navy">{product.productName}</h2>
      <p className="mb-4 text-sm font-light leading-relaxed text-navy/65">
        {product.shortDescription}
      </p>
      <Link
        href={path}
        className="inline-flex rounded-[2px] bg-navy px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-amber"
      >
        Read the lab report for our current batch
      </Link>
    </aside>
  );
}

/** Three related articles from the same category (Learn Brief §05). */
export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section aria-label="Related articles">
      <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">Keep reading</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

/** Back-to-hub link (Learn Brief §05 — spoke → hub authority). */
export function BackToLearn() {
  return (
    <Link
      href="/learn"
      className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-amber"
    >
      ← Back to Learn
    </Link>
  );
}

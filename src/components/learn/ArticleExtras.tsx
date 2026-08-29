import Link from "next/link";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { ArticleCard } from "./ArticleCard";
import type { Article, Product } from "@/types";

/** Contextual product CTA at the end of an article (Learn Brief §05/§06). */
export function ProductCTA({ product, path }: { product: Product; path: string }) {
  return (
    <aside className="border-navy/10 bg-paper/50 rounded border p-6" aria-label="Related product">
      <p className="text-amber mb-1 text-xs font-medium tracking-[0.14em] uppercase">
        From the Vara range
      </p>
      <h2 className="text-navy mb-2 font-serif text-xl font-semibold">{product.productName}</h2>
      <p className="text-navy/65 mb-4 text-sm leading-relaxed font-light">
        {product.shortDescription}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={LAB_REPORTS_PATH}
          className="bg-navy text-ivory hover:bg-amber inline-flex rounded-[2px] px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
        >
          Read the lab reports
        </Link>
        <Link href={path} className="text-amber text-xs font-medium tracking-[0.12em] uppercase">
          View product →
        </Link>
      </div>
    </aside>
  );
}

/** Three related articles from the same category (Learn Brief §05). */
export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section aria-label="Related articles">
      <h2 className="text-navy mb-6 font-serif text-2xl font-semibold">Keep reading</h2>
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
      className="text-amber inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] uppercase"
    >
      ← Back to Learn
    </Link>
  );
}

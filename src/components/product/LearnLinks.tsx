import Link from "next/link";
import type { Article } from "@/types";

/**
 * "Learn more" links to relevant /learn articles (Learn Brief §06 — Product →
 * Learn internal linking). Anchor text is the article title, never "read more".
 */
export function LearnLinks({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section aria-label="Learn more" className="rounded border border-navy/10 bg-navy px-6 py-7">
      <h2 className="mb-4 font-serif text-xl font-semibold text-gold-lt">Learn more</h2>
      <ul className="space-y-2.5">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/learn/${a.slug}`}
              className="text-[15px] font-light text-ivory/80 underline-offset-4 hover:text-gold-lt hover:underline"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

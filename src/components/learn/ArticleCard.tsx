import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/utils";
import type { Article } from "@/types";

/**
 * Article card. The anchor text is the article TITLE (never "read more") for
 * internal-link SEO (Learn Brief §04).
 */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded border border-navy/10 bg-white">
      <Link href={`/learn/${article.slug}`} className="relative block aspect-[16/9]" tabIndex={-1} aria-hidden="true">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute left-3 top-3">
          <Badge tone="amber">{categoryLabel(article.category)}</Badge>
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 font-serif text-lg font-semibold text-navy">
          <Link href={`/learn/${article.slug}`} className="hover:text-amber">
            {article.title}
          </Link>
        </h3>
        <p className="mb-4 line-clamp-2 text-sm font-light leading-relaxed text-navy/60">
          {article.excerpt}
        </p>
        <p className="mt-auto text-xs font-light text-navy/45">{article.readTime} min read</p>
      </div>
    </article>
  );
}

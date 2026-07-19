import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Markdown, extractH1Headings } from "@/components/learn/Markdown";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { ProductCTA, RelatedArticles, BackToLearn } from "@/components/learn/ArticleExtras";
import { JsonLd } from "@/components/schema/JsonLd";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
} from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import {
  getArticleBySlug,
  getPublishedSlugs,
  getRelatedArticles,
} from "@/features/articles/queries";
import { findByRouteSlug } from "@/features/products/queries";
import { categoryLabel, formatDate } from "@/lib/utils";

// Known published articles are statically generated; new ones render on-demand
// then cache (Learn Brief §05). Revalidation happens via the webhook endpoint.
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    path: `learn/${slug}`,
    ogImage: article.coverImage ?? undefined,
    type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, relatedProduct] = await Promise.all([
    getRelatedArticles(article),
    article.relatedProduct ? findByRouteSlug(article.relatedProduct) : Promise.resolve(null),
  ]);

  const path = `learn/${slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
    { name: article.title, path: `/${path}` },
  ];
  const howToSteps = article.enableHowtoSchema ? extractH1Headings(article.bodyMarkdown) : [];

  return (
    <>
      <JsonLd data={articleSchema(article, path)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {article.faqs.length > 0 && <JsonLd data={faqSchema(article.faqs)} />}
      {article.enableHowtoSchema && howToSteps.length > 0 && (
        <JsonLd data={howToSchema(article, howToSteps, path)} />
      )}

      <Container className="py-8 md:py-12">
        <Breadcrumb crumbs={crumbs} />

        <article className="mx-auto mt-6 max-w-[760px]">
          <header className="mb-8">
            <div className="mb-4">
              <Badge tone="amber">{categoryLabel(article.category)}</Badge>
            </div>
            <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
              {article.title}
            </h1>
            <p className="text-sm font-light text-navy/50">
              {article.readTime} min read · Published {formatDate(article.createdAt)}
            </p>
            {article.coverImage && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded border border-navy/10">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            )}
          </header>

          {/* Markdown headings map # → H2, ## → H3, ### → H4 (offset 1). */}
          <Markdown content={article.bodyMarkdown} headingOffset={1} />

          {article.faqs.length > 0 && (
            <section aria-label="Frequently asked questions" className="mt-12">
              <h2 className="mb-4 font-serif text-2xl font-semibold text-navy">
                Frequently asked questions
              </h2>
              <Accordion items={article.faqs} />
            </section>
          )}

          {relatedProduct && (
            <div className="mt-12">
              <ProductCTA product={relatedProduct.product} path={relatedProduct.path} />
            </div>
          )}

          <div className="mt-12">
            <BackToLearn />
          </div>
        </article>

        <div className="mt-16">
          <RelatedArticles articles={related} />
        </div>
      </Container>
    </>
  );
}

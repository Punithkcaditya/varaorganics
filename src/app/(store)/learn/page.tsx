import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { ArticleCard } from "@/components/learn/ArticleCard";
import { VerifyCTA } from "@/components/learn/VerifyCTA";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, collectionPageSchema, faqSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getArticlesByCategory, getPublishedArticles } from "@/features/articles/queries";
import { hubFaqs } from "@/data/articles";
import type { Category } from "@/types";

// Learn hub: ISR, revalidate every 300s (Learn Brief §04).
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Learn About A2 Ghee, Raw Honey & Wood Pressed Oils",
  description:
    "Guides to A2 Gir cow bilona ghee, wood-pressed oils and raw wild honey — what they are, how they're made, and how to verify purity.",
  path: "learn",
});

const sections: { category: Category; heading: string }[] = [
  { category: "ghee", heading: "Ghee — The Complete Guide" },
  { category: "oils", heading: "Wood Pressed Oils — Know the Difference" },
  { category: "honey", heading: "Raw Honey — What Pure Really Means" },
];

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Learn", path: "/learn" },
];

export default async function LearnHubPage() {
  const [grouped, all] = await Promise.all([getArticlesByCategory(), getPublishedArticles()]);

  return (
    <Section tone="ivory" ariaLabel="Learn hub">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={collectionPageSchema(
          "Learn",
          "learn",
          all.map((a) => `learn/${a.slug}`),
        )}
      />
      <JsonLd data={faqSchema(hubFaqs)} />

      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4 max-w-[720px]">
        <Eyebrow>The Vara Learn Hub</Eyebrow>
        <h1 className="mb-4 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
          Everything you need to know about pure A2 ghee, raw honey and wood-pressed oils
        </h1>
        <p className="text-base font-light leading-relaxed text-navy/65">
          Clear, honest guides to traditional Indian foods — how they&apos;re made, what the labels
          really mean, and how to verify purity for yourself.
        </p>
      </div>

      <div className="mt-14 space-y-16">
        {sections.map(({ category, heading }) => {
          const items = grouped[category];
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">{heading}</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {items.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16">
        <VerifyCTA />
      </div>

      <div className="mt-16 max-w-[760px]">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-navy">Frequently asked questions</h2>
        <Accordion items={hubFaqs} />
      </div>
    </Section>
  );
}

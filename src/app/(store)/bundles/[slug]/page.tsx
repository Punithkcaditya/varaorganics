import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Gallery } from "@/components/product/Gallery";
import { BundleAddToCart } from "@/components/product/BundleAddToCart";
import { Markdown } from "@/components/learn/Markdown";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getBundle } from "@/features/products/queries";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ slug: "wellness-starter" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) return {};
  return buildMetadata({
    title: bundle.metaTitle ?? bundle.productName,
    description: bundle.metaDescription ?? bundle.shortDescription,
    path: `bundles/${slug}`,
    ogImage: bundle.images[0]?.url,
  });
}

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: bundle.productName, path: `/bundles/${slug}` },
  ];

  return (
    <Container className="py-8 md:py-12">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {bundle.faqs.length > 0 && <JsonLd data={faqSchema(bundle.faqs)} />}
      <Breadcrumb crumbs={crumbs} />

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <Gallery images={bundle.images} productName={bundle.productName} />
        <div>
          <h1 className="mb-3 font-serif text-[clamp(1.875rem,3.5vw,2.75rem)] font-semibold leading-tight text-navy">
            {bundle.productName}
          </h1>
          <p className="mb-6 text-base font-light leading-relaxed text-navy/70">
            {bundle.shortDescription}
          </p>
          <BundleAddToCart bundle={bundle} />
        </div>
      </div>

      <div className="mt-16 max-w-[760px] space-y-12">
        <Markdown content={bundle.longDescription} />
        {bundle.faqs.length > 0 && (
          <section aria-label="Frequently asked questions">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-navy">
              Frequently asked questions
            </h2>
            <Accordion items={bundle.faqs} />
          </section>
        )}
      </div>
    </Container>
  );
}

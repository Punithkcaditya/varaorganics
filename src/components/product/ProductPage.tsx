import { Container } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Gallery } from "./Gallery";
import { PurchasePanel } from "./PurchasePanel";
import { BatchInfo } from "./BatchInfo";
import { NutritionTable } from "./NutritionTable";
import { RelatedProducts } from "./RelatedProducts";
import { LearnLinks } from "./LearnLinks";
import { Markdown } from "@/components/learn/Markdown";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/schema/JsonLd";
import {
  breadcrumbSchema,
  productSchema,
  faqSchema,
} from "@/components/schema/builders";
import { getRelatedProducts } from "@/features/products/queries";
import { getArticlesBySlugs } from "@/features/articles/queries";
import { categoryLabel } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

/** Full product detail page shared by /ghee, /honey, /oils (thin wrappers). */
export async function ProductPage({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant;
}) {
  const path = `${product.routePrefix}/${variant.routeSlug}`;
  const [related, learnArticles] = await Promise.all([
    getRelatedProducts(product),
    getArticlesBySlugs(product.learnLinks),
  ]);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: categoryLabel(product.category), path: `/shop/${product.category}` },
    { name: product.productName, path: `/${path}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={productSchema(product, variant, path)} />
      {product.faqs.length > 0 && <JsonLd data={faqSchema(product.faqs)} />}

      <Container className="py-8 md:py-12">
        <Breadcrumb crumbs={crumbs} />

        {/* Above the fold */}
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <Gallery images={product.images} productName={product.productName} />
          <div>
            <h1 className="mb-3 font-serif text-[clamp(1.875rem,3.5vw,2.75rem)] font-semibold leading-tight text-navy">
              {product.productName}
            </h1>
            <p className="mb-6 text-base font-light leading-relaxed text-navy/70">
              {product.shortDescription}
            </p>
            <PurchasePanel product={product} initialVariantId={variant.id} />
          </div>
        </div>

        {/* Below the fold */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            <div>
              <h2 className="sr-only">Product description</h2>
              <Markdown content={product.longDescription} />
            </div>
            {product.currentBatch && <BatchInfo batch={product.currentBatch} />}
            {product.ingredients && (
              <section aria-label="Ingredients">
                <h2 className="mb-2 font-serif text-2xl font-semibold text-navy">Ingredients</h2>
                <p className="text-[15px] font-light leading-relaxed text-navy/75">
                  {product.ingredients}
                </p>
              </section>
            )}
            {product.nutritionalInfo && <NutritionTable info={product.nutritionalInfo} />}
            {product.faqs.length > 0 && (
              <section aria-label="Frequently asked questions">
                <h2 className="mb-4 font-serif text-2xl font-semibold text-navy">
                  Frequently asked questions
                </h2>
                <Accordion items={product.faqs} />
              </section>
            )}
          </div>
          <aside className="space-y-8">
            <LearnLinks articles={learnArticles} />
          </aside>
        </div>

        <div className="mt-16">
          <RelatedProducts products={related} />
        </div>
      </Container>
    </>
  );
}

/** Shared metadata builder for product routes. */
export function productMetaDescription(product: Product): string {
  return product.metaDescription ?? product.shortDescription;
}

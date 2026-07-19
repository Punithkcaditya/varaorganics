import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, collectionPageSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getStoreProducts } from "@/features/products/queries";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Shop All — Ghee, Honey & Wood-Pressed Oils",
  description:
    "Shop Vara Organics: A2 Gir Cow Bilona ghee, raw wild forest honey and wood-pressed oils. Every batch NABL lab-tested and QR-traceable.",
  path: "shop",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
];

export default async function ShopPage() {
  const products = await getStoreProducts();
  return (
    <Section tone="ivory" ariaLabel="Shop all products">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={collectionPageSchema(
          "Shop All",
          "shop",
          products.map((p) => `${p.routePrefix}/${p.variants.find((v) => v.routeSlug)?.routeSlug ?? p.slug}`),
        )}
      />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4">
        <Eyebrow>Our Products</Eyebrow>
        <h1 className="mb-8 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
          Everything, <em className="italic text-amber">made honestly</em>
        </h1>
      </div>
      <ShopToolbar products={products} activeCategory="all" />
    </Section>
  );
}

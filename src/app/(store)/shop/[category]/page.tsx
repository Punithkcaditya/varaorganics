import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, collectionPageSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getProductsByCategory } from "@/features/products/queries";
import { categoryLabel } from "@/lib/utils";
import type { Category } from "@/types";

export const revalidate = 300;

const CATEGORIES: Category[] = ["ghee", "honey", "oils"];

const copy: Record<Category, { title: string; blurb: string }> = {
  ghee: {
    title: "A2 Gir Cow Bilona Ghee",
    blurb: "Hand-churned by the bilona method. NABL lab-tested, batch-traced.",
  },
  honey: {
    title: "Raw Wild Forest Honey",
    blurb: "Wild-harvested, unheated and pollen-rich. Raw honey the way bees make it.",
  },
  oils: {
    title: "Wood-Pressed Oils",
    blurb: "Extracted on traditional wooden ghanis. Unrefined, full-flavoured.",
  },
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!CATEGORIES.includes(category as Category)) return {};
  const c = copy[category as Category];
  return buildMetadata({
    title: `${c.title} | Shop`,
    description: c.blurb,
    path: `shop/${category}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.includes(category as Category)) notFound();
  const cat = category as Category;
  const products = await getProductsByCategory(cat);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: categoryLabel(cat), path: `/shop/${cat}` },
  ];

  return (
    <Section tone="ivory" ariaLabel={`${copy[cat].title} collection`}>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={collectionPageSchema(
          copy[cat].title,
          `shop/${cat}`,
          products.map((p) => `${p.routePrefix}/${p.variants.find((v) => v.routeSlug)?.routeSlug ?? p.slug}`),
        )}
      />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4">
        <Eyebrow>{categoryLabel(cat)}</Eyebrow>
        <h1 className="mb-2 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
          {copy[cat].title}
        </h1>
        <p className="mb-8 max-w-[540px] text-base font-light text-navy/65">{copy[cat].blurb}</p>
      </div>
      <ShopToolbar products={products} activeCategory={cat} />
    </Section>
  );
}

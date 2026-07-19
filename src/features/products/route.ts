import "server-only";
import type { Metadata } from "next";
import { buildMetadata } from "@/components/seo/metadata";
import { getRouteSlugsForPrefix, resolveProductRoute, mockActiveRouteSlugs } from "./queries";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import type { Category } from "@/types";

/** Shared generateStaticParams for a product route prefix (ghee/honey/oils). */
export async function productStaticParams(prefix: Category): Promise<{ slug: string }[]> {
  // Prefer the mock catalog at build time when in mock mode (no DB reachable).
  const slugs = USE_MOCK_DATA ? mockActiveRouteSlugs(prefix) : await getRouteSlugsForPrefix(prefix);
  return slugs.map((slug) => ({ slug }));
}

/** Shared generateMetadata for a product route. */
export async function productMetadata(prefix: Category, slug: string): Promise<Metadata> {
  const resolved = await resolveProductRoute(prefix, slug);
  if (!resolved) return {};
  const { product, variant } = resolved;
  const title = product.metaTitle ?? `${product.productName} — ${variant.size}`;
  const description = product.metaDescription ?? product.shortDescription;
  return buildMetadata({
    title,
    description,
    path: `${prefix}/${slug}`,
    ogImage: product.images[0] ? `${product.images[0].url}` : undefined,
    type: "website",
  });
}

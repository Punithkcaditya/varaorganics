import type { MetadataRoute } from "next";
import { canonical } from "@/config/site";
import { getStoreProducts } from "@/features/products/queries";
import { getPublishedArticles } from "@/features/articles/queries";
import { LAB_REPORTS_PATH } from "@/config/routes";

/**
 * Sitemap (§16). Includes static pages, product URLs and published Learn
 * articles. Excludes /api, /order-confirmed, /cart, /checkout and noindex /lp
 * landing pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([getStoreProducts(), getPublishedArticles()]);

  const staticPaths = [
    "",
    "shop",
    "shop/ghee",
    "shop/honey",
    "shop/oils",
    "combos",
    "bundles/wellness-starter",
    "our-story",
    LAB_REPORTS_PATH.slice(1),
    "faqs",
    "contact",
    "learn",
    "b2b",
    "privacy",
    "shipping",
    "returns",
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: canonical(path),
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    product.variants
      .filter((v) => v.active && v.routeSlug)
      .map((v) => ({
        url: canonical(`${product.routePrefix}/${v.routeSlug}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })),
  );

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: canonical(`learn/${a.slug}`),
    lastModified: new Date(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...articleEntries];
}

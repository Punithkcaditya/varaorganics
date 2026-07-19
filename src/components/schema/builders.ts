import { site, canonical } from "@/config/site";
import type { Article, FaqItem, Product, ProductBatch, ProductVariant } from "@/types";

/**
 * JSON-LD builders. Values are structural; marketing-owned copy comes from the
 * DB. NOTE: aggregateRating is intentionally omitted until genuine reviews
 * exist (no fake ratings — Dev Kit checklist). No unsupported medical claims.
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/placeholders/og-default.svg`,
    description: site.description,
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonical(c.path),
    })),
  };
}

export function productSchema(product: Product, variant: ProductVariant, path: string) {
  const inStock = variant.stock > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.productName} — ${variant.size}`,
    description: product.shortDescription,
    sku: variant.sku,
    image: product.images.map((i) => `${site.url}${i.url}`),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: variant.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: canonical(path),
      seller: { "@type": "Organization", name: site.legalName },
    },
    // aggregateRating intentionally omitted — see file header.
  };
}

export function batchProductSchema(product: Product, batch: ProductBatch, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.productName,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: site.name },
    url: canonical(path),
    productionDate: batch.mfgDate,
    expirationDate: batch.bestBefore,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Batch number", value: batch.batchNumber },
      ...batch.labParameters.map((p) => ({
        "@type": "PropertyValue",
        name: p.name,
        value: `${p.result} (${p.status})`,
      })),
    ],
  };
}

export function faqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleSchema(article: Article, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? `${site.url}${article.coverImage}` : undefined,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: site.name },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/placeholders/og-default.svg` },
    },
    mainEntityOfPage: canonical(path),
  };
}

/**
 * HowTo schema for how-to articles. Steps are derived from the `#`-level
 * markdown headings (which render as H2) — the article template passes them in.
 */
export function howToSchema(article: Article, steps: string[], path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.title,
    description: article.excerpt,
    step: steps.map((name, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name,
      url: `${canonical(path)}#step-${i + 1}`,
    })),
  };
}

export function collectionPageSchema(name: string, path: string, itemPaths: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: canonical(path),
    hasPart: itemPaths.map((p) => ({ "@type": "WebPage", url: canonical(p) })),
  };
}

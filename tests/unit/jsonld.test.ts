import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "@/lib/security/jsonld";
import {
  productSchema,
  faqSchema,
  breadcrumbSchema,
  organizationSchema,
} from "@/components/schema/builders";
import type { Product, ProductVariant } from "@/types";

describe("serializeJsonLd", () => {
  it("escapes characters that could break out of a script tag", () => {
    const out = serializeJsonLd({ evil: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c");
  });

  it("escapes ampersands and angle brackets", () => {
    const out = serializeJsonLd({ x: "a & b < c > d" });
    expect(out).toContain("\\u0026");
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
  });
});

describe("schema builders", () => {
  const variant: ProductVariant = {
    id: "v1",
    productId: "p1",
    size: "500ml",
    sku: "VARA-GHEE-500",
    price: 1399,
    compareAtPrice: null,
    stock: 5,
    unitLabel: "500ml",
    unitBase: 500,
    unitType: "ml",
    active: true,
    routeSlug: "a2-gir-cow-bilona-ghee-500ml",
  };
  const product = {
    id: "p1",
    productName: "A2 Gir Cow Bilona Ghee",
    slug: "a2-gir-cow-bilona-ghee",
    category: "ghee",
    routePrefix: "ghee",
    shortDescription: "Pure ghee.",
    images: [{ id: "i1", url: "/placeholders/ghee.svg", alt: "Ghee", position: 0 }],
  } as unknown as Product;

  it("builds Product schema with an INR offer and no aggregateRating", () => {
    const schema = productSchema(product, variant, "ghee/a2-gir-cow-bilona-ghee-500ml") as Record<
      string,
      unknown
    >;
    expect(schema["@type"]).toBe("Product");
    expect((schema.offers as Record<string, unknown>).priceCurrency).toBe("INR");
    expect((schema.offers as Record<string, unknown>).availability).toContain("InStock");
    expect(schema.aggregateRating).toBeUndefined();
  });

  it("marks out-of-stock availability", () => {
    const schema = productSchema(product, { ...variant, stock: 0 }, "x") as Record<string, unknown>;
    expect((schema.offers as Record<string, unknown>).availability).toContain("OutOfStock");
  });

  it("builds a FAQPage with one Question per pair", () => {
    const schema = faqSchema([{ question: "Q1", answer: "A1" }]) as Record<string, unknown>;
    expect(schema["@type"]).toBe("FAQPage");
    expect((schema.mainEntity as unknown[]).length).toBe(1);
  });

  it("builds a BreadcrumbList with positions", () => {
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]) as Record<string, unknown>;
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items[0]!.position).toBe(1);
    expect(items[1]!.position).toBe(2);
  });

  it("builds Organization schema", () => {
    const schema = organizationSchema() as Record<string, unknown>;
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Vara Organics");
  });
});

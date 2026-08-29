import { describe, it, expect } from "vitest";
import { catalog } from "@/data/catalog";

/**
 * Variant selection / pricing invariants on the seeded catalog. Guards the
 * ghee two-slug modeling (C3) and the "extras are inactive" rule (C8).
 */
describe("catalog variant pricing", () => {
  const ghee = catalog.find((p) => p.slug === "a2-gir-cow-bilona-ghee")!;

  it("prices each ghee size distinctly", () => {
    const v500 = ghee.variants.find((v) => v.size === "500ml")!;
    const v1l = ghee.variants.find((v) => v.size === "1L")!;
    expect(v500.price).toBe(1399);
    expect(v1l.price).toBe(2599);
    expect(v500.price).not.toBe(v1l.price);
  });

  it("gives both active ghee sizes their own indexable slug", () => {
    const active = ghee.variants.filter((v) => v.active);
    expect(active.map((v) => v.routeSlug).sort()).toEqual([
      "a2-gir-cow-bilona-ghee-1l",
      "a2-gir-cow-bilona-ghee-500ml",
    ]);
  });

  it("keeps design-only extras inactive (coconut, mustard honey)", () => {
    const coconut = catalog.find((p) => p.slug === "extra-virgin-coconut-oil")!;
    const mustard = catalog.find((p) => p.slug === "mustard-flower-honey")!;
    expect(coconut.active).toBe(false);
    expect(mustard.active).toBe(false);
  });

  it("never exposes a route slug on an inactive variant", () => {
    for (const product of catalog) {
      for (const variant of product.variants) {
        if (!variant.active) expect(variant.routeSlug).toBeNull();
      }
    }
  });
});

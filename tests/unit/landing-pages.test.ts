import { describe, it, expect } from "vitest";
import { landingPages } from "@/data/landing-pages";
import { catalog } from "@/data/catalog";

/**
 * Guards the two campaign pages: they must stay noindex, point at a real
 * product, and keep their section toggles consistent with the content present.
 */
describe("landing pages", () => {
  const bySlug = Object.fromEntries(landingPages.map((lp) => [lp.slug, lp]));

  it("ships both campaign pages from the copy doc", () => {
    expect(Object.keys(bySlug).sort()).toEqual(["ghee-bangalore", "pure-ghee-truth"]);
  });

  it("keeps every landing page noindex (paid traffic only)", () => {
    for (const lp of landingPages) expect(lp.noindex).toBe(true);
  });

  it("points each page at a real, purchasable variant", () => {
    const routeSlugs = catalog
      .flatMap((p) => p.variants)
      .filter((v) => v.active && v.routeSlug)
      .map((v) => v.routeSlug);
    for (const lp of landingPages) {
      expect(routeSlugs).toContain(lp.productSlug);
    }
  });

  it("only enables a section when its content exists", () => {
    for (const lp of landingPages) {
      if (lp.showComparison) expect(lp.comparisonRows.length).toBeGreaterThan(0);
      if (lp.showPainPoints) expect(lp.painPoints.length).toBeGreaterThan(0);
      if (lp.showProcess) expect(lp.processSteps.length).toBeGreaterThan(0);
      if (lp.showStory) expect(lp.storyCopy).toBeTruthy();
      if (lp.showHonest) expect(lp.honestCopy).toBeTruthy();
    }
  });

  it("marks exactly one row as 'us' in a comparison table", () => {
    for (const lp of landingPages) {
      if (!lp.showComparison) continue;
      expect(lp.comparisonRows.filter((r) => r.isUs)).toHaveLength(1);
    }
  });

  it("gives the Meta page its gold CTA and the search page its navy CTA", () => {
    expect(bySlug["pure-ghee-truth"]!.ctaButtonColor).toBe("gold");
    expect(bySlug["ghee-bangalore"]!.ctaButtonColor).toBe("navy");
  });
});

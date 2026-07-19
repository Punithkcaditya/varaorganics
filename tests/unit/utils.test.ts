import { describe, it, expect } from "vitest";
import { formatPrice, unitPrice, discountPercent, estimateReadTime } from "@/lib/utils";
import { canonical } from "@/config/site";

describe("price + unit helpers", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatPrice(1399)).toBe("₹1,399");
    expect(formatPrice(100000)).toBe("₹1,00,000");
  });

  it("computes unit price per ml/g", () => {
    expect(unitPrice(1399, 500, "ml")).toBe("₹2.8 / ml");
    expect(unitPrice(0, 0, "g")).toBeNull();
  });

  it("computes discount percentage only when compareAt is higher", () => {
    expect(discountPercent(1799, 1948)).toBe(8);
    expect(discountPercent(1799, 1799)).toBeNull();
    expect(discountPercent(1799, null)).toBeNull();
  });

  it("estimates read time at ~200wpm, min 1", () => {
    expect(estimateReadTime("word ".repeat(400))).toBe(2);
    expect(estimateReadTime("short")).toBe(1);
  });
});

describe("canonical URL helper", () => {
  it("never emits a trailing slash", () => {
    expect(canonical("/")).not.toMatch(/\/$/);
    expect(canonical("shop/ghee")).toMatch(/\/shop\/ghee$/);
    expect(canonical("/shop/ghee/")).toMatch(/\/shop\/ghee$/);
  });
});

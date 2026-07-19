import { describe, it, expect } from "vitest";
import { extractH1Headings } from "@/components/learn/Markdown";

/**
 * Learn Brief §05: markdown `#` renders as H2 (article title is the only H1).
 * extractH1Headings pulls those `#` headings — used to build HowTo steps.
 */
describe("extractH1Headings", () => {
  const md = `Intro paragraph.

# Step one

Body.

# Step two

More body.

## Not a step (this is H3)
`;

  it("extracts only the # (rendered-as-H2) headings", () => {
    expect(extractH1Headings(md)).toEqual(["Step one", "Step two"]);
  });

  it("returns an empty array when there are no # headings", () => {
    expect(extractH1Headings("Just text with ## subheading")).toEqual([]);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/batches/queries", () => ({
  getAllActiveBatches: vi.fn().mockResolvedValue([]),
}));

import LabReportPage from "@/app/(store)/labreport/page";
import { footerNav, primaryNav } from "@/config/nav";

describe("canonical lab report page", () => {
  it("publishes both supplied documents and all three report pages", async () => {
    const { container } = render(await LabReportPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Lab reports & accreditation" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByText(/issued to Gawdee Organic Pvt\. Ltd\./i)).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(3);
    expect(
      screen.getAllByRole("link", { name: "Open PDF" }).map((link) => link.getAttribute("href")),
    ).toEqual([
      "/lab-reports/ghee-lab-test-2026.pdf",
      "/lab-reports/equity-food-testing-nabl-accreditation.pdf",
    ]);
  });

  it("uses /labreport as the single navigation destination", () => {
    expect(primaryNav.find((item) => item.label === "Lab Reports")?.href).toBe("/labreport");
    expect(
      footerNav.flatMap((column) => column.links).find((item) => item.label === "Lab Reports")
        ?.href,
    ).toBe("/labreport");
  });
});

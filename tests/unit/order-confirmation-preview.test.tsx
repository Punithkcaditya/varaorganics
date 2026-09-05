import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrderConfirmationPreviewPage from "@/app/(store)/order-confirmed/preview/page";

describe("order confirmation preview route", () => {
  it("uses clearly marked sample data without an active order-status link", () => {
    render(<OrderConfirmationPreviewPage />);

    expect(screen.getByText(/Client preview.*sample data/i)).toBeInTheDocument();
    expect(screen.getByText("VARA-DEMO-ORDER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Thank you, Sample" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View order status" })).not.toBeInTheDocument();
    expect(screen.getByText("View order status")).toHaveAttribute("aria-disabled", "true");
  });
});

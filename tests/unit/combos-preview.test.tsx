import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CombosPreview } from "@/components/home/CombosPreview";
import { ComboCard } from "@/components/combos/CombosExplorer";
import { combos } from "@/data/combos";
import { useCart } from "@/features/cart/store";

describe("homepage combos preview", () => {
  beforeEach(() => {
    localStorage.clear();
    useCart.setState({ items: [] });
  });

  it("shows two equal-height featured cards with temporary product images", () => {
    const { container } = render(<CombosPreview combos={combos} />);
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveClass("md:h-[700px]");
    expect(cards[1]).toHaveClass("md:h-[700px]");
    expect(screen.getByText("Mane Ruchi (Starter Combo)")).toBeInTheDocument();
    expect(screen.getByText("Ajji Kai Ruchi (Grandmothers Kitchen)")).toBeInTheDocument();
    expect(screen.queryByText("Ammana Madilu (New Mother)")).not.toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(6);
  });

  it("replaces the compact add button with a single cart action", () => {
    render(<CombosPreview combos={combos} />);

    fireEvent.click(screen.getAllByRole("button", { name: "ADD TO CART" })[0]!);

    expect(useCart.getState().items).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Proceed to Cart →" })).toHaveAttribute(
      "href",
      "/cart",
    );
  });

  it("shows product photography on full combo cards", () => {
    const { container } = render(<ComboCard combo={combos[2]!} lang="english" />);

    expect(
      screen.getByLabelText("Products included in Mane Adige Set (Complete Kitchen)"),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HeroAddToCart } from "@/components/home/HeroAddToCart";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/features/cart/store";
import { catalog } from "@/data/catalog";

const product = catalog[0]!;
const variant = product.variants.find((item) => item.active)!;

describe("post-add cart actions", () => {
  beforeEach(() => {
    localStorage.clear();
    useCart.setState({ items: [] });
  });

  it("shows Proceed to Cart in the featured hero after adding", () => {
    render(<HeroAddToCart product={product} variant={variant} />);

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(useCart.getState().items).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: `${product.productName} added. Proceed to cart` }),
    ).toHaveAttribute("href", "/cart");
  });

  it("replaces the product-card button without adding a second stacked action", () => {
    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(screen.queryByRole("button", { name: "Add to Cart" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `${product.productName} added. Proceed to cart` }),
    ).toHaveAttribute("href", "/cart");
  });
});

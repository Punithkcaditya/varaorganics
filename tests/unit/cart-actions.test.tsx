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

  it("carries the selected out-of-stock product, size, and SKU into Notify Me", () => {
    const outOfStockProduct = {
      ...product,
      variants: product.variants.map((item) => ({ ...item, stock: 0 })),
    };
    const selected = outOfStockProduct.variants.find((item) => item.active)!;

    render(<ProductCard product={outOfStockProduct} />);

    const link = screen.getByRole("link", {
      name: `Notify me when ${product.productName}, ${selected.size}, is back in stock`,
    });
    const url = new URL(link.getAttribute("href")!, "https://www.varaorganic.com");

    expect(url.pathname).toBe("/contact");
    expect(url.searchParams.get("intent")).toBe("restock");
    expect(url.searchParams.get("product")).toBe(product.productName);
    expect(url.searchParams.get("size")).toBe(selected.size);
    expect(url.searchParams.get("sku")).toBe(selected.sku);
  });
});

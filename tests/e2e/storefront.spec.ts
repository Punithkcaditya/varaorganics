import { test, expect } from "@playwright/test";

/**
 * Critical-path e2e (§22). Runs against the dev server in mock mode
 * (NEXT_PUBLIC_USE_MOCK_DATA=true via playwright.config webServer env), so no
 * external credentials are needed. Razorpay/Shiprocket/Resend are stubbed.
 */

test("1. homepage loads with hero and products", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /always should be/i })).toBeVisible();
});

test("2. mobile menu opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  const dialog = page.getByRole("dialog", { name: /navigation menu/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Shop", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("3. product variant change updates price", async ({ page }) => {
  await page.goto("/ghee/a2-gir-cow-bilona-ghee-500ml");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/ghee/i);
  await expect(page.getByText("₹1,399")).toBeVisible();
  await page.getByRole("button", { name: "1L", exact: true }).click();
  await expect(page.getByText("₹2,699")).toBeVisible();
});

test("4. add to cart updates the cart count", async ({ page }) => {
  await page.goto("/ghee/a2-gir-cow-bilona-ghee-500ml");
  await page.getByRole("button", { name: /^Add to Cart$/ }).click();
  await expect(page.getByRole("link", { name: /Cart, 1 items|Cart \(1\)/ }).first()).toBeVisible();
});

test("5. cart persists after refresh", async ({ page }) => {
  await page.goto("/ghee/a2-gir-cow-bilona-ghee-500ml");
  await page.getByRole("button", { name: /^Add to Cart$/ }).click();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A2 Gir Cow Bilona Ghee" }),
  ).toBeVisible();
});

test("6. checkout validation blocks an empty submit", async ({ page }) => {
  await page.goto("/ghee/a2-gir-cow-bilona-ghee-500ml");
  await page.getByRole("button", { name: /^Add to Cart$/ }).click();
  await page.goto("/checkout");
  await page.getByRole("button", { name: /place order/i }).click();
  await expect(page.getByText("Please fix the following:")).toBeVisible();
  await expect(page.getByText(/full name/i).first()).toBeVisible();
});

test("7. learn hub shows category sections", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("heading", { level: 2, name: /ghee — the complete guide/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /wood pressed oils/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /raw honey/i })).toBeVisible();
});

test("8. learn article renders semantic headings (single H1)", async ({ page }) => {
  await page.goto("/learn/how-to-read-ghee-lab-report");
  const h1s = page.getByRole("heading", { level: 1 });
  await expect(h1s).toHaveCount(1);
  await expect(h1s).toContainText(/lab report/i);
  // Markdown # renders as H2, not another H1.
  await expect(page.getByRole("heading", { level: 2, name: /check the batch number/i })).toBeVisible();
});

test("9. verify page handles valid and invalid batches", async ({ page }) => {
  await page.goto("/verify/GHE-2024-047");
  await expect(page.getByRole("heading", { name: /A2 Gir Cow Bilona Ghee/i })).toBeVisible();
  await expect(page.getByText(/verified batch/i)).toBeVisible();

  await page.goto("/verify/DOES-NOT-EXIST");
  await expect(page.getByRole("heading", { name: /batch not found/i })).toBeVisible();
});

test("10. landing page is noindex and has no site nav", async ({ page }) => {
  await page.goto("/lp/ghee-launch");
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("navigation", { name: /primary/i })).toHaveCount(0);
});

test("11. custom 404 page works", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});

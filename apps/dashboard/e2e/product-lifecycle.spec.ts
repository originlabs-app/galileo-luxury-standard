import { test, expect } from "@playwright/test";

test.describe("Product Lifecycle", () => {
  test("create product → verify DRAFT → mint → verify ACTIVE → verify QR", async ({
    page,
  }) => {
    const uniqueSerial = `SN-E2E-${Date.now()}`;

    // Navigate to the products list
    await page.goto("/dashboard/products");
    await expect(page).toHaveURL(/\/dashboard\/products/);

    // Click "New Product" button
    await page.getByRole("link", { name: /new product/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/products\/new/);

    // Fill the product creation form
    await page.getByLabel("Name").fill("E2E Test Product");
    await page.getByLabel("GTIN").fill("00012345678905");
    await page.getByLabel("Serial Number").fill(uniqueSerial);

    // Select category from dropdown
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: "Leather Goods" }).click();

    // Submit the form
    await page.getByRole("button", { name: /create product/i }).click();

    // Verify redirect to the product detail page
    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
      timeout: 15_000,
    });

    // Verify DRAFT status badge is visible (use first() since badge appears in header + info card)
    const draftBadge = page.getByText("DRAFT", { exact: true }).first();
    await expect(draftBadge).toBeVisible();

    // Verify product name in heading
    await expect(
      page.getByRole("heading", { name: "E2E Test Product" }),
    ).toBeVisible();

    // Verify Mint button is visible on DRAFT product
    const mintButton = page.getByRole("button", { name: /mint/i });
    await expect(mintButton).toBeVisible();

    // Click Mint
    await mintButton.click();

    // Wait for minting to complete — status should change to ACTIVE
    const activeBadge = page.getByText("ACTIVE", { exact: true }).first();
    await expect(activeBadge).toBeVisible({ timeout: 15_000 });

    // Verify DRAFT badge is no longer visible
    await expect(page.getByText("DRAFT", { exact: true })).not.toBeVisible();

    // Verify QR code image is visible (passport card shows QR for ACTIVE products)
    await expect(
      page.getByRole("img", { name: /qr/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Verify MINTED event appears in the event timeline
    await expect(page.getByText("Product Minted")).toBeVisible();

    // Verify Download QR button is visible for ACTIVE product
    await expect(
      page.getByRole("button", { name: /download qr/i }),
    ).toBeVisible();

    // Verify Mint button is no longer visible (use exact match to avoid matching "Minting…")
    await expect(
      page.getByRole("button", { name: "Mint" }),
    ).not.toBeVisible();
  });
});

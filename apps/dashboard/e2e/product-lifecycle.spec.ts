import { test, expect } from "@playwright/test";

test.describe("Product Lifecycle", () => {
  test("create product → verify identity checkpoint → confirm phase-1 product surfaces", async ({
    page,
  }) => {
    const uniqueSerial = `SN-E2E-${Date.now()}`;

    // Navigate directly to the product creation flow
    await page.goto("/dashboard/products/new");
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

    // Verify redirect to the dedicated identity checkpoint
    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+\/identity$/, {
      timeout: 15_000,
    });

    await expect(
      page.getByText("Identity locked in", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(uniqueSerial, { exact: true })).toBeVisible();
    await expect(page.getByText("did:galileo:", { exact: false })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /copy gs1 digital link/i }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /continue to product record/i })
      .click();
    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
      timeout: 15_000,
    });

    // Verify the product record stays centered on identity plus editable metadata
    await expect(
      page.getByRole("heading", { name: "E2E Test Product" }),
    ).toBeVisible();
    await expect(page.getByText("Identity baseline")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /view identity checkpoint/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /edit details/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /mint/i })).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: /transfer/i }),
    ).not.toBeVisible();
    await expect(page.getByRole("button", { name: /recall/i })).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: /download qr/i }),
    ).not.toBeVisible();

    // Verify the products index no longer advertises later-phase actions
    await page.getByRole("link", { name: "Products" }).click();
    await page.waitForURL(/\/dashboard\/products$/, { timeout: 15_000 });
    await expect(page.getByText("Track the permanent identifiers created for each item before any downstream lifecycle workflows enter scope.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /batch import/i }),
    ).not.toBeVisible();
  });
});

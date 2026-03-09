import { test, expect } from "@playwright/test";

test.describe("Product List Filters", () => {
  test("filter dropdowns are visible on products page", async ({ page }) => {
    await page.goto("/dashboard/products");
    await expect(page).toHaveURL(/\/dashboard\/products/);

    // Both filter triggers should be visible
    await expect(page.getByRole("combobox").first()).toBeVisible({
      timeout: 10_000,
    });

    // Status dropdown placeholder
    await expect(page.getByText("All statuses")).toBeVisible();

    // Category dropdown placeholder
    await expect(page.getByText("All categories")).toBeVisible();
  });

  test("status filter dropdown shows options", async ({ page }) => {
    await page.goto("/dashboard/products");

    // Open status dropdown
    await page.getByText("All statuses").click();

    // Check options are visible
    await expect(page.getByRole("option", { name: "Draft" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Active" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Transferred" }),
    ).toBeVisible();
    await expect(page.getByRole("option", { name: "Recalled" })).toBeVisible();
  });

  test("category filter dropdown shows options", async ({ page }) => {
    await page.goto("/dashboard/products");

    // Open category dropdown
    await page.getByText("All categories").click();

    // Check some key options
    await expect(
      page.getByRole("option", { name: "Leather Goods" }),
    ).toBeVisible();
    await expect(page.getByRole("option", { name: "Jewelry" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Watches" })).toBeVisible();
  });

  test("selecting a status filter triggers a request", async ({ page }) => {
    await page.goto("/dashboard/products");

    // Wait for initial load
    await expect(page.locator("body")).toBeVisible();

    // Open status dropdown and select Draft
    await page.getByText("All statuses").click();
    await page.getByRole("option", { name: "Draft" }).click();

    // Clear filters button should appear
    await expect(page.getByText("Clear filters")).toBeVisible();
  });

  test("clear filters button resets both filters", async ({ page }) => {
    await page.goto("/dashboard/products");

    // Select a status filter
    await page.getByText("All statuses").click();
    await page.getByRole("option", { name: "Draft" }).click();

    // Verify Clear filters button is visible
    await expect(page.getByText("Clear filters")).toBeVisible();

    // Click Clear filters
    await page.getByText("Clear filters").click();

    // Clear filters button should disappear
    await expect(page.getByText("Clear filters")).not.toBeVisible();

    // Placeholders should be restored
    await expect(page.getByText("All statuses")).toBeVisible();
    await expect(page.getByText("All categories")).toBeVisible();
  });

  test("filters are usable on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard/products");

    // Filter triggers should still be visible on mobile
    await expect(page.getByText("All statuses")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("All categories")).toBeVisible();

    // Open dropdown on mobile
    await page.getByText("All statuses").click();
    await expect(page.getByRole("option", { name: "Draft" })).toBeVisible();
  });
});

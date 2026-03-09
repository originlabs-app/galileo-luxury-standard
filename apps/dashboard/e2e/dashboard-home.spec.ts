import { test, expect } from "@playwright/test";

test.describe("Dashboard Home", () => {
  test("displays stat cards with correct labels", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify all 4 stat cards are present
    await expect(page.getByText("Total Products")).toBeVisible();
    await expect(page.getByText("Active Passports")).toBeVisible();
    await expect(page.getByText("Transferred")).toBeVisible();
    await expect(page.getByText("Verifications")).toBeVisible();
  });

  test("stat cards show numeric values after loading", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for loading to finish (em dashes should disappear)
    // Stats should show numbers (at least 0)
    const statValues = page.locator(".text-3xl.font-bold");
    await expect(statValues.first()).not.toHaveText("\u2014", {
      timeout: 10_000,
    });

    // Verify at least one stat card has a numeric value
    const firstValue = await statValues.first().textContent();
    expect(firstValue).toMatch(/^\d+$/);
  });

  test("shows activity feed section", async ({ page }) => {
    await page.goto("/dashboard");

    // The activity feed header should be visible
    await expect(page.getByText("Recent Activity")).toBeVisible();

    // Should show either events or the empty state message
    const hasEvents = await page
      .locator("ul.divide-y li")
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText("No recent activity")
      .isVisible()
      .catch(() => false);

    expect(hasEvents || hasEmptyState).toBe(true);
  });

  test("stat cards are responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");

    // Verify stat cards are still visible on mobile
    await expect(page.getByText("Total Products")).toBeVisible();
    await expect(page.getByText("Active Passports")).toBeVisible();
    await expect(page.getByText("Transferred")).toBeVisible();
    await expect(page.getByText("Verifications")).toBeVisible();
  });

  test("CTA button links to products page", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for stats to load
    await expect(page.locator(".text-3xl.font-bold").first()).not.toHaveText(
      "\u2014",
      { timeout: 10_000 },
    );

    // CTA should link to products
    const cta = page.getByRole("link", {
      name: /(view products|create your first product)/i,
    });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/dashboard\/products/);
  });
});

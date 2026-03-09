import { test, expect } from "@playwright/test";

test.describe("SIWE Wallet Login", () => {
  test("login page shows 'Sign in with Wallet' button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Sign in with Wallet/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("login page shows 'or' divider between email form and wallet login", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByText("or")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Sign In$/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in with Wallet/i }),
    ).toBeVisible();
  });
});

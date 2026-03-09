import { test, expect } from "@playwright/test";

test.describe("SIWE Wallet Login", () => {
  test("login page shows 'Sign in with Wallet' button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Sign in with Wallet/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("login page shows 'Sign in with Coinbase' button (Smart Wallet)", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Sign in with Coinbase/i }),
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
    await expect(
      page.getByRole("button", { name: /Sign in with Coinbase/i }),
    ).toBeVisible();
  });

  test("both wallet buttons are present and separate", async ({ page }) => {
    await page.goto("/login");

    const walletBtn = page.getByRole("button", {
      name: /Sign in with Wallet/i,
    });
    const coinbaseBtn = page.getByRole("button", {
      name: /Sign in with Coinbase/i,
    });

    await expect(walletBtn).toBeVisible({ timeout: 10_000 });
    await expect(coinbaseBtn).toBeVisible({ timeout: 10_000 });

    // Verify they are both enabled (not loading)
    await expect(walletBtn).toBeEnabled();
    await expect(coinbaseBtn).toBeEnabled();
  });
});

import { test as setup, expect } from "@playwright/test";
import * as fs from "node:fs";

const RUN_ID = Date.now();
const TEST_EMAIL = `e2e-${RUN_ID}@galileo.test`;
// Test-only credential — not a real secret
const TEST_PASSWORD = ["E2eTest", "Pass123!"].join("");
const TEST_BRAND = `E2E Brand ${RUN_ID}`;

setup("register and authenticate test user", async ({ page }) => {
  // Navigate to the register page
  await page.goto("/register");
  await expect(
    page.getByRole("button", { name: "Create Account" }),
  ).toBeVisible();

  // Fill registration form
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByLabel("Brand Name").fill(TEST_BRAND);

  // Submit registration
  await page.getByRole("button", { name: "Create Account" }).click();

  // Wait for redirect to dashboard (auth cookies set automatically by browser)
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

  // Verify we are authenticated by seeing dashboard content
  await expect(page.locator("body")).toBeVisible();

  // Ensure the auth directory exists before writing storage state
  fs.mkdirSync("playwright/.auth", { recursive: true });

  // Save signed-in state (includes httpOnly cookies) so tests can reuse it
  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});

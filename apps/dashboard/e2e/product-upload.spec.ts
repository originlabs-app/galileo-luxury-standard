import { test, expect } from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";

// Create a minimal 1x1 PNG fixture for testing
function createTestPng(filePath: string): void {
  // 1x1 red pixel PNG (smallest valid PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, pngBuffer);
}

test.describe("Product Image Upload", () => {
  const testPngPath = path.join(
    __dirname,
    "..",
    "playwright",
    "test-image.png",
  );

  test.beforeAll(() => {
    createTestPng(testPngPath);
  });

  test.afterAll(() => {
    if (fs.existsSync(testPngPath)) {
      fs.unlinkSync(testPngPath);
    }
  });

  test("image upload component is visible on product detail page", async ({
    page,
  }) => {
    const uniqueSerial = `SN-UP-${Date.now()}`;

    // Create a product first
    await page.goto("/dashboard/products/new");
    await page.getByLabel("Name").fill("Upload Test Product");
    await page.getByLabel("GTIN").fill("00012345678905");
    await page.getByLabel("Serial Number").fill(uniqueSerial);
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: "Watches" }).click();
    await page.getByRole("button", { name: /create product/i }).click();

    // Wait for redirect to detail page
    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
      timeout: 15_000,
    });

    // Verify image upload component is visible
    await expect(page.getByText("Product Image")).toBeVisible();
    await expect(page.getByText("Upload image")).toBeVisible();
  });

  test("uploading an image shows preview", async ({ page }) => {
    const uniqueSerial = `SN-UP2-${Date.now()}`;

    // Create a product
    await page.goto("/dashboard/products/new");
    await page.getByLabel("Name").fill("Upload Preview Product");
    await page.getByLabel("GTIN").fill("00012345678905");
    await page.getByLabel("Serial Number").fill(uniqueSerial);
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: "Watches" }).click();
    await page.getByRole("button", { name: /create product/i }).click();

    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
      timeout: 15_000,
    });

    // Upload image using setInputFiles
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPngPath);

    // Wait for upload to complete — preview image should appear
    await expect(page.getByAltText("Product")).toBeVisible({ timeout: 10_000 });
  });

  test("image upload component is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const uniqueSerial = `SN-UP3-${Date.now()}`;

    // Create a product
    await page.goto("/dashboard/products/new");
    await page.getByLabel("Name").fill("Upload Mobile Product");
    await page.getByLabel("GTIN").fill("00012345678905");
    await page.getByLabel("Serial Number").fill(uniqueSerial);
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: "Watches" }).click();
    await page.getByRole("button", { name: /create product/i }).click();

    await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
      timeout: 15_000,
    });

    // Verify upload component is visible on mobile
    await expect(page.getByText("Product Image")).toBeVisible();
    await expect(page.getByText("Upload image")).toBeVisible();
  });
});

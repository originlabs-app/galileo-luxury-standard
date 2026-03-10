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

async function createDraftProduct(page: import("@playwright/test").Page, name: string, serialNumber: string) {
  await page.goto("/dashboard/products/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("GTIN").fill("00012345678905");
  await page.getByLabel("Serial Number").fill(serialNumber);
  await page.getByRole("combobox", { name: /category/i }).click();
  await page.getByRole("option", { name: "Watches" }).click();
  await page.getByRole("button", { name: /add material/i }).click();
  await page.getByLabel("Material name 1").fill("Calfskin");
  await page.getByLabel("Material percentage 1").fill("100");
  await page.getByRole("button", { name: /create product/i }).click();

  await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+\/identity$/, {
    timeout: 15_000,
  });
  await page.getByRole("link", { name: /continue to product record/i }).click();
  await page.waitForURL(/\/dashboard\/products\/[a-zA-Z0-9-]+$/, {
    timeout: 15_000,
  });
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
    await createDraftProduct(page, "Upload Test Product", uniqueSerial);

    await expect(page.getByText("Linked media draft")).toBeVisible();
    await expect(page.getByLabel("Media alt text")).toBeVisible();
    await expect(page.getByText("Upload linked image")).toBeVisible();
  });

  test("uploading an image shows preview", async ({ page }) => {
    const uniqueSerial = `SN-UP2-${Date.now()}`;
    await createDraftProduct(page, "Upload Preview Product", uniqueSerial);
    await page.getByLabel("Media alt text").fill("Front-facing dial image");

    // Upload image using setInputFiles
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPngPath);

    // Wait for upload to complete — preview image should appear
    await expect(page.getByAltText("Product")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel("Media alt text")).toHaveValue(
      "Front-facing dial image",
    );
  });

  test("image upload component is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const uniqueSerial = `SN-UP3-${Date.now()}`;
    await createDraftProduct(page, "Upload Mobile Product", uniqueSerial);

    await expect(page.getByText("Linked media draft")).toBeVisible();
    await expect(page.getByLabel("Media alt text")).toBeVisible();
    await expect(page.getByText("Upload linked image")).toBeVisible();
  });
});

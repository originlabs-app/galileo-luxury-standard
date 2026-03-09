import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const VALID_GTIN_13 = "4006381333931";

test.use({ storageState: "playwright/.auth/user.json" });

function createCsvFile(filename: string, rows: string[][]): string {
  const content = rows.map((r) => r.join(",")).join("\n");
  const dir = path.join(process.cwd(), "playwright/.tmp");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

test.describe("Batch CSV Import & Mint", () => {
  test("should navigate to product list, import CSV, and see products created", async ({
    page,
  }) => {
    // Create a valid test CSV
    const csvPath = createCsvFile("valid-import.csv", [
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      [
        "E2E Bag A",
        VALID_GTIN_13,
        `E2E-${Date.now()}-001`,
        "Leather Goods",
        "E2E test",
        "leather",
      ],
      [
        "E2E Watch B",
        VALID_GTIN_13,
        `E2E-${Date.now()}-002`,
        "Watches",
        "E2E test",
        "steel",
      ],
    ]);

    await page.goto("/dashboard/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({
      timeout: 15_000,
    });

    // Click "Import CSV" button
    await page.getByRole("button", { name: "Import CSV" }).click();

    // Dialog should appear
    await expect(page.getByText("Import Products from CSV")).toBeVisible();

    // Upload the CSV file
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // Preview should show rows
    await expect(page.getByText("E2E Bag A")).toBeVisible({ timeout: 5_000 });

    // Click Import
    await page.getByRole("button", { name: "Import" }).click();

    // Wait for success
    await expect(page.getByText("created successfully")).toBeVisible({
      timeout: 30_000,
    });

    // Close dialog
    await page.getByRole("button", { name: "Done" }).click();
  });

  test("should show error summary for CSV with invalid rows", async ({
    page,
  }) => {
    const csvPath = createCsvFile("invalid-import.csv", [
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      [
        "Good Product",
        VALID_GTIN_13,
        `E2E-ERR-${Date.now()}-001`,
        "Watches",
        "",
        "",
      ],
      [
        "Bad GTIN",
        "0000000000000",
        `E2E-ERR-${Date.now()}-002`,
        "Watches",
        "",
        "",
      ],
    ]);

    await page.goto("/dashboard/products");
    await page.getByRole("button", { name: "Import CSV" }).click();

    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);
    await expect(page.getByText("Good Product")).toBeVisible({
      timeout: 5_000,
    });

    await page.getByRole("button", { name: "Import" }).click();

    // Should show error table
    await expect(page.getByText("error")).toBeVisible({ timeout: 30_000 });
  });
});

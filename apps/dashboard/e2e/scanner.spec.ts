import { test, expect } from "@playwright/test";

// Scanner runs on a separate port (3001). All scanner tests target it directly.
// The scanner is a public app so no auth is required.
test.use({ storageState: { cookies: [], origins: [] } });

const SCANNER_URL = "http://localhost:3001";

test.describe("Scanner — Home page", () => {
  test("home page renders with 'Galileo Verify' heading", async ({ page }) => {
    await page.goto(SCANNER_URL);
    await expect(
      page.getByRole("heading", { name: "Galileo Verify" }),
    ).toBeVisible();
  });

  test("home page has Scan QR Code link pointing to /scan", async ({
    page,
  }) => {
    await page.goto(SCANNER_URL);
    const scanLink = page.getByRole("link", { name: /scan qr code/i });
    await expect(scanLink).toBeVisible();
    await expect(scanLink).toHaveAttribute("href", "/scan");
  });

  test("home page has Digital Link textarea and Verify link button", async ({
    page,
  }) => {
    await page.goto(SCANNER_URL);
    await expect(
      page.getByRole("heading", { name: "Paste a Digital Link" }),
    ).toBeVisible();
    await expect(page.locator("textarea[name='link']")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Verify link" }),
    ).toBeVisible();
  });

  test("home page shows 'How it works' section", async ({ page }) => {
    await page.goto(SCANNER_URL);
    await expect(page.getByText("How it works")).toBeVisible();
  });
});

test.describe("Scanner — Invalid barcode input", () => {
  test("malformed DID shows 'Unable to verify' with DID format error", async ({
    page,
  }) => {
    // "did:invalid-format" starts with "did:" but doesn't match the galileo DID pattern.
    // normalizeResolverInput returns error without making any API call — works offline.
    await page.goto(
      `${SCANNER_URL}/?link=${encodeURIComponent("did:invalid-format")}`,
    );
    await expect(
      page.getByRole("heading", { name: "Unable to verify" }),
    ).toBeVisible();
    await expect(page.getByText(/DID format not recognized/i)).toBeVisible();
  });

  test("DID with invalid GTIN check digit shows GTIN error", async ({
    page,
  }) => {
    // 00012345678906 has the wrong check digit (should be 5, not 6).
    // normalizeResolverInput validates the check digit before any API call.
    const badDid = "did:galileo:01:00012345678906:21:SN001";
    await page.goto(
      `${SCANNER_URL}/?link=${encodeURIComponent(badDid)}`,
    );
    await expect(
      page.getByRole("heading", { name: "Unable to verify" }),
    ).toBeVisible();
    await expect(page.getByText(/GTIN check digit invalid/i)).toBeVisible();
  });

  test("unrecognized URL format shows URL format error", async ({ page }) => {
    // A string that looks like a URL but doesn't have the /01/{gtin}/21/{serial} path.
    const badUrl = "https://example.com/products/12345";
    await page.goto(
      `${SCANNER_URL}/?link=${encodeURIComponent(badUrl)}`,
    );
    await expect(
      page.getByRole("heading", { name: "Unable to verify" }),
    ).toBeVisible();
    await expect(page.getByText(/URL format not recognized/i)).toBeVisible();
  });
});

test.describe("Scanner — Camera scan page", () => {
  test("scan page shows camera error state when permission is denied", async ({
    page,
  }) => {
    // Mock getUserMedia to immediately reject with NotAllowedError,
    // simulating camera permission denial before the page loads its own scripts.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        get: () => ({
          getUserMedia: () =>
            Promise.reject(
              new DOMException("Permission denied", "NotAllowedError"),
            ),
        }),
        configurable: true,
      });
    });

    await page.goto(`${SCANNER_URL}/scan`);
    await expect(
      page.getByText("Camera access blocked"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("camera permission denial shows re-enable instructions", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        get: () => ({
          getUserMedia: () =>
            Promise.reject(
              new DOMException("Permission denied", "NotAllowedError"),
            ),
        }),
        configurable: true,
      });
    });

    await page.goto(`${SCANNER_URL}/scan`);
    await expect(
      page.getByText("Camera access blocked"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/How to re-enable camera access/i),
    ).toBeVisible();
    // Instructions cover iOS Safari, Android Chrome, and Desktop
    await expect(page.getByText(/iOS Safari/i)).toBeVisible();
    await expect(page.getByText(/Android Chrome/i)).toBeVisible();
    await expect(page.getByText(/Desktop/i)).toBeVisible();
  });

  test("camera error state shows Retry and Go back buttons", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        get: () => ({
          getUserMedia: () =>
            Promise.reject(
              new DOMException("Permission denied", "NotAllowedError"),
            ),
        }),
        configurable: true,
      });
    });

    await page.goto(`${SCANNER_URL}/scan`);
    await expect(
      page.getByText("Camera access blocked"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go back" })).toBeVisible();
  });
});

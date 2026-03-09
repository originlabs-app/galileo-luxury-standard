import { test, expect } from "@playwright/test";
import { privateKeyToAccount } from "viem/accounts";

const SIWE_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;
const siweAccount = privateKeyToAccount(SIWE_PRIVATE_KEY);

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("SIWE Wallet Login", () => {
  test("linked-wallet SIWE lands on the setup-check screen", async ({
    page,
  }) => {
    await page.exposeFunction("galileoSignSiweMessage", async (message: string) =>
      siweAccount.signMessage({ message }),
    );

    await page.addInitScript((address) => {
      window.__GALILEO_E2E_SIWE__ = {
        connect: async () => address,
        signMessage: async (message: string) =>
          window.galileoSignSiweMessage(message),
      };
    }, siweAccount.address);

    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Sign in with Wallet" }),
    ).toBeVisible();

    const setupUrl = page.waitForURL(/\/dashboard\/setup$/, { timeout: 30_000 });
    await page.getByRole("button", { name: "Sign in with Wallet" }).click();
    await setupUrl;

    await expect(page).toHaveURL(/\/dashboard\/setup$/);
    await expect(
      page.getByRole("heading", { name: "Access readiness" }),
    ).toBeVisible();
    await expect(page.getByText("Workspace ready").first()).toBeVisible();
    await expect(page.getByText("Galileo Luxe").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Continue to dashboard" }),
    ).toBeVisible();
  });
});

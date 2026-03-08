import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { buildApp } from "../src/server.js";
import type { FastifyInstance } from "fastify";
import { parseCookies } from "./helpers.js";

/**
 * Generate a deterministic wallet and sign a message.
 */
function createTestWallet() {
  // Use a deterministic private key for testing
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;
  const account = privateKeyToAccount(privateKey);
  return { account, address: account.address };
}

/**
 * A second wallet for conflict tests.
 */
function createTestWallet2() {
  const privateKey =
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;
  const account = privateKeyToAccount(privateKey);
  return { account, address: account.address };
}

describe("POST /auth/link-wallet", () => {
  let app: FastifyInstance;
  const wallet1 = createTestWallet();
  const wallet2 = createTestWallet2();

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.prisma.user.deleteMany({
      where: {
        email: {
          in: ["wallet-link@test.com", "wallet-link2@test.com"],
        },
      },
    });
  });

  /**
   * Helper: register a user and return auth cookies.
   */
  async function registerAndGetCookies(email: string) {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email,
        password: "password123",
      },
    });
    expect(res.statusCode).toBe(201);
    return parseCookies(res);
  }

  // ─── Happy Path ───────────────────────────────────────────────

  it("links wallet with valid signature and returns 200", async () => {
    const cookies = await registerAndGetCookies("wallet-link@test.com");
    const message = "Link wallet to Galileo: wallet-link@test.com";
    const signature = await wallet1.account.signMessage({ message });

    const response = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature,
        message,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.walletAddress).toBe(wallet1.address);

    // Verify persisted in DB
    const dbUser = await app.prisma.user.findFirst({
      where: { email: "wallet-link@test.com" },
    });
    expect(dbUser!.walletAddress).toBe(wallet1.address);
  });

  // ─── 409: Address already linked ─────────────────────────────

  it("returns 409 when address is already linked to another user", async () => {
    // First user links wallet
    const cookies1 = await registerAndGetCookies("wallet-link@test.com");
    const message1 = "Link wallet to Galileo: wallet-link@test.com";
    const signature1 = await wallet1.account.signMessage({ message: message1 });

    const res1 = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies1.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature: signature1,
        message: message1,
      },
    });
    expect(res1.statusCode).toBe(200);

    // Second user tries to link same address
    const cookies2 = await registerAndGetCookies("wallet-link2@test.com");
    const message2 = "Link wallet to Galileo: wallet-link2@test.com";
    // wallet1 signs for user2 — valid signature, but address already taken
    const signature2 = await wallet1.account.signMessage({ message: message2 });

    const res2 = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies2.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature: signature2,
        message: message2,
      },
    });

    expect(res2.statusCode).toBe(409);
    const body = res2.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("CONFLICT");
  });

  // ─── 401: Unauthenticated ────────────────────────────────────

  it("returns 401 without auth cookie", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature: "0x1234",
        message: "Link wallet to Galileo: test",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  // ─── 400: Invalid Ethereum address ───────────────────────────

  it("returns 400 for invalid Ethereum address", async () => {
    const cookies = await registerAndGetCookies("wallet-link@test.com");

    const response = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: "not-a-valid-address",
        signature: "0x1234",
        message: "Link wallet to Galileo: wallet-link@test.com",
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  // ─── 400: Signature verification fails ───────────────────────

  it("returns 400 when signature does not match address (wrong signer)", async () => {
    const cookies = await registerAndGetCookies("wallet-link@test.com");
    const message = "Link wallet to Galileo: wallet-link@test.com";
    // wallet2 signs, but user claims wallet1's address
    const signature = await wallet2.account.signMessage({ message });

    const response = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature,
        message,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("SIGNATURE_INVALID");
  });

  // ─── 400: Message missing required prefix ────────────────────

  it("returns 400 when message lacks the required prefix", async () => {
    const cookies = await registerAndGetCookies("wallet-link@test.com");
    const message = "Some random message without the prefix";
    const signature = await wallet1.account.signMessage({ message });

    const response = await app.inject({
      method: "POST",
      url: "/auth/link-wallet",
      headers: {
        cookie: `galileo_at=${cookies.galileo_at}`,
        "x-galileo-client": "1",
      },
      payload: {
        address: wallet1.address,
        signature,
        message,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

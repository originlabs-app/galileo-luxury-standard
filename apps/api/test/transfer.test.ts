import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(),
}));

vi.mock("viem/accounts", () => ({
  privateKeyToAccount: vi.fn(),
}));

vi.mock("viem/chains", () => ({
  baseSepolia: { id: 84532, name: "Base Sepolia" },
}));

import { parseCookies } from "./helpers.js";

const VALID_GTIN_13 = "4006381333931";
const CSRF = { "x-galileo-client": "test" };
const VALID_ETH_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const ANOTHER_ETH_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

describe("POST /products/:id/transfer", () => {
  let app: FastifyInstance;

  let brandAdminCookie: string;
  let adminCookie: string;
  let otherBrandAdminCookie: string;

  let testBrandId: string;
  let otherBrandId: string;

  beforeAll(async () => {
    const { buildApp } = await import("../src/server.js");
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.prisma.productEvent.deleteMany({});
    await app.prisma.productPassport.deleteMany({});
    await app.prisma.product.deleteMany({});
    await app.prisma.user.deleteMany({});
    await app.prisma.brand.deleteMany({});

    const brand = await app.prisma.brand.create({
      data: {
        name: "Transfer Test Brand",
        slug: "transfer-test-brand",
        did: "did:galileo:brand:transfer-test-brand",
      },
    });
    testBrandId = brand.id;

    const otherBrand = await app.prisma.brand.create({
      data: {
        name: "Other Transfer Brand",
        slug: "other-transfer-brand",
        did: "did:galileo:brand:other-transfer-brand",
      },
    });
    otherBrandId = otherBrand.id;

    async function setupUser(
      email: string,
      role: string,
      brandId?: string,
    ): Promise<string> {
      const reg = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email, password: "password123" },
      });
      const userId = reg.json().data.user.id;
      await app.prisma.user.update({
        where: { id: userId },
        data: { role, ...(brandId ? { brandId } : {}) },
      });
      const login = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email, password: "password123" },
      });
      const cookies = parseCookies(login);
      return `galileo_at=${cookies.galileo_at}`;
    }

    brandAdminCookie = await setupUser(
      "transfer-ba@test.com",
      "BRAND_ADMIN",
      testBrandId,
    );
    adminCookie = await setupUser("transfer-admin@test.com", "ADMIN");
    otherBrandAdminCookie = await setupUser(
      "transfer-other@test.com",
      "BRAND_ADMIN",
      otherBrandId,
    );
  });

  /** Create a product and mint it so it becomes ACTIVE */
  async function createMintedProduct(
    cookie: string,
    serial = "TRANSFER-001",
  ): Promise<string> {
    const createRes = await app.inject({
      method: "POST",
      url: "/products",
      headers: { cookie, ...CSRF },
      payload: {
        name: "Transferable Product",
        gtin: VALID_GTIN_13,
        serialNumber: serial,
        brandId: testBrandId,
        category: "Watches",
      },
    });
    const productId = createRes.json().data.product.id;

    await app.inject({
      method: "POST",
      url: `/products/${productId}/mint`,
      headers: { cookie, ...CSRF },
    });

    return productId;
  }

  it("transfers an ACTIVE product to a valid address and creates TRANSFERRED event", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.product.walletAddress).toBe(VALID_ETH_ADDRESS);
    // Product stays ACTIVE after transfer
    expect(body.data.product.status).toBe("ACTIVE");

    const events = body.data.product.events;
    const transferEvent = events.find(
      (e: { type: string }) => e.type === "TRANSFERRED",
    );
    expect(transferEvent).toBeDefined();
    expect(transferEvent.data.to).toBe(VALID_ETH_ADDRESS);
  });

  it("second transfer updates walletAddress and records both from and to", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    // First transfer
    await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    // Second transfer
    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: ANOTHER_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.product.walletAddress).toBe(ANOTHER_ETH_ADDRESS);
    expect(body.data.product.status).toBe("ACTIVE");

    const events = body.data.product.events;
    const transferEvents = events.filter(
      (e: { type: string }) => e.type === "TRANSFERRED",
    );
    expect(transferEvents).toHaveLength(2);

    // Most recent event first (ordered by createdAt desc)
    expect(transferEvents[0].data.from).toBe(VALID_ETH_ADDRESS);
    expect(transferEvents[0].data.to).toBe(ANOTHER_ETH_ADDRESS);
  });

  it("returns 409 for DRAFT product", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/products",
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: {
        name: "Draft Product",
        gtin: VALID_GTIN_13,
        serialNumber: "DRAFT-TRANSFER",
        brandId: testBrandId,
        category: "Watches",
      },
    });
    const productId = createRes.json().data.product.id;

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe("CONFLICT");
  });

  it("returns 409 for RECALLED product", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    // Recall the product first
    await app.inject({
      method: "POST",
      url: `/products/${productId}/recall`,
      headers: { cookie: brandAdminCookie, ...CSRF },
    });

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe("CONFLICT");
  });

  it("returns 404 for non-existent product", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/products/nonexistent-id/transfer",
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(404);
  });

  it("denies BRAND_ADMIN from another brand", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: otherBrandAdminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(403);
  });

  it("allows ADMIN to transfer any brand product", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: adminCookie, ...CSRF },
      payload: { toAddress: VALID_ETH_ADDRESS },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.product.walletAddress).toBe(VALID_ETH_ADDRESS);
  });

  it("returns 400 for invalid Ethereum address", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: { toAddress: "not-an-address" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("BAD_REQUEST");
  });

  it("returns 400 for missing toAddress", async () => {
    const productId = await createMintedProduct(brandAdminCookie);

    const res = await app.inject({
      method: "POST",
      url: `/products/${productId}/transfer`,
      headers: { cookie: brandAdminCookie, ...CSRF },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("BAD_REQUEST");
  });
});

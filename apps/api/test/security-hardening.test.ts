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

// Mock viem entirely — must be before any import that touches viem
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

import { parseCookies, cleanDb } from "./helpers.js";

// Valid GTINs (GS1 check digit verified)
const VALID_GTIN_13 = "4006381333931";
const VALID_GTIN_13_B = "5901234123457";

describe("Security Hardening", () => {
  let app: FastifyInstance;

  let brandAdminCookie: string;
  let adminCookie: string;
  let nullBrandUserCookie: string;

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
    await cleanDb(app.prisma);

    // Create test brand
    const brand = await app.prisma.brand.create({
      data: {
        name: "Security Test Brand",
        slug: "security-test-brand",
        did: "did:galileo:brand:security-test-brand",
      },
    });
    testBrandId = brand.id;

    // Create another brand
    const otherBrand = await app.prisma.brand.create({
      data: {
        name: "Other Security Brand",
        slug: "other-security-brand",
        did: "did:galileo:brand:other-security-brand",
      },
    });
    otherBrandId = otherBrand.id;

    // Register BRAND_ADMIN user (with brand)
    const brandAdminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "sec-brand-admin@test.com",
        password: "password123",
      },
    });
    const brandAdminUser = brandAdminRes.json().data.user;
    await app.prisma.user.update({
      where: { id: brandAdminUser.id },
      data: { role: "BRAND_ADMIN", brandId: testBrandId },
    });
    const brandAdminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "sec-brand-admin@test.com",
        password: "password123",
      },
    });
    const brandAdminCookies = parseCookies(brandAdminLogin);
    brandAdminCookie = `galileo_at=${brandAdminCookies.galileo_at}`;

    // Register ADMIN user (no brand)
    const adminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "sec-admin@test.com",
        password: "password123",
      },
    });
    const adminUser = adminRes.json().data.user;
    await app.prisma.user.update({
      where: { id: adminUser.id },
      data: { role: "ADMIN" },
    });
    const adminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "sec-admin@test.com",
        password: "password123",
      },
    });
    const adminCookies = parseCookies(adminLogin);
    adminCookie = `galileo_at=${adminCookies.galileo_at}`;

    // Register a user with null brandId (non-ADMIN) to test brandId guard
    const nullBrandRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "sec-nullbrand@test.com",
        password: "password123",
      },
    });
    const nullBrandUser = nullBrandRes.json().data.user;
    await app.prisma.user.update({
      where: { id: nullBrandUser.id },
      data: { role: "BRAND_ADMIN", brandId: null },
    });
    const nullBrandLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "sec-nullbrand@test.com",
        password: "password123",
      },
    });
    const nullBrandCookies = parseCookies(nullBrandLogin);
    nullBrandUserCookie = `galileo_at=${nullBrandCookies.galileo_at}`;
  });

  // ─── C1: Concurrent Mint TOCTOU ─────────────────────────────

  describe("C1: Mint TOCTOU race condition", () => {
    it("concurrent mint: one succeeds, one gets 409", async () => {
      // Create a DRAFT product
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "RACE-001",
          name: "Race Condition Watch",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      // Fire two mint requests concurrently
      const [res1, res2] = await Promise.all([
        app.inject({
          method: "POST",
          url: `/products/${productId}/mint`,
          headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        }),
        app.inject({
          method: "POST",
          url: `/products/${productId}/mint`,
          headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        }),
      ]);

      const statuses = [res1.statusCode, res2.statusCode].sort();
      // Exactly one 200 and one 409
      expect(statuses).toEqual([200, 409]);
    });
  });

  // ─── C4: brandId null guard ─────────────────────────────────

  describe("C4: brandId null guard", () => {
    it("returns 403 on GET /products when non-ADMIN user has null brandId", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products",
        headers: { cookie: nullBrandUserCookie },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json().error.code).toBe("FORBIDDEN");
    });

    it("returns 403 on POST /products when non-ADMIN user has null brandId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: nullBrandUserCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NULL-001",
          name: "Null Brand Product",
          category: "Watches",
        },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json().error.code).toBe("FORBIDDEN");
    });

    it("returns 403 on GET /products/:id when non-ADMIN user has null brandId", async () => {
      // Create a product via brand admin first
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NULL-DETAIL",
          name: "Null Brand Detail",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}`,
        headers: { cookie: nullBrandUserCookie },
      });
      expect(response.statusCode).toBe(403);
    });

    it("returns 403 on PATCH /products/:id when non-ADMIN user has null brandId", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NULL-PATCH",
          name: "Null Brand Patch",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "PATCH",
        url: `/products/${productId}`,
        headers: { cookie: nullBrandUserCookie, "x-galileo-client": "1" },
        payload: { name: "Updated" },
      });
      expect(response.statusCode).toBe(403);
    });

    it("returns 403 on POST /products/:id/mint when non-ADMIN user has null brandId", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NULL-MINT",
          name: "Null Brand Mint",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "POST",
        url: `/products/${productId}/mint`,
        headers: { cookie: nullBrandUserCookie, "x-galileo-client": "1" },
      });
      expect(response.statusCode).toBe(403);
    });

    it("returns 403 on GET /products/:id/qr when non-ADMIN user has null brandId", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NULL-QR",
          name: "Null Brand QR",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}/qr`,
        headers: { cookie: nullBrandUserCookie },
      });
      expect(response.statusCode).toBe(403);
    });
  });

  // ─── F4: Validation bounds ──────────────────────────────────

  describe("F4: Validation bounds", () => {
    it("returns 400 for name exceeding 255 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "BOUNDS-001",
          name: "A".repeat(256),
          category: "Watches",
        },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().success).toBe(false);
    });

    it("returns 400 for serialNumber exceeding 100 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "S".repeat(101),
          name: "Valid Name",
          category: "Watches",
        },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().success).toBe(false);
    });

    it("returns 400 for invalid category", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "BOUNDS-002",
          name: "Valid Name",
          category: "InvalidCategory",
        },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().success).toBe(false);
    });

    it("returns 400 for description exceeding 2000 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "BOUNDS-003",
          name: "Valid Name",
          description: "D".repeat(2001),
          category: "Watches",
        },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().success).toBe(false);
    });

    it("returns 400 for update with name exceeding 255 characters", async () => {
      // Create a product first
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "BOUNDS-004",
          name: "Valid Name",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "PATCH",
        url: `/products/${productId}`,
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          name: "A".repeat(256),
        },
      });
      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for update with invalid category", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "BOUNDS-005",
          name: "Valid Name",
          category: "Watches",
        },
      });
      const productId = createRes.json().data.product.id;

      const response = await app.inject({
        method: "PATCH",
        url: `/products/${productId}`,
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          category: "invalid-category",
        },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  // ─── F5: ADMIN create with brandId ─────────────────────────

  describe("F5: ADMIN create with explicit brandId", () => {
    it("ADMIN with brandId in body creates product for that brand (201)", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: adminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "ADMIN-001",
          name: "Admin Created Product",
          category: "Jewelry",
          brandId: testBrandId,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.product.brandId).toBe(testBrandId);
    });

    it("ADMIN without brandId in body gets 400", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: adminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "ADMIN-002",
          name: "Admin No Brand",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain("brandId");
    });

    it("non-ADMIN body.brandId is ignored — uses user brandId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "NONADMIN-001",
          name: "Non-Admin Brand Override Attempt",
          category: "Watches",
          brandId: otherBrandId, // should be ignored
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      // Should use user's brandId, not the one from body
      expect(body.data.product.brandId).toBe(testBrandId);
    });
  });
});

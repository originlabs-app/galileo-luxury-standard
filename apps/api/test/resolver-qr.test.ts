import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../src/server.js";
import type { FastifyInstance } from "fastify";

/**
 * Parse Set-Cookie headers and return a map of cookie name → value.
 */
function parseCookies(
  response: { headers: Record<string, string | string[] | undefined> },
): Record<string, string> {
  const raw = response.headers["set-cookie"];
  if (!raw) return {};
  const arr = Array.isArray(raw) ? raw : [raw];
  const result: Record<string, string> = {};
  for (const header of arr) {
    const [pair] = header.split(";");
    const [name, ...rest] = pair!.split("=");
    result[name!.trim()] = rest.join("=").trim();
  }
  return result;
}

// Valid GTINs (GS1 check digit verified)
const VALID_GTIN = "4006381333931";

describe("Resolver & QR endpoints", () => {
  let app: FastifyInstance;

  let brandAdminCookie: string;
  let otherBrandAdminCookie: string;
  let testBrandId: string;
  let otherBrandId: string;

  // Store products created in beforeEach
  let activeProductId: string;
  let activeProductGtin: string;
  let activeProductSerial: string;
  let draftProductId: string;
  let draftProductGtin: string;
  let draftProductSerial: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up all test data
    await app.prisma.productEvent.deleteMany({});
    await app.prisma.productPassport.deleteMany({});
    await app.prisma.product.deleteMany({});
    await app.prisma.user.deleteMany({});
    await app.prisma.brand.deleteMany({});

    // Create test brand
    const brand = await app.prisma.brand.create({
      data: {
        name: "Resolver Test Brand",
        slug: "resolver-test-brand",
        did: "did:galileo:brand:resolver-test-brand",
      },
    });
    testBrandId = brand.id;

    // Create other brand
    const otherBrand = await app.prisma.brand.create({
      data: {
        name: "Other Resolver Brand",
        slug: "other-resolver-brand",
        did: "did:galileo:brand:other-resolver-brand",
      },
    });
    otherBrandId = otherBrand.id;

    // Register BRAND_ADMIN user
    const brandAdminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "resolver-admin@test.com", password: "password123" },
    });
    const brandAdminUser = brandAdminRes.json().data.user;
    await app.prisma.user.update({
      where: { id: brandAdminUser.id },
      data: { role: "BRAND_ADMIN", brandId: testBrandId },
    });
    const brandAdminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "resolver-admin@test.com", password: "password123" },
    });
    const brandAdminCookies = parseCookies(brandAdminLogin);
    brandAdminCookie = `galileo_at=${brandAdminCookies.galileo_at}`;

    // Register other BRAND_ADMIN
    const otherRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "other-resolver-admin@test.com",
        password: "password123",
      },
    });
    const otherUser = otherRes.json().data.user;
    await app.prisma.user.update({
      where: { id: otherUser.id },
      data: { role: "BRAND_ADMIN", brandId: otherBrandId },
    });
    const otherLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "other-resolver-admin@test.com",
        password: "password123",
      },
    });
    const otherCookies = parseCookies(otherLogin);
    otherBrandAdminCookie = `galileo_at=${otherCookies.galileo_at}`;

    // Create a DRAFT product
    draftProductGtin = VALID_GTIN;
    draftProductSerial = "SN-DRAFT-001";
    const draftRes = await app.inject({
      method: "POST",
      url: "/products",
      headers: { cookie: brandAdminCookie },
      payload: {
        gtin: draftProductGtin,
        serialNumber: draftProductSerial,
        name: "Draft Resolver Product",
        description: "A draft product for resolver tests",
        category: "watches",
      },
    });
    draftProductId = draftRes.json().data.product.id;

    // Create and MINT a product (ACTIVE)
    activeProductGtin = VALID_GTIN;
    activeProductSerial = "SN-ACTIVE-001";
    const activeRes = await app.inject({
      method: "POST",
      url: "/products",
      headers: { cookie: brandAdminCookie },
      payload: {
        gtin: activeProductGtin,
        serialNumber: activeProductSerial,
        name: "Active Resolver Product",
        description: "An active product for resolver tests",
        category: "jewelry",
      },
    });
    activeProductId = activeRes.json().data.product.id;

    // Mint the product to make it ACTIVE
    await app.inject({
      method: "POST",
      url: `/products/${activeProductId}/mint`,
      headers: { cookie: brandAdminCookie },
    });
  });

  // ─── GS1 Digital Link Resolver ───────────────────────────────

  describe("GET /01/:gtin/21/:serial (GS1 Resolver)", () => {
    it("returns 200 with application/ld+json for ACTIVE product", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/01/${activeProductGtin}/21/${activeProductSerial}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain(
        "application/ld+json",
      );

      const body = response.json();
      expect(body["@context"]).toEqual([
        "https://schema.org",
        "https://gs1.org/voc",
      ]);
      expect(body["@type"]).toBe("Product");
      expect(body.name).toBe("Active Resolver Product");
      expect(body.description).toBe("An active product for resolver tests");
      expect(body.gtin).toBe(activeProductGtin);
      expect(body.category).toBe("jewelry");
      expect(body.status).toBe("ACTIVE");

      // Passport fields
      expect(body.passport).toBeDefined();
      expect(body.passport.digitalLink).toContain("id.galileoprotocol.io");
      expect(body.passport.txHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(body.passport.tokenAddress).toMatch(/^0x[a-f0-9]{40}$/);
      expect(body.passport.chainId).toBe(84532);
      expect(body.passport.mintedAt).toBeDefined();

      // Brand fields
      expect(body.brand).toBeDefined();
      expect(body.brand.name).toBe("Resolver Test Brand");
      expect(body.brand.did).toBe("did:galileo:brand:resolver-test-brand");
    });

    it("returns 404 for non-existent product", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/01/0000000000000/21/NONEXISTENT",
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 for DRAFT product (no data leak)", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/01/${draftProductGtin}/21/${draftProductSerial}`,
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.success).toBe(false);
      // Should not leak any product data
      expect(body).not.toHaveProperty("data");
    });

    it("works without authentication (public endpoint)", async () => {
      // No cookie header — should still work
      const response = await app.inject({
        method: "GET",
        url: `/01/${activeProductGtin}/21/${activeProductSerial}`,
        // No headers, no cookies
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain(
        "application/ld+json",
      );
    });

    it("correctly decodes URL-encoded serial number", async () => {
      // Create a product with special characters in serial
      const specialSerial = "SN/TEST#123?A B";
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie },
        payload: {
          gtin: VALID_GTIN,
          serialNumber: specialSerial,
          name: "Special Serial Product",
          category: "accessories",
        },
      });
      const specialId = createRes.json().data.product.id;

      // Mint the product
      await app.inject({
        method: "POST",
        url: `/products/${specialId}/mint`,
        headers: { cookie: brandAdminCookie },
      });

      // Resolve with URL-encoded serial
      const encodedSerial = encodeURIComponent(specialSerial);
      const response = await app.inject({
        method: "GET",
        url: `/01/${VALID_GTIN}/21/${encodedSerial}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.name).toBe("Special Serial Product");
    });
  });

  // ─── QR Code Generation ──────────────────────────────────────

  describe("GET /products/:id/qr (QR Code Generation)", () => {
    it("returns image/png for ACTIVE product with default size", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/png");

      // Verify PNG header bytes (PNG magic number: 0x89 0x50 0x4E 0x47)
      const buffer = Buffer.from(response.rawPayload);
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50); // P
      expect(buffer[2]).toBe(0x4e); // N
      expect(buffer[3]).toBe(0x47); // G
    });

    it("returns QR code at custom size", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr?size=500`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/png");

      // Should be a valid PNG
      const buffer = Buffer.from(response.rawPayload);
      expect(buffer[0]).toBe(0x89);
    });

    it("returns 400 for size below minimum (100)", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr?size=50`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain("size");
    });

    it("returns 400 for size above maximum (1000)", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr?size=2000`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain("size");
    });

    it("returns 401 without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr`,
        // No cookie
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 400 for DRAFT product", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${draftProductId}/qr`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain("unminted");
    });

    it("returns 404 for non-existent product", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products/nonexistent-id-12345/qr",
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 403 for other brand's product", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr`,
        headers: { cookie: otherBrandAdminCookie },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 400 for non-numeric size parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr?size=abc`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(400);
    });

    it("responds in under 500ms", async () => {
      const start = Date.now();
      const response = await app.inject({
        method: "GET",
        url: `/products/${activeProductId}/qr`,
        headers: { cookie: brandAdminCookie },
      });
      const elapsed = Date.now() - start;

      expect(response.statusCode).toBe(200);
      expect(elapsed).toBeLessThan(500);
    });
  });
});

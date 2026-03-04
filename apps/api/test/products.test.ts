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
const VALID_GTIN_13 = "4006381333931";
const VALID_GTIN_13_B = "5901234123457";

describe("Product CRUD endpoints", () => {
  let app: FastifyInstance;

  // Tokens for different roles
  let brandAdminCookie: string;
  let operatorCookie: string;
  let viewerCookie: string;
  let adminCookie: string;
  let otherBrandAdminCookie: string;

  let testBrandId: string;
  let otherBrandId: string;

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
        name: "Test Luxury Brand",
        slug: "test-luxury-brand",
        did: "did:galileo:brand:test-luxury-brand",
      },
    });
    testBrandId = brand.id;

    // Create another brand
    const otherBrand = await app.prisma.brand.create({
      data: {
        name: "Other Brand",
        slug: "other-brand",
        did: "did:galileo:brand:other-brand",
      },
    });
    otherBrandId = otherBrand.id;

    // Register BRAND_ADMIN user (with brand)
    const brandAdminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "brand-admin@test.com",
        password: "password123",
      },
    });
    const brandAdminUser = brandAdminRes.json().data.user;
    await app.prisma.user.update({
      where: { id: brandAdminUser.id },
      data: { role: "BRAND_ADMIN", brandId: testBrandId },
    });
    // Re-login to get updated token with role+brand
    const brandAdminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "brand-admin@test.com",
        password: "password123",
      },
    });
    const brandAdminCookies = parseCookies(brandAdminLogin);
    brandAdminCookie = `galileo_at=${brandAdminCookies.galileo_at}`;

    // Register OPERATOR user
    const operatorRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "operator@test.com",
        password: "password123",
      },
    });
    const operatorUser = operatorRes.json().data.user;
    await app.prisma.user.update({
      where: { id: operatorUser.id },
      data: { role: "OPERATOR", brandId: testBrandId },
    });
    const operatorLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "operator@test.com",
        password: "password123",
      },
    });
    const operatorCookies = parseCookies(operatorLogin);
    operatorCookie = `galileo_at=${operatorCookies.galileo_at}`;

    // Register VIEWER user
    const viewerRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "viewer@test.com",
        password: "password123",
      },
    });
    const viewerUser = viewerRes.json().data.user;
    await app.prisma.user.update({
      where: { id: viewerUser.id },
      data: { role: "VIEWER", brandId: testBrandId },
    });
    const viewerLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "viewer@test.com",
        password: "password123",
      },
    });
    const viewerCookies = parseCookies(viewerLogin);
    viewerCookie = `galileo_at=${viewerCookies.galileo_at}`;

    // Register ADMIN user (no brand — sees all)
    const adminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "admin@test.com",
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
        email: "admin@test.com",
        password: "password123",
      },
    });
    const adminCookies = parseCookies(adminLogin);
    adminCookie = `galileo_at=${adminCookies.galileo_at}`;

    // Register other BRAND_ADMIN (different brand)
    const otherBrandAdminRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "other-brand-admin@test.com",
        password: "password123",
      },
    });
    const otherBrandAdminUser = otherBrandAdminRes.json().data.user;
    await app.prisma.user.update({
      where: { id: otherBrandAdminUser.id },
      data: { role: "BRAND_ADMIN", brandId: otherBrandId },
    });
    const otherBrandAdminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "other-brand-admin@test.com",
        password: "password123",
      },
    });
    const otherBrandAdminCookies = parseCookies(otherBrandAdminLogin);
    otherBrandAdminCookie = `galileo_at=${otherBrandAdminCookies.galileo_at}`;
  });

  // ─── POST /products ─────────────────────────────────────────

  describe("POST /products", () => {
    it("creates product with valid GTIN and returns 201 with auto-generated DID and Digital Link", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-001",
          name: "Luxury Watch",
          description: "A beautiful timepiece",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);

      // Check product fields
      const product = body.data.product;
      expect(product.gtin).toBe(VALID_GTIN_13);
      expect(product.serialNumber).toBe("SN-001");
      expect(product.name).toBe("Luxury Watch");
      expect(product.description).toBe("A beautiful timepiece");
      expect(product.category).toBe("Watches");
      expect(product.status).toBe("DRAFT");
      expect(product.brandId).toBe(testBrandId);
      expect(product.did).toBe(`did:galileo:01:0${VALID_GTIN_13}:21:SN-001`);

      // Check passport
      const passport = body.data.passport;
      expect(passport).toBeDefined();
      expect(passport.digitalLink).toBe(
        `https://id.galileoprotocol.io/01/0${VALID_GTIN_13}/21/SN-001`,
      );
      expect(passport.productId).toBe(product.id);

      // Verify CREATED event was logged
      const events = await app.prisma.productEvent.findMany({
        where: { productId: product.id },
      });
      expect(events).toHaveLength(1);
      expect(events[0]!.type).toBe("CREATED");
    });

    it("allows OPERATOR to create products", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: operatorCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-OP-001",
          name: "Operator Product",
          category: "Jewelry",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.product.brandId).toBe(testBrandId);
    });

    it("returns 400 for invalid GTIN check digit", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: "4006381333932", // wrong check digit (should be 1)
          serialNumber: "SN-002",
          name: "Bad GTIN Product",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain("Invalid GTIN");
    });

    it("returns 400 for non-numeric GTIN", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: "400638ABCDEFG",
          serialNumber: "SN-003",
          name: "Bad GTIN Product",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it("returns 400 for wrong-length GTIN", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: "12345",
          serialNumber: "SN-004",
          name: "Short GTIN Product",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 409 for duplicate gtin+serial combination", async () => {
      // First creation
      const first = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-DUP",
          name: "First Product",
          category: "Watches",
        },
      });
      expect(first.statusCode).toBe(201);

      // Duplicate
      const second = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-DUP",
          name: "Duplicate Product",
          category: "Jewelry",
        },
      });

      expect(second.statusCode).toBe(409);
      const body = second.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
    });

    it("returns 401 without auth", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-NOAUTH",
          name: "No Auth Product",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 403 for VIEWER role", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: viewerCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "SN-VIEWER",
          name: "Viewer Product",
          category: "Watches",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 400 for missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          // missing serialNumber, name, category
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── GET /products ──────────────────────────────────────────

  describe("GET /products", () => {
    beforeEach(async () => {
      // Seed some products for the test brand
      for (let i = 0; i < 25; i++) {
        await app.inject({
          method: "POST",
          url: "/products",
          headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
          payload: {
            gtin: VALID_GTIN_13,
            serialNumber: `LIST-SN-${String(i).padStart(3, "0")}`,
            name: `Product ${i}`,
            category: "Watches",
          },
        });
      }

      // Seed a product for the other brand
      await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: otherBrandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13_B,
          serialNumber: "OTHER-001",
          name: "Other Brand Product",
          category: "Jewelry",
        },
      });
    });

    it("returns brand-scoped paginated list with default pagination", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products",
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.products).toHaveLength(20); // default limit
      expect(body.data.pagination.total).toBe(25);
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(20);
      expect(body.data.pagination.totalPages).toBe(2);

      // Should not include other brand's products
      for (const product of body.data.products) {
        expect(product.brandId).toBe(testBrandId);
      }
    });

    it("returns correct page with custom pagination", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products?page=2&limit=5",
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.products).toHaveLength(5);
      expect(body.data.pagination.page).toBe(2);
      expect(body.data.pagination.limit).toBe(5);
      expect(body.data.pagination.total).toBe(25);
      expect(body.data.pagination.totalPages).toBe(5);
    });

    it("returns empty array for page beyond total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products?page=100&limit=20",
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.products).toHaveLength(0);
      expect(body.data.pagination.total).toBe(25);
    });

    it("ADMIN sees all brands' products", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products?limit=100",
        headers: { cookie: adminCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.pagination.total).toBe(26); // 25 + 1 from other brand
    });

    it("VIEWER can list products (read access)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products",
        headers: { cookie: viewerCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      // VIEWER belongs to testBrand, so should see testBrand products
      expect(body.data.pagination.total).toBe(25);
    });

    it("returns 401 without auth", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── GET /products/:id ──────────────────────────────────────

  describe("GET /products/:id", () => {
    let productId: string;

    beforeEach(async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "DETAIL-001",
          name: "Detail Product",
          description: "For detail testing",
          category: "Watches",
        },
      });
      productId = createRes.json().data.product.id;
    });

    it("returns product with passport and events", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}`,
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);

      const product = body.data.product;
      expect(product.id).toBe(productId);
      expect(product.name).toBe("Detail Product");
      expect(product.passport).toBeDefined();
      expect(product.passport.digitalLink).toContain("id.galileoprotocol.io");
      expect(product.events).toBeDefined();
      expect(product.events.length).toBeGreaterThanOrEqual(1);
      expect(product.events[0].type).toBe("CREATED");
    });

    it("returns 404 for non-existent product", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/products/nonexistent-id-12345",
        headers: { cookie: brandAdminCookie },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 403 for other brand's product", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}`,
        headers: { cookie: otherBrandAdminCookie },
      });

      expect(response.statusCode).toBe(403);
    });

    it("ADMIN can see any brand's product", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}`,
        headers: { cookie: adminCookie },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.product.id).toBe(productId);
    });

    it("returns 401 without auth", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/products/${productId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── PATCH /products/:id ────────────────────────────────────

  describe("PATCH /products/:id", () => {
    let draftProductId: string;

    beforeEach(async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/products",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: VALID_GTIN_13,
          serialNumber: "PATCH-001",
          name: "Patchable Product",
          description: "Original description",
          category: "Watches",
        },
      });
      draftProductId = createRes.json().data.product.id;
    });

    it("updates name, description, category on DRAFT product and creates UPDATED event", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          name: "Updated Name",
          description: "Updated description",
          category: "Jewelry",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);

      const product = body.data.product;
      expect(product.name).toBe("Updated Name");
      expect(product.description).toBe("Updated description");
      expect(product.category).toBe("Jewelry");

      // Verify UPDATED event was created
      const updatedEvent = product.events.find(
        (e: { type: string }) => e.type === "UPDATED",
      );
      expect(updatedEvent).toBeDefined();
    });

    it("rejects update on ACTIVE product", async () => {
      // Change status to ACTIVE
      await app.prisma.product.update({
        where: { id: draftProductId },
        data: { status: "ACTIVE" },
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          name: "Should Not Update",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.error.message).toContain("non-DRAFT");
    });

    it("rejects gtin/serialNumber/did/status changes with 400", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          gtin: "9999999999999",
          serialNumber: "CHANGED",
          did: "did:galileo:01:fake:21:fake",
          status: "ACTIVE",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 403 for other brand's product", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { cookie: otherBrandAdminCookie, "x-galileo-client": "1" },
        payload: {
          name: "Intruder Update",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 404 for non-existent product", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/products/nonexistent-id-12345",
        headers: { cookie: brandAdminCookie, "x-galileo-client": "1" },
        payload: {
          name: "Ghost Update",
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 403 for VIEWER role", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { cookie: viewerCookie, "x-galileo-client": "1" },
        payload: {
          name: "Viewer Update",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 401 without auth", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/products/${draftProductId}`,
        headers: { "x-galileo-client": "1" },
        payload: {
          name: "No Auth Update",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});

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

// Mock viem — must precede all imports that touch viem (R06)
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(),
  getAddress: vi.fn((a: string) => a),
  verifyMessage: vi.fn(),
}));
vi.mock("viem/accounts", () => ({ privateKeyToAccount: vi.fn() }));
vi.mock("viem/chains", () => ({
  baseSepolia: { id: 84532, name: "Base Sepolia" },
}));

import { parseCookies, cleanDb } from "./helpers.js";

const VALID_GTIN_13 = "4006381333931";
const VALID_GTIN_13_B = "0012345678905";

function buildCsv(rows: string[][]): string {
  return rows.map((r) => r.join(",")).join("\n");
}

describe("POST /products/batch-import", () => {
  let app: FastifyInstance;
  let brandAdminCookie: string;
  let adminCookie: string;
  let viewerCookie: string;
  let testBrandId: string;
  let otherBrandId: string;
  let otherBrandAdminCookie: string;

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

    const brand = await app.prisma.brand.create({
      data: {
        name: "Test Brand",
        slug: "test-brand",
        did: "did:galileo:brand:test-brand",
      },
    });
    testBrandId = brand.id;

    const otherBrand = await app.prisma.brand.create({
      data: {
        name: "Other Brand",
        slug: "other-brand",
        did: "did:galileo:brand:other-brand",
      },
    });
    otherBrandId = otherBrand.id;

    // Register BRAND_ADMIN
    const baRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "ba@test.com",
        password: "Password123!",
        brandName: "Test Brand BA",
      },
    });
    const baCookies = parseCookies(baRes);
    brandAdminCookie = `galileo_at=${baCookies.galileo_at}`;
    // Assign brand
    const baUser = await app.prisma.user.findUnique({
      where: { email: "ba@test.com" },
    });
    await app.prisma.user.update({
      where: { id: baUser!.id },
      data: { brandId: testBrandId, role: "BRAND_ADMIN" },
    });
    // Re-login to get updated token
    const baLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "ba@test.com", password: "Password123!" },
    });
    brandAdminCookie = `galileo_at=${parseCookies(baLogin).galileo_at}`;

    // Register ADMIN
    const adRes = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "admin@test.com",
        password: "Password123!",
        brandName: "Admin Brand",
      },
    });
    await app.prisma.user.update({
      where: { email: "admin@test.com" },
      data: { role: "ADMIN" },
    });
    const adLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@test.com", password: "Password123!" },
    });
    adminCookie = `galileo_at=${parseCookies(adLogin).galileo_at}`;

    // Register VIEWER
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "viewer@test.com",
        password: "Password123!",
        brandName: "Viewer Brand",
      },
    });
    await app.prisma.user.update({
      where: { email: "viewer@test.com" },
      data: { role: "VIEWER" },
    });
    const vLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "viewer@test.com", password: "Password123!" },
    });
    viewerCookie = `galileo_at=${parseCookies(vLogin).galileo_at}`;

    // Other BRAND_ADMIN
    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "other-ba@test.com",
        password: "Password123!",
        brandName: "Other BA Brand",
      },
    });
    const otherUser = await app.prisma.user.findUnique({
      where: { email: "other-ba@test.com" },
    });
    await app.prisma.user.update({
      where: { id: otherUser!.id },
      data: { brandId: otherBrandId, role: "BRAND_ADMIN" },
    });
    const otherLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "other-ba@test.com", password: "Password123!" },
    });
    otherBrandAdminCookie = `galileo_at=${parseCookies(otherLogin).galileo_at}`;
  });

  function injectCsv(csvContent: string, cookie: string, query: string = "") {
    const boundary = "----TestBoundary";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="products.csv"',
      "Content-Type: text/csv",
      "",
      csvContent,
      `--${boundary}--`,
    ].join("\r\n");

    return app.inject({
      method: "POST",
      url: `/products/batch-import${query}`,
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        cookie,
        "x-galileo-client": "1",
      },
      payload: body,
    });
  }

  it("should import valid CSV with 5 products (201)", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Bag A", VALID_GTIN_13, "SN001", "Leather Goods", "Desc A", "leather"],
      ["Bag B", VALID_GTIN_13, "SN002", "Leather Goods", "Desc B", "leather"],
      ["Watch C", VALID_GTIN_13, "SN003", "Watches", "Desc C", "steel"],
      ["Ring D", VALID_GTIN_13, "SN004", "Jewelry", "Desc D", "gold"],
      ["Perf E", VALID_GTIN_13, "SN005", "Fragrances", "Desc E", ""],
    ]);

    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.success).toBe(true);
    expect(data.data.created).toBe(5);
    expect(data.data.errors).toHaveLength(0);

    // Verify products exist in DB
    const products = await app.prisma.product.findMany({
      where: { gtin: VALID_GTIN_13 },
    });
    expect(products).toHaveLength(5);
  });

  it("should report errors for invalid GTIN rows in partial mode", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Good", VALID_GTIN_13, "SN100", "Watches", "", ""],
      ["Bad", "0000000000001", "SN101", "Watches", "", ""],
    ]);

    const res = await injectCsv(csv, brandAdminCookie, "?partial=true");
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.data.created).toBe(1);
    expect(data.data.errors).toHaveLength(1);
    expect(data.data.errors[0].field).toBe("gtin");
  });

  it("should report error for duplicate GTIN+serial within CSV", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Item A", VALID_GTIN_13, "DUPE001", "Jewelry", "", ""],
      ["Item B", VALID_GTIN_13, "DUPE001", "Jewelry", "", ""],
    ]);

    const res = await injectCsv(csv, brandAdminCookie, "?partial=true");
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.data.created).toBe(1);
    expect(data.data.errors).toHaveLength(1);
    expect(data.data.errors[0].message).toContain("Duplicate");
  });

  it("should return 0 created for empty CSV (header only)", async () => {
    const csv = "name,gtin,serialNumber,category,description,materials\n";
    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.data.created).toBe(0);
    expect(data.data.errors).toHaveLength(0);
  });

  it("should return 400 when exceeding 500 rows", async () => {
    const header = [
      "name",
      "gtin",
      "serialNumber",
      "category",
      "description",
      "materials",
    ];
    const rows = [header];
    for (let i = 0; i < 501; i++) {
      rows.push([`Item${i}`, VALID_GTIN_13, `SN${i}`, "Watches", "", ""]);
    }
    const csv = buildCsv(rows);
    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(400);
  });

  it("should allow BRAND_ADMIN to import for own brand", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Mine", VALID_GTIN_13, "OWN001", "Fashion", "", ""],
    ]);
    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(201);
    expect(res.json().data.created).toBe(1);
  });

  it("should reject VIEWER role with 403", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["X", VALID_GTIN_13, "V001", "Fashion", "", ""],
    ]);
    const res = await injectCsv(csv, viewerCookie);
    expect(res.statusCode).toBe(403);
  });

  it("should reject unauthenticated request with 401", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["X", VALID_GTIN_13, "U001", "Fashion", "", ""],
    ]);
    const res = await injectCsv(csv, "galileo_at=invalid");
    expect(res.statusCode).toBe(401);
  });

  it("should return 400 for malformed CSV (missing columns)", async () => {
    const csv = "name,gtin\nTest,123\n";
    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(400);
  });

  it("should roll back all rows when one is invalid in transaction mode (default)", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Good", VALID_GTIN_13, "TX001", "Watches", "", ""],
      ["Bad", "0000000000001", "TX002", "Watches", "", ""],
    ]);

    const res = await injectCsv(csv, brandAdminCookie);
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.data.created).toBe(0);
    expect(data.data.errors.length).toBeGreaterThan(0);
  });

  it("should create valid rows and report invalid in partial mode", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Good1", VALID_GTIN_13, "P001", "Watches", "", ""],
      ["Bad1", "0000000000001", "P002", "Watches", "", ""],
      ["Good2", VALID_GTIN_13, "P003", "Jewelry", "", ""],
    ]);

    const res = await injectCsv(csv, brandAdminCookie, "?partial=true");
    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.data.created).toBe(2);
    expect(data.data.errors).toHaveLength(1);
  });

  it("should require ADMIN to provide brandId", async () => {
    const csv = buildCsv([
      ["name", "gtin", "serialNumber", "category", "description", "materials"],
      ["Admin Item", VALID_GTIN_13, "ADM001", "Fashion", "", ""],
    ]);

    // Without brandId query param
    const res = await injectCsv(csv, adminCookie);
    expect(res.statusCode).toBe(400);
    expect(res.json().error.message).toContain("brandId");

    // With brandId
    const res2 = await injectCsv(csv, adminCookie, `?brandId=${testBrandId}`);
    expect(res2.statusCode).toBe(201);
    expect(res2.json().data.created).toBe(1);
  });
});

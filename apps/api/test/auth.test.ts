import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { buildApp } from "../src/server.js";
import type { FastifyInstance } from "fastify";

describe("Auth endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Clean up test users before each test to avoid state leakage
  beforeEach(async () => {
    // Delete test users (cascade will handle related records)
    await app.prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "register@test.com",
            "duplicate@test.com",
            "brand@test.com",
            "brand-collision@test.com",
            "brand-collision2@test.com",
            "login@test.com",
            "refresh@test.com",
            "me@test.com",
          ],
        },
      },
    });
    // Delete test brands
    await app.prisma.brand.deleteMany({
      where: {
        slug: {
          in: ["acme-luxury", "test-brand", "collision-brand"],
        },
      },
    });
  });

  // ─── Register ───────────────────────────────────────────────

  describe("POST /auth/register", () => {
    it("creates user and returns 201 with tokens", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "register@test.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("register@test.com");
      expect(body.data.user.role).toBe("VIEWER");
      expect(body.data.user.brandId).toBeNull();
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
      // Must NOT include passwordHash
      expect(body.data.user.passwordHash).toBeUndefined();
    });

    it("creates user with brand when brandName is provided", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "brand@test.com",
          password: "password123",
          brandName: "Acme Luxury",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.user.role).toBe("BRAND_ADMIN");
      expect(body.data.user.brandId).toBeDefined();
      expect(body.data.user.brandId).not.toBeNull();

      // Verify brand was created with correct DID
      const brand = await app.prisma.brand.findUnique({
        where: { slug: "acme-luxury" },
      });
      expect(brand).not.toBeNull();
      expect(brand!.did).toBe("did:galileo:brand:acme-luxury");
      expect(brand!.name).toBe("Acme Luxury");
    });

    it("returns 409 for duplicate email", async () => {
      // First registration
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "duplicate@test.com",
          password: "password123",
        },
      });

      // Second registration with same email
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "duplicate@test.com",
          password: "password456",
        },
      });

      expect(response.statusCode).toBe(409);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
    });

    it("returns 400 for invalid email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "not-an-email",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for short password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "register@test.com",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // ─── Login ──────────────────────────────────────────────────

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a user to test login
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "login@test.com",
          password: "password123",
        },
      });
    });

    it("returns 200 with tokens for valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "login@test.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("login@test.com");
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
      expect(body.data.user.passwordHash).toBeUndefined();
    });

    it("returns 401 for wrong password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "login@test.com",
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toBe("Invalid email or password");
    });

    it("returns 401 with same message for non-existent email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "nonexistent@test.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
      // Same message as wrong password (prevent enumeration)
      expect(body.error.message).toBe("Invalid email or password");
    });
  });

  // ─── Refresh ────────────────────────────────────────────────

  describe("POST /auth/refresh", () => {
    it("returns new tokens for valid refresh token", async () => {
      // Register a user to get tokens
      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "refresh@test.com",
          password: "password123",
        },
      });

      const { refreshToken } = registerRes.json().data;

      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
      expect(typeof body.data.accessToken).toBe("string");
      expect(typeof body.data.refreshToken).toBe("string");
    });

    it("returns 401 for invalid refresh token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "invalid-token-here" },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });
  });

  // ─── Me ─────────────────────────────────────────────────────

  describe("GET /auth/me", () => {
    it("returns user profile with valid JWT", async () => {
      // Register a user to get tokens
      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "me@test.com",
          password: "password123",
        },
      });

      const { accessToken } = registerRes.json().data;

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("me@test.com");
      expect(body.data.user.role).toBe("VIEWER");
      expect(body.data.user.passwordHash).toBeUndefined();
    });

    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 with invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── JWT Payload ────────────────────────────────────────────

  describe("JWT Payload", () => {
    it("contains only sub, role, brandId, iat, exp — no PII", async () => {
      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "register@test.com",
          password: "password123",
        },
      });

      const { accessToken } = registerRes.json().data;

      // Decode the JWT (base64 decode the payload)
      const payloadBase64 = accessToken.split(".")[1]!;
      const payload = JSON.parse(
        Buffer.from(payloadBase64, "base64").toString("utf8"),
      );

      // Must contain ONLY these fields
      const allowedKeys = new Set(["sub", "role", "brandId", "iat", "exp"]);
      const payloadKeys = new Set(Object.keys(payload));

      expect(payloadKeys).toEqual(allowedKeys);
      // Must NOT contain email or any PII
      expect(payload.email).toBeUndefined();
      expect(payload.name).toBeUndefined();
    });
  });

  // ─── Security: Refresh Token Hashing ────────────────────────

  describe("Refresh token hashing", () => {
    it("stores hashed refresh token in database, not raw token", async () => {
      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "register@test.com",
          password: "password123",
        },
      });

      const { refreshToken, user } = registerRes.json().data;

      // Fetch the user from DB and check the stored token
      const dbUser = await app.prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser).not.toBeNull();
      // Stored token should NOT be the raw refresh token
      expect(dbUser!.refreshToken).not.toBe(refreshToken);
      // Stored token should be the SHA-256 hash of the refresh token
      const expectedHash = createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      expect(dbUser!.refreshToken).toBe(expectedHash);
    });

    it("stores hashed refresh token after login", async () => {
      // First register
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "login@test.com",
          password: "password123",
        },
      });

      // Then login
      const loginRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "login@test.com",
          password: "password123",
        },
      });

      const { refreshToken, user } = loginRes.json().data;

      const dbUser = await app.prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser!.refreshToken).not.toBe(refreshToken);
      const expectedHash = createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      expect(dbUser!.refreshToken).toBe(expectedHash);
    });

    it("stores hashed refresh token after token refresh", async () => {
      // Register to get initial tokens
      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "refresh@test.com",
          password: "password123",
        },
      });

      const { refreshToken: initialToken } = registerRes.json().data;

      // Refresh the token
      const refreshRes = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: initialToken },
      });

      expect(refreshRes.statusCode).toBe(200);
      const { refreshToken: newToken } = refreshRes.json().data;

      // Check the DB stores the hash of the NEW token
      const dbUser = await app.prisma.user.findUnique({
        where: { email: "refresh@test.com" },
      });

      expect(dbUser!.refreshToken).not.toBe(newToken);
      const expectedHash = createHash("sha256")
        .update(newToken)
        .digest("hex");
      expect(dbUser!.refreshToken).toBe(expectedHash);
    });
  });

  // ─── Security: Brand Slug Collision ─────────────────────────

  describe("Brand slug collision", () => {
    it("returns 409 when brand slug already exists", async () => {
      // First registration with a brand
      const res1 = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "brand-collision@test.com",
          password: "password123",
          brandName: "Collision Brand",
        },
      });
      expect(res1.statusCode).toBe(201);

      // Second registration with different email but same brand name → slug collision
      const res2 = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "brand-collision2@test.com",
          password: "password123",
          brandName: "Collision Brand",
        },
      });

      expect(res2.statusCode).toBe(409);
      const body = res2.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
    });
  });
});

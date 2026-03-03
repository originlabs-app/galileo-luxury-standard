import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import healthRoutes from "../src/routes/health.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    await app.register(healthRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with status ok", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  it("returns the correct version from package.json", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const body = response.json();
    expect(body.version).toBe("0.0.0");
  });

  it("does not require authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Should return 200 even without auth headers
    expect(response.statusCode).toBe(200);
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import healthRoutes from "../src/routes/health.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    // Mock prisma decorator (healthy DB)
    app.decorate("prisma", {
      $queryRawUnsafe: async () => [{ "?column?": 1 }],
    });
    // Mock chain decorator (disabled)
    app.decorate("chain", { chainEnabled: false });
    await app.register(healthRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with status ok and dependency status", async () => {
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
    expect(body.dependencies).toBeDefined();
    expect(body.dependencies.database).toBe("ok");
    expect(body.dependencies.chain).toBe("disabled");
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

  it("returns 503 with degraded status when DB is down", async () => {
    const degradedApp = Fastify();
    // Mock prisma decorator (unhealthy DB)
    degradedApp.decorate("prisma", {
      $queryRawUnsafe: async () => {
        throw new Error("Connection refused");
      },
    });
    degradedApp.decorate("chain", { chainEnabled: false });
    await degradedApp.register(healthRoutes);
    await degradedApp.ready();

    const response = await degradedApp.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(503);
    const body = response.json();
    expect(body.status).toBe("degraded");
    expect(body.dependencies.database).toBe("error");

    await degradedApp.close();
  });

  it("reports chain status as ok when chain is enabled and responsive", async () => {
    const chainApp = Fastify();
    chainApp.decorate("prisma", {
      $queryRawUnsafe: async () => [{ "?column?": 1 }],
    });
    chainApp.decorate("chain", {
      chainEnabled: true,
      publicClient: {
        getChainId: async () => 84532,
      },
    });
    await chainApp.register(healthRoutes);
    await chainApp.ready();

    const response = await chainApp.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.dependencies.chain).toBe("ok");

    await chainApp.close();
  });

  it("reports chain status as error when chain is enabled but unresponsive", async () => {
    const chainApp = Fastify();
    chainApp.decorate("prisma", {
      $queryRawUnsafe: async () => [{ "?column?": 1 }],
    });
    chainApp.decorate("chain", {
      chainEnabled: true,
      publicClient: {
        getChainId: async () => {
          throw new Error("RPC timeout");
        },
      },
    });
    await chainApp.register(healthRoutes);
    await chainApp.ready();

    const response = await chainApp.inject({
      method: "GET",
      url: "/health",
    });

    // DB is ok, chain error doesn't degrade overall status
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.dependencies.chain).toBe("error");

    await chainApp.close();
  });
});

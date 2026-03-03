import type { FastifyInstance } from "fastify";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            version: { type: "string" },
            uptime: { type: "number" },
          },
        },
      },
    },
  }, async () => {
    return {
      status: "ok" as const,
      version: pkg.version,
      uptime: process.uptime(),
    };
  });
}

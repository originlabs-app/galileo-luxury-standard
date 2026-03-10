import type { FastifyInstance } from "fastify";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint with dependency status",
        tags: ["Health"],
      },
    },
    async (_request, reply) => {
      // Database check
      let dbStatus: "ok" | "error" = "error";
      try {
        await fastify.prisma.$queryRawUnsafe("SELECT 1");
        dbStatus = "ok";
      } catch {
        dbStatus = "error";
      }

      // Chain RPC check
      let chainStatus: "ok" | "disabled" | "error" = "disabled";
      if (fastify.chain.chainEnabled) {
        try {
          await fastify.chain.publicClient.getChainId();
          chainStatus = "ok";
        } catch {
          chainStatus = "error";
        }
      }

      const status = dbStatus === "ok" ? "ok" : "degraded";
      const statusCode = status === "ok" ? 200 : 503;

      return reply.status(statusCode).send({
        status,
        version: pkg.version,
        uptime: process.uptime(),
        deployment: {
          environment: fastify.chain.deployment.environment,
          network: fastify.chain.deployment.network,
          chainId: fastify.chain.deployment.chainId,
          status: fastify.chain.deployment.status,
          explorer: {
            name: fastify.chain.deployment.explorer.name,
            baseUrl: fastify.chain.explorer.baseUrl,
          },
          issuance: fastify.chain.issuance,
          infrastructure: fastify.chain.deployment.infrastructure,
          rpcConfigured: fastify.chain.rpcConfigured,
          writeEnabled: fastify.chain.chainEnabled,
          writeCredentialsConfigured: fastify.chain.writeCredentialsConfigured,
          basescanConfigured: fastify.chain.writeVerificationConfigured,
        },
        dependencies: {
          database: dbStatus,
          chain: chainStatus,
        },
      });
    },
  );
}

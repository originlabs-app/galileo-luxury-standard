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
      let dbStatus: "ok" | "error";
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
      const contracts = Object.fromEntries(
        Object.entries(fastify.chain.deployment.infrastructure).map(
          ([name, address]) => [
            name,
            {
              address,
              explorerUrl: address
                ? fastify.chain.explorer.addressUrl(address)
                : null,
            },
          ],
        ),
      );
      const deployedContractCount = Object.values(
        fastify.chain.deployment.infrastructure,
      ).filter(Boolean).length;

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
            txBaseUrl: `${fastify.chain.explorer.baseUrl}${fastify.chain.deployment.explorer.txPath}`,
            addressBaseUrl: `${fastify.chain.explorer.baseUrl}${fastify.chain.deployment.explorer.addressPath}`,
          },
          issuance: fastify.chain.issuance,
          contracts,
          contractCount: deployedContractCount,
          rpcConfigured: fastify.chain.rpcConfigured,
          writeEnabled: fastify.chain.chainEnabled,
          writeMode: fastify.chain.chainEnabled ? "enabled" : "read-only",
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

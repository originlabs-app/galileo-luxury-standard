import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { EventType } from "@galileo/shared";
import { requireRole } from "../../middleware/rbac.js";
import { RouteError } from "../../utils/route-error.js";
import { enqueueWebhookEvent } from "../../services/webhooks/outbox.js";

export default async function mintProductRoute(fastify: FastifyInstance) {
  fastify.post<{ Params: { id: string } }>(
    "/products/:id/mint",
    {
      onRequest: [fastify.authenticate, requireRole("BRAND_ADMIN", "ADMIN")],
      schema: {
        description:
          "Mint a DRAFT product on-chain, transitioning it to ACTIVE status",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Product ID" },
          },
          required: ["id"],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user;

      // brandId null guard: non-ADMIN users without a brandId cannot access product routes
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand",
          },
        });
      }

      // Real chain mode — not yet implemented
      if (fastify.chain.chainEnabled) {
        return reply.status(503).send({
          success: false,
          error: {
            code: "NOT_IMPLEMENTED",
            message: "Real chain minting not yet implemented",
          },
        });
      }

      // Mock mode: generate synthetic on-chain data
      const txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
      const tokenAddress = `0x${crypto.randomBytes(20).toString("hex")}`;
      const chainId = 84532; // Base Sepolia
      const mintedAt = new Date();

      // Optimistic concurrency control: lookup product, verify DRAFT status, then
      // use updateMany WHERE status=DRAFT to atomically flip to ACTIVE.
      // If a concurrent request already changed the status, updateMany returns count=0
      // and we return 409 — preventing TOCTOU race conditions without row-level locks.
      try {
        await fastify.prisma.$transaction(
          async (tx: import("../../plugins/prisma.js").TxClient) => {
            const product = await tx.product.findUnique({
              where: { id },
              include: { passport: true },
            });

            if (!product) {
              throw new RouteError(404, "NOT_FOUND", "Product not found");
            }

            // Brand scoping: BRAND_ADMIN can only mint their own brand's products; ADMIN can mint any
            if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
              throw new RouteError(403, "FORBIDDEN", "Access denied");
            }

            // Product must be in DRAFT status
            if (product.status !== "DRAFT") {
              throw new RouteError(
                409,
                "CONFLICT",
                "Product is not in DRAFT status",
              );
            }

            // Use conditional update to prevent race: only update if status is still DRAFT
            const updated = await tx.product.updateMany({
              where: { id, status: "DRAFT" },
              data: { status: "ACTIVE" },
            });

            if (updated.count === 0) {
              throw new RouteError(
                409,
                "CONFLICT",
                "Product is not in DRAFT status",
              );
            }

            await tx.productPassport.update({
              where: { productId: id },
              data: {
                txHash,
                tokenAddress,
                chainId,
                mintedAt,
              },
            });

            await tx.productEvent.create({
              data: {
                productId: id,
                type: "MINTED",
                data: { txHash, tokenAddress, chainId },
                performedBy: user.sub,
              },
            });
          },
        );
      } catch (err) {
        if (err instanceof RouteError) {
          return reply.status(err.statusCode).send({
            success: false,
            error: {
              code: err.code,
              message: err.message,
            },
          });
        }
        throw err;
      }

      // Re-fetch with all relations for complete response
      const fullProduct = await fastify.prisma.product.findUnique({
        where: { id },
        include: {
          passport: true,
          events: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });

      if (!fullProduct) {
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Product not found after mint — this should not happen",
          },
        });
      }

      // Fire webhook (non-blocking, R29 — cross-cutting hooks fail silently)
      await enqueueWebhookEvent(fastify.prisma, EventType.MINTED, id, {
        productId: id,
        txHash,
        tokenAddress,
      }).catch(() => {
        // Webhook enqueue failure must not break the request
      });

      return reply.status(200).send({
        success: true,
        data: { product: fullProduct },
      });
    },
  );
}

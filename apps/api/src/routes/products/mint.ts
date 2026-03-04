import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { requireRole } from "../../middleware/rbac.js";

export default async function mintProductRoute(fastify: FastifyInstance) {
  fastify.post<{ Params: { id: string } }>(
    "/products/:id/mint",
    {
      onRequest: [
        fastify.authenticate,
        requireRole("BRAND_ADMIN"),
      ],
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

      // Atomically: lookup product with DRAFT status, update to ACTIVE, update passport, create event
      // This prevents TOCTOU race conditions on concurrent mint requests
      try {
        await fastify.prisma.$transaction(async (tx) => {
          // Atomic lookup + status check: only find product if it's in DRAFT status
          const product = await tx.product.findUnique({
            where: { id },
            include: { passport: true },
          });

          if (!product) {
            throw new MintError(404, "NOT_FOUND", "Product not found");
          }

          // Brand scoping: BRAND_ADMIN can only mint their own brand's products
          if (product.brandId !== user.brandId) {
            throw new MintError(403, "FORBIDDEN", "Access denied");
          }

          // Product must be in DRAFT status
          if (product.status !== "DRAFT") {
            throw new MintError(409, "CONFLICT", "Product is not in DRAFT status");
          }

          // Use conditional update to prevent race: only update if status is still DRAFT
          const updated = await tx.product.updateMany({
            where: { id, status: "DRAFT" },
            data: { status: "ACTIVE" },
          });

          if (updated.count === 0) {
            throw new MintError(409, "CONFLICT", "Product is not in DRAFT status");
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
        });
      } catch (err) {
        if (err instanceof MintError) {
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
          },
        },
      });

      return reply.status(200).send({
        success: true,
        data: { product: fullProduct },
      });
    },
  );
}

class MintError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "MintError";
  }
}

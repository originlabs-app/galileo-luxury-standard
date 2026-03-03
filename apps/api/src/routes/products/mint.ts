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

      // Find the product with passport
      const product = await fastify.prisma.product.findUnique({
        where: { id },
        include: { passport: true },
      });

      if (!product) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        });
      }

      // Brand scoping: BRAND_ADMIN can only mint their own brand's products
      if (product.brandId !== user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        });
      }

      // Product must be in DRAFT status
      if (product.status !== "DRAFT") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "CONFLICT",
            message: "Product is not in DRAFT status",
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

      // Update product, passport, and create MINTED event in a transaction
      await fastify.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: { status: "ACTIVE" },
        });

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

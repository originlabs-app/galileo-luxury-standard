import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { EventType } from "@galileo/shared";
import { requireRole } from "../../middleware/rbac.js";
import { enqueueWebhookEvent } from "../../services/webhooks/outbox.js";

const CHAIN_ID = 84532; // Base Sepolia

const batchMintBodySchema = z
  .object({
    productIds: z.array(z.string().min(1)).min(1).max(100),
  })
  .strict();

interface MintError {
  productId: string;
  message: string;
}

export default async function batchMintRoute(fastify: FastifyInstance) {
  fastify.post(
    "/products/batch-mint",
    {
      onRequest: [fastify.authenticate, requireRole("BRAND_ADMIN", "ADMIN")],
      schema: {
        description:
          "Batch mint an array of DRAFT products, transitioning them to ACTIVE status",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;

      // Brand scoping guard
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "User must belong to a brand" },
        });
      }

      const parsed = batchMintBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const { productIds } = parsed.data;

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

      // Fetch all products
      const products = await fastify.prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { passport: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Pre-validate: check existence, status, and brand scoping
      const errors: MintError[] = [];
      const toMint: string[] = [];

      for (const id of productIds) {
        const product = productMap.get(id);
        if (!product) {
          errors.push({ productId: id, message: "Product not found" });
          continue;
        }

        if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
          return reply.status(403).send({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access denied: cross-brand product in batch",
            },
          });
        }

        if (product.status === "ACTIVE") {
          errors.push({ productId: id, message: "Product already minted" });
          continue;
        }

        if (product.status === "RECALLED") {
          errors.push({
            productId: id,
            message: "Cannot mint recalled product",
          });
          continue;
        }

        if (product.status !== "DRAFT") {
          errors.push({
            productId: id,
            message: `Product is in ${product.status} status`,
          });
          continue;
        }

        toMint.push(id);
      }

      // Mint valid products in a transaction
      let minted = 0;
      const mintedProducts: Array<{
        id: string;
        txHash: string;
        tokenAddress: string;
      }> = [];

      if (toMint.length > 0) {
        try {
          await fastify.prisma.$transaction(
            async (tx: import("../../plugins/prisma.js").TxClient) => {
              for (const id of toMint) {
                const txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
                const tokenAddress = `0x${crypto.randomBytes(20).toString("hex")}`;
                const mintedAt = new Date();

                // Optimistic concurrency: only update if still DRAFT
                const updated = await tx.product.updateMany({
                  where: { id, status: "DRAFT" },
                  data: { status: "ACTIVE" },
                });

                if (updated.count === 0) {
                  errors.push({
                    productId: id,
                    message: "Product status changed concurrently",
                  });
                  continue;
                }

                await tx.productPassport.update({
                  where: { productId: id },
                  data: { txHash, tokenAddress, chainId: CHAIN_ID, mintedAt },
                });

                await tx.productEvent.create({
                  data: {
                    productId: id,
                    type: "MINTED",
                    data: { txHash, tokenAddress, chainId: CHAIN_ID },
                    performedBy: user.sub,
                  },
                });

                mintedProducts.push({ id, txHash, tokenAddress });
                minted++;
              }
            },
          );
        } catch {
          // Transaction failed entirely
          minted = 0;
          mintedProducts.length = 0;
        }
      }

      // Fire webhooks (non-blocking, R29)
      for (const mp of mintedProducts) {
        try {
          enqueueWebhookEvent(EventType.MINTED, mp.id, {
            productId: mp.id,
            txHash: mp.txHash,
            tokenAddress: mp.tokenAddress,
          });
        } catch {
          // Webhook enqueue failure must not break the request
        }
      }

      return reply.status(200).send({
        success: true,
        data: { minted, errors },
      });
    },
  );
}

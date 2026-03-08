import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/rbac.js";
import { RouteError } from "../../utils/route-error.js";

/** Validates an Ethereum address: 0x followed by 40 hex characters */
const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export default async function transferProductRoute(fastify: FastifyInstance) {
  fastify.post<{
    Params: { id: string };
    Body: { toAddress: string };
  }>(
    "/products/:id/transfer",
    {
      onRequest: [fastify.authenticate, requireRole("BRAND_ADMIN", "ADMIN")],
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user;
      const toAddress = request.body?.toAddress;

      // Validate toAddress presence and format
      if (
        !toAddress ||
        typeof toAddress !== "string" ||
        !ETH_ADDRESS_RE.test(toAddress)
      ) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message:
              "toAddress must be a valid Ethereum address (0x + 40 hex chars)",
          },
        });
      }

      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand",
          },
        });
      }

      try {
        await fastify.prisma.$transaction(
          async (tx: import("../../plugins/prisma.js").TxClient) => {
            const product = await tx.product.findUnique({
              where: { id },
              select: {
                id: true,
                brandId: true,
                status: true,
                walletAddress: true,
              },
            });

            if (!product) {
              throw new RouteError(404, "NOT_FOUND", "Product not found");
            }

            if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
              throw new RouteError(403, "FORBIDDEN", "Access denied");
            }

            if (product.status !== "ACTIVE") {
              throw new RouteError(
                409,
                "CONFLICT",
                "Only ACTIVE products can be transferred",
              );
            }

            const fromAddress = product.walletAddress ?? null;

            await tx.product.update({
              where: { id },
              data: { walletAddress: toAddress },
            });

            await tx.productEvent.create({
              data: {
                productId: id,
                type: "TRANSFERRED",
                data: { from: fromAddress, to: toAddress },
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

      const fullProduct = await fastify.prisma.product.findUnique({
        where: { id },
        include: {
          passport: true,
          events: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      });

      if (!fullProduct) {
        return reply.status(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message:
              "Product not found after transfer — this should not happen",
          },
        });
      }

      return reply.status(200).send({
        success: true,
        data: { product: fullProduct },
      });
    },
  );
}

import type { FastifyInstance } from "fastify";
import { EventType } from "@galileo/shared";
import { errorResponseSchema } from "../../utils/schemas.js";

export default async function verifyProductRoute(fastify: FastifyInstance) {
  fastify.post<{
    Params: { id: string };
    Body: { location?: string; userAgent?: string } | undefined;
  }>(
    "/products/:id/verify",
    {
      schema: {
        description:
          "Verify a product by its ID. Public endpoint — no authentication required. " +
          "Records a VERIFIED event for anti-counterfeiting analytics.",
        tags: ["Products"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Product ID" },
          },
          required: ["id"],
        },
        response: {
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const location = request.body?.location ?? "";
      const userAgent = request.body?.userAgent ?? "";

      // Optional auth: try to extract user ID from cookie if present
      let performedBy: string | null = null;
      try {
        await request.jwtVerify();
        performedBy = request.user.sub;
      } catch {
        // No valid auth — that's fine, this is a public endpoint
      }

      // Look up the product
      const product = await fastify.prisma.product.findUnique({
        where: { id },
        select: { id: true, status: true },
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

      // Only ACTIVE products can be verified
      if (product.status !== "ACTIVE") {
        return reply.status(200).send({
          success: true,
          data: {
            verified: false,
            status: product.status,
            reason: "Product is not active",
          },
        });
      }

      // Record the VERIFIED event
      await fastify.prisma.productEvent.create({
        data: {
          productId: id,
          type: EventType.VERIFIED,
          data: { location, userAgent },
          performedBy,
        },
      });

      // Re-fetch with full relations for the response
      const fullProduct = await fastify.prisma.product.findUnique({
        where: { id },
        include: {
          passport: true,
          events: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      });

      return reply.status(200).send({
        success: true,
        data: {
          verified: true,
          product: fullProduct,
        },
      });
    },
  );
}

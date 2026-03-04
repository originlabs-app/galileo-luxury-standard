import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../../middleware/rbac.js";

const PRODUCT_CATEGORIES = [
  "Leather Goods",
  "Jewelry",
  "Watches",
  "Fashion",
  "Accessories",
  "Other",
] as const;

const updateProductBody = z
  .object({
    name: z.string().min(1).max(255, "Name must be at most 255 characters").optional(),
    description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
    category: z.enum(PRODUCT_CATEGORIES, { message: "Category must be one of: Leather Goods, Jewelry, Watches, Fashion, Accessories, Other" }).optional(),
  })
  .strict();

export default async function updateProductRoute(fastify: FastifyInstance) {
  fastify.patch<{ Params: { id: string } }>(
    "/products/:id",
    {
      onRequest: [
        fastify.authenticate,
        requireRole("BRAND_ADMIN", "OPERATOR", "ADMIN"),
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

      // Validate body — reject any fields beyond name/description/category
      const parsed = updateProductBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input. Only name, description, and category can be updated.",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const updateData = parsed.data;

      // Must have at least one field to update
      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No valid fields to update",
          },
        });
      }

      // Find the product
      const product = await fastify.prisma.product.findUnique({
        where: { id },
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

      // Brand scoping
      if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        });
      }

      // Only DRAFT products can be updated
      if (product.status !== "DRAFT") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Cannot update a non-DRAFT product",
          },
        });
      }

      // Update product and create UPDATED event in a transaction
      const updated = await fastify.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: updateData,
        });

        await tx.productEvent.create({
          data: {
            productId: id,
            type: "UPDATED",
            data: updateData,
            performedBy: user.sub,
          },
        });

        // Re-fetch to include the new event
        return tx.product.findUnique({
          where: { id },
          include: {
            passport: true,
            events: {
              orderBy: { createdAt: "desc" },
            },
          },
        });
      });

      return reply.status(200).send({
        success: true,
        data: { product: updated },
      });
    },
  );
}

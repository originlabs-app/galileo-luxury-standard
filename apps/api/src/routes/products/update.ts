import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../../middleware/rbac.js";
import { ensureSameWorkspaceBrand } from "../../utils/workspace.js";

const PRODUCT_CATEGORIES = [
  "Leather Goods",
  "Jewelry",
  "Watches",
  "Fashion",
  "Accessories",
  "Fragrances",
  "Eyewear",
  "Other",
] as const;

const materialSchema = z.object({
  name: z.string().min(1).max(100),
  percentage: z.number().min(0).max(100),
});

const updateProductBody = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255, "Name must be at most 255 characters")
      .optional(),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),
    category: z
      .enum(PRODUCT_CATEGORIES, {
        message:
          "Category must be one of: Leather Goods, Jewelry, Watches, Fashion, Accessories, Fragrances, Eyewear, Other",
      })
      .optional(),
    materials: z.array(materialSchema).max(20).optional(),
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
      schema: {
        description: "Update a DRAFT product's name, description, or category",
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

      // Validate body — reject any fields beyond name/description/category
      const parsed = updateProductBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Invalid input. Only name, description, category, and materials can be updated.",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const { materials, ...productFields } = parsed.data;

      // Must have at least one field to update (product fields or materials)
      if (Object.keys(productFields).length === 0 && materials === undefined) {
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

      if (!ensureSameWorkspaceBrand(reply, user, product.brandId)) {
        return;
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
      const updated = await fastify.prisma.$transaction(
        async (tx: import("../../plugins/prisma.js").TxClient) => {
          if (Object.keys(productFields).length > 0) {
            await tx.product.update({
              where: { id },
              data: productFields,
            });
          }

          // Store materials in passport metadata (merge with existing)
          if (materials !== undefined) {
            const passport = await tx.productPassport.findUnique({
              where: { productId: id },
            });
            if (passport) {
              const existingMetadata =
                (passport.metadata as Record<string, unknown>) ?? {};
              await tx.productPassport.update({
                where: { id: passport.id },
                data: {
                  metadata: { ...existingMetadata, materials },
                },
              });
            }
          }

          await tx.productEvent.create({
            data: {
              productId: id,
              type: "UPDATED",
              data: { ...productFields, ...(materials ? { materials } : {}) },
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
        },
      );

      return reply.status(200).send({
        success: true,
        data: { product: updated },
      });
    },
  );
}

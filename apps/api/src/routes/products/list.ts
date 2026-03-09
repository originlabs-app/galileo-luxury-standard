import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ProductStatus } from "@galileo/shared";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(ProductStatus).optional(),
  category: z.string().max(100).optional(),
});

export default async function listProductsRoute(fastify: FastifyInstance) {
  fastify.get(
    "/products",
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: "List products with pagination, scoped by brand",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "Page number",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "Items per page",
            },
            status: {
              type: "string",
              description:
                "Filter by product status (DRAFT, MINTING, ACTIVE, TRANSFERRED, RECALLED)",
            },
            category: {
              type: "string",
              description: "Filter by product category",
            },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = listQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const { page, limit, status, category } = parsed.data;
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

      // Brand scoping: ADMIN sees all, others see only their brand
      const where: Record<string, unknown> =
        user.role === "ADMIN" ? {} : { brandId: user.brandId as string };

      // Apply optional filters
      if (status) where.status = status;
      if (category) where.category = category;

      const [products, total] = await Promise.all([
        fastify.prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        fastify.prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        success: true,
        data: {
          products,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
    },
  );
}

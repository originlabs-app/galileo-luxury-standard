import type { FastifyInstance } from "fastify";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export default async function listProductsRoute(fastify: FastifyInstance) {
  fastify.get(
    "/products",
    {
      onRequest: [fastify.authenticate],
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

      const { page, limit } = parsed.data;
      const user = request.user;

      // Brand scoping: ADMIN sees all, others see only their brand
      const where =
        user.role === "ADMIN" ? {} : { brandId: user.brandId! };

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

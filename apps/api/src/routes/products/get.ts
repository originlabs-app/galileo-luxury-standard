import type { FastifyInstance } from "fastify";

export default async function getProductRoute(fastify: FastifyInstance) {
  fastify.get<{ Params: { id: string } }>(
    "/products/:id",
    {
      onRequest: [fastify.authenticate],
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

      const product = await fastify.prisma.product.findUnique({
        where: { id },
        include: {
          passport: true,
          events: {
            orderBy: { createdAt: "desc" },
          },
        },
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

      // Brand scoping: non-ADMIN users can only see their own brand's products
      if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        });
      }

      return reply.status(200).send({
        success: true,
        data: { product },
      });
    },
  );
}

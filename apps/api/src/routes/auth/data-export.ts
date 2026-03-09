import type { FastifyInstance } from "fastify";

export default async function dataExportRoute(fastify: FastifyInstance) {
  fastify.get(
    "/auth/me/data",
    {
      onRequest: [fastify.authenticate],
      schema: {
        description:
          "Export all personal data for the authenticated user (GDPR Art. 15). " +
          "Returns user profile, brand association, products, and events performed.",
        tags: ["Auth", "GDPR"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { sub } = request.user;

      const user = await fastify.prisma.user.findUnique({
        where: { id: sub },
        include: { brand: true },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
      }

      // Products owned by user's brand (if any)
      let products: unknown[] = [];
      if (user.brandId) {
        products = await fastify.prisma.product.findMany({
          where: { brandId: user.brandId },
          include: { passport: true },
        });
      }

      // Events performed by this user
      const events = await fastify.prisma.productEvent.findMany({
        where: { performedBy: sub },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      // Build export -- explicitly exclude passwordHash and refreshToken
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        brand: user.brand
          ? {
              id: user.brand.id,
              name: user.brand.name,
              slug: user.brand.slug,
              did: user.brand.did,
              createdAt: user.brand.createdAt,
            }
          : null,
        products,
        events,
      };

      return reply.status(200).send({
        success: true,
        data: exportData,
      });
    },
  );
}

import type { FastifyInstance } from "fastify";
import { EventType } from "@galileo/shared";
import { buildWorkspaceBrandFilter } from "../../utils/workspace.js";

export default async function statsProductRoute(fastify: FastifyInstance) {
  fastify.get(
    "/products/stats",
    {
      onRequest: [fastify.authenticate],
      schema: {
        description:
          "Get aggregated product statistics for the dashboard. " +
          "Brand-scoped for non-ADMIN users.",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      const brandFilter: Record<string, unknown> | null =
        buildWorkspaceBrandFilter(reply, user);

      if (!brandFilter) {
        return;
      }

      // Run all queries in parallel for performance
      const [statusCounts, verificationCount, recentEvents] = await Promise.all(
        [
          // Product counts by status using groupBy
          fastify.prisma.product.groupBy({
            by: ["status"],
            where: brandFilter,
            _count: { status: true },
          }),

          // Total verification events
          fastify.prisma.productEvent.count({
            where: {
              type: EventType.VERIFIED,
              product: brandFilter,
            },
          }),

          // Recent 10 events for activity feed
          fastify.prisma.productEvent.findMany({
            where: {
              product: brandFilter,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              product: {
                select: { name: true, gtin: true },
              },
            },
          }),
        ],
      );

      // Transform groupBy result into a flat object
      const byStatus: Record<string, number> = {};
      for (const row of statusCounts) {
        byStatus[row.status] = row._count.status;
      }

      return reply.status(200).send({
        success: true,
        data: {
          byStatus,
          verificationCount,
          recentEvents,
        },
      });
    },
  );
}

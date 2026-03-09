import type { FastifyInstance } from "fastify";
import type { TxClient } from "../../plugins/prisma.js";
import { clearAuthCookies } from "../../utils/cookies.js";
import { requireCsrfHeader } from "../../middleware/csrf.js";

export default async function dataErasureRoute(fastify: FastifyInstance) {
  fastify.delete(
    "/auth/me/data",
    {
      onRequest: [requireCsrfHeader, fastify.authenticate],
      schema: {
        description:
          "Delete all personal data for the authenticated user (GDPR Art. 17). " +
          "Anonymizes event references, removes user record, and clears auth cookies. " +
          "Products and images belong to the brand and are NOT deleted.",
        tags: ["Auth", "GDPR"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const { sub } = request.user;

      const user = await fastify.prisma.user.findUnique({
        where: { id: sub },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
      }

      await fastify.prisma.$transaction(async (tx: TxClient) => {
        // 1. Anonymize events performed by this user (set performedBy to null)
        await tx.productEvent.updateMany({
          where: { performedBy: sub },
          data: { performedBy: null },
        });

        // 2. Delete the user record
        await tx.user.delete({
          where: { id: sub },
        });
      });

      // 3. Clear auth cookies
      clearAuthCookies(reply);

      return reply.status(200).send({
        success: true,
        data: {
          message: "All personal data has been deleted",
          deletedAt: new Date().toISOString(),
        },
      });
    },
  );
}

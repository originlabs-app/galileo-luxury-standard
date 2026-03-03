import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyRefreshToken, generateTokenPair } from "../../utils/tokens.js";
import { hashToken } from "../../utils/token-hash.js";

const refreshBody = z.object({
  refreshToken: z.string().min(1),
});

const errorResponseSchema = {
  type: "object" as const,
  properties: {
    success: { type: "boolean" as const },
    error: {
      type: "object" as const,
      properties: {
        code: { type: "string" as const },
        message: { type: "string" as const },
      },
    },
  },
};

export default async function refreshRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/refresh",
    {
      schema: {
        description: "Refresh access token using a valid refresh token",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                },
              },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = refreshBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const { refreshToken } = parsed.data;

      // Verify the refresh token JWT signature
      const payload = verifyRefreshToken(fastify, refreshToken);
      if (!payload) {
        return reply.status(401).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
          },
        });
      }

      // Hash the incoming token for comparison
      const hashedIncoming = hashToken(refreshToken);

      // Atomic transaction: verify stored token and rotate in one step
      const result = await fastify.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user || user.refreshToken !== hashedIncoming) {
          return null;
        }

        // Generate new token pair
        const tokens = generateTokenPair(fastify, {
          sub: user.id,
          role: user.role,
          brandId: user.brandId,
        });

        // Update stored refresh token (hashed)
        await tx.user.update({
          where: { id: user.id },
          data: { refreshToken: hashToken(tokens.refreshToken) },
        });

        return { user, tokens };
      });

      if (!result) {
        return reply.status(401).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
          },
        });
      }

      // Log without PII
      fastify.log.info({ userId: result.user.id }, "Token refreshed");

      return reply.status(200).send({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    },
  );
}

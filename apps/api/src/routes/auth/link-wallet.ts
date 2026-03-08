import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyMessage, getAddress } from "viem";
import { requireCsrfHeader } from "../../middleware/csrf.js";

const ETHEREUM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const MESSAGE_PREFIX = "Link wallet to Galileo:";

const linkWalletBody = z.object({
  address: z.string().regex(ETHEREUM_ADDRESS_RE, "Invalid Ethereum address"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Message is required"),
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

export default async function linkWalletRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/link-wallet",
    {
      onRequest: [requireCsrfHeader, fastify.authenticate],
      schema: {
        description:
          "Link an Ethereum wallet address to the authenticated user",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        body: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Ethereum wallet address (0x...)",
            },
            signature: {
              type: "string",
              description: "EIP-191 personal_sign signature",
            },
            message: { type: "string", description: "Message that was signed" },
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
                  walletAddress: { type: "string" },
                },
              },
            },
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // 1. Validate body
      const parsed = linkWalletBody.safeParse(request.body);
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

      const { address, signature, message } = parsed.data;

      // 2. Validate message contains the required prefix
      if (!message.startsWith(MESSAGE_PREFIX)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Message must start with "${MESSAGE_PREFIX}"`,
          },
        });
      }

      // 3. Verify EIP-191 signature
      let isValid: boolean;
      try {
        isValid = await verifyMessage({
          address: getAddress(address),
          message,
          signature: signature as `0x${string}`,
        });
      } catch {
        isValid = false;
      }

      if (!isValid) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "SIGNATURE_INVALID",
            message:
              "Signature verification failed — recovered address does not match",
          },
        });
      }

      // 4. Checksum-normalize the address
      const checksumAddress = getAddress(address);
      const { sub } = request.user;

      // 5. Check if the address is already linked to another user
      const existingUser = await fastify.prisma.user.findUnique({
        where: { walletAddress: checksumAddress },
      });

      if (existingUser && existingUser.id !== sub) {
        return reply.status(409).send({
          success: false,
          error: {
            code: "CONFLICT",
            message: "This wallet address is already linked to another account",
          },
        });
      }

      // 6. Update the user's wallet address
      await fastify.prisma.user.update({
        where: { id: sub },
        data: { walletAddress: checksumAddress },
      });

      fastify.log.info({ userId: sub }, "Wallet linked");

      return reply.status(200).send({
        success: true,
        data: {
          walletAddress: checksumAddress,
        },
      });
    },
  );
}

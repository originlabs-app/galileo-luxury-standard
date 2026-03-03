import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@galileo/shared";
import { hashPassword } from "../../utils/password.js";
import { generateTokenPair } from "../../utils/tokens.js";
import { toSlug } from "../../utils/slug.js";
import { hashToken } from "../../utils/token-hash.js";
import { setAuthCookies } from "../../utils/cookies.js";

const registerBody = z.object({
  email: emailSchema,
  password: passwordSchema,
  brandName: z.string().min(1).optional(),
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

export default async function registerRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["Auth"],
        body: {
          type: "object",
          properties: {
            email: { type: "string", description: "Valid email address" },
            password: {
              type: "string",
              description: "Password (min 8 characters)",
            },
            brandName: { type: "string", description: "Optional brand name" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      email: { type: "string" },
                      role: { type: "string" },
                      brandId: { type: "string", nullable: true },
                      createdAt: { type: "string" },
                      updatedAt: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          400: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = registerBody.safeParse(request.body);
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

      const { email, password, brandName } = parsed.data;

      // Check if user exists
      const existing = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return reply.status(409).send({
          success: false,
          error: {
            code: "CONFLICT",
            message: "An account with this email already exists",
          },
        });
      }

      const passwordHash = await hashPassword(password);

      let user;

      if (brandName) {
        const slug = toSlug(brandName);
        const did = `did:galileo:brand:${slug}`;

        // Create brand and user in a transaction
        try {
          const result = await fastify.prisma.$transaction(async (tx) => {
            const brand = await tx.brand.create({
              data: {
                name: brandName,
                slug,
                did,
              },
            });

            const newUser = await tx.user.create({
              data: {
                email,
                passwordHash,
                role: "BRAND_ADMIN",
                brandId: brand.id,
              },
            });

            return newUser;
          });

          user = result;
        } catch (error: unknown) {
          // Handle unique constraint violation (slug or DID collision)
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002"
          ) {
            return reply.status(409).send({
              success: false,
              error: {
                code: "CONFLICT",
                message:
                  "A brand with this name already exists. Please choose a different name.",
              },
            });
          }
          throw error;
        }
      } else {
        user = await fastify.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: "VIEWER",
          },
        });
      }

      const tokens = generateTokenPair(fastify, {
        sub: user.id,
        role: user.role,
        brandId: user.brandId,
      });

      // Store hashed refresh token
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashToken(tokens.refreshToken) },
      });

      // Set httpOnly cookies
      setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);

      // Log without PII
      fastify.log.info({ userId: user.id }, "User registered");

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            brandId: user.brandId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    },
  );
}

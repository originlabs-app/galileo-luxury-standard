import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  validateGtin,
  generateDid,
  generateDigitalLinkUrl,
} from "@galileo/shared";
import { requireRole } from "../../middleware/rbac.js";

const createProductBody = z.object({
  gtin: z.string().min(1, "GTIN is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});

export default async function createProductRoute(fastify: FastifyInstance) {
  fastify.post(
    "/products",
    {
      onRequest: [
        fastify.authenticate,
        requireRole("BRAND_ADMIN", "OPERATOR", "ADMIN"),
      ],
    },
    async (request, reply) => {
      const parsed = createProductBody.safeParse(request.body);
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

      const { gtin, serialNumber, name, description, category } = parsed.data;

      // Validate GTIN check digit
      if (!validateGtin(gtin)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid GTIN: check digit verification failed",
          },
        });
      }

      const user = request.user;

      // BRAND_ADMIN and OPERATOR must have a brandId
      if (!user.brandId && user.role !== "ADMIN") {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand to create products",
          },
        });
      }

      const brandId = user.brandId!;

      // Generate DID and Digital Link
      const did = generateDid(gtin, serialNumber);
      const digitalLink = generateDigitalLinkUrl(gtin, serialNumber);

      try {
        // Create product, passport, and event in a transaction
        const result = await fastify.prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: {
              gtin,
              serialNumber,
              did,
              name,
              description: description ?? null,
              category,
              brandId,
            },
          });

          const passport = await tx.productPassport.create({
            data: {
              productId: product.id,
              digitalLink,
            },
          });

          await tx.productEvent.create({
            data: {
              productId: product.id,
              type: "CREATED",
              data: { name, gtin, serialNumber, category },
              performedBy: user.sub,
            },
          });

          return { product, passport };
        });

        return reply.status(201).send({
          success: true,
          data: {
            product: result.product,
            passport: result.passport,
          },
        });
      } catch (err: unknown) {
        // Handle unique constraint violation (duplicate gtin+serial)
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: string }).code === "P2002"
        ) {
          return reply.status(409).send({
            success: false,
            error: {
              code: "CONFLICT",
              message:
                "A product with this GTIN and serial number already exists",
            },
          });
        }
        throw err;
      }
    },
  );
}

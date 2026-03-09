import type { FastifyInstance } from "fastify";
import { ProductStatus } from "@galileo/shared";
import { requireRole } from "../../middleware/rbac.js";
import { computeCid } from "../../utils/cid.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export default async function uploadProductImageRoute(
  fastify: FastifyInstance,
) {
  fastify.post<{ Params: { id: string } }>(
    "/products/:id/upload",
    {
      onRequest: [
        fastify.authenticate,
        requireRole("BRAND_ADMIN", "OPERATOR", "ADMIN"),
      ],
      schema: {
        description:
          "Upload a product image (JPEG, PNG, or WebP, max 5 MB). " +
          "Only DRAFT products can have images uploaded.",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Product ID" },
          },
          required: ["id"],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user;

      // brandId null guard
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand",
          },
        });
      }

      // Find the product
      const product = await fastify.prisma.product.findUnique({
        where: { id },
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

      // Brand scoping
      if (user.role !== "ADMIN" && product.brandId !== user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        });
      }

      // Only DRAFT products can have images added
      if (product.status !== ProductStatus.DRAFT) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Only DRAFT products can have images uploaded",
          },
        });
      }

      // Parse multipart file
      let file;
      try {
        file = await request.file();
      } catch {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid multipart request",
          },
        });
      }

      if (!file) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "No file provided",
          },
        });
      }

      // Validate content type
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message:
              "Invalid file type. Allowed: image/jpeg, image/png, image/webp",
          },
        });
      }

      // Read file buffer
      const buffer = await file.toBuffer();

      // Enforce size limit (multipart plugin handles it, but double-check)
      if (buffer.length > 5 * 1024 * 1024) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "File exceeds 5 MB limit",
          },
        });
      }

      // Compute CID for content-addressing (tamper-evidence)
      const cid = await computeCid(buffer);
      const ext = MIME_TO_EXT[file.mimetype] || ".bin";
      const storageKey = `products/${id}/${cid}${ext}`;

      // Upload to storage (R2 or local filesystem)
      const imageUrl = await fastify.storage.upload(
        storageKey,
        buffer,
        file.mimetype,
      );

      // Update product with image URL and CID
      const updated = await fastify.prisma.product.update({
        where: { id },
        data: { imageUrl, imageCid: cid },
        include: {
          passport: true,
          events: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      });

      return reply.status(200).send({
        success: true,
        data: {
          product: updated,
          upload: {
            imageUrl,
            imageCid: cid,
            contentType: file.mimetype,
            size: buffer.length,
          },
        },
      });
    },
  );
}

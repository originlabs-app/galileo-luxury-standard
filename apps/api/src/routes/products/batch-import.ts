import type { FastifyInstance } from "fastify";
import { requireRole } from "../../middleware/rbac.js";
import { resolveWorkspaceMutationBrandId } from "../../utils/workspace.js";
import {
  commitCatalogCsvImport,
  partialCatalogCsvImport,
} from "../../services/products/import-csv.js";

const MAX_ROWS = 500;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export default async function batchImportRoute(fastify: FastifyInstance) {
  fastify.post<{ Querystring: { partial?: string; brandId?: string } }>(
    "/products/batch-import",
    {
      onRequest: [fastify.authenticate, requireRole("BRAND_ADMIN", "ADMIN")],
      schema: {
        description:
          "Import products from a CSV file (multipart/form-data). Max 500 rows, 1MB.",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            partial: {
              type: "string",
              description: "Set to 'true' for partial success mode",
            },
            brandId: {
              type: "string",
              description: "Brand ID (required for ADMIN)",
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user;
      const isPartial = request.query.partial === "true";
      const brandId = resolveWorkspaceMutationBrandId(
        reply,
        user,
        request.query.brandId,
        {
          membershipMessage: "User must belong to a brand",
          missingAdminBrandMessage: "ADMIN must provide brandId query parameter",
        },
      );

      if (!brandId) {
        return;
      }

      // Parse multipart file
      let file;
      try {
        file = await request.file();
      } catch {
        return reply.status(400).send({
          success: false,
          error: { code: "BAD_REQUEST", message: "Invalid multipart request" },
        });
      }

      if (!file) {
        return reply.status(400).send({
          success: false,
          error: { code: "BAD_REQUEST", message: "No file provided" },
        });
      }

      const buffer = await file.toBuffer();
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          error: { code: "BAD_REQUEST", message: "File exceeds 1 MB limit" },
        });
      }

      const content = buffer.toString("utf-8");
      const result = isPartial
        ? await partialCatalogCsvImport({
            brandId,
            content,
            maxRows: MAX_ROWS,
            performedBy: user.sub,
            prisma: fastify.prisma,
          })
        : await commitCatalogCsvImport({
            brandId,
            content,
            maxRows: MAX_ROWS,
            performedBy: user.sub,
            prisma: fastify.prisma,
          });

      if (!result.ok) {
        return reply.status(400).send({
          success: false,
          error: { code: "BAD_REQUEST", message: result.message },
        });
      }

      return reply.status(201).send({
        success: true,
        data: {
          created: result.created,
          errors: result.errors,
          rows: result.rows,
          summary: result.summary,
        },
      });
    },
  );
}

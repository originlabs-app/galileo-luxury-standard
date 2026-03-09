import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  validateGtin,
  generateDid,
  generateDigitalLinkUrl,
} from "@galileo/shared";
import { requireRole } from "../../middleware/rbac.js";
import { isPrismaUniqueViolation } from "../../utils/prisma-errors.js";

const MAX_ROWS = 500;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const PRODUCT_CATEGORIES = [
  "Leather Goods",
  "Jewelry",
  "Watches",
  "Fashion",
  "Accessories",
  "Fragrances",
  "Eyewear",
  "Other",
] as const;

const csvRowSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    gtin: z.string().min(1, "GTIN is required"),
    serialNumber: z.string().min(1, "Serial number is required").max(100),
    category: z.enum(PRODUCT_CATEGORIES, {
      message: "Invalid category",
    }),
    description: z.string().max(2000).optional(),
    materials: z.string().optional(),
  })
  .strict();

interface RowError {
  row: number;
  field: string;
  message: string;
}

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(
  content: string,
):
  | { rows: Record<string, string>[]; headerFields: string[] }
  | { parseError: string } {
  const text = stripBom(content);
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) {
    return { rows: [], headerFields: [] };
  }
  const headerFields = parseCsvLine(lines[0]!).map((h) =>
    h.toLowerCase().replace(/\s+/g, ""),
  );
  const expectedColumns = [
    "name",
    "gtin",
    "serialnumber",
    "category",
    "description",
    "materials",
  ];
  const requiredColumns = ["name", "gtin", "serialnumber", "category"];
  for (const req of requiredColumns) {
    if (!headerFields.includes(req)) {
      return { parseError: `Missing required column: ${req}` };
    }
  }
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    for (let j = 0; j < headerFields.length; j++) {
      const key = headerFields[j]!;
      // Map serialnumber -> serialNumber for Zod schema
      const mappedKey = key === "serialnumber" ? "serialNumber" : key;
      if (expectedColumns.includes(key)) {
        row[mappedKey] = fields[j] ?? "";
      }
    }
    rows.push(row);
  }
  return { rows, headerFields };
}

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

      // Brand scoping
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "User must belong to a brand" },
        });
      }

      let brandId: string;
      if (user.role === "ADMIN") {
        if (!request.query.brandId) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "ADMIN must provide brandId query parameter",
            },
          });
        }
        brandId = request.query.brandId;
      } else {
        brandId = user.brandId as string;
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
      const parsed = parseCsv(content);

      if ("parseError" in parsed) {
        return reply.status(400).send({
          success: false,
          error: { code: "BAD_REQUEST", message: parsed.parseError },
        });
      }

      const { rows } = parsed;

      if (rows.length === 0) {
        return reply.status(201).send({
          success: true,
          data: { created: 0, errors: [] },
        });
      }

      if (rows.length > MAX_ROWS) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: `CSV exceeds maximum of ${MAX_ROWS} rows`,
          },
        });
      }

      // Validate each row and collect errors
      const errors: RowError[] = [];
      const validRows: Array<{
        rowNum: number;
        data: z.infer<typeof csvRowSchema>;
      }> = [];
      const seenGtinSerial = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 2; // 1-indexed, header is row 1
        const raw = rows[i]!;
        const result = csvRowSchema.safeParse(raw);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors.push({
              row: rowNum,
              field: issue.path.join(".") || "unknown",
              message: issue.message,
            });
          }
          continue;
        }

        const data = result.data;

        // Validate GTIN check digit
        if (!validateGtin(data.gtin)) {
          errors.push({
            row: rowNum,
            field: "gtin",
            message: "Invalid GTIN: check digit verification failed",
          });
          continue;
        }

        // Check for duplicate within CSV
        const key = `${data.gtin}:${data.serialNumber}`;
        if (seenGtinSerial.has(key)) {
          errors.push({
            row: rowNum,
            field: "gtin",
            message: "Duplicate GTIN+serialNumber within CSV",
          });
          continue;
        }
        seenGtinSerial.add(key);

        validRows.push({ rowNum, data });
      }

      if (!isPartial && errors.length > 0) {
        // Transaction mode: any validation error means no rows created
        return reply.status(201).send({
          success: true,
          data: { created: 0, errors },
        });
      }

      // Create products
      let created = 0;

      if (isPartial) {
        // Partial mode: create each valid row independently
        for (const { rowNum, data } of validRows) {
          try {
            const did = generateDid(data.gtin, data.serialNumber);
            const digitalLink = generateDigitalLinkUrl(
              data.gtin,
              data.serialNumber,
            );
            await fastify.prisma.$transaction(
              async (tx: import("../../plugins/prisma.js").TxClient) => {
                const product = await tx.product.create({
                  data: {
                    gtin: data.gtin,
                    serialNumber: data.serialNumber,
                    did,
                    name: data.name,
                    description: data.description ?? null,
                    category: data.category,
                    brandId,
                  },
                });
                await tx.productPassport.create({
                  data: {
                    productId: product.id,
                    digitalLink,
                    ...(data.materials
                      ? { metadata: { materials: data.materials } }
                      : {}),
                  },
                });
                await tx.productEvent.create({
                  data: {
                    productId: product.id,
                    type: "CREATED",
                    data: {
                      name: data.name,
                      gtin: data.gtin,
                      serialNumber: data.serialNumber,
                      category: data.category,
                    },
                    performedBy: user.sub,
                  },
                });
              },
            );
            created++;
          } catch (err) {
            if (isPrismaUniqueViolation(err)) {
              errors.push({
                row: rowNum,
                field: "gtin",
                message:
                  "A product with this GTIN and serial number already exists",
              });
            } else {
              errors.push({
                row: rowNum,
                field: "unknown",
                message: "Failed to create product",
              });
            }
          }
        }
      } else {
        // Transaction mode: all or nothing
        try {
          await fastify.prisma.$transaction(
            async (tx: import("../../plugins/prisma.js").TxClient) => {
              for (const { data } of validRows) {
                const did = generateDid(data.gtin, data.serialNumber);
                const digitalLink = generateDigitalLinkUrl(
                  data.gtin,
                  data.serialNumber,
                );
                const product = await tx.product.create({
                  data: {
                    gtin: data.gtin,
                    serialNumber: data.serialNumber,
                    did,
                    name: data.name,
                    description: data.description ?? null,
                    category: data.category,
                    brandId,
                  },
                });
                await tx.productPassport.create({
                  data: {
                    productId: product.id,
                    digitalLink,
                    ...(data.materials
                      ? { metadata: { materials: data.materials } }
                      : {}),
                  },
                });
                await tx.productEvent.create({
                  data: {
                    productId: product.id,
                    type: "CREATED",
                    data: {
                      name: data.name,
                      gtin: data.gtin,
                      serialNumber: data.serialNumber,
                      category: data.category,
                    },
                    performedBy: user.sub,
                  },
                });
                created++;
              }
            },
          );
        } catch (err) {
          if (isPrismaUniqueViolation(err)) {
            errors.push({
              row: 0,
              field: "gtin",
              message:
                "Duplicate GTIN+serialNumber conflict with existing data",
            });
          }
          created = 0;
        }
      }

      return reply.status(201).send({
        success: true,
        data: { created, errors },
      });
    },
  );
}

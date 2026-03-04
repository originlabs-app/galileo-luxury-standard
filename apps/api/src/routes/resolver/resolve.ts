import type { FastifyInstance } from "fastify";
import { validateGtin, padGtin14 } from "@galileo/shared";

/**
 * Maps internal product status to public-safe resolver values.
 * Only ACTIVE and RECALLED are exposed; other statuses are hidden behind 404.
 */
const STATUS_MAP: Record<string, string> = {
  ACTIVE: "verified",
  RECALLED: "recalled",
};

export default async function resolveDigitalLinkRoute(
  fastify: FastifyInstance,
) {
  fastify.get<{ Params: { gtin: string; serial: string } }>(
    "/01/:gtin/21/:serial",
    async (request, reply) => {
      const { gtin: rawGtin } = request.params;
      // URL-decode serial (Fastify already decodes params, but ensure it)
      const serial = decodeURIComponent(request.params.serial);

      // Validate GTIN check digit before DB lookup
      if (!validateGtin(rawGtin)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid GTIN check digit",
          },
        });
      }

      // DB stores the original GTIN length — look up using the raw param
      const product = await fastify.prisma.product.findUnique({
        where: {
          gtin_serialNumber: { gtin: rawGtin, serialNumber: serial },
        },
        include: {
          passport: true,
          brand: true,
        },
      });

      // Return 404 if not found or status not publicly resolvable
      if (!product || !STATUS_MAP[product.status]) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        });
      }

      // Pad GTIN to 14 digits for all URIs (GS1 canonical form)
      const gtin14 = padGtin14(rawGtin);
      const mappedStatus = STATUS_MAP[product.status];

      // Build JSON-LD payload with custom @context namespaces
      const jsonLd = {
        "@context": {
          "@vocab": "https://schema.org/",
          gs1: "https://ref.gs1.org/voc/",
          galileo: "https://galileoprotocol.io/ns/",
        },
        "@type": "IndividualProduct",
        "@id": `did:galileo:01:${gtin14}:21:${serial}`,
        name: product.name,
        description: product.description,
        "gs1:gtin": gtin14,
        category: product.category,
        "galileo:status": mappedStatus,
        "galileo:serialNumber": product.serialNumber,
        "galileo:digitalLink": `https://id.galileoprotocol.io/01/${gtin14}/21/${encodeURIComponent(serial)}`,
        "galileo:did": `did:galileo:01:${gtin14}:21:${serial}`,
        "galileo:passport": product.passport
          ? {
              "galileo:digitalLink": product.passport.digitalLink,
              "galileo:txHash": product.passport.txHash,
              "galileo:tokenAddress": product.passport.tokenAddress,
              "galileo:chainId": product.passport.chainId,
              "galileo:mintedAt": product.passport.mintedAt,
            }
          : null,
        "galileo:brand": product.brand
          ? {
              name: product.brand.name,
              "galileo:did": product.brand.did,
            }
          : null,
      };

      return reply
        .status(200)
        .header("content-type", "application/ld+json")
        .send(jsonLd);
    },
  );
}

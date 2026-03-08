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

      // DB stores the original GTIN length — try raw param first, then
      // try with leading zeros stripped (e.g., 14-digit "00012345678905" → 13-digit "0012345678905")
      // so that both padded and unpadded GTINs resolve correctly.
      let product = await fastify.prisma.product.findUnique({
        where: {
          gtin_serialNumber: { gtin: rawGtin, serialNumber: serial },
        },
        include: {
          passport: true,
          brand: true,
        },
      });

      if (!product) {
        // Strip leading zeros added by 14-digit padding to recover the stored form
        const strippedGtin = rawGtin.replace(/^0+/, "") || "0";
        // Re-pad to common lengths: try 13-digit form (most common stored form)
        const gtin13 = strippedGtin.padStart(13, "0");
        if (gtin13 !== rawGtin) {
          product = await fastify.prisma.product.findUnique({
            where: {
              gtin_serialNumber: { gtin: gtin13, serialNumber: serial },
            },
            include: {
              passport: true,
              brand: true,
            },
          });
        }
      }

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

      // Build JSON-LD payload with @context array (C1: Galileo context, I1: canonical GS1 URL)
      const jsonLd = {
        "@context": [
          "https://schema.org",
          "https://ref.gs1.org/voc/",
          "https://vocab.galileoprotocol.io/contexts/galileo.jsonld",
        ],
        "@type": "IndividualProduct",
        "@id": `did:galileo:01:${gtin14}:21:${serial}`,
        name: product.name,
        description: product.description,
        gtin: gtin14,
        serialNumber: product.serialNumber,
        category: product.category,
        status: mappedStatus,
        brand: product.brand
          ? {
              "@type": "Brand",
              "@id": product.brand.did,
              name: product.brand.name,
            }
          : null,
        passport: product.passport
          ? {
              digitalLink: product.passport.digitalLink,
              txHash: product.passport.txHash,
              tokenAddress: product.passport.tokenAddress,
              chainId: product.passport.chainId,
              mintedAt: product.passport.mintedAt,
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

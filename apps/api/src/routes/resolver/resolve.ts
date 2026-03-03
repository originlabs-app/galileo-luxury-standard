import type { FastifyInstance } from "fastify";

export default async function resolveDigitalLinkRoute(
  fastify: FastifyInstance,
) {
  fastify.get<{ Params: { gtin: string; serial: string } }>(
    "/01/:gtin/21/:serial",
    async (request, reply) => {
      const { gtin } = request.params;
      // URL-decode serial (Fastify already decodes params, but ensure it)
      const serial = decodeURIComponent(request.params.serial);

      // Look up product by gtin + serialNumber
      const product = await fastify.prisma.product.findUnique({
        where: {
          gtin_serialNumber: { gtin, serialNumber: serial },
        },
        include: {
          passport: true,
          brand: true,
        },
      });

      // Return 404 if not found or DRAFT (do not leak DRAFT product data)
      if (!product || product.status === "DRAFT") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        });
      }

      // Build JSON-LD payload
      const jsonLd = {
        "@context": ["https://schema.org", "https://gs1.org/voc"],
        "@type": "Product",
        name: product.name,
        description: product.description,
        gtin: product.gtin,
        category: product.category,
        status: product.status,
        passport: product.passport
          ? {
              digitalLink: product.passport.digitalLink,
              txHash: product.passport.txHash,
              tokenAddress: product.passport.tokenAddress,
              chainId: product.passport.chainId,
              mintedAt: product.passport.mintedAt,
            }
          : null,
        brand: product.brand
          ? {
              name: product.brand.name,
              did: product.brand.did,
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

import type { FastifyInstance } from "fastify";
import createProductRoute from "./create.js";
import listProductsRoute from "./list.js";
import getProductRoute from "./get.js";
import updateProductRoute from "./update.js";
import mintProductRoute from "./mint.js";
import recallProductRoute from "./recall.js";
import qrProductRoute from "./qr.js";
import { requireCsrfHeader } from "../../middleware/csrf.js";

export default async function productRoutes(fastify: FastifyInstance) {
  // CSRF protection: require X-Galileo-Client header on POST/PATCH/DELETE
  fastify.addHook("onRequest", requireCsrfHeader);

  await fastify.register(createProductRoute);
  await fastify.register(listProductsRoute);
  await fastify.register(getProductRoute);
  await fastify.register(updateProductRoute);
  await fastify.register(mintProductRoute);
  await fastify.register(recallProductRoute);
  await fastify.register(qrProductRoute);
}

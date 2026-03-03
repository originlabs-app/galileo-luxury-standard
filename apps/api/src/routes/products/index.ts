import type { FastifyInstance } from "fastify";
import createProductRoute from "./create.js";
import listProductsRoute from "./list.js";
import getProductRoute from "./get.js";
import updateProductRoute from "./update.js";
import mintProductRoute from "./mint.js";
import qrProductRoute from "./qr.js";

export default async function productRoutes(fastify: FastifyInstance) {
  await fastify.register(createProductRoute);
  await fastify.register(listProductsRoute);
  await fastify.register(getProductRoute);
  await fastify.register(updateProductRoute);
  await fastify.register(mintProductRoute);
  await fastify.register(qrProductRoute);
}

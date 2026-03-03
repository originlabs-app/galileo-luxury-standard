import type { FastifyInstance } from "fastify";
import createProductRoute from "./create.js";
import listProductsRoute from "./list.js";
import getProductRoute from "./get.js";
import updateProductRoute from "./update.js";

export default async function productRoutes(fastify: FastifyInstance) {
  await fastify.register(createProductRoute);
  await fastify.register(listProductsRoute);
  await fastify.register(getProductRoute);
  await fastify.register(updateProductRoute);
}

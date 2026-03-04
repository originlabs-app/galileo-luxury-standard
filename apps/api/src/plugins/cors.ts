import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyCors, {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Galileo-Client"],
    credentials: true,
  });
});

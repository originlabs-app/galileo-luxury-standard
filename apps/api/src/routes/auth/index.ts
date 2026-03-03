import type { FastifyInstance } from "fastify";
import registerRoute from "./register.js";
import loginRoute from "./login.js";
import refreshRoute from "./refresh.js";
import meRoute from "./me.js";
import logoutRoute from "./logout.js";

export default async function authRoutes(fastify: FastifyInstance) {
  await fastify.register(registerRoute);
  await fastify.register(loginRoute);
  await fastify.register(refreshRoute);
  await fastify.register(meRoute);
  await fastify.register(logoutRoute);
}

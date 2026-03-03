import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { config } from "./config.js";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import corsPlugin from "./plugins/cors.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth/index.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: config.NODE_ENV !== "test",
  });

  // Register Swagger (must be before routes)
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Galileo Protocol API",
        description:
          "API for luxury product authentication via Digital Product Passports",
        version: "0.0.0",
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  // Register plugins
  await fastify.register(corsPlugin);
  await fastify.register(authPlugin);
  await fastify.register(prismaPlugin);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);

  return fastify;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

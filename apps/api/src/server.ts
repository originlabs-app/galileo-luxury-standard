import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { config } from "./config.js";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import corsPlugin from "./plugins/cors.js";
import cookiePlugin from "./plugins/cookie.js";
import chainPlugin from "./plugins/chain.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import securityHeadersPlugin from "./plugins/security-headers.js";
import storagePlugin from "./plugins/storage.js";
import sentryPlugin from "./plugins/sentry.js";
import { ACCESS_COOKIE_NAME } from "./utils/cookies.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth/index.js";
import productRoutes from "./routes/products/index.js";
import resolverRoutes from "./routes/resolver/index.js";

export async function buildApp() {
  const fastify = Fastify({
    logger:
      config.NODE_ENV !== "test"
        ? {
            level: config.LOG_LEVEL ?? "info",
            serializers: {
              req(request: {
                method: string;
                url: string;
                hostname: string;
                ip: string;
              }) {
                return {
                  method: request.method,
                  url: request.url,
                  hostname: request.hostname,
                  remoteAddress: request.ip,
                };
              },
              res(reply: { statusCode: number }) {
                return {
                  statusCode: reply.statusCode,
                };
              },
            },
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                "req.body.password",
                "req.body.email",
                "req.body.passwordHash",
              ],
              censor: "[REDACTED]",
            },
          }
        : false,
    genReqId: (req) => {
      return (req.headers["x-request-id"] as string) ?? crypto.randomUUID();
    },
  });

  // Register Swagger when enabled (configurable via ENABLE_SWAGGER env var)
  if (config.ENABLE_SWAGGER) {
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
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: ACCESS_COOKIE_NAME,
            },
          },
        },
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
    });
  }

  // Register plugins
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
      files: 1,
    },
  });
  await fastify.register(securityHeadersPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(cookiePlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(authPlugin);
  await fastify.register(prismaPlugin);
  await fastify.register(chainPlugin);
  await fastify.register(storagePlugin);
  await fastify.register(sentryPlugin);

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(productRoutes);
  await fastify.register(resolverRoutes);

  return fastify;
}

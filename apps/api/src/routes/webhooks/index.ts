/**
 * Webhook subscription CRUD routes.
 *
 * POST   /webhooks       — Create subscription (BRAND_ADMIN, ADMIN)
 * GET    /webhooks       — List subscriptions (brand-scoped)
 * DELETE /webhooks/:id   — Delete subscription
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireRole } from "../../middleware/rbac.js";
import { requireCsrfHeader } from "../../middleware/csrf.js";
import {
  addSubscription,
  removeSubscription,
  getSubscription,
  listSubscriptions,
  generateSecret,
} from "../../services/webhooks/outbox.js";
import type { WebhookSubscription } from "../../services/webhooks/types.js";

const createWebhookBody = z
  .object({
    url: z.string().url("URL must be a valid HTTP(S) URL"),
    events: z
      .array(z.string().min(1))
      .min(1, "At least one event type is required"),
  })
  .strict();

export default async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks — Create a subscription
  fastify.post(
    "/webhooks",
    {
      onRequest: [
        requireCsrfHeader,
        fastify.authenticate,
        requireRole("BRAND_ADMIN", "ADMIN"),
      ],
      schema: {
        description: "Create a webhook subscription for product events",
        tags: ["Webhooks"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const parsed = createWebhookBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const user = request.user;
      const { url, events } = parsed.data;

      // BRAND_ADMIN must have a brandId
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand",
          },
        });
      }

      const subscription: WebhookSubscription = {
        id: randomUUID(),
        brandId: user.brandId ?? "system",
        url,
        secret: generateSecret(),
        events,
        active: true,
        createdAt: new Date().toISOString(),
      };

      await addSubscription(fastify.prisma, subscription);

      return reply.status(201).send({
        success: true,
        data: {
          subscription: {
            id: subscription.id,
            brandId: subscription.brandId,
            url: subscription.url,
            secret: subscription.secret,
            events: subscription.events,
            active: subscription.active,
            createdAt: subscription.createdAt,
          },
        },
      });
    },
  );

  // GET /webhooks — List subscriptions (brand-scoped)
  fastify.get(
    "/webhooks",
    {
      onRequest: [fastify.authenticate, requireRole("BRAND_ADMIN", "ADMIN")],
      schema: {
        description:
          "List webhook subscriptions. BRAND_ADMIN sees only their brand. ADMIN sees all.",
        tags: ["Webhooks"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      const brandId =
        user.role === "ADMIN" ? undefined : (user.brandId ?? undefined);
      const subs = await listSubscriptions(fastify.prisma, brandId);

      return reply.status(200).send({
        success: true,
        data: { subscriptions: subs },
      });
    },
  );

  // DELETE /webhooks/:id — Remove subscription
  fastify.delete<{ Params: { id: string } }>(
    "/webhooks/:id",
    {
      onRequest: [
        requireCsrfHeader,
        fastify.authenticate,
        requireRole("BRAND_ADMIN", "ADMIN"),
      ],
      schema: {
        description: "Delete a webhook subscription",
        tags: ["Webhooks"],
        security: [{ cookieAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    async (request, reply) => {
      const user = request.user;
      const sub = await getSubscription(fastify.prisma, request.params.id);

      if (!sub) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Webhook subscription not found",
          },
        });
      }

      // BRAND_ADMIN can only delete their own brand's subscriptions
      if (user.role !== "ADMIN" && sub.brandId !== user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot delete another brand's subscription",
          },
        });
      }

      await removeSubscription(fastify.prisma, request.params.id);

      return reply.status(200).send({
        success: true,
        data: { deleted: true },
      });
    },
  );
}

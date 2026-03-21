/**
 * Webhook outbox — PostgreSQL-backed queue for reliable webhook delivery.
 *
 * When a product event occurs (MINTED, TRANSFERRED, RECALLED, VERIFIED),
 * the outbox creates entries in WebhookDelivery for all matching subscriptions.
 * A background worker processes the queue and attempts delivery with exponential backoff.
 *
 * Deliveries survive server restarts. Max 5 attempts per delivery.
 */

import { randomBytes } from "node:crypto";
import type { PrismaClient, Prisma } from "../../generated/prisma/client.js";
import type { WebhookEvent, WebhookSubscription } from "./types.js";
import { deliverWebhook, getBackoffMs } from "./delivery.js";

let workerInterval: ReturnType<typeof setInterval> | null = null;

const MAX_ATTEMPTS = 5;

// ─── Type mappers ──────────────────────────────────────────────

function mapSubscription(row: {
  id: string;
  brandId: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
}): WebhookSubscription {
  return {
    id: row.id,
    brandId: row.brandId,
    url: row.url,
    secret: row.secret,
    events: row.events,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapDelivery(row: {
  id: string;
  webhookId: string;
  eventType: string;
  payload: unknown;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: Date;
  lastAttemptAt: Date | null;
  status: string;
  createdAt: Date;
}): WebhookEvent {
  return {
    id: row.id,
    subscriptionId: row.webhookId,
    eventType: row.eventType,
    payload: row.payload as Record<string, unknown>,
    attempts: row.attempts,
    maxAttempts: MAX_ATTEMPTS,
    nextAttemptAt: row.nextAttemptAt,
    status: row.status as "pending" | "delivered" | "failed",
    lastError: row.lastError ?? undefined,
    createdAt: row.createdAt,
  };
}

// ─── Subscription management ─────────────────────────────────

export async function addSubscription(
  prisma: PrismaClient,
  sub: WebhookSubscription,
): Promise<void> {
  await prisma.webhookSubscription.create({
    data: {
      id: sub.id,
      brandId: sub.brandId,
      url: sub.url,
      secret: sub.secret,
      events: sub.events,
      active: sub.active,
    },
  });
}

export async function removeSubscription(
  prisma: PrismaClient,
  id: string,
): Promise<boolean> {
  const deleted = await prisma.webhookSubscription.deleteMany({
    where: { id },
  });
  return deleted.count > 0;
}

export async function getSubscription(
  prisma: PrismaClient,
  id: string,
): Promise<WebhookSubscription | undefined> {
  const row = await prisma.webhookSubscription.findUnique({ where: { id } });
  return row ? mapSubscription(row) : undefined;
}

export async function listSubscriptions(
  prisma: PrismaClient,
  brandId?: string,
): Promise<WebhookSubscription[]> {
  const rows = await prisma.webhookSubscription.findMany({
    where: brandId ? { brandId } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapSubscription);
}

// ─── Outbox operations ────────────────────────────────────────

/**
 * Enqueue webhook events for all matching active subscriptions.
 * Non-blocking: does not throw even if there are no matching subscriptions.
 */
export async function enqueueWebhookEvent(
  prisma: PrismaClient,
  eventType: string,
  productId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const now = new Date();
  const payload = {
    eventType,
    productId,
    data,
    timestamp: now.toISOString(),
  };

  const subscriptions = await prisma.webhookSubscription.findMany({
    where: {
      active: true,
      events: { has: eventType },
    },
  });

  if (subscriptions.length === 0) return;

  // JSON.parse/stringify ensures Prisma accepts the payload as InputJsonValue
  const jsonPayload = JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;

  await prisma.webhookDelivery.createMany({
    data: subscriptions.map((sub) => ({
      webhookId: sub.id,
      eventType,
      payload: jsonPayload,
      nextAttemptAt: now,
    })),
  });
}

/**
 * Process the next due outbox entry.
 * Returns true if an entry was processed, false if queue is empty or nothing is due.
 */
export async function processNext(prisma: PrismaClient): Promise<boolean> {
  const now = new Date();

  const delivery = await prisma.webhookDelivery.findFirst({
    where: {
      status: "pending",
      nextAttemptAt: { lte: now },
    },
    include: { subscription: true },
    orderBy: { createdAt: "asc" },
  });

  if (!delivery) return false;

  const result = await deliverWebhook(
    mapDelivery(delivery),
    mapSubscription(delivery.subscription),
  );

  const newAttempts = delivery.attempts + 1;

  if (result.success) {
    // Terminal: delete on success to keep table lean
    await prisma.webhookDelivery.delete({ where: { id: delivery.id } });
  } else if (newAttempts >= MAX_ATTEMPTS) {
    // Terminal: max retries exhausted — delete
    await prisma.webhookDelivery.delete({ where: { id: delivery.id } });
  } else {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        attempts: newAttempts,
        lastError: result.error,
        lastAttemptAt: now,
        nextAttemptAt: new Date(
          now.getTime() + getBackoffMs(newAttempts - 1),
        ),
      },
    });
  }

  return true;
}

/**
 * Start the outbox background worker.
 */
export function startWorker(prisma: PrismaClient, intervalMs = 5000): void {
  if (workerInterval) return;
  workerInterval = setInterval(async () => {
    try {
      while (await processNext(prisma)) {
        // Process all due entries
      }
    } catch {
      // Worker must never crash the process
    }
  }, intervalMs);
}

/**
 * Stop the outbox background worker.
 */
export function stopWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
}

/**
 * Get all pending outbox entries (for testing/monitoring).
 */
export async function getOutboxEntries(
  prisma: PrismaClient,
): Promise<WebhookEvent[]> {
  const rows = await prisma.webhookDelivery.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapDelivery);
}

/**
 * List all queued delivery events for a given subscription.
 */
export function listDeliveries(subscriptionId: string): WebhookEvent[] {
  return outboxQueue
    .filter((e) => e.subscriptionId === subscriptionId)
    .map((e) => ({ ...e }));
}

/**
 * Requeue all non-delivered events for a subscription.
 * Resets attempts counter and sets nextAttemptAt to now so the worker
 * picks them up on the next tick.
 * Returns the number of events requeued.
 */
export function requeueFailed(subscriptionId: string): number {
  const now = new Date();
  let count = 0;
  for (const event of outboxQueue) {
    if (event.subscriptionId !== subscriptionId) continue;
    if (event.status === "delivered") continue;
    event.attempts = 0;
    event.nextAttemptAt = now;
    event.status = "pending";
    event.lastError = undefined;
    count++;
  }
  return count;
}

/**
 * Clear all subscriptions and outbox entries (for testing).
 */
export async function clearAll(prisma: PrismaClient): Promise<void> {
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhookSubscription.deleteMany();
}

/**
 * Generate a signing secret for a new subscription.
 */
export function generateSecret(): string {
  return randomBytes(32).toString("hex");
}

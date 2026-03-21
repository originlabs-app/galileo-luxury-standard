/**
 * Webhook outbox — in-memory queue for reliable webhook delivery.
 *
 * When a product event occurs (MINTED, TRANSFERRED, RECALLED, VERIFIED),
 * the outbox creates entries for all matching subscriptions.
 * A background worker processes the queue and attempts delivery.
 *
 * MVP: in-memory. Data is lost on server restart.
 * Production: move to a DB-backed outbox table.
 */

import { randomUUID } from "node:crypto";
import type { WebhookEvent, WebhookSubscription } from "./types.js";
import { deliverWebhook, getBackoffMs } from "./delivery.js";

// In-memory subscription store
const subscriptions = new Map<string, WebhookSubscription>();

// In-memory outbox queue
const outboxQueue: WebhookEvent[] = [];

let workerInterval: ReturnType<typeof setInterval> | null = null;

const MAX_ATTEMPTS = 5;

// ─── Subscription management ─────────────────────────────────

export function addSubscription(sub: WebhookSubscription): void {
  subscriptions.set(sub.id, sub);
}

export function removeSubscription(id: string): boolean {
  return subscriptions.delete(id);
}

export function getSubscription(id: string): WebhookSubscription | undefined {
  return subscriptions.get(id);
}

export function listSubscriptions(brandId?: string): WebhookSubscription[] {
  const all = Array.from(subscriptions.values());
  if (!brandId) return all;
  return all.filter((s) => s.brandId === brandId);
}

// ─── Outbox operations ────────────────────────────────────────

/**
 * Enqueue webhook events for all matching subscriptions.
 * Non-blocking: does not throw even if there are no matching subscriptions.
 */
export function enqueueWebhookEvent(
  eventType: string,
  productId: string,
  data: Record<string, unknown>,
): void {
  const now = new Date();
  const payload = {
    eventType,
    productId,
    data,
    timestamp: now.toISOString(),
  };

  for (const sub of subscriptions.values()) {
    if (!sub.active) continue;
    if (!sub.events.includes(eventType)) continue;

    const event: WebhookEvent = {
      id: randomUUID(),
      subscriptionId: sub.id,
      eventType,
      payload,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      nextAttemptAt: now,
      status: "pending",
      createdAt: now,
    };

    outboxQueue.push(event);
  }
}

/**
 * Process the next due outbox entry.
 * Returns true if an entry was processed, false if queue is empty or nothing is due.
 */
export async function processNext(): Promise<boolean> {
  const now = new Date();
  const idx = outboxQueue.findIndex(
    (e) => e.status === "pending" && e.nextAttemptAt <= now,
  );
  if (idx === -1) return false;

  const event = outboxQueue[idx]!;
  const sub = subscriptions.get(event.subscriptionId);

  if (!sub) {
    // Subscription removed while event was pending — remove from queue
    outboxQueue.splice(idx, 1);
    return true;
  }

  event.attempts += 1;
  const result = await deliverWebhook(event, sub);

  if (result.success) {
    // Terminal state: remove from queue to prevent unbounded growth
    outboxQueue.splice(idx, 1);
  } else {
    event.lastError = result.error;
    if (event.attempts >= event.maxAttempts) {
      // Terminal state: remove from queue
      outboxQueue.splice(idx, 1);
    } else {
      event.nextAttemptAt = new Date(
        now.getTime() + getBackoffMs(event.attempts - 1),
      );
    }
  }

  return true;
}

/**
 * Start the outbox background worker.
 */
export function startWorker(intervalMs = 5000): void {
  if (workerInterval) return;
  workerInterval = setInterval(async () => {
    try {
      while (await processNext()) {
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
 * Get all outbox entries (for testing).
 */
export function getOutboxEntries(): WebhookEvent[] {
  return [...outboxQueue];
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
export function clearAll(): void {
  subscriptions.clear();
  outboxQueue.length = 0;
}

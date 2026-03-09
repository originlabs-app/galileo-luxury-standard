# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #7 -- Compliance & Event Delivery

**Goal**: Add compliance checks to transfers, build the webhook delivery system, harden wallet-link security, and enable audit trail export. These are non-blocked P1 tasks pulled forward while Sprint #6 (Real Chain Unblock) waits for the RPC key.
**Started**: 2026-03-09
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| T7.1 | Transfer compliance check (5 modules) | EPIC-002 | done | Transfer blocked when compliance fails, with reason. Transfer succeeds when all checks pass. | 72746f2 |
| T7.2 | Webhook system (outbox + retry) | EPIC-002 | done | Webhook registered, events delivered reliably, failed deliveries retried with exponential backoff. | 3b805f1 |
| T7.3 | Audit trail export (CSV/JSON) | EPIC-006 | done | ADMIN exports audit data as CSV or JSON. BRAND_ADMIN sees only own brand. Date range filter works. | d6aac65 |
| T7.4 | Wallet-link: add nonce + expiry | EPIC-005 | done | Nonce endpoint returns unique nonce, signed message includes nonce + timestamp, old/replayed signatures rejected. | 7e0eb06 |
| T7.5 | E2E Playwright: compliance, webhooks, audit export, wallet nonce | EPIC-007 | done | Automated Playwright specs covering Sprint #7 features. Run with `pnpm --filter dashboard exec playwright test`. | 60fb11e |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated or explicitly deferred
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### Brief T7.1: Transfer Compliance Check (5 Modules)

**Type**: backend
**Priority**: P1
**Epic**: EPIC-002-product-lifecycle
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/services/compliance/` -- NEW directory: compliance module system
- `apps/api/src/services/compliance/index.ts` -- NEW: compliance runner (orchestrates all modules)
- `apps/api/src/services/compliance/jurisdiction.ts` -- NEW: jurisdiction check module
- `apps/api/src/services/compliance/sanctions.ts` -- NEW: sanctions list check module
- `apps/api/src/services/compliance/brand-auth.ts` -- NEW: brand authorization check module
- `apps/api/src/services/compliance/cpo.ts` -- NEW: CPO eligibility check module (stub for now)
- `apps/api/src/services/compliance/service-center.ts` -- NEW: authorized service center check module (stub for now)
- `apps/api/src/routes/products/transfer.ts` -- integrate compliance check before transfer
- `apps/api/test/transfer.test.ts` -- extend with compliance tests

**Approach**:

Add a compliance check pipeline that runs before every product transfer. The pipeline consists of 5 modules executed sequentially. If any module fails, the transfer is blocked with a detailed rejection reason.

**Step 1: Create the compliance module interface and runner**

Create `apps/api/src/services/compliance/index.ts`:

```typescript
export interface ComplianceContext {
  productId: string;
  productStatus: string;
  productBrandId: string;
  fromAddress: string | null;
  toAddress: string;
  userId: string;
  userRole: string;
  userBrandId: string | null;
}

export interface ComplianceResult {
  passed: boolean;
  module: string;
  reason?: string;
}

export type ComplianceModule = (
  ctx: ComplianceContext,
) => Promise<ComplianceResult>;

export async function runComplianceChecks(
  ctx: ComplianceContext,
  modules: ComplianceModule[],
): Promise<{ passed: boolean; results: ComplianceResult[] }> {
  const results: ComplianceResult[] = [];
  for (const mod of modules) {
    const result = await mod(ctx);
    results.push(result);
    if (!result.passed) {
      return { passed: false, results };
    }
  }
  return { passed: true, results };
}
```

**Step 2: Implement the 5 compliance modules**

1. **jurisdiction.ts**: Check that the destination address is not in a blocked jurisdiction. For MVP, maintain a configurable blocklist of address prefixes or always pass (no jurisdiction data available yet). Return `{ passed: true, module: "jurisdiction" }` for now, with a TODO for real jurisdiction lookup.

2. **sanctions.ts**: Check destination address against a sanctions list. For MVP, maintain a static blocklist Set. If `toAddress` is in the set, reject. Initially the set is empty -- no addresses are sanctioned. Structure allows easy extension with OFAC/EU sanctions API later.

3. **brand-auth.ts**: Verify that the transferring user's brand authorizes transfers to the destination. For MVP: brand admins of the product's brand can always transfer. Cross-brand transfers (user.brandId !== product.brandId) are rejected unless user is ADMIN.

4. **cpo.ts**: Check CPO (Certified Pre-Owned) eligibility. For MVP: stub that always passes. Will be activated when REPAIRED/CPO_CERTIFIED event types are added (Sprint #7 locked task).

5. **service-center.ts**: Verify the transfer is initiated from an authorized service center. For MVP: stub that always passes. Will be activated when service center registry is built.

**Step 3: Integrate into transfer.ts**

In `apps/api/src/routes/products/transfer.ts`, after fetching the product and before the optimistic update:

```typescript
import { runComplianceChecks, type ComplianceContext } from "../../services/compliance/index.js";
import { jurisdictionCheck } from "../../services/compliance/jurisdiction.js";
import { sanctionsCheck } from "../../services/compliance/sanctions.js";
import { brandAuthCheck } from "../../services/compliance/brand-auth.js";
import { cpoCheck } from "../../services/compliance/cpo.js";
import { serviceCenterCheck } from "../../services/compliance/service-center.js";

// Inside the transaction, after fetching product and before updateMany:
const complianceCtx: ComplianceContext = {
  productId: product.id,
  productStatus: product.status,
  productBrandId: product.brandId,
  fromAddress: product.walletAddress ?? null,
  toAddress: checksumToAddress,
  userId: user.sub,
  userRole: user.role,
  userBrandId: user.brandId ?? null,
};

const compliance = await runComplianceChecks(complianceCtx, [
  jurisdictionCheck,
  sanctionsCheck,
  brandAuthCheck,
  cpoCheck,
  serviceCenterCheck,
]);

if (!compliance.passed) {
  const failed = compliance.results.find((r) => !r.passed);
  throw new RouteError(
    403,
    "COMPLIANCE_REJECTED",
    `Transfer blocked by compliance: ${failed?.module} — ${failed?.reason}`,
  );
}
```

**Step 4: Add compliance rejection data to the response**

When compliance fails, the 403 response includes the module name and reason so the caller (dashboard or API consumer) can display a meaningful error.

**Patterns to follow**:
- RouteError for compliance rejection (standard error pattern)
- Brand scoping: ADMIN bypasses brand-auth check (R31)
- No body/response JSON schema changes needed (R01)
- Sequential module execution (fail fast on first rejection)
- Each module is a pure async function -- easy to test in isolation
- Enums from @galileo/shared (R09)

**Edge cases**:
- Product with no walletAddress (first transfer): `fromAddress` is null -- compliance modules must handle null fromAddress
- ADMIN user transferring cross-brand: brand-auth module passes for ADMIN role
- Empty sanctions list: all transfers pass sanctions check (expected for MVP)
- Concurrent compliance + transfer: compliance runs inside the transaction, so optimistic concurrency still protects
- Multiple modules fail: only the first failure is reported (fail-fast)

**Tests** (~12 tests):
- Transfer succeeds when all compliance modules pass
- Transfer blocked (403 COMPLIANCE_REJECTED) when sanctions check fails
- Transfer blocked when brand-auth fails (cross-brand non-ADMIN)
- ADMIN can transfer cross-brand (brand-auth passes)
- Compliance context correctly built from product + user
- Each module tested in isolation with mock context
- Null fromAddress handled correctly
- Existing transfer tests still pass (regression)

**Verify**: Transfer a product -- succeeds when compliance passes. Add a sanctioned address -- transfer to that address returns 403 with `COMPLIANCE_REJECTED` and module name. Cross-brand transfer by non-ADMIN returns 403.

---

### Brief T7.2: Webhook System (Outbox + Retry)

**Type**: backend
**Priority**: P1
**Epic**: EPIC-002-product-lifecycle
**Operator approval**: not required (no schema migration -- uses existing JSON field pattern)

**Files to modify**:
- `apps/api/src/services/webhooks/` -- NEW directory: webhook system
- `apps/api/src/services/webhooks/outbox.ts` -- NEW: outbox pattern for reliable delivery
- `apps/api/src/services/webhooks/delivery.ts` -- NEW: HTTP delivery with retry logic
- `apps/api/src/services/webhooks/types.ts` -- NEW: webhook types and interfaces
- `apps/api/src/routes/webhooks/` -- NEW directory: webhook management routes
- `apps/api/src/routes/webhooks/index.ts` -- NEW: CRUD routes for webhook subscriptions
- `apps/api/src/server.ts` -- register webhook routes
- `apps/api/test/webhooks.test.ts` -- NEW: webhook tests

**Approach**:

Implement a webhook system using the outbox pattern for reliable event delivery. Instead of direct HTTP callbacks from route handlers (which fail silently if the destination is down), we write webhook events to an outbox table and process them with a background worker.

**Important design decision**: We need a table for webhook subscriptions and outbox entries. Since the 🔒 DB migration task is blocked, we use an **in-memory approach for MVP** with a JSON config file for subscriptions and an in-memory outbox queue. This avoids needing a DB migration while proving the delivery mechanism works. When the DB migration is unblocked, we can move subscriptions and outbox to proper tables.

**Step 1: Create webhook types**

`apps/api/src/services/webhooks/types.ts`:

```typescript
export interface WebhookSubscription {
  id: string;
  brandId: string;
  url: string;
  secret: string; // HMAC-SHA256 signing secret
  events: string[]; // e.g. ["MINTED", "TRANSFERRED", "RECALLED"]
  active: boolean;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  subscriptionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  status: "pending" | "delivered" | "failed";
  lastError?: string;
  createdAt: Date;
}
```

**Step 2: Create outbox service**

`apps/api/src/services/webhooks/outbox.ts`:

The outbox maintains an in-memory queue of pending webhook events. When a product event occurs (MINTED, TRANSFERRED, RECALLED, VERIFIED), the outbox creates entries for all matching subscriptions.

Key methods:
- `enqueue(eventType, productId, data)` -- creates outbox entries for matching subscriptions
- `processNext()` -- picks the next due entry and attempts delivery
- `startWorker(intervalMs)` -- starts a setInterval loop processing the queue
- `stopWorker()` -- cleans up the interval

**Step 3: Create delivery service**

`apps/api/src/services/webhooks/delivery.ts`:

HTTP delivery with HMAC-SHA256 signature:
- POST to subscription URL
- Body: JSON payload with event type, product data, timestamp
- Header `X-Galileo-Signature`: HMAC-SHA256 of body using subscription secret
- Header `X-Galileo-Event`: event type string
- Timeout: 10s
- On success (2xx): mark entry as delivered
- On failure: increment attempts, schedule retry with exponential backoff (1min, 5min, 25min, 2h, 10h)
- Max 5 attempts -- after that, mark as failed

**Step 4: Create webhook management routes**

`apps/api/src/routes/webhooks/index.ts`:

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /webhooks | BRAND_ADMIN, ADMIN | Create subscription |
| GET | /webhooks | BRAND_ADMIN, ADMIN | List subscriptions (brand-scoped) |
| DELETE | /webhooks/:id | BRAND_ADMIN, ADMIN | Delete subscription |

Subscriptions are stored in-memory (Map) for MVP. Brand-scoped: BRAND_ADMIN sees only their brand's subscriptions. ADMIN sees all.

**Step 5: Wire into product event flow**

After product events are created (in transfer.ts, mint.ts, recall.ts, verify.ts), call `webhookOutbox.enqueue(eventType, productId, eventData)`. This is a non-blocking fire-and-forget call (R29 -- cross-cutting hooks fail silently).

**Step 6: Register in server.ts**

Register webhook routes and start the outbox worker on app ready.

**Patterns to follow**:
- Brand scoping: BRAND_ADMIN sees only their brand (R31)
- Cross-cutting hooks fail silently (R29)
- CSRF on mutations (POST, DELETE)
- No body/response JSON schema (R01)
- requireRole middleware for auth
- HMAC-SHA256 for webhook signature (industry standard)
- Exponential backoff for retries (1, 5, 25, 120, 600 minutes)

**Edge cases**:
- No subscriptions matching event: enqueue is a no-op
- Subscription URL unreachable: retry with backoff, max 5 attempts
- Large payload: limit event payload to essential fields (id, type, product summary)
- Server restart: in-memory outbox is lost -- acceptable for MVP (document as known limitation)
- Concurrent delivery: single worker, no concurrency issues
- Invalid subscription URL: validate URL format on creation
- HMAC verification: document how consumers verify the signature

**Tests** (~15 tests):
- POST /webhooks creates subscription (201)
- POST /webhooks validates URL format (400)
- GET /webhooks lists brand-scoped subscriptions
- DELETE /webhooks/:id removes subscription
- ADMIN sees all subscriptions
- BRAND_ADMIN cannot see other brand's subscriptions
- Unauthenticated request returns 401
- Outbox enqueue creates entries for matching subscriptions
- Outbox enqueue skips inactive subscriptions
- Outbox enqueue skips subscriptions not matching event type
- Delivery sends correct payload with HMAC signature
- Delivery retries on failure with exponential backoff
- Delivery marks as failed after max attempts
- Delivery marks as delivered on 2xx response
- Webhook fires after product transfer

**Verify**: Create a webhook subscription for TRANSFERRED events. Transfer a product. Verify the webhook delivery attempt occurs with correct payload and HMAC signature. Test retry by pointing to an invalid URL -- verify retries happen with backoff. Verify BRAND_ADMIN can only see own subscriptions.

---

### Brief T7.3: Audit Trail Export (CSV/JSON)

**Type**: backend
**Priority**: P1
**Epic**: EPIC-006-data-compliance
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/routes/audit/export.ts` -- NEW: export route handler
- `apps/api/src/routes/audit/index.ts` -- register export route alongside existing list route
- `apps/api/test/audit-export.test.ts` -- NEW: export tests

**Approach**:

Add a `GET /audit-log/export` endpoint that returns audit trail data as CSV or JSON. The format is selected via `Accept` header or `?format=csv|json` query param. Supports date range filtering, resource filtering, and brand scoping for non-ADMIN users.

**Step 1: Create `apps/api/src/routes/audit/export.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../../middleware/rbac.js";

const exportQuerySchema = z.object({
  format: z.enum(["csv", "json"]).default("json"),
  from: z.string().datetime().optional(), // ISO 8601 start date
  to: z.string().datetime().optional(),   // ISO 8601 end date
  resource: z.string().optional(),
  actor: z.string().optional(),
});

export default async function auditExportRoute(fastify: FastifyInstance) {
  fastify.get(
    "/audit-log/export",
    {
      onRequest: [fastify.authenticate, requireRole("ADMIN", "BRAND_ADMIN")],
      schema: {
        description:
          "Export audit log entries as CSV or JSON. " +
          "ADMIN sees all entries. BRAND_ADMIN sees only their brand's entries " +
          "(filtered by actor being a user of their brand).",
        tags: ["Audit"],
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            format: { type: "string", enum: ["csv", "json"], default: "json" },
            from: { type: "string", format: "date-time" },
            to: { type: "string", format: "date-time" },
            resource: { type: "string" },
            actor: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = exportQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: parsed.error.flatten().fieldErrors,
          },
        });
      }

      const { format, from, to, resource, actor } = parsed.data;
      const user = request.user;

      // Build where clause
      const where: Record<string, unknown> = {};
      if (resource) where.resource = resource;
      if (actor) where.actor = actor;
      if (from || to) {
        where.createdAt = {};
        if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
        if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
      }

      // Brand scoping for BRAND_ADMIN: filter by actors belonging to their brand
      if (user.role === "BRAND_ADMIN" && user.brandId) {
        const brandUsers = await fastify.prisma.user.findMany({
          where: { brandId: user.brandId },
          select: { id: true },
        });
        const brandUserIds = brandUsers.map((u: { id: string }) => u.id);
        where.actor = { in: brandUserIds };
      }

      const entries = await fastify.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 10000, // Safety limit
      });

      if (format === "csv") {
        const header = "id,actor,action,resource,resourceId,ip,createdAt";
        const rows = entries.map(
          (e: { id: string; actor: string | null; action: string; resource: string; resourceId: string | null; ip: string | null; createdAt: Date }) =>
            [
              e.id,
              e.actor ?? "",
              e.action,
              e.resource,
              e.resourceId ?? "",
              e.ip ?? "",
              e.createdAt.toISOString(),
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(","),
        );
        const csv = [header, ...rows].join("\n");
        return reply
          .header("Content-Type", "text/csv; charset=utf-8")
          .header(
            "Content-Disposition",
            `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
          )
          .send(csv);
      }

      // JSON format
      return reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header(
          "Content-Disposition",
          `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.json"`,
        )
        .send({
          success: true,
          data: { entries, exportedAt: new Date().toISOString(), count: entries.length },
        });
    },
  );
}
```

**Step 2: Update `apps/api/src/routes/audit/index.ts`**

The current audit/index.ts is a single file with the list route. Refactor to register the export route alongside it.

Current structure: `auditRoutes` function registers `GET /audit-log` directly.
New structure: keep existing route, add import and register of the export route.

Note: The export route is `GET /audit-log/export`, not a sub-path of the existing route. Both are registered in the same plugin. Register the export route BEFORE the list route to avoid Fastify route matching ambiguity (more specific path first).

```typescript
import auditExportRoute from "./export.js";

// Inside auditRoutes:
await fastify.register(auditExportRoute);
// ... existing GET /audit-log route ...
```

**Patterns to follow**:
- requireRole for ADMIN + BRAND_ADMIN access (existing audit pattern)
- Zod validation for query params (existing audit pattern)
- Brand scoping for BRAND_ADMIN (R31) -- filter by brand's user IDs
- No body/response JSON schema (R01)
- CSV escaping: double-quote wrapping with escaped internal quotes
- Content-Disposition header for file download
- Safety limit (10000) to prevent OOM on large audit logs

**Edge cases**:
- No entries matching filter: CSV returns header-only, JSON returns empty array
- Very large audit log: 10000 entry limit prevents OOM -- document this limitation
- BRAND_ADMIN with no brand users: returns empty result
- Date range: `from` and `to` are both optional, can be used independently
- CSV special characters: commas, newlines, quotes in field values -- escaped with RFC 4180 double-quoting
- Metadata JSON field: excluded from CSV for simplicity (only flat fields exported)

**Tests** (~10 tests):
- GET /audit-log/export returns JSON by default (200)
- GET /audit-log/export?format=csv returns CSV with correct Content-Type and Content-Disposition
- Date range filter: `from` and `to` limit results
- Resource filter works
- ADMIN sees all entries
- BRAND_ADMIN sees only their brand's entries
- VIEWER role returns 403
- Unauthenticated returns 401
- Empty result: JSON has empty entries array, CSV has only header
- CSV escapes special characters correctly

**Verify**: Create audit entries via product operations. Export as JSON -- verify entries match. Export as CSV -- verify downloadable file with correct format. Test as BRAND_ADMIN -- verify only brand-scoped entries. Test date range -- verify filtering works.

---

### Brief T7.4: Wallet-Link: Add Nonce + Expiry

**Type**: security
**Priority**: P1
**Epic**: EPIC-005-security-hardening
**Operator approval**: not required

**Files to modify**:
- `packages/shared/src/validation/wallet.ts` -- update `buildLinkWalletMessage` to include nonce + timestamp
- `apps/api/src/routes/auth/nonce.ts` -- NEW: GET /auth/nonce endpoint
- `apps/api/src/routes/auth/link-wallet.ts` -- validate nonce + expiry in signed message
- `apps/api/src/routes/auth/index.ts` -- register nonce route
- `apps/api/test/link-wallet.test.ts` -- extend with nonce/expiry tests
- `apps/dashboard/src/components/wallet-connection.tsx` -- update to fetch nonce before signing

**Approach**:

The current wallet-link flow uses a static message (`"Link wallet to Galileo: {email}"`) with no nonce or expiry. This is vulnerable to replay attacks: an attacker who captures a signed message can reuse it indefinitely. Fix: add a server-generated nonce and a timestamp to the message, then validate both server-side.

**Step 1: Create GET /auth/nonce endpoint**

`apps/api/src/routes/auth/nonce.ts`:

```typescript
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

// In-memory nonce store (Map<nonce, { userId, expiresAt }>)
// For MVP: in-memory. For production: store in Redis or DB.
const nonceStore = new Map<string, { userId: string; expiresAt: number }>();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function createNonce(userId: string): string {
  // Clean expired nonces (lazy cleanup)
  const now = Date.now();
  for (const [key, val] of nonceStore) {
    if (val.expiresAt < now) nonceStore.delete(key);
  }

  const nonce = randomUUID();
  nonceStore.set(nonce, { userId, expiresAt: now + NONCE_TTL_MS });
  return nonce;
}

export function consumeNonce(nonce: string, userId: string): boolean {
  const entry = nonceStore.get(nonce);
  if (!entry) return false;
  if (entry.userId !== userId) return false;
  if (entry.expiresAt < Date.now()) {
    nonceStore.delete(nonce);
    return false;
  }
  nonceStore.delete(nonce); // One-time use
  return true;
}

// Exported for testing
export function _clearNonceStore(): void {
  nonceStore.clear();
}

export default async function nonceRoute(fastify: FastifyInstance) {
  fastify.get(
    "/auth/nonce",
    {
      onRequest: [fastify.authenticate],
      schema: {
        description:
          "Generate a one-time nonce for wallet-link message signing. " +
          "Nonce expires after 5 minutes.",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const nonce = createNonce(request.user.sub);
      return reply.status(200).send({
        success: true,
        data: { nonce },
      });
    },
  );
}
```

**Step 2: Update `packages/shared/src/validation/wallet.ts`**

Update `buildLinkWalletMessage` to include nonce and timestamp:

```typescript
export const LINK_WALLET_MESSAGE_PREFIX = "Link wallet to Galileo:";

/** Build the signed message for wallet linking (v2: with nonce + timestamp). */
export function buildLinkWalletMessage(
  email: string,
  nonce?: string,
  timestamp?: number,
): string {
  if (nonce && timestamp) {
    return `${LINK_WALLET_MESSAGE_PREFIX} ${email}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
  }
  // Legacy fallback (for backward compatibility during migration)
  return `${LINK_WALLET_MESSAGE_PREFIX} ${email}`;
}

/** Parse nonce and timestamp from a signed message. Returns null if not present. */
export function parseLinkWalletMessage(
  message: string,
): { email: string; nonce: string; timestamp: number } | null {
  const lines = message.split("\n");
  if (lines.length < 3) return null;
  const emailMatch = lines[0].match(
    /^Link wallet to Galileo:\s+(.+)$/,
  );
  const nonceMatch = lines[1]?.match(/^Nonce:\s+(.+)$/);
  const timestampMatch = lines[2]?.match(/^Timestamp:\s+(\d+)$/);
  if (!emailMatch || !nonceMatch || !timestampMatch) return null;
  return {
    email: emailMatch[1],
    nonce: nonceMatch[1],
    timestamp: Number(timestampMatch[1]),
  };
}
```

**Step 3: Update link-wallet.ts**

In the link-wallet route, after signature verification, parse the message for nonce + timestamp:

```typescript
import { parseLinkWalletMessage, buildLinkWalletMessage } from "@galileo/shared";
import { consumeNonce } from "./nonce.js";

// After signature verification succeeds:
const parsed = parseLinkWalletMessage(message);
if (!parsed) {
  // Legacy message format (no nonce) -- reject
  return reply.status(400).send({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Message must include nonce and timestamp. Use GET /auth/nonce first.",
    },
  });
}

// Verify email matches
if (parsed.email !== currentUser.email) {
  return reply.status(400).send({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Signed message does not match your account",
    },
  });
}

// Verify timestamp (5-minute expiry)
const MESSAGE_EXPIRY_MS = 5 * 60 * 1000;
if (Date.now() - parsed.timestamp > MESSAGE_EXPIRY_MS) {
  return reply.status(400).send({
    success: false,
    error: {
      code: "EXPIRED",
      message: "Signed message has expired. Request a new nonce.",
    },
  });
}

// Consume nonce (one-time use)
if (!consumeNonce(parsed.nonce, sub)) {
  return reply.status(400).send({
    success: false,
    error: {
      code: "INVALID_NONCE",
      message: "Nonce is invalid or has already been used.",
    },
  });
}
```

**Step 4: Register nonce route in auth/index.ts**

Add import and register of `nonceRoute`.

**Step 5: Update dashboard wallet-connection.tsx**

Update the wallet link flow in the dashboard to:
1. `GET /auth/nonce` to obtain a nonce
2. Build message with `buildLinkWalletMessage(email, nonce, Date.now())`
3. Sign the message
4. `POST /auth/link-wallet` with address, signature, message

**Patterns to follow**:
- In-memory nonce store for MVP (R12 -- optional in dev/test)
- One-time use nonces (consumed on successful link)
- 5-minute TTL for nonces and message timestamps
- Lazy cleanup of expired nonces
- No body/response JSON schema (R01)
- Authentication required for nonce endpoint (prevent nonce farming)
- Shared message builder in @galileo/shared (keeps wallet.ts as single source of truth)

**Edge cases**:
- Replayed signature: nonce consumed on first use, second attempt fails with INVALID_NONCE
- Expired message: timestamp check rejects messages older than 5 minutes
- Expired nonce: nonce TTL is 5 minutes, same as message expiry
- Wrong user's nonce: nonce is bound to userId, cross-user replay blocked
- Server restart: in-memory nonce store is cleared -- all pending nonces invalidated (user must request new one)
- Race condition: two concurrent link-wallet requests with same nonce -- Map.delete is sync, first wins
- Legacy message format: rejected with clear error message directing user to use nonce endpoint

**Tests** (~10 tests):
- GET /auth/nonce returns 200 with nonce string
- GET /auth/nonce requires authentication (401)
- Link-wallet with valid nonce + timestamp succeeds (200)
- Link-wallet with legacy message (no nonce) returns 400
- Link-wallet with expired timestamp returns 400 EXPIRED
- Link-wallet with invalid nonce returns 400 INVALID_NONCE
- Link-wallet with replayed nonce (second attempt) returns 400 INVALID_NONCE
- Link-wallet with wrong user's nonce returns 400 INVALID_NONCE
- Nonce expires after 5 minutes (mock Date.now)
- Existing tests updated to use nonce flow

**Verify**: Request a nonce. Build message with nonce + timestamp. Sign and submit -- succeeds. Try to replay the same signature -- fails with INVALID_NONCE. Wait 5+ minutes (or mock time) -- fails with EXPIRED. Try old-format message without nonce -- fails with clear error.

---

### Brief T7.5: E2E Playwright -- Compliance, Webhooks, Audit Export, Wallet Nonce

**Type**: testing
**Priority**: P2
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/e2e/transfer-compliance.spec.ts` -- NEW: E2E tests for transfer compliance
- `apps/dashboard/e2e/audit-export.spec.ts` -- NEW: E2E tests for audit export
- `apps/api/test/webhooks.test.ts` -- covered in T7.2 (Vitest unit tests, not Playwright)

**Approach**:

Write Playwright E2E specs for the Sprint #7 features that have dashboard UI impact. Not all features have browser-testable UI -- webhooks and wallet-link nonce are primarily API-level and are better covered by Vitest unit/integration tests (T7.2 and T7.4).

Focus E2E on:
1. **Transfer compliance**: Transfer a product via dashboard -- verify the transfer succeeds. Verify the compliance rejection error appears in the UI if compliance fails (requires a sanctioned address in test setup).
2. **Audit export**: Navigate to dashboard audit page (if it exists) or use API directly via Playwright request context. Verify CSV and JSON exports download correctly.

**Spec 1: `transfer-compliance.spec.ts`**

```
describe("Transfer with Compliance")
  - create product → mint → transfer to valid address → succeeds
  - transfer shows compliance rejection error for blocked address (if sanctions list populated in test)
  - transfer error message includes the module name that rejected
```

Setup: reuse auth state. Create and mint a product via dashboard, then use the transfer flow.

**Spec 2: `audit-export.spec.ts`**

```
describe("Audit Trail Export")
  - export as JSON via API request → returns entries with correct structure
  - export as CSV via API request → returns file with header and rows
  - date range filter limits export results
  - ADMIN can export all entries
```

Setup: perform several operations (create, mint, transfer) to generate audit entries, then test the export endpoint via Playwright's `request` API context.

**Patterns to follow**:
- Auth: use `storageState: "playwright/.auth/user.json"`
- Selectors: prefer `getByRole`, `getByText`, `getByLabel`
- Waits: use `expect(locator).toBeVisible({ timeout })` not arbitrary sleeps
- API testing: use `request.newContext()` for direct API calls in Playwright
- Isolation: each spec creates its own test data

**Edge cases**:
- Transfer compliance error may be displayed differently depending on dashboard implementation
- Audit export download: use Playwright's download handling (`page.waitForEvent("download")`) for CSV
- ADMIN auth setup: may need a separate auth state file for ADMIN tests

**Verify**: `pnpm --filter dashboard exec playwright test` runs all specs including new ones. All pass. Transfer compliance rejection is visible in dashboard. Audit export downloads correctly.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. Sprint #7 pulls forward non-blocked P1 tasks from Sprint #7 (lifecycle/compliance) and Sprint #8/9 (audit export, wallet security).

The 🔒 DB migration task (add REPAIRED, CPO_CERTIFIED event types) is NOT included. Lifecycle endpoints and CPO certification flow depend on that migration and will be in a future sprint after operator approval.

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #4 -- Production Observability & API Usability

**Goal**: Add error tracking (Sentry), an append-only audit trail for all mutations, and product list filtering -- moving the API closer to production-grade observability and usability.
**Started**: 2026-03-09
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| 1 | Sentry error tracking integration | EPIC-007 | done | Unhandled errors captured in Sentry, SENTRY_DSN configurable | 78f3042 |
| 2 | Audit trail: AuditLog model + onResponse hook + admin endpoint | EPIC-006 | done | All POST/PATCH/DELETE mutations logged, GET /audit-log returns entries for ADMIN | 75e15ca |
| 3 | Product list filtering by status and category | EPIC-002 | done | GET /products?status=ACTIVE&category=watches returns filtered results | ff33ff6 |

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

### Brief #1: Sentry Error Tracking Integration

**Type**: observability
**Priority**: P2
**Epic**: EPIC-007-observability-quality

**Files to modify**:
- `apps/api/package.json` -- add `@sentry/node` dependency
- `apps/api/src/config.ts` -- add `SENTRY_DSN` env var (optional)
- `apps/api/src/plugins/sentry.ts` -- NEW: Sentry plugin (fp() pattern)
- `apps/api/src/server.ts` -- register sentry plugin (before routes, after core plugins)
- `apps/api/test/sentry.test.ts` -- NEW: tests using mock decorator pattern

**Approach**:

Sentry captures unhandled errors and sends them to a remote dashboard for monitoring. For Galileo, we use `@sentry/node` directly with a Fastify plugin that:
1. Initializes Sentry with the DSN from config
2. Adds an `onError` hook that captures exceptions
3. Gracefully no-ops when `SENTRY_DSN` is not set (dev/test)

**Step 1: Add dependency**

```bash
cd apps/api && pnpm add @sentry/node
```

**Step 2: Add `SENTRY_DSN` to config.ts**

```typescript
SENTRY_DSN: z.string().url().optional(),
```

This follows R12 (optional in dev/test, used in production).

**Step 3: Create `apps/api/src/plugins/sentry.ts`**

```typescript
import fp from "fastify-plugin";
import * as Sentry from "@sentry/node";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    sentry: typeof Sentry | null;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  if (!config.SENTRY_DSN) {
    fastify.decorate("sentry", null);
    return;
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    tracesSampleRate: config.NODE_ENV === "production" ? 0.1 : 1.0,
  });

  fastify.decorate("sentry", Sentry);

  // Capture unhandled errors
  fastify.addHook("onError", async (_request, _reply, error) => {
    Sentry.captureException(error);
  });

  // Flush on shutdown
  fastify.addHook("onClose", async () => {
    await Sentry.close(2000);
  });
});
```

**Step 4: Register in `server.ts`**

Add import and register after `storagePlugin`, before routes:

```typescript
import sentryPlugin from "./plugins/sentry.js";
// ... in buildApp():
await fastify.register(sentryPlugin);
```

**Step 5: Tests in `apps/api/test/sentry.test.ts`**

Use the mock decorator pattern (R17) -- no real Sentry connection needed:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";

describe("Sentry plugin", () => {
  it("decorates fastify with sentry: null when no DSN configured", async () => {
    const app = Fastify();
    // Plugin reads config.SENTRY_DSN which is undefined in test env
    const { default: sentryPlugin } = await import("../src/plugins/sentry.js");
    await app.register(sentryPlugin);
    await app.ready();

    expect(app.sentry).toBeNull();

    await app.close();
  });

  it("does not throw when sentry is null and an error occurs", async () => {
    const app = Fastify();
    const { default: sentryPlugin } = await import("../src/plugins/sentry.js");
    await app.register(sentryPlugin);

    // Add a route that throws
    app.get("/error-test", async () => {
      throw new Error("Test error");
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/error-test",
    });

    // Fastify returns 500 for unhandled errors
    expect(response.statusCode).toBe(500);

    await app.close();
  });
});
```

**Patterns to follow**:
- Plugin architecture: `fp()` wrapper, decorate fastify instance (same as prisma.ts, chain.ts)
- Config pattern: optional env var with no default (R12)
- Mock decorator pattern for tests (R17)
- Sentry SDK is disabled in test env (SENTRY_DSN not set)

**Edge cases**:
- `SENTRY_DSN` not set: plugin decorates `sentry: null`, no errors captured. This is the default for dev/test.
- `SENTRY_DSN` set but invalid: Sentry SDK handles this gracefully (logs warning, does not throw)
- High error volume: `tracesSampleRate: 0.1` in production limits trace collection
- Shutdown: `Sentry.close(2000)` flushes pending events with a 2-second timeout

**Verify**: `SENTRY_DSN` not set: app starts normally, `sentry` decorator is null. With DSN set: errors are captured (verify via Sentry dashboard or mock). All existing tests pass.

---

### Brief #2: Audit Trail -- AuditLog Model + onResponse Hook + Admin Endpoint

**Type**: feature
**Priority**: P2
**Epic**: EPIC-006-data-compliance

**Files to modify**:
- `apps/api/prisma/schema.prisma` -- add `AuditLog` model
- `apps/api/src/plugins/audit.ts` -- NEW: Fastify plugin with onResponse hook
- `apps/api/src/routes/audit/index.ts` -- NEW: GET /audit-log endpoint (ADMIN only)
- `apps/api/src/server.ts` -- register audit plugin + audit routes
- `apps/api/test/helpers.ts` -- add `AuditLog` to TRUNCATE statement
- `apps/api/test/global-setup.ts` -- add `AuditLog` to TRUNCATE statement
- `apps/api/test/audit.test.ts` -- NEW: tests

**Approach**:

An append-only audit log records who did what, when. This is a lightweight first version -- a Prisma model with a Fastify `onResponse` hook that logs all successful mutations (POST, PATCH, DELETE that returned 2xx). A later sprint can add hash-chain integrity per the full spec in `specifications/infrastructure/audit-trail.md`.

**Step 1: Add AuditLog model to Prisma schema**

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  actor      String?  // User ID (null for unauthenticated actions like verify)
  action     String   // HTTP method + route: "POST /products"
  resource   String   // Resource type: "product", "user", "auth"
  resourceId String?  // ID of the affected resource (if applicable)
  metadata   Json     @default("{}")  // Request body (sanitized), status code, etc.
  ip         String?  // Client IP for forensics
  createdAt  DateTime @default(now())

  @@index([actor])
  @@index([resource])
  @@index([createdAt])
}
```

After adding this, run: `cd apps/api && pnpm prisma generate`

**Step 2: Create `apps/api/src/plugins/audit.ts`**

```typescript
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

/** HTTP methods that are considered mutations and should be audited */
const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** Fields to strip from request body before logging (PII/secrets) */
const SENSITIVE_FIELDS = new Set([
  "password",
  "passwordHash",
  "refreshToken",
  "email",
]);

/** Sanitize request body: remove sensitive fields, truncate large values */
function sanitizeBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 200) {
      sanitized[key] = value.slice(0, 200) + "...";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/** Extract resource type from URL path */
function extractResource(url: string): string {
  // /products/:id/mint -> "product"
  // /auth/login -> "auth"
  // /auth/me/data -> "auth"
  const segments = url.split("/").filter(Boolean);
  if (segments[0] === "auth") return "auth";
  if (segments[0] === "products") return "product";
  if (segments[0] === "01") return "resolver";
  return segments[0] ?? "unknown";
}

/** Extract resource ID from URL path if present */
function extractResourceId(url: string): string | null {
  // /products/:id/... -> id
  const match = url.match(/\/products\/([^/]+)/);
  return match?.[1] ?? null;
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Only audit mutations that succeeded (2xx)
      if (!MUTATION_METHODS.has(request.method)) return;
      if (reply.statusCode < 200 || reply.statusCode >= 300) return;

      // Skip health checks and other non-business routes
      if (request.url === "/health") return;

      const actor = request.user?.sub ?? null;
      const action = `${request.method} ${request.routeOptions?.url ?? request.url}`;
      const resource = extractResource(request.url);
      const resourceId = extractResourceId(request.url);

      try {
        await fastify.prisma.auditLog.create({
          data: {
            actor,
            action,
            resource,
            resourceId,
            metadata: {
              statusCode: reply.statusCode,
              body: sanitizeBody(request.body),
              requestId: request.id,
            },
            ip: request.ip,
          },
        });
      } catch {
        // Audit logging must never break the request -- log and continue
        request.log.error("Failed to write audit log entry");
      }
    },
  );
});
```

**Step 3: Create `apps/api/src/routes/audit/index.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../../middleware/rbac.js";

const auditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  resource: z.string().optional(),
  actor: z.string().optional(),
});

export default async function auditRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/audit-log",
    {
      onRequest: [fastify.authenticate, requireRole("ADMIN")],
      schema: {
        description:
          "List audit log entries. ADMIN only. " +
          "Supports pagination and filtering by resource type or actor.",
        tags: ["Audit"],
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            resource: { type: "string", description: "Filter by resource type" },
            actor: { type: "string", description: "Filter by actor user ID" },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = auditQuerySchema.safeParse(request.query);
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

      const { page, limit, resource, actor } = parsed.data;

      const where: Record<string, string> = {};
      if (resource) where.resource = resource;
      if (actor) where.actor = actor;

      const [entries, total] = await Promise.all([
        fastify.prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        fastify.prisma.auditLog.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        success: true,
        data: {
          entries,
          pagination: { total, page, limit, totalPages },
        },
      });
    },
  );
}
```

**Step 4: Register in `server.ts`**

```typescript
import auditPlugin from "./plugins/audit.js";
import auditRoutes from "./routes/audit/index.js";
// ... in buildApp():
await fastify.register(auditPlugin);  // after prisma, before routes
// ... with other route registrations:
await fastify.register(auditRoutes);
```

**Step 5: Update `test/helpers.ts` TRUNCATE**

Add `"AuditLog"` to the TRUNCATE statement:

```typescript
`TRUNCATE TABLE "AuditLog", "ProductEvent", "ProductPassport", "Product", "User", "Brand" CASCADE`
```

Do the same in `test/global-setup.ts` teardown.

**Step 6: Tests in `apps/api/test/audit.test.ts`**

```
~10 tests:
- POST /products creates an audit log entry with actor, action, resource, resourceId
- Audit log entry has sanitized body (password redacted)
- GET /audit-log returns paginated entries for ADMIN
- GET /audit-log with ?resource=product filters by resource
- GET /audit-log with ?actor=userId filters by actor
- GET /audit-log returns 403 for non-ADMIN users
- GET /audit-log returns 401 for unauthenticated requests
- Failed mutations (4xx) are NOT logged
- GET requests are NOT logged (only mutations)
- Audit hook failure does not break the request (error handling)
```

Use `buildApp()` + `cleanDb()` + re-seed pattern (R03, R16).

**Patterns to follow**:
- Plugin architecture: `fp()` wrapper (same as prisma.ts, rate-limit.ts)
- Pagination: same pattern as products/list.ts (page/limit/totalPages)
- RBAC: `requireRole("ADMIN")` (same as existing admin guards)
- PII redaction: sanitize body before logging (R22 principle)
- Error resilience: audit logging must never break the request
- No body/response JSON schema in route config (R01)

**Edge cases**:
- Public endpoints (verify): `actor` is null, still logged
- Large request body: truncated to 200 chars per field
- Multipart upload: body sanitization handles non-object bodies gracefully
- Prisma error during audit write: caught silently, logged via Pino
- New TRUNCATE in helpers.ts: must be updated or existing tests will have stale AuditLog rows

**Verify**: Create a product (POST). Check AuditLog table has entry with actor, action="POST /products", resource="product", resourceId=productId. GET /audit-log as ADMIN returns the entry. Non-ADMIN gets 403. Failed requests (4xx) do not create entries.

---

### Brief #3: Product List Filtering by Status and Category

**Type**: improvement
**Priority**: P2
**Epic**: EPIC-002-product-lifecycle

**Files to modify**:
- `apps/api/src/routes/products/list.ts` -- add `status` and `category` query params
- `apps/api/test/products.test.ts` -- add filtering tests

**Approach**:

The product list endpoint already supports pagination (page/limit). Add optional `status` and `category` query params for filtering. This enables the dashboard to show "only active products" or "only watches".

**Step 1: Update `listQuerySchema` in list.ts**

```typescript
import { ProductStatus } from "@galileo/shared";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(ProductStatus).optional(),
  category: z.string().max(100).optional(),
});
```

Note: Use `z.nativeEnum(ProductStatus)` to validate against the shared enum (R09).

**Step 2: Update the querystring schema metadata** (for Swagger docs)

```typescript
querystring: {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1, description: "Page number" },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 20, description: "Items per page" },
    status: { type: "string", enum: ["DRAFT", "MINTING", "ACTIVE", "TRANSFERRED", "RECALLED"], description: "Filter by product status" },
    category: { type: "string", description: "Filter by product category" },
  },
},
```

**Step 3: Update the where clause in the handler**

```typescript
const { page, limit, status, category } = parsed.data;

// Brand scoping: ADMIN sees all, others see only their brand
const where: Record<string, unknown> =
  user.role === "ADMIN" ? {} : { brandId: user.brandId as string };

// Apply optional filters
if (status) where.status = status;
if (category) where.category = category;
```

**Step 4: Add tests in products.test.ts**

Add to the existing `describe("Product CRUD endpoints")` block:

```
~4 tests:
- GET /products?status=ACTIVE returns only active products
- GET /products?category=watches returns only watches
- GET /products?status=ACTIVE&category=watches combines both filters
- GET /products with invalid status returns 400 validation error
```

**Patterns to follow**:
- Use enums from @galileo/shared (R09)
- Zod validation on query params (same as existing page/limit)
- No response schema in route config (R01)

**Edge cases**:
- No products match filter: returns empty array with pagination `{ total: 0, products: [], pagination: { ... } }`
- Invalid status value: Zod rejects with VALIDATION_ERROR
- Category is free-text: accepts any string up to 100 chars
- Combined with brand scoping: filters are AND-ed with brand scope

**Verify**: Create products with different statuses and categories. GET /products?status=ACTIVE returns only active ones. GET /products?category=watches returns only watches. Invalid status returns 400.

## Notes

<!-- Developer and Tester add notes here during the sprint -->

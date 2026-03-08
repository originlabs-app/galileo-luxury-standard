# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #2 -- Scanner Completion + Observability Foundation

**Goal**: Complete the Scanner PWA (EPIC-004) by adding material composition display and deep link support, then lay the observability foundation (EPIC-007) with enhanced health checks and structured logging -- preparing for production deployment.
**Started**: 2026-03-08
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| 1 | Scanner material composition display | EPIC-004 | todo | Scanner shows material composition when product has metadata | -- |
| 2 | Scanner deep link | EPIC-004 | todo | QR scan opens product page directly, bypassing scanner home | -- |
| 3 | Health check with dependency status | EPIC-007 | todo | GET /health returns db + chain status | -- |
| 4 | Structured logging (no PII) | EPIC-007 | todo | JSON logs with request IDs, no email/password in logs | -- |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated or explicitly deferred
- [ ] All tests pass (173+ API tests, 69 shared tests)
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed
- [ ] EPIC-004 status updated to `completed` after scanner tasks validated

## Task Briefs

### Brief #1: Scanner Material Composition Display

**Type**: feature
**Priority**: P1
**Epic**: EPIC-004-scanner-pwa

**Files to modify**:
- `apps/scanner/src/app/page.tsx` -- add MaterialComposition component + render it in verification result
- `apps/api/src/routes/resolver/resolve.ts` -- include `metadata` from ProductPassport in JSON-LD response
- `apps/api/src/routes/products/create.ts` -- add optional `materials` field to createProductBody schema
- `apps/api/src/routes/products/update.ts` -- add optional `materials` field to updateProductBody schema
- `packages/shared/src/types/product.ts` -- add Material type (if not already there)
- `apps/api/test/resolver-qr.test.ts` -- add test for material composition in resolver response

**Approach**:

Material composition data needs to flow from product creation to the scanner display. The `ProductPassport.metadata` JSON field already exists and is the right place to store DPP-related data like materials. ESPR requires material composition in Digital Product Passports for textiles/footwear.

1. **Data model** -- no schema migration needed. Use the existing `ProductPassport.metadata` JSON field. Store materials as:
   ```typescript
   // In metadata JSON
   {
     materials: [
       { name: "Calfskin Leather", percentage: 65 },
       { name: "Cotton Canvas", percentage: 30 },
       { name: "Brass Hardware", percentage: 5 }
     ]
   }
   ```

2. **Create/Update routes** -- add an optional `materials` array to the Zod body schemas:
   ```typescript
   const materialSchema = z.object({
     name: z.string().min(1).max(100),
     percentage: z.number().min(0).max(100),
   });

   // In createProductBody / updateProductBody:
   materials: z.array(materialSchema).max(20).optional(),
   ```
   When `materials` is provided, store it in `ProductPassport.metadata`:
   ```typescript
   await tx.productPassport.update({
     where: { productId: product.id },
     data: { metadata: { materials: parsed.data.materials } },
   });
   ```

3. **Resolver** -- include materials from `metadata` in the JSON-LD response:
   ```typescript
   // In resolve.ts, after building jsonLd:
   const metadata = product.passport?.metadata as Record<string, unknown> | null;
   const materials = Array.isArray(metadata?.materials) ? metadata.materials : [];
   // Add to jsonLd:
   ...(materials.length > 0 ? { hasMaterialComposition: materials } : {}),
   ```

4. **Scanner UI** -- add a `MaterialComposition` component:
   - Renders a list of materials with percentage bars
   - Only shown when `hasMaterialComposition` is present and non-empty
   - Styled consistently with ProvenanceTimeline (same card + section pattern)
   - Update `ResolverResult` type to include `hasMaterialComposition`

**Patterns to follow**:
- Same card styling as ProvenanceTimeline (rounded-[28px], border, bg-card, shadow)
- Zod `.strict()` on body schemas (already done)
- Use metadata JSON field (no schema migration needed)
- Resolver only exposes public-safe data (materials are public per ESPR)

**Edge cases**:
- Materials percentages may not sum to 100 (some products have partial composition data) -- do NOT validate sum
- Empty materials array should be treated as "no materials" -- don't render the section
- Metadata field may contain other keys in the future -- use spread/merge when updating, not overwrite
- Old products with no materials in metadata should render normally without the section

**Verify**: Create a product with materials -> mint it -> resolve via scanner -> material composition displayed with percentage bars. Product without materials shows no composition section.

---

### Brief #2: Scanner Deep Link

**Type**: feature
**Priority**: P1
**Epic**: EPIC-004-scanner-pwa

**Files to modify**:
- `apps/scanner/src/app/scan/page.tsx` -- already routes to `/?link=...` after scan (this works)
- `apps/scanner/src/app/page.tsx` -- auto-resolve when `?link=` param is present (already works)
- `apps/scanner/src/app/layout.tsx` -- no changes needed
- `apps/scanner/public/manifest.json` -- add `url_handlers` for deep linking
- `apps/scanner/next.config.ts` -- add `assetLinks` / `apple-app-site-association` rewrites if needed

**Approach**:

The scanner already handles deep links partially -- when you scan a QR code on `/scan`, it redirects to `/?link=<encoded-url>` which auto-resolves via `resolveLink()`. The missing piece is **external deep linking**: when a user scans a Galileo QR code with their native camera app (not inside the scanner), the QR contains a GS1 Digital Link URL like `https://id.galileoprotocol.io/01/00012345678905/21/SERIAL-001`. This needs to open the scanner app and show the verification result.

Three things to implement:

1. **Add a catch-all route for GS1 Digital Link paths** -- create `apps/scanner/src/app/01/[gtin]/21/[serial]/page.tsx` that extracts GTIN/serial from the URL path and renders the verification result directly (reusing the same resolver logic from the home page).

   ```typescript
   // apps/scanner/src/app/01/[gtin]/21/[serial]/page.tsx
   import { redirect } from "next/navigation";

   export default async function DeepLinkPage({
     params,
   }: {
     params: Promise<{ gtin: string; serial: string }>;
   }) {
     const { gtin, serial } = await params;
     // Redirect to home with link param -- reuses all existing resolution + display logic
     redirect(`/?link=${encodeURIComponent(`/01/${gtin}/21/${serial}`)}`);
   }
   ```

2. **Update PWA manifest** -- add `start_url` that preserves query params, ensure `scope` allows the `/01/` path:
   ```json
   {
     "start_url": "/",
     "scope": "/",
     "url_handlers": [{ "origin": "https://scanner.galileoprotocol.io" }]
   }
   ```

3. **Service worker** -- update `sw.js` to handle `/01/` paths as navigation requests (not cache-first):
   ```javascript
   // In sw.js fetch handler, skip caching for /01/ paths (always network-first for fresh verification)
   if (url.pathname.startsWith('/01/')) {
     return; // Let the browser handle it (network request to Next.js)
   }
   ```

**Patterns to follow**:
- Next.js App Router dynamic segments: `[gtin]` and `[serial]` as folder names
- Redirect pattern: `redirect()` from `next/navigation` for server-side redirect
- Service worker: network-first for dynamic content, cache-first for static assets (already the pattern in sw.js)

**Edge cases**:
- URL-encoded serial numbers (e.g., `SERIAL%20001`) -- `decodeURIComponent` in the redirect handles this
- Invalid GTIN in deep link -- the home page resolver will show the "Invalid GTIN" error (handled by existing validation)
- `/01/` path must not be cached by the service worker -- stale cache would show old verification results
- Deep link from external camera app: depends on the QR URL domain matching the scanner's deployed domain. For local dev, deep links only work via `/?link=` param.

**Verify**: Navigate to `/01/0012345678905/21/SERIAL-001` in the scanner -- redirects to home page with verification result. QR scan still works (redirect to `/?link=...`). Service worker does not cache `/01/` paths.

---

### Brief #3: Health Check with Dependency Status

**Type**: improvement
**Priority**: P2
**Epic**: EPIC-007-observability-quality

**Files to modify**:
- `apps/api/src/routes/health.ts` -- extend handler to check DB + chain status
- `apps/api/test/health.test.ts` -- add tests for dependency status

**Approach**:

Extend the existing `GET /health` endpoint to report dependency status. The current endpoint returns `{ status, version, uptime }`. Add `dependencies` with DB and chain RPC status.

1. **Database check** -- use `fastify.prisma.$queryRaw` to execute a lightweight query:
   ```typescript
   let dbStatus: "ok" | "error" = "error";
   try {
     await fastify.prisma.$queryRawUnsafe("SELECT 1");
     dbStatus = "ok";
   } catch {
     dbStatus = "error";
   }
   ```

2. **Chain RPC check** -- use `fastify.chain.chainEnabled` flag:
   ```typescript
   let chainStatus: "ok" | "disabled" | "error" = "disabled";
   if (fastify.chain.chainEnabled) {
     try {
       await fastify.chain.publicClient.getChainId();
       chainStatus = "ok";
     } catch {
       chainStatus = "error";
     }
   }
   ```

3. **Response format**:
   ```typescript
   {
     status: dbStatus === "ok" ? "ok" : "degraded",
     version: pkg.version,
     uptime: process.uptime(),
     dependencies: {
       database: dbStatus,
       chain: chainStatus,
     }
   }
   ```

4. **HTTP status code**: Return `200` when `status === "ok"`, `503` when `status === "degraded"`. Load balancers and monitoring tools use the HTTP status to determine if the service is healthy.

5. **Update route schema** to reflect new response shape:
   ```typescript
   response: {
     200: {
       type: "object",
       properties: {
         status: { type: "string", enum: ["ok"] },
         version: { type: "string" },
         uptime: { type: "number" },
         dependencies: {
           type: "object",
           properties: {
             database: { type: "string", enum: ["ok", "error"] },
             chain: { type: "string", enum: ["ok", "disabled", "error"] },
           },
         },
       },
     },
     503: {
       type: "object",
       properties: {
         status: { type: "string", enum: ["degraded"] },
         version: { type: "string" },
         uptime: { type: "number" },
         dependencies: {
           type: "object",
           properties: {
             database: { type: "string", enum: ["ok", "error"] },
             chain: { type: "string", enum: ["ok", "disabled", "error"] },
           },
         },
       },
     },
   }
   ```

**Important**: The current health.test.ts creates a standalone Fastify instance without plugins (no prisma, no chain). The new health route needs `fastify.prisma` and `fastify.chain` decorators. Two options:
- (a) Use `buildApp()` from server.ts in the test (requires test DB)
- (b) Keep the lightweight test but mock the decorators

**Recommended: (b)** -- mock the decorators. This keeps the health test fast and independent of the DB:
```typescript
beforeAll(async () => {
  app = Fastify();
  // Mock prisma decorator
  app.decorate("prisma", {
    $queryRawUnsafe: async () => [{ "?column?": 1 }],
  });
  // Mock chain decorator
  app.decorate("chain", { chainEnabled: false });
  await app.register(healthRoutes);
  await app.ready();
});
```

**Patterns to follow**:
- Health endpoint remains public (no auth required)
- Response format consistent with existing `{ success, data }` or stay with current flat format (current flat format is fine for health -- keep it flat)
- Error handling: never throw from health check -- always return a response with status info

**Edge cases**:
- DB connection pool exhausted -- `$queryRawUnsafe("SELECT 1")` should time out, not hang. Add a timeout wrapper if needed (stretch goal).
- Chain disabled (no DEPLOYER_PRIVATE_KEY) -- report `"disabled"`, not `"error"`. This is the expected state until RPC key is provided.
- Health check should NOT be rate-limited (it already isn't because it's GET and rate-limit targets all routes equally, but load balancers may hit it frequently). If rate limiting becomes an issue, exempt `/health` in the rate-limit plugin.

**Verify**: GET /health returns `{ status: "ok", version, uptime, dependencies: { database: "ok", chain: "disabled" } }` with 200. When DB is down, returns 503 with `status: "degraded"`. Existing health tests still pass.

---

### Brief #4: Structured Logging (No PII)

**Type**: improvement
**Priority**: P2
**Epic**: EPIC-007-observability-quality

**Files to modify**:
- `apps/api/src/server.ts` -- configure Pino logger options (serializers, redaction, request ID)
- `apps/api/src/config.ts` -- add optional `LOG_LEVEL` env var
- `apps/api/test/health.test.ts` -- may need `logger: false` on test Fastify instance (already the case)

**Approach**:

Fastify already uses Pino as its built-in logger (`Fastify({ logger: true })`). The task is to configure Pino properly for production: JSON format (default), correlation IDs (Fastify adds `reqId` automatically), and PII redaction.

1. **Logger configuration** in `server.ts`:
   ```typescript
   const fastify = Fastify({
     logger: config.NODE_ENV !== "test" ? {
       level: config.LOG_LEVEL ?? "info",
       // Pino serializers control what gets logged for req/res
       serializers: {
         req(request) {
           return {
             method: request.method,
             url: request.url,
             hostname: request.hostname,
             remoteAddress: request.ip,
             // Exclude headers that may contain auth tokens
           };
         },
         res(reply) {
           return {
             statusCode: reply.statusCode,
           };
         },
       },
       // Redact paths that could contain PII
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
     } : false,
     // Generate unique request IDs for correlation
     genReqId: (req) => {
       return req.headers["x-request-id"] as string ?? crypto.randomUUID();
     },
   });
   ```

2. **Add `LOG_LEVEL` to config.ts**:
   ```typescript
   LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
   ```

3. **PII redaction strategy**:
   - `req.headers.authorization` -- may contain Bearer token
   - `req.headers.cookie` -- contains auth cookies
   - `req.body.password` -- plaintext password in login/register
   - `req.body.email` -- PII in login/register
   - Pino's `redact` option replaces these paths with `[REDACTED]` in all log output
   - This is more reliable than manual filtering -- works on ALL log calls automatically

4. **Request ID correlation**:
   - Fastify already adds `reqId` to every log line within a request context
   - Configure `genReqId` to use the incoming `x-request-id` header if present (supports distributed tracing) or generate a UUID
   - Import `crypto` from Node.js built-in (available since Node 19+)

5. **No new dependencies** -- Pino is built into Fastify. `crypto.randomUUID()` is a Node.js built-in.

**Patterns to follow**:
- Logger disabled in test env (`logger: false`) -- already the case, keep it
- Config pattern: optional env var with `.optional()`
- Pino redaction is path-based -- uses dot notation for nested fields
- `genReqId` is a Fastify built-in option -- no plugin needed

**Edge cases**:
- `req.body` may not exist for GET requests -- Pino's redact handles missing paths gracefully (no error)
- `x-request-id` header from client could be spoofed -- acceptable for logging (not security-critical). The ID is for log correlation only.
- Pino serializers receive the raw Fastify request/reply objects -- the serializer functions must be careful not to access properties that trigger side effects
- In production, Pino outputs JSON by default (no config needed). In development with `logger: true`, it also outputs JSON. If human-readable logs are desired in dev, add `pino-pretty` as a dev dependency and use `transport: { target: "pino-pretty" }` -- but this is optional and can be deferred.

**Verify**: Start API server, make requests. Log output is JSON with `reqId` field. `password` and `email` fields are redacted in log output. `req.headers.cookie` is redacted. No PII visible in any log line. All existing tests still pass.

## Notes

<!-- Developer and Tester add notes here during the sprint -->

# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #3 -- Data Compliance & Production API Polish

**Goal**: Make the API production-ready by enabling Swagger docs in all environments and implementing GDPR Art. 15 (data export) and Art. 17 (erasure) endpoints -- closing critical compliance gaps before deployment.
**Started**: 2026-03-09
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| 1 | Publish Swagger at /docs in production | EPIC-008 | validated | /docs accessible when ENABLE_SWAGGER=true in production | 1ddbea6 |
| 2 | GDPR data export (GET /auth/me/data) | EPIC-006 | validated | Authenticated user gets full JSON export of all their data | 8532fc3 |
| 3 | GDPR erasure (DELETE /auth/me/data) | EPIC-006 | validated | User data deleted from PostgreSQL, events anonymized, cookies cleared | 22eb6c4 |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [x] All tasks validated or explicitly deferred
- [x] All tests pass (198 API tests across 14 files, 69 shared tests, 0 failures)
- [x] No P0 bugs introduced
- [x] CONTEXT.md updated if architecture changed

## Task Briefs

### Brief #1: Publish Swagger at /docs in Production

**Type**: improvement
**Priority**: P2
**Epic**: EPIC-008-production-deploy

**Files to modify**:
- `apps/api/src/config.ts` -- add `ENABLE_SWAGGER` env var
- `apps/api/src/server.ts` -- replace `NODE_ENV !== "production"` guard with `ENABLE_SWAGGER` check

**Approach**:

Currently, Swagger UI is guarded by `config.NODE_ENV !== "production"` in `server.ts` (line 64). This prevents API documentation from being available in production. For a B2B API, having `/docs` accessible in production is important for brand integrators.

Instead of simply removing the guard (which would always enable Swagger), add a configurable `ENABLE_SWAGGER` env var that defaults to `true` in development/test and can be explicitly set in production.

1. **Add `ENABLE_SWAGGER` to config.ts**:
   ```typescript
   ENABLE_SWAGGER: z
     .enum(["true", "false"])
     .default("true")
     .transform((v) => v === "true"),
   ```

2. **Update the guard in server.ts** (line 64):
   ```typescript
   // Before:
   if (config.NODE_ENV !== "production") {
   // After:
   if (config.ENABLE_SWAGGER) {
   ```

3. No changes to the Swagger config content itself. The existing server URL (`http://localhost:{PORT}`) is fine -- browsers auto-detect the actual server. A future task can add a configurable `API_BASE_URL` if needed.

**Tests**: No new test file needed. This is a config change. Verify with `pnpm turbo typecheck`. The existing test suite does not exercise Swagger registration (test env has `logger: false` and Swagger was already registering in non-test envs).

**Patterns to follow**:
- Config pattern: Zod schema in config.ts with `.default()` for optional vars (R12)
- Boolean env vars: parse as `z.enum(["true", "false"]).transform()` since env vars are always strings

**Edge cases**:
- `ENABLE_SWAGGER` not set: defaults to `"true"` -> Swagger enabled. This is the desired behavior for dev/test, and production deployments must explicitly set env vars anyway.
- `ENABLE_SWAGGER=false` in production: Swagger disabled, `/docs` returns 404. Useful for internal-only deployments.
- Swagger in production exposes API structure: acceptable for a B2B API. The endpoints are protected by auth/RBAC regardless.

**Verify**: Set `ENABLE_SWAGGER=true` in env. Start server. Navigate to `/docs`. Swagger UI loads with all API routes. Set `ENABLE_SWAGGER=false` -- `/docs` returns 404. All existing tests pass.

---

### Brief #2: GDPR Data Export (GET /auth/me/data)

**Type**: feature
**Priority**: P2
**Epic**: EPIC-006-data-compliance

**Files to modify**:
- `apps/api/src/routes/auth/data-export.ts` -- NEW: GET /auth/me/data route
- `apps/api/src/routes/auth/index.ts` -- register the new route
- `apps/api/test/gdpr.test.ts` -- NEW: tests for data export (and erasure in task 3)

**Approach**:

GDPR Art. 15 gives users the right to access all their personal data. This endpoint returns a JSON package containing everything the system knows about the authenticated user, excluding sensitive internal fields (passwordHash, refreshToken).

1. **Create `data-export.ts`** route:

   ```typescript
   import type { FastifyInstance } from "fastify";

   export default async function dataExportRoute(fastify: FastifyInstance) {
     fastify.get(
       "/auth/me/data",
       {
         onRequest: [fastify.authenticate],
         schema: {
           description:
             "Export all personal data for the authenticated user (GDPR Art. 15). " +
             "Returns user profile, brand association, products, and events performed.",
           tags: ["Auth", "GDPR"],
           security: [{ cookieAuth: [] }],
         },
       },
       async (request, reply) => {
         const { sub } = request.user;

         const user = await fastify.prisma.user.findUnique({
           where: { id: sub },
           include: { brand: true },
         });

         if (!user) {
           return reply.status(404).send({
             success: false,
             error: { code: "NOT_FOUND", message: "User not found" },
           });
         }

         // Products owned by user's brand (if any)
         let products: unknown[] = [];
         if (user.brandId) {
           products = await fastify.prisma.product.findMany({
             where: { brandId: user.brandId },
             include: { passport: true },
           });
         }

         // Events performed by this user
         const events = await fastify.prisma.productEvent.findMany({
           where: { performedBy: sub },
           orderBy: { createdAt: "desc" },
           take: 1000,
         });

         // Build export -- explicitly exclude passwordHash and refreshToken
         const exportData = {
           exportedAt: new Date().toISOString(),
           user: {
             id: user.id,
             email: user.email,
             role: user.role,
             walletAddress: user.walletAddress,
             createdAt: user.createdAt,
             updatedAt: user.updatedAt,
           },
           brand: user.brand
             ? {
                 id: user.brand.id,
                 name: user.brand.name,
                 slug: user.brand.slug,
                 did: user.brand.did,
                 createdAt: user.brand.createdAt,
               }
             : null,
           products,
           events,
         };

         return reply.status(200).send({
           success: true,
           data: exportData,
         });
       },
     );
   }
   ```

2. **Register in `auth/index.ts`**:
   ```typescript
   import dataExportRoute from "./data-export.js";
   // ...in the function body:
   await fastify.register(dataExportRoute);
   ```

3. **Tests** in `gdpr.test.ts` (~7 tests):
   - Authenticated user gets 200 with export data containing user, brand, products, events
   - Export includes user profile WITHOUT passwordHash or refreshToken
   - Export includes brand data when user has brand
   - Export includes products when user's brand has products
   - Export includes events performed by user
   - User without brand: `brand: null`, `products: []`
   - Unauthenticated request returns 401

**Patterns to follow**:
- Auth route pattern: `onRequest: [fastify.authenticate]` (same as me.ts, logout.ts)
- Response format: `{ success: true, data: { ... } }` (standard API pattern)
- No body/response JSON schema in route config (R01)
- Use `buildApp()` in tests, `cleanDb()` + re-seed in `beforeEach` (R03, R16)
- GET request -- no CSRF header needed (CSRF only on POST/PATCH/DELETE/PUT)

**Edge cases**:
- User with no brand: `brand: null`, `products: []` -- still valid export
- User with brand but no products: `products: []`
- Large number of events: limit to 1000 most recent to prevent memory issues
- `passwordHash` and `refreshToken` must NEVER appear in export -- use explicit field selection (not `select: { passwordHash: false }` which is fragile if new fields are added)
- Products include passport data (metadata, digitalLink) -- this is the user's own brand data

**Verify**: Register user with brand, create products, perform events (mint, verify). GET /auth/me/data returns complete JSON with user, brand, products, events. passwordHash is absent from response. Unauthenticated request returns 401.

---

### Brief #3: GDPR Erasure (DELETE /auth/me/data)

**Type**: feature
**Priority**: P2
**Epic**: EPIC-006-data-compliance

**Files to modify**:
- `apps/api/src/routes/auth/data-erasure.ts` -- NEW: DELETE /auth/me/data route
- `apps/api/src/routes/auth/index.ts` -- register the new route (add alongside task 2 import)
- `apps/api/test/gdpr.test.ts` -- add erasure tests (same file as task 2)

**Approach**:

GDPR Art. 17 gives users the right to erasure ("right to be forgotten"). This endpoint deletes the authenticated user's personal data from PostgreSQL and clears their auth cookies.

**Key design decisions**:
- **Products and images are NOT deleted** -- they belong to the brand (business data), not the individual user. If a brand admin leaves, their products remain under the brand.
- **Events are anonymized** -- `performedBy` is set to `null` (this field is already nullable, see R08). The event itself stays for audit/provenance purposes.
- **User record is deleted** -- email, passwordHash, refreshToken, walletAddress are all purged.
- **Auth cookies are cleared** -- the user is logged out after deletion.

1. **Create `data-erasure.ts`** route:

   ```typescript
   import type { FastifyInstance } from "fastify";
   import { clearAuthCookies } from "../../utils/cookies.js";
   import { requireCsrfHeader } from "../../middleware/csrf.js";

   export default async function dataErasureRoute(fastify: FastifyInstance) {
     fastify.delete(
       "/auth/me/data",
       {
         onRequest: [requireCsrfHeader, fastify.authenticate],
         schema: {
           description:
             "Delete all personal data for the authenticated user (GDPR Art. 17). " +
             "Anonymizes event references, removes user record, and clears auth cookies. " +
             "Products and images belong to the brand and are NOT deleted.",
           tags: ["Auth", "GDPR"],
           security: [{ cookieAuth: [] }],
         },
       },
       async (request, reply) => {
         const { sub } = request.user;

         const user = await fastify.prisma.user.findUnique({
           where: { id: sub },
         });

         if (!user) {
           return reply.status(404).send({
             success: false,
             error: { code: "NOT_FOUND", message: "User not found" },
           });
         }

         await fastify.prisma.$transaction(
           async (tx: import("../../plugins/prisma.js").TxClient) => {
             // 1. Anonymize events performed by this user (set performedBy to null)
             await tx.productEvent.updateMany({
               where: { performedBy: sub },
               data: { performedBy: null },
             });

             // 2. Delete the user record (cascades are handled by Prisma)
             await tx.user.delete({
               where: { id: sub },
             });
           },
         );

         // 3. Clear auth cookies
         clearAuthCookies(reply);

         return reply.status(200).send({
           success: true,
           data: {
             message: "All personal data has been deleted",
             deletedAt: new Date().toISOString(),
           },
         });
       },
     );
   }
   ```

2. **Register in `auth/index.ts`**:
   ```typescript
   import dataErasureRoute from "./data-erasure.js";
   // ...in the function body:
   await fastify.register(dataErasureRoute);
   ```

3. **Tests** in `gdpr.test.ts` (~7 tests):
   - Authenticated user DELETE /auth/me/data returns 200 with success message
   - User record is gone from database after erasure (findUnique returns null)
   - Events previously performed by user now have `performedBy: null`
   - Products belonging to the user's brand still exist (not deleted)
   - Auth cookies are cleared in response (Set-Cookie headers with maxAge=0 or empty)
   - Unauthenticated request returns 401
   - Request without `X-Galileo-Client` header returns 403 CSRF_REQUIRED

**Patterns to follow**:
- Mutating route: `onRequest: [requireCsrfHeader, fastify.authenticate]` (same as logout.ts)
- Transaction: `$transaction(async (tx) => { ... })` with TxClient type
- Cookie clearing: `clearAuthCookies(reply)` from utils/cookies.ts
- No body/response JSON schema (R01)
- ProductEvent.performedBy is nullable (R08) -- setting to null is safe

**Edge cases**:
- User with no brand: no products involved, just delete user + anonymize events
- User who is sole BRAND_ADMIN: deletion succeeds. Brand becomes orphaned. This is acceptable -- GDPR Art. 17 right takes precedence. An ADMIN can manage orphaned brands.
- Concurrent requests: user deletes their account while another request is in-flight. The in-flight request will fail with 401 on next `authenticate` call (user not found). Acceptable behavior.
- FK constraint on ProductEvent.performedBy: setting to null first, then deleting user avoids FK violations. The `updateMany` runs before `delete` in the same transaction.
- User without any events: `updateMany` with 0 matches is a no-op -- no error.

**Verify**: Register user, create products with brand, perform events (mint, verify). DELETE /auth/me/data with X-Galileo-Client header. Verify: user record gone from DB, events have performedBy=null, products still exist under brand, cookies cleared. Follow-up GET /auth/me returns 401.

## Notes

<!-- Developer and Tester add notes here during the sprint -->

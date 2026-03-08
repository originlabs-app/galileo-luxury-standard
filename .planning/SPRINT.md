# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #1 -- Hardening & Quality

**Goal**: Fix flaky tests, harden security (OWASP + cookies), and add file upload -- unblocking quality and features without waiting on blockchain RPC key.
**Started**: 2026-03-08
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| 1 | Fix flaky test suites | EPIC-007 | done | `pnpm --filter api test` passes 3x consecutively | 3ac8bf6 |
| 2 | OWASP input validation audit | EPIC-005 | done | All routes reviewed, prototype pollution blocked | 75d4038 |
| 3 | Cookie hardening | EPIC-005 | done | `__Host-` prefix in prod, cookie signing, dev warning | 61ebf4e |
| 4 | File upload (R2 + CID) | EPIC-006 | done | Photo upload in dashboard, CID computed, R2 storage | 9600650 |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated or explicitly deferred
- [ ] All tests pass (including previously flaky ones)
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### Brief #1: Fix Flaky Test Suites

**Type**: testing
**Priority**: P0
**Epic**: EPIC-007-observability-quality

**Files to modify**:
- `apps/api/vitest.config.ts` -- add hookTimeout, testTimeout
- `apps/api/test/mint.test.ts` -- optimize beforeEach cleanup
- `apps/api/test/products.test.ts` -- optimize beforeEach cleanup
- `apps/api/test/recall.test.ts` -- optimize beforeEach cleanup
- `apps/api/test/helpers.ts` -- add shared cleanup helper

**Approach**:

The root cause is `beforeEach` hooks timing out (default 10s) because `deleteMany` cascades on shared PostgreSQL cause lock contention. `fileParallelism: false` is already set, so tests run sequentially by file -- but individual test setups still do heavy cleanup (register 4-5 users via HTTP per test).

Recommended fix (two-pronged):

1. **Increase timeouts** in vitest.config.ts as immediate mitigation:
   ```typescript
   test: {
     hookTimeout: 30_000,  // 30s for beforeEach/afterAll hooks
     testTimeout: 30_000,  // 30s per test
   }
   ```

2. **Optimize cleanup** -- replace cascading `deleteMany` chain with a single raw SQL `TRUNCATE ... CASCADE` in a shared helper:
   ```typescript
   // test/helpers.ts
   export async function cleanDb(prisma: PrismaClient) {
     await prisma.$executeRawUnsafe(
       `TRUNCATE TABLE "ProductEvent", "ProductPassport", "Product", "User", "Brand" CASCADE`
     );
   }
   ```
   This avoids the Prisma ORM overhead of 5 sequential deleteMany calls and releases locks faster.

3. **Reuse app instance** -- each test file already uses `beforeAll` to build the app once. Ensure no test file rebuilds the app in `beforeEach`.

**Patterns to follow**:
- `global-setup.ts` already uses raw SQL TRUNCATE in teardown -- same pattern
- Rate limiting and helmet are already disabled in test env
- Keep `fileParallelism: false` -- do NOT enable parallel files

**Edge cases**:
- TRUNCATE CASCADE might fail if a test leaves an open transaction -- ensure no hanging transactions
- hookTimeout increase is a safety net, not a fix -- the TRUNCATE optimization should bring cleanup under 1s

**Verify**: Run `pnpm --filter api test` three consecutive times. Zero timeouts. All 155+ tests pass each time.

---

### Brief #2: OWASP Input Validation Audit

**Type**: security
**Priority**: P1
**Epic**: EPIC-005-security-hardening

**Files to modify**:
- `apps/api/src/routes/products/create.ts` -- add prototype pollution guard
- `apps/api/src/routes/products/update.ts` -- verify `.strict()` blocks extra fields
- `apps/api/src/routes/auth/register.ts` -- verify email normalization
- `apps/api/src/routes/auth/login.ts` -- verify no injection vectors
- `apps/api/src/routes/auth/link-wallet.ts` -- verify address validation
- `apps/api/src/routes/products/transfer.ts` -- verify wallet address validation
- `apps/api/src/routes/products/verify.ts` -- verify public endpoint safety
- `apps/api/src/routes/products/recall.ts` -- verify reason string sanitization
- `apps/api/src/routes/resolver/resolve.ts` -- verify GTIN/serial params sanitized
- `apps/api/test/security-hardening.test.ts` -- add new OWASP test cases

**Approach**:

Audit each route against OWASP Top 10 (2021):

1. **A01 Broken Access Control** -- already covered by RBAC middleware + brandId scoping. Verify no bypass paths.
2. **A02 Cryptographic Failures** -- JWT secrets validated (min 32 chars), bcrypt for passwords. Check: refresh token rotation is atomic.
3. **A03 Injection** -- Prisma parameterizes queries. Check: no raw SQL with user input. Check: `$executeRawUnsafe` not used with user input.
4. **A04 Insecure Design** -- verify rate limits on auth endpoints (already 5/min).
5. **A05 Security Misconfiguration** -- Swagger guarded in prod. Check: error responses don't leak stack traces.
6. **A06 Vulnerable Components** -- run `pnpm audit`. Document findings.
7. **A07 Auth Failures** -- timing-safe login (dummy hash). Check: no user enumeration via register.
8. **A08 Data Integrity** -- CID ensures tamper-evidence. Check: no deserialization of untrusted data.
9. **A09 Logging Failures** -- check that security events are logged.
10. **A10 SSRF** -- check: no user-controlled URLs fetched server-side.

Key actions:
- Add `.strict()` to `createProductBody` schema (update.ts already has it, create.ts doesn't)
- Ensure `recall.ts` reason field is bounded (check max length)
- Ensure resolver params are validated (GTIN format, serial format)
- Add prototype pollution tests: `POST /products` with `{"__proto__": {"admin": true}}`
- Verify Zod strips `__proto__` and `constructor` keys

**Patterns to follow**:
- Use Zod `.strict()` on all body schemas to reject unexpected fields
- Use existing `errorResponseSchema` for consistent error format
- Test security assertions in `security-hardening.test.ts`

**Edge cases**:
- Zod v4 `.strict()` behavior may differ from v3 -- verify it rejects `__proto__`
- Prototype pollution via JSON.parse is mitigated by Fastify's content-type parser -- verify no custom parsers bypass this

**Verify**: All existing tests still pass. New security tests in `security-hardening.test.ts` cover: prototype pollution rejection, `.strict()` rejects unknown fields, bounded string lengths, GTIN format validation on resolver params.

---

### Brief #3: Cookie Hardening

**Type**: security
**Priority**: P1
**Epic**: EPIC-005-security-hardening

**Files to modify**:
- `apps/api/src/utils/cookies.ts` -- add `__Host-` prefix, dev warning
- `apps/api/src/plugins/cookie.ts` -- add cookie signing secret
- `apps/api/src/config.ts` -- add `COOKIE_SECRET` env var (optional in dev/test)
- `apps/api/src/plugins/auth.ts` -- update cookie name references
- `apps/api/test/helpers.ts` -- update cookie name in parseCookies usage
- `apps/api/test/*.test.ts` -- update `galileo_at` references to `__Host-galileo_at` (production) or keep `galileo_at` (test env)

**Approach**:

1. **`__Host-` prefix** (production only):
   - `__Host-` cookies require `Secure`, `Path=/`, and no `Domain` -- prevents cookie tossing attacks
   - In production: `__Host-galileo_at`, `__Host-galileo_rt`
   - In dev/test: keep `galileo_at`, `galileo_rt` (because `__Host-` requires HTTPS)
   - Update `cookies.ts` to conditionally apply the prefix based on `config.NODE_ENV`

2. **Cookie signing**:
   - Add `COOKIE_SECRET` to config.ts env schema (optional in dev/test, required in production)
   - Pass secret to `@fastify/cookie` registration in `cookie.ts`
   - Fastify will automatically sign/unsign cookies

3. **Dev-mode warning**:
   - In `cookies.ts`, if `!isProduction`, log once: `"WARNING: Cookies are not secure (HTTP only). Set NODE_ENV=production for secure cookies."`

**Patterns to follow**:
- Cookie options pattern already in `cookies.ts` -- extend, don't restructure
- Config validation pattern in `config.ts` -- add new env var with `.optional()` and production guard
- Rate limiting and helmet already follow the "disabled in test" pattern

**Edge cases**:
- Tests use `galileo_at` as cookie name in `parseCookies` -- since tests run with `NODE_ENV=test`, the prefix won't be applied, so tests should not break
- `__Host-` prefix on refresh cookie: `__Host-` requires `Path=/`, but refresh cookie has `Path=/auth/refresh` -- this is incompatible. Options: (a) use `__Host-` only for access cookie, (b) change refresh cookie to `Path=/` with route-level check, (c) use `__Secure-` prefix for refresh cookie instead. **Recommended: (c)** -- `__Secure-` only requires `Secure` flag, no `Path=/` constraint.
- Cookie signing changes the cookie value format -- existing sessions will be invalidated on deploy (acceptable for a security upgrade)

**Verify**: In test env, cookies still work as before. In production config, access cookie uses `__Host-galileo_at`, refresh cookie uses `__Secure-galileo_rt`. Cookie secret is configured. Dev mode logs insecure cookie warning once.

---

### Brief #4: File Upload (R2 + CID)

**Type**: feature
**Priority**: P1
**Epic**: EPIC-006-data-compliance

**Files to modify**:
- Create: `apps/api/src/plugins/storage.ts` -- R2/S3 client plugin
- Create: `apps/api/src/utils/cid.ts` -- CIDv1 computation
- Create: `apps/api/src/routes/products/upload.ts` -- upload endpoint
- Modify: `apps/api/src/routes/products/index.ts` -- register upload route
- Modify: `apps/api/src/server.ts` -- register storage plugin
- Modify: `apps/api/src/config.ts` -- add R2 env vars
- Modify: `apps/api/prisma/schema.prisma` -- add `imageUrl`/`imageCid` fields to Product
- Create: `apps/api/test/upload.test.ts` -- upload tests
- Modify: `apps/dashboard/src/app/dashboard/products/new/page.tsx` -- add photo upload
- Modify: `apps/dashboard/src/app/dashboard/products/[id]/page.tsx` -- show photo + upload in edit

**Approach**:

1. **Storage plugin** (`storage.ts`):
   - Use `@aws-sdk/client-s3` (R2 is S3-compatible)
   - Create a Fastify plugin that decorates `fastify.storage` with `upload(key, buffer, contentType)` and `delete(key)` methods
   - In test/dev without R2 credentials: use local filesystem fallback (`uploads/` directory)
   - Env vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (all optional -- fallback to local)

2. **CID computation** (`cid.ts`):
   - Compute CIDv1 using `multiformats` npm package (official IPFS CID library)
   - `sha256` hash of the file buffer -> CIDv1 with `raw` codec
   - Pure function, no network: `computeCid(buffer: Buffer): string`

3. **Upload endpoint** (`upload.ts`):
   - `POST /products/:id/upload` -- multipart form with `file` field
   - Use `@fastify/multipart` for multipart parsing
   - Validate: file size (max 5MB), content type (image/jpeg, image/png, image/webp)
   - Flow: parse file -> compute CID -> upload to R2 (key: `products/{productId}/{cid}.{ext}`) -> update Product with imageUrl + imageCid
   - Auth: BRAND_ADMIN, OPERATOR, ADMIN (same as product CRUD)
   - Only DRAFT products can have images added

4. **Schema migration**:
   - Add `imageUrl String?` and `imageCid String?` to Product model
   - Run `pnpm prisma generate` after schema change

5. **Dashboard UI**:
   - Add file input to product create/edit forms
   - Show uploaded image in product detail page
   - Use fetch with FormData for multipart upload

**Patterns to follow**:
- Plugin pattern: same structure as `prisma.ts`, `chain.ts` (fp plugin with decorator)
- Route pattern: same structure as `create.ts` (Zod validation, RBAC, error handling)
- Prisma migration: remember to regenerate client (`pnpm prisma generate`)
- Config pattern: optional env vars with `.optional()` and runtime fallback

**Edge cases**:
- 🔒 R2 credentials are sensitive -- never commit, validate in config.ts
- Large files: enforce 5MB limit in multipart config, not just validation
- Multiple uploads: overwrite previous image (single image per product for MVP)
- CID determinism: same file -> same CID (important for tamper-evidence)
- Content-type spoofing: validate actual file magic bytes, not just Content-Type header (stretch goal -- acceptable to skip for MVP)

**Verify**: Create product -> upload photo -> photo visible in product detail. CID stored in database. File in R2 (or local uploads/ dir in dev). Uploading to non-DRAFT product returns 400. File > 5MB rejected. Non-image files rejected.

## Notes

<!-- Developer and Tester add notes here during the sprint -->

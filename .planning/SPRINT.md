# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #10 — Test Stability & Deployment Readiness

**Goal**: Fix the P0 FK constraint test flakiness (10 failing tests in batch-mint/batch-import), prepare Vercel deployment configs for frontend apps, create an API Dockerfile for containerized deployment, and draft the DPIA document required before mainnet.
**Started**: 2026-03-10
**Status**: active

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T10.1 | Fix FK constraint violations in batch-mint/batch-import tests | EPIC-007 | validated | All 372+ tests pass consistently with zero FK violations. `pnpm test` green on full suite, 3 consecutive runs. | a4f22d0 |
| T10.2 | Vercel deployment config for dashboard + scanner | EPIC-008 | validated | `vercel.json` present for dashboard and scanner. `pnpm turbo build` passes. Vercel CLI `vercel build` (dry-run) succeeds if available. | cddf83a |
| T10.3 | API Dockerfile for containerized deployment | EPIC-008 | validated | `docker build -t galileo-api apps/api` succeeds. Container starts and responds to `/health`. Image size < 500MB. | d239545 |
| T10.4 | DPIA scaffold document | EPIC-006 | validated | DPIA document exists at `specifications/dpia/galileo-dpia.md` with all required EDPB sections. Content is accurate for current architecture. | 602b60f |

### Status values
- `todo` — Not started
- `in_progress` — Developer is working on it
- `done` — Developer committed, awaiting validation
- `validated` — Tester confirmed it meets verification criteria
- `blocked` — Cannot proceed, reason in Notes
- `deferred` — Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated, explicitly deferred, or blocked with reason
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### T10.1 — Fix FK Constraint Violations in Batch Tests

**Type**: testing
**Priority**: P0
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Files to modify**:
- `apps/api/test/batch-mint.test.ts` — fix `beforeEach` user seeding pattern
- `apps/api/test/batch-import.test.ts` — fix `beforeEach` user seeding pattern

**Root cause analysis**:

Both `batch-mint.test.ts` and `batch-import.test.ts` register users WITH `brandName` in `beforeEach`:
```typescript
await app.inject({
  method: "POST",
  url: "/auth/register",
  payload: { email: "ba@test.com", password: "Password123!", brandName: "BA Brand" },
});
```

When `brandName` is provided, `/auth/register` creates a NEW brand ("BA Brand") + user in a Prisma transaction. Then the test reassigns `brandId` to the manually-created `testBrandId`. This creates phantom brands ("BA Brand", "Admin Brand", "Other BA") that are never cleaned up within the test, and the `user.update({ brandId })` races with the `cleanDb()` TRUNCATE from the next beforeEach.

The working test files (e.g., `products.test.ts`, `auth.test.ts`) register WITHOUT `brandName`, which creates a VIEWER user with no brand. Then they update role + brandId explicitly. This is the stable pattern.

**Approach**:

Align batch test files with the stable pattern used in `products.test.ts`:

1. Register WITHOUT `brandName` — creates VIEWER user, no phantom brand
2. Update user role + brandId explicitly
3. Re-login to get updated JWT token

**Before** (flaky):
```typescript
// Creates phantom brand "BA Brand" + user linked to it
await app.inject({
  method: "POST",
  url: "/auth/register",
  payload: { email: "ba@test.com", password: "Password123!", brandName: "BA Brand" },
});
const baUser = await app.prisma.user.findUnique({ where: { email: "ba@test.com" } });
await app.prisma.user.update({
  where: { id: baUser!.id },
  data: { brandId: testBrandId, role: "BRAND_ADMIN" },
});
```

**After** (stable):
```typescript
// Creates VIEWER user, no phantom brand
await app.inject({
  method: "POST",
  url: "/auth/register",
  payload: { email: "ba@test.com", password: "Password123!" },
});
await app.prisma.user.update({
  where: { email: "ba@test.com" },
  data: { brandId: testBrandId, role: "BRAND_ADMIN" },
});
```

Apply this change to ALL user registrations in both test files:
- `batch-mint.test.ts`: 3 users (ba@test.com, admin@test.com, other-ba@test.com)
- `batch-import.test.ts`: 4 users (ba@test.com, admin@test.com, viewer@test.com, other-ba@test.com)

For `admin@test.com`: register without brandName, then update to ADMIN role. The admin user does NOT need a brandId.

For `viewer@test.com` (batch-import only): register without brandName, then update to VIEWER. Already the default role, so only need to re-login for consistent token.

**Patterns to follow**:
- `products.test.ts` beforeEach pattern (canonical, 27 tests pass reliably)
- R16: cleanDb() + re-seed parent rows in beforeEach
- R06: vi.mock() before imports (already correct in both files)
- Update `where` in user.update to use `email` instead of `id` — avoids the extra `findUnique` call

**Edge cases**:
- Admin user without brand: `admin@test.com` should NOT have a brandId (ADMIN sees all brands). Remove `brandName: "Admin Brand"` from register.
- Token refresh after role update: must re-login after `user.update({ role })` because the JWT is generated at registration time with the old role.
- `otherBrandAdminCookie`: must be linked to `otherBrandId`, not `testBrandId`

**Tests**: No new tests. Fix makes existing 10 tests (7 batch-mint + 3 batch-import) pass reliably.

**Verify**: Run `pnpm test` 3 times consecutively. All runs must be green with 0 FK violations. The batch-mint and batch-import test files should each complete without errors.

---

### T10.2 — Vercel Deployment Config for Dashboard + Scanner

**Type**: infrastructure
**Priority**: P2
**Epic**: EPIC-008-production-deploy
**Operator approval**: not required

**Files to create**:
- `apps/dashboard/vercel.json` — Vercel project config for dashboard
- `apps/scanner/vercel.json` — Vercel project config for scanner

**Approach**:

Both dashboard and scanner are Next.js 16 apps in a pnpm monorepo. Vercel natively supports this setup. The key configuration items are:

1. **Root directory**: Vercel needs to know which app directory to build (set in project settings, not vercel.json)
2. **Build command**: `cd ../.. && pnpm turbo build --filter=@galileo/dashboard` (respects workspace deps)
3. **Install command**: `pnpm install` (at monorepo root)
4. **Output directory**: `.next` (default for Next.js)
5. **Security headers**: same pattern as `website/vercel.json`
6. **Environment variables**: `NEXT_PUBLIC_API_URL` for API base URL

**Step 1: Create `apps/dashboard/vercel.json`**

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@galileo/dashboard",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Step 2: Create `apps/scanner/vercel.json`**

Same structure but for scanner. Scanner also needs PWA-related headers:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@galileo/scanner",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(self), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

Note: scanner's `Permissions-Policy` allows `camera=(self)` because the QR scanner needs camera access.

**Step 3: Verify build**

Run `pnpm turbo build` to ensure both apps build successfully. The vercel.json files should not affect local builds.

**Patterns to follow**:
- `website/vercel.json` as reference
- Security headers matching @fastify/helmet config
- No environment variable secrets in vercel.json (use Vercel project settings)

**Edge cases**:
- Monorepo detection: Vercel auto-detects pnpm workspaces. The `buildCommand` with `--filter` ensures only the target app builds.
- `@galileo/shared` workspace dependency: Turbo's `dependsOn: ["^build"]` ensures shared is built first
- PWA service worker caching: `sw.js` must NOT be cached by CDN — use `no-cache` header
- `NEXT_PUBLIC_API_URL`: must be set in Vercel project env vars (not in vercel.json)
- `@vercel/analytics`: already installed, auto-activates on Vercel deployment

**Tests**: No tests needed. Verify `pnpm turbo build` passes.

**Verify**: Both `vercel.json` files present. `pnpm turbo build` succeeds. Security headers configured. PWA service worker headers correct for scanner.

---

### T10.3 — API Dockerfile for Containerized Deployment

**Type**: infrastructure
**Priority**: P2
**Epic**: EPIC-008-production-deploy
**Operator approval**: not required

**Files to create**:
- `apps/api/Dockerfile` — multi-stage build for production API
- `apps/api/.dockerignore` — exclude unnecessary files from build context
- `.dockerignore` (root) — monorepo-level ignore if needed

**Approach**:

Create a multi-stage Dockerfile for the API that:
1. Installs dependencies (pnpm monorepo-aware)
2. Generates Prisma client
3. Compiles TypeScript
4. Produces a minimal production image

The API is a Fastify + Prisma app that runs as `node dist/main.js`. It needs:
- Node.js 22 (LTS)
- Prisma client (generated at build time)
- `bcrypt` native module (must be built for target platform)
- Production dependencies only (no devDependencies)

**Step 1: Create `apps/api/Dockerfile`**

```dockerfile
# Stage 1: Install dependencies
FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Build
FROM node:22-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
WORKDIR /app/packages/shared
RUN pnpm build
WORKDIR /app/apps/api
RUN pnpm prisma generate && pnpm tsc

# Stage 3: Production
FROM node:22-slim AS runner
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/src/generated ./src/generated
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ../packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ../packages/shared/
COPY --from=builder /app/apps/api/package.json ./
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw 1}).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
```

**Step 2: Create `apps/api/.dockerignore`**

```
node_modules
dist
test
*.test.ts
.env*
coverage
```

**Step 3: Verify build**

```bash
docker build -f apps/api/Dockerfile -t galileo-api .
docker run --rm -p 4000:4000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=test-secret-that-is-at-least-32-chars \
  -e JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-chars \
  galileo-api
```

**Patterns to follow**:
- Multi-stage builds for small production images
- `node:22-slim` (not alpine, because bcrypt needs glibc)
- `openssl` for Prisma engine
- HEALTHCHECK directive for container orchestrators
- No secrets in Dockerfile (use env vars at runtime)

**Edge cases**:
- `bcrypt` native module: requires glibc (not musl/alpine). Use `node:22-slim` (Debian-based).
- Prisma engine: requires `openssl` at runtime
- `@galileo/shared` workspace dependency: must be built and available at runtime
- `pnpm-lock.yaml` at monorepo root: Dockerfile context must be the monorepo root, not `apps/api/`
- `.env` files: must NOT be included in the image — use runtime env vars

**Tests**: No automated tests. Manual verification: `docker build` succeeds, container starts, `/health` responds.

**Verify**: `docker build -f apps/api/Dockerfile -t galileo-api .` succeeds. Image size < 500MB. Container starts and `/health` responds 200 (when DATABASE_URL is provided).

---

### T10.4 — DPIA Scaffold Document

**Type**: documentation
**Priority**: P2
**Epic**: EPIC-006-data-compliance
**Operator approval**: not required

**Files to create**:
- `specifications/dpia/galileo-dpia.md` — Data Protection Impact Assessment scaffold

**Approach**:

Create a DPIA document following the EDPB Guidelines 02/2025 structure. This is a scaffold with accurate content based on the current architecture — the operator/DPO will review and finalize before mainnet deployment.

The DPIA must cover:
1. **Description of processing**: what personal data, why, how
2. **Necessity and proportionality**: legal basis, data minimization
3. **Risks to data subjects**: identify and assess risks
4. **Measures to mitigate risks**: technical and organizational measures

**Key data processing activities in Galileo Protocol**:
- User registration: email, passwordHash (bcrypt, never plaintext)
- Wallet linking: walletAddress (pseudonymous on-chain identifier)
- Product events: performedBy (userId, nullable for public verify)
- Audit trail: actor (userId string, no FK — survives user deletion)
- Session: httpOnly cookies (JWT access + refresh tokens)
- Analytics: Vercel Analytics (page views, no PII by default)
- On-chain: zero personal data on-chain (DID, GTIN, serial only)

**Privacy-by-design measures already implemented**:
- GDPR Art. 15 (data export) and Art. 17 (erasure) endpoints
- PII redaction in logs (Pino serializers)
- `__Host-`/`__Secure-` cookie prefixes in production
- CSRF protection via `X-Galileo-Client` header
- Rate limiting on all endpoints
- No personal data on blockchain (privacy-first principle)
- AuditLog actor anonymization on user deletion

**Step 1: Create the DPIA document**

Follow EDPB standard structure:
1. Systematic description of processing
2. Assessment of necessity and proportionality
3. Assessment of risks to rights and freedoms
4. Measures to address risks
5. Involvement of stakeholders
6. Monitoring and review

**Step 2: Populate with current architecture details**

Use CONTEXT.md, schema.prisma, and the privacy measures already implemented. Mark sections that need operator/DPO input with `[TODO: DPO review required]`.

**Patterns to follow**:
- EDPB Guidelines 02/2025 structure
- Reference actual code paths (e.g., "PII redaction in `apps/api/src/main.ts` via Pino serializers")
- Mark uncertain or legal-specific sections for DPO review
- Use plain language (DPIA may be reviewed by non-technical stakeholders)

**Edge cases**:
- Wallet addresses: pseudonymous but potentially linkable to identity (EDPB considers them personal data in some contexts). Document this risk.
- On-chain data immutability: DID and product data on blockchain cannot be deleted. Document that no personal data is stored on-chain.
- Cross-border transfers: Base Sepolia/mainnet nodes are globally distributed. Document adequacy decisions or SCCs if applicable.
- Subprocessors: Vercel (analytics, hosting), PostgreSQL provider, R2/S3 storage. List and assess.

**Tests**: No automated tests. Document review by operator/DPO.

**Verify**: DPIA document exists at `specifications/dpia/galileo-dpia.md`. All EDPB-required sections present. Technical measures accurately reflect current implementation. TODO markers for sections requiring legal review.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. Sprint #10 focuses on test stability and deployment readiness.

🔒 MFA (TOTP + passkey) is NOT included — requires DB migration (unchanged from Sprint #9).

🔒 PostgreSQL RLS is NOT included — requires operator approval (unchanged from Sprint #9).

🔒 Contract deployment to mainnet is NOT included — requires testnet E2E + operator approval.

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

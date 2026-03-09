# Codebase Concerns

## Scope
This document captures current technical debt, fragile areas, security and performance concerns, operational risk, and missing safeguards in the implemented repository. It is based on code currently present in the monorepo, not on roadmap or RFC intent.

## Overall Risk Shape
- The repository has solid breadth of API and contract test coverage, but several production-critical behaviors are still implemented as single-process MVPs.
- The biggest gaps are in backend operational durability and trust guarantees: compliance enforcement, webhook delivery, chain minting, and schema change management.
- Frontend and docs apps are comparatively lighter risk, but the scanner has weak safeguards for production misconfiguration and no automated test coverage.

## High Severity

### 1. Compliance enforcement is mostly nominal outside brand-auth
- Severity: High
- Evidence:
  - `apps/api/src/routes/products/transfer.ts` advertises a 5-module compliance pipeline before transfer.
  - `apps/api/src/services/compliance/jurisdiction.ts` always returns pass.
  - `apps/api/src/services/compliance/cpo.ts` always returns pass.
  - `apps/api/src/services/compliance/service-center.ts` always returns pass.
  - `apps/api/src/services/compliance/sanctions.ts` uses an empty in-memory `Set`.
- Likely impact:
  - Transfers can be marked compliant while jurisdiction, sanctions, CPO, and service-center controls are functionally absent.
  - This is a regulatory and business-integrity risk, not just a TODO.
- Planning note:
  - The only materially active guard in the API path today is brand authorization plus basic address formatting.

### 2. Minting is mock-only, and the API still upgrades products to `ACTIVE`
- Severity: High
- Evidence:
  - `apps/api/src/routes/products/mint.ts` generates synthetic `txHash` and `tokenAddress` when `fastify.chain.chainEnabled` is false.
  - `apps/api/src/routes/products/batch-mint.ts` does the same in batch mode.
  - When chain writes are enabled, both routes return `503 NOT_IMPLEMENTED` instead of performing a real mint.
  - `apps/api/src/plugins/chain.ts` enables write mode only when `DEPLOYER_PRIVATE_KEY` exists.
- Likely impact:
  - Product passports can present blockchain-looking metadata without an actual chain transaction.
  - Environments with write credentials still cannot mint, so real production enablement is blocked.
- Planning note:
  - This is a trust and product-correctness issue, not merely a missing enhancement.

### 3. Webhook system is both ephemeral and over-permissive
- Severity: High
- Evidence:
  - `apps/api/src/services/webhooks/outbox.ts` stores subscriptions and queued deliveries entirely in memory.
  - `apps/api/src/routes/webhooks/index.ts` accepts arbitrary subscriber URLs and returns the signing `secret` on create.
  - `apps/api/src/routes/webhooks/index.ts` lists subscriptions via `listSubscriptions(...)`; `apps/api/src/services/webhooks/types.ts` shows the stored object includes the raw `secret`.
  - `apps/api/src/services/webhooks/delivery.ts` performs server-side `fetch(subscription.url, ...)` without host allowlisting or private-network blocking.
- Likely impact:
  - Restarting the API loses subscriptions and pending deliveries.
  - Multi-instance deployments will have inconsistent webhook state.
  - Admin-configured webhook URLs can be used for SSRF against internal network targets.
  - Re-listing secrets increases blast radius if an admin session is compromised.

### 4. Database change management relies on `prisma db push`, with no migration history
- Severity: High
- Evidence:
  - `apps/api/prisma/` contains `schema.prisma` and `seed.ts`, but no migrations directory.
  - Root scripts in `package.json` use `prisma db push`.
  - `.github/workflows/ci.yml` also applies schema changes with `prisma db push`.
- Likely impact:
  - Schema changes are not versioned as explicit, reviewable migrations.
  - Reproducing production state, rolling forward safely, and auditing destructive schema changes will be difficult.
  - This increases deployment risk as the data model grows.

## Medium Severity

### 5. Several security-critical controls only work safely on a single process
- Severity: Medium
- Evidence:
  - `apps/api/src/routes/auth/nonce.ts` stores wallet-link nonces in an in-memory `Map`.
  - `apps/api/src/services/siwe.ts` stores SIWE nonces in an in-memory `Map`.
  - `apps/api/src/plugins/rate-limit.ts` uses the default in-memory store.
  - `apps/api/src/services/webhooks/outbox.ts` runs an interval worker in-process.
- Likely impact:
  - Horizontal scaling weakens replay protection, rate limiting, and webhook reliability.
  - Restarts silently invalidate auth flows and lose operational state.
- Planning note:
  - These are acceptable dev defaults, but they are not safe production primitives.

### 6. Public verification writes permanent events with limited abuse controls
- Severity: Medium
- Evidence:
  - `apps/api/src/routes/products/verify.ts` is public and inserts a `ProductEvent` on every successful verification.
  - `apps/api/src/plugins/rate-limit.ts` defines route-specific tightening for login, register, refresh, and resolver, but not for `/products/:id/verify`.
- Likely impact:
  - An attacker can inflate verification analytics and grow the event table using low-cost repeated requests.
  - The route currently depends only on the global IP limiter, which is also in-memory.

### 7. SIWE verification does not validate the signed domain or URI
- Severity: Medium
- Evidence:
  - `apps/api/src/routes/auth/siwe.ts` parses `domain`, `chainId`, and `nonce` from the SIWE message.
  - The implementation verifies signature ownership and nonce consumption, but does not enforce expected `domain`, `uri`, or chain policy before issuing cookies.
- Likely impact:
  - The server is less strict than a normal SIWE verifier and may accept messages signed for an unexpected origin or context.
  - This weakens login trust boundaries even if the nonce remains one-time.

### 8. Local upload fallback is fragile and appears incomplete
- Severity: Medium
- Evidence:
  - `apps/api/src/plugins/storage.ts` returns local URLs like `/uploads/...` when R2 is not configured.
  - No API static-file serving for `/uploads` is registered anywhere under `apps/api/src/`.
  - `apps/dashboard/src/components/image-upload.tsx` uses returned `imageUrl` directly in `<img src>`.
- Likely impact:
  - Local-storage image uploads are likely broken or environment-dependent.
  - In multi-instance or ephemeral deployments, uploaded files will disappear even if URLs resolve.

### 9. Audit export is actor-scoped, not resource-scoped
- Severity: Medium
- Evidence:
  - `apps/api/src/routes/audit/export.ts` restricts `BRAND_ADMIN` exports by fetching users with the same `brandId` and filtering `where.actor`.
  - `apps/api/prisma/schema.prisma` stores `AuditLog` with `actor`, `resource`, `resourceId`, and `metadata`, but no brand dimension.
- Likely impact:
  - A brand admin may miss actions affecting their brand if those actions were performed by a platform admin or system process.
  - The audit trail is incomplete for brand-level governance and dispute handling.

### 10. Swagger docs are enabled by default
- Severity: Medium
- Evidence:
  - `apps/api/src/config.ts` defaults `ENABLE_SWAGGER` to `true`.
  - `apps/api/src/server.ts` registers `/docs` whenever that flag is true, regardless of environment.
- Likely impact:
  - Unless production config explicitly disables it, the API surface and schemas are exposed by default.
  - This is not a direct vulnerability by itself, but it widens discovery and probing surface.

### 11. Scanner production fallback points to localhost
- Severity: Medium
- Evidence:
  - `apps/scanner/src/app/page.tsx` falls back to `http://localhost:4000` when `NEXT_PUBLIC_RESOLVER_BASE_URL` is missing.
  - Unlike the dashboard, there is no production-time fail-fast equivalent to `apps/dashboard/src/lib/constants.ts`.
- Likely impact:
  - A misconfigured production scanner can silently ship with a dead resolver target instead of failing the build.
  - This is easy to miss because the app will still build and deploy.

### 12. The website is outside the workspace dependency graph
- Severity: Medium
- Evidence:
  - `pnpm-workspace.yaml` includes only `apps/*` and `packages/*`.
  - `website/` has its own `package-lock.json` and is built separately in `.github/workflows/ci.yml`.
- Likely impact:
  - Dependency management, tooling, and upgrade cadence can drift from the main monorepo.
  - Shared standards enforced by turbo tasks do not apply automatically to the website.

## Lower Severity / Watch Areas

### 13. Seed path still has a dangerous default password in non-production
- Severity: Low
- Evidence:
  - `apps/api/prisma/seed.ts` falls back to `dev-seed-password-change-me`.
  - `apps/api/.env.example` instructs operators to set `SEED_ADMIN_PASSWORD`, but the script still self-defaults outside production.
- Likely impact:
  - Shared development environments can accidentally keep a predictable admin credential.

### 14. Repository documentation overstates production readiness in several places
- Severity: Low
- Evidence:
  - `README.md` describes blockchain integration, webhook reliability, compliance checks, and deployment readiness in stronger terms than the current API implementation supports.
  - Current backend files still contain explicit MVP/in-memory/mock behavior in `apps/api/src/routes/products/mint.ts`, `apps/api/src/services/webhooks/outbox.ts`, and the compliance service files.
- Likely impact:
  - New contributors and operators can make unsafe assumptions about what is actually production-grade.

## Missing Safeguards / Explicit Absences

### Testing gaps
- `apps/scanner/` has no test or e2e files.
- `website/` has no test or e2e files.
- The scanner is linted/typechecked through turbo, but `.github/workflows/ci.yml` does not run a dedicated `next build` for `apps/scanner/`.

### Operational durability gaps
- No DB-backed outbox or subscription persistence exists for webhooks; the implementation is only `apps/api/src/services/webhooks/outbox.ts`.
- No shared store such as Redis is present for auth nonces or rate limiting.
- No Prisma migration history exists under `apps/api/prisma/`.

### Serving and deployment gaps
- No implemented static serving for API upload assets is present under `apps/api/src/`.
- No API image proxy, CDN contract, or signed asset delivery layer is present; uploads depend on either direct R2 public URLs or the incomplete local fallback.

### Guardrail gaps
- No webhook destination allowlist or internal-network denylist is present.
- No stronger anti-abuse control exists for the public verify endpoint beyond the global in-memory rate limiter.
- No strict SIWE origin validation is implemented in the API route.

## Most Useful Planning Priorities
1. Replace mock/in-memory production paths in `apps/api/` with durable primitives: migrations, Redis-backed ephemeral state, DB-backed webhook outbox.
2. Close trust gaps first: real mint path, enforceable compliance modules, SIWE origin validation, webhook SSRF controls.
3. Add missing safeguards around scanner deployment and public verification abuse before traffic volume increases.

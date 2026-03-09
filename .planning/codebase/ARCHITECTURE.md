# Architecture

## Scope

This repository is a mixed monorepo plus adjacent projects:

- The JavaScript workspace is defined by `pnpm-workspace.yaml` and contains `apps/api`, `apps/dashboard`, `apps/scanner`, and `packages/shared`.
- `website` is a separate Next.js app at the repo root. It is not included in `pnpm-workspace.yaml` and is not orchestrated by `turbo.json`.
- `contracts` is a separate Foundry project with its own build and test toolchain under `contracts/foundry.toml`.
- `specifications`, `governance`, `docs`, and most of `.planning` are content or planning trees, not runtime services.

The implemented system today is therefore not one deployable unit. It is a set of related surfaces:

1. A Fastify API in `apps/api`.
2. A private dashboard in `apps/dashboard`.
3. A public/mobile scanner in `apps/scanner`.
4. A shared TypeScript utility package in `packages/shared`.
5. A separate public documentation site in `website`.
6. A separate smart-contract codebase in `contracts`.

## System Boundaries

### Runtime applications

- `apps/api` is the only backend process in the pnpm workspace. `apps/api/src/main.ts` starts the server built by `apps/api/src/server.ts`.
- `apps/dashboard` is a Next.js App Router frontend that talks to the API over HTTP using `apps/dashboard/src/lib/api.ts`.
- `apps/scanner` is another Next.js App Router frontend. It does not authenticate users; it resolves public product passports through the resolver endpoint exposed by the API.
- `website` is a third Next.js app, but it serves documentation and marketing content rather than the operational product flow.

### Persistent and external boundaries

- PostgreSQL is the main persistent store for the API via Prisma in `apps/api/prisma/schema.prisma` and `apps/api/src/plugins/prisma.ts`.
- Object storage is abstracted behind `apps/api/src/plugins/storage.ts` and is either:
  - Cloudflare R2 / S3-compatible storage when `R2_*` environment variables are present.
  - Local filesystem storage under `apps/api/uploads` otherwise.
- Blockchain access is abstracted behind `apps/api/src/plugins/chain.ts` using `viem` against Base Sepolia.
  - Read-only `publicClient` is always created.
  - Write mode depends on `DEPLOYER_PRIVATE_KEY`.
  - Product minting routes currently return `503` when real chain mode is enabled, so write-side chain integration is not implemented in the API yet.
- Error reporting is optional through Sentry in `apps/api/src/plugins/sentry.ts`.
- Webhook delivery exists, but subscriptions and the outbox queue live only in memory in `apps/api/src/services/webhooks/outbox.ts`.
- SIWE nonces and wallet-link nonces also live only in memory in `apps/api/src/services/siwe.ts` and `apps/api/src/routes/auth/nonce.ts`.

### Non-runtime code and content

- `contracts/src` contains Solidity implementations and interfaces; nothing in `apps/*` imports these contracts directly.
- `specifications` is consumed by the `website` app through filesystem reads in `website/src/lib/specifications.ts`.
- `website/content/blog` is consumed by the `website` app through filesystem reads in `website/src/lib/blog.ts`.

## Entry Points

### Workspace and build entry points

- Root workspace commands are declared in `package.json`.
- Turborepo task wiring lives in `turbo.json`.
- Workspace membership lives in `pnpm-workspace.yaml`.

### API entry points

- Process bootstrap: `apps/api/src/main.ts`
- App composition: `apps/api/src/server.ts`
- Database schema and seed: `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts`
- Container build: `apps/api/Dockerfile`

`apps/api/src/server.ts` is the primary backend composition root. It registers all plugins, then mounts route groups:

- `apps/api/src/routes/health.ts`
- `apps/api/src/routes/auth/index.ts`
- `apps/api/src/routes/products/index.ts`
- `apps/api/src/routes/resolver/index.ts`
- `apps/api/src/routes/audit/index.ts`
- `apps/api/src/routes/webhooks/index.ts`

### Dashboard entry points

- Root layout and providers: `apps/dashboard/src/app/layout.tsx`
- Initial redirect shell: `apps/dashboard/src/app/page.tsx`
- Protected dashboard shell: `apps/dashboard/src/app/dashboard/layout.tsx`
- Main operational screens:
  - `apps/dashboard/src/app/dashboard/page.tsx`
  - `apps/dashboard/src/app/dashboard/products/page.tsx`
  - `apps/dashboard/src/app/dashboard/products/new/page.tsx`
  - `apps/dashboard/src/app/dashboard/products/[id]/page.tsx`
  - `apps/dashboard/src/app/login/page.tsx`
  - `apps/dashboard/src/app/register/page.tsx`

### Scanner entry points

- Root layout: `apps/scanner/src/app/layout.tsx`
- Public resolver UI: `apps/scanner/src/app/page.tsx`
- Camera flow: `apps/scanner/src/app/scan/page.tsx`
- GS1 route redirector: `apps/scanner/src/app/01/[gtin]/21/[serial]/page.tsx`
- Service worker registration: `apps/scanner/src/app/register-sw.tsx`
- PWA assets: `apps/scanner/public/manifest.json`, `apps/scanner/public/sw.js`

### Website entry points

- Root layout: `website/src/app/layout.tsx`
- Main public routes under `website/src/app/**`
- Dynamic specification renderer: `website/src/app/specifications/[category]/[...slug]/page.tsx`
- Dynamic blog renderer: `website/src/app/blog/[slug]/page.tsx`

### Contract entry points

- Foundry configuration: `contracts/foundry.toml`
- Deployment script: `contracts/script/Deploy.s.sol`
- Main contract packages:
  - `contracts/src/infrastructure`
  - `contracts/src/identity`
  - `contracts/src/compliance`
  - `contracts/src/token`

## Layer Boundaries

### API layering

The API is organized around Fastify composition rather than a deep onion architecture.

1. Configuration and process bootstrap
   - `apps/api/src/config.ts`
   - `apps/api/src/main.ts`
2. Platform plugins that decorate the Fastify instance
   - `apps/api/src/plugins/prisma.ts`
   - `apps/api/src/plugins/auth.ts`
   - `apps/api/src/plugins/chain.ts`
   - `apps/api/src/plugins/storage.ts`
   - `apps/api/src/plugins/cookie.ts`
   - `apps/api/src/plugins/cors.ts`
   - `apps/api/src/plugins/rate-limit.ts`
   - `apps/api/src/plugins/security-headers.ts`
   - `apps/api/src/plugins/sentry.ts`
   - `apps/api/src/plugins/audit.ts`
3. Request guards and policies
   - `apps/api/src/middleware/rbac.ts`
   - `apps/api/src/middleware/csrf.ts`
4. Route handlers grouped by business area
   - `apps/api/src/routes/auth/*`
   - `apps/api/src/routes/products/*`
   - `apps/api/src/routes/resolver/*`
   - `apps/api/src/routes/audit/*`
   - `apps/api/src/routes/webhooks/*`
5. Reusable services and utilities
   - Compliance runners in `apps/api/src/services/compliance/*`
   - Webhook delivery/outbox in `apps/api/src/services/webhooks/*`
   - SIWE nonce handling in `apps/api/src/services/siwe.ts`
   - Shared helper utilities in `apps/api/src/utils/*`

Important current boundary: most business logic still lives inside route modules. There is not a separate application-service layer for products, auth, or audit. The dedicated service layer exists only for selected cross-cutting concerns.

### Frontend layering

Both frontend apps follow a lightweight App Router split:

1. Route segments under `src/app`
2. UI components under `src/components`
3. Client-side helpers under `src/lib`
4. Hooks/providers where needed

Examples:

- `apps/dashboard/src/hooks/use-auth.tsx` owns auth state hydration.
- `apps/dashboard/src/components/auth-guard.tsx` enforces protected routing.
- `apps/dashboard/src/components/providers/wallet-provider.tsx` wires `wagmi` and React Query.
- `apps/scanner/src/app/page.tsx` combines parsing, public fetch, and rendering in one page component instead of delegating to a service layer.

There is no shared frontend component package under `packages/*`. Dashboard UI primitives are local to `apps/dashboard/src/components/ui`, and website UI is local to `website/src/components`.

### Contract layering

The contract project has its own internal package-style split:

- Access and governance primitives in `contracts/src/infrastructure`
- Identity registries in `contracts/src/identity`
- Compliance engine and modules in `contracts/src/compliance`
- Product token logic in `contracts/src/token`
- Shared Solidity interfaces in `contracts/src/interfaces`

This boundary is clean at the repository level: the TypeScript apps reference the contract conceptually, but not as compiled artifacts or generated bindings.

## Data Flows

### Auth flow

1. Dashboard pages call `apps/dashboard/src/lib/api.ts`.
2. Requests go to API auth routes such as `apps/api/src/routes/auth/login.ts` and `apps/api/src/routes/auth/me.ts`.
3. The API verifies credentials against Prisma models from `apps/api/prisma/schema.prisma`.
4. Tokens are created in `apps/api/src/utils/tokens.ts`.
5. Cookies are set via `apps/api/src/utils/cookies.ts`.
6. Dashboard bootstraps user state in `apps/dashboard/src/hooks/use-auth.tsx` by calling `/auth/me`.

Wallet-related auth is split:

- Email/password login uses DB-backed users and refresh-token hashing.
- SIWE login uses one-time in-memory nonces from `apps/api/src/services/siwe.ts`.
- Wallet linking uses user-bound in-memory nonces from `apps/api/src/routes/auth/nonce.ts`.

### Product management flow

1. Dashboard product screens submit forms through `apps/dashboard/src/lib/api.ts`.
2. Product routes such as `apps/api/src/routes/products/create.ts`, `list.ts`, `get.ts`, `update.ts`, `mint.ts`, `recall.ts`, `transfer.ts`, `upload.ts`, `batch-import.ts`, and `batch-mint.ts` validate request data with Zod and shared validators from `@galileo/shared`.
3. Route handlers write directly through Prisma transactions.
4. State changes are recorded as `ProductEvent` rows.
5. Successful mutations are also observed by the audit plugin in `apps/api/src/plugins/audit.ts`.
6. Selected events enqueue webhooks through `apps/api/src/services/webhooks/outbox.ts`.

### Public resolver flow

1. Scanner users enter or scan a GS1 Digital Link or Galileo DID in `apps/scanner/src/app/page.tsx` or `apps/scanner/src/app/scan/page.tsx`.
2. The scanner normalizes input with helpers from `@galileo/shared`.
3. The scanner fetches `GET /01/:gtin/21/:serial` from the API.
4. `apps/api/src/routes/resolver/resolve.ts` validates the GTIN, looks up the product and related records, filters unpublished states, and emits JSON-LD.
5. The scanner renders the resolved passport and provenance data.
6. `apps/scanner/public/sw.js` caches resolver responses for offline re-viewing.

### Transfer compliance flow

1. `apps/api/src/routes/products/transfer.ts` loads the product and the acting user context.
2. It constructs a `ComplianceContext`.
3. It runs pure TypeScript compliance modules from:
   - `apps/api/src/services/compliance/jurisdiction.ts`
   - `apps/api/src/services/compliance/sanctions.ts`
   - `apps/api/src/services/compliance/brand-auth.ts`
   - `apps/api/src/services/compliance/cpo.ts`
   - `apps/api/src/services/compliance/service-center.ts`
4. Only if all checks pass does Prisma update the product wallet address and append an event.

This is separate from the Solidity compliance system in `contracts/src/compliance`. The repository currently has both a TypeScript compliance pipeline for the API and a Solidity compliance pipeline for the contract project.

### Documentation-site content flow

1. `website/src/lib/specifications.ts` walks `../specifications` on disk.
2. `website/src/lib/specs-navigation.ts` builds dynamic sidebar data from those files.
3. `website/src/app/specifications/[category]/[...slug]/page.tsx` renders markdown or JSON-based specification content.
4. `website/src/lib/blog.ts` reads `website/content/blog`.
5. `website/src/app/blog/[slug]/page.tsx` renders MDX posts.

The `website` app therefore depends on repository-local files outside its own directory. That is an important architectural coupling.

## App, Package, and Contract Relationships

### `@galileo/shared`

`packages/shared` is the only reusable TypeScript package in the workspace. It exports:

- Domain enums and DTO-style types from `packages/shared/src/types/*`
- Static business constants from `packages/shared/src/constants/*`
- Shared validation and identifier helpers from `packages/shared/src/validation/*`

Current consumers:

- `apps/api` imports it for validation, enums, and wallet-message helpers.
- `apps/dashboard` imports it for product statuses, GTIN validation, and wallet-message helpers.
- `apps/scanner` imports it for GTIN and DID/Digital Link normalization.

### Dashboard to API

- Coupling is HTTP- and cookie-based, not package-internal.
- The dashboard does not import backend code.
- The shared contract between them is implicit in route payloads plus the exported shared enums/types from `@galileo/shared`.

### Scanner to API

- Coupling is through the public resolver endpoint.
- The scanner only needs shared identifier helpers and the JSON-LD response shape it renders locally.

### Website to repository content

- `website` does not depend on `@galileo/shared`.
- It depends on the filesystem layout of `specifications` and `website/content/blog`.

### Contracts to the rest of the repo

- `contracts` is related conceptually to the API and the published specifications.
- There is no generated ABI package, no TypeScript bindings package, and no direct compile-time dependency from `apps/api`, `apps/dashboard`, or `apps/scanner` into `contracts`.
- The API currently synthesizes mock mint data in `apps/api/src/routes/products/mint.ts` and `apps/api/src/routes/products/batch-mint.ts` instead of calling deployed contract bindings.

## Key Abstractions

- `buildApp()` in `apps/api/src/server.ts` is the backend composition root.
- Fastify decorations provide platform capabilities:
  - `fastify.prisma`
  - `fastify.authenticate`
  - `fastify.chain`
  - `fastify.storage`
  - `fastify.sentry`
- Prisma models in `apps/api/prisma/schema.prisma` are the operational source of truth for users, brands, products, passports, product events, and audit logs.
- `ProductEvent` is the core append-only event abstraction for lifecycle history.
- `AuditLog` is a separate append-only operational audit trail created automatically by the audit plugin.
- `runComplianceChecks()` in `apps/api/src/services/compliance/index.ts` is the reusable policy pipeline abstraction for transfer approval.
- `enqueueWebhookEvent()` and `startWorker()` in `apps/api/src/services/webhooks/outbox.ts` form the current background-processing abstraction.
- `AuthProvider` in `apps/dashboard/src/hooks/use-auth.tsx` is the dashboard’s client auth boundary.
- `walletConfig` in `apps/dashboard/src/lib/wallet.ts` is the wallet-integration boundary for the dashboard.

## Explicitly Absent Areas

- No shared UI/design-system package exists under `packages/*`.
- No persistent queue or database-backed outbox exists for webhooks; current webhook state is process memory only.
- No persistent store exists for SIWE or wallet-link nonces; both are process memory only.
- No Prisma migration history directory exists under `apps/api/prisma`; the implemented files are `schema.prisma` and `seed.ts`.
- No repository-wide infrastructure-as-code directory such as `terraform`, `pulumi`, `k8s`, or `helm` is present.
- No generated TypeScript contract client, ABI package, or on-chain sync worker is present.
- No backend microservice split exists; `apps/api` is the single backend service in the pnpm workspace.

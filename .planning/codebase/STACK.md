# Stack

## Snapshot

Galileo Luxury is a mixed-tooling repository: a root `pnpm` + Turborepo workspace for the application code, a standalone `website/` app managed with `npm`, and a separate Foundry-based smart contract project in `contracts/`.

## Workspace Layout

- Monorepo root is defined by `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, and `tsconfig.json`.
- Root workspace members are only `apps/*` and `packages/*` per `pnpm-workspace.yaml`.
- Application packages:
  - `apps/api` is the backend API.
  - `apps/dashboard` is the authenticated admin/operator dashboard.
  - `apps/scanner` is the mobile-first public scanner/PWA.
  - `packages/shared` holds shared TypeScript types, constants, and validation helpers.
- Non-workspace but active code surfaces:
  - `website` is a separate Next.js site with its own `website/package.json` and `website/package-lock.json`.
  - `contracts` is a Foundry project with source in `contracts/src`, tests in `contracts/test`, deployment scripts in `contracts/script`, and vendored dependencies in `contracts/lib`.

## Languages And Runtimes

- TypeScript is the main application language across `apps/api`, `apps/dashboard`, `apps/scanner`, `packages/shared`, and `website`.
- JavaScript is used for some runtime/config files such as `apps/dashboard/postcss.config.mjs`, `apps/scanner/postcss.config.mjs`, `website/postcss.config.mjs`, and the scanner service worker at `apps/scanner/public/sw.js`.
- Solidity is used for protocol contracts in `contracts/src`.
- Node.js is the runtime for the API, build tooling, tests, and CI. The pinned container/CI runtime is Node 22 in `apps/api/Dockerfile` and `.github/workflows/ci.yml`.
- The repository uses ESM where explicitly enabled, for example `apps/api/package.json` and `packages/shared/package.json` declare `"type": "module"`.

## Frameworks And Major Libraries

### Backend: `apps/api`

- HTTP server is Fastify 5 via `apps/api/src/server.ts`.
- API plugins include JWT auth, cookies, CORS, Helmet, multipart upload, Swagger, Swagger UI, rate limiting, Prisma, storage, blockchain access, Sentry, and audit logging in `apps/api/src/plugins/*`.
- Persistence uses Prisma 7 with the PostgreSQL adapter in `apps/api/prisma/schema.prisma` and `apps/api/src/plugins/prisma.ts`.
- Validation uses `zod` in `apps/api/src/config.ts` and route handlers such as `apps/api/src/routes/auth/siwe.ts`.
- Blockchain client usage is `viem` in `apps/api/src/plugins/chain.ts`.
- Object storage support uses the AWS SDK S3 client in `apps/api/src/plugins/storage.ts`.
- Content addressing uses `multiformats` for CID generation in `apps/api/src/utils/cid.ts`.

### Dashboard: `apps/dashboard`

- Frontend framework is Next.js 16 App Router in `apps/dashboard/src/app`.
- UI runtime is React 19 from `apps/dashboard/package.json`.
- Wallet integration is built with `wagmi`, `viem`, and Coinbase/injected connectors in `apps/dashboard/src/lib/wallet.ts`.
- Client data fetching and request-state management use `@tanstack/react-query` in `apps/dashboard/src/components/providers/wallet-provider.tsx`.
- Styling is Tailwind CSS 4 plus `tailwind-merge`, `class-variance-authority`, and `tw-animate-css`.
- Component primitives follow shadcn/Radix conventions via `apps/dashboard/components.json` and `apps/dashboard/src/components/ui/*`.

### Scanner: `apps/scanner`

- Frontend framework is also Next.js 16 App Router in `apps/scanner/src/app`.
- QR detection uses `barcode-detector/ponyfill` and the browser camera API in `apps/scanner/src/app/scan/page.tsx`.
- The scanner is PWA-like, with a web manifest in `apps/scanner/public/manifest.json`, service worker logic in `apps/scanner/public/sw.js`, and registration in `apps/scanner/src/app/register-sw.tsx`.

### Marketing / Docs Site: `website`

- `website` is a separate Next.js 16 application, not part of the root `pnpm` workspace.
- Blog/document content is file-backed and parsed at runtime/build time with `gray-matter` in `website/src/lib/blog.ts`.
- Specification browsing reads files from the repository-level `specifications/` directory via `website/src/lib/specifications.ts`.
- The package list includes MDX and syntax-highlighting tools (`@mdx-js/*`, `next-mdx-remote`, `shiki`) in `website/package.json`, although the current `website/next.config.ts` is minimal and does not wire an MDX plugin.

### Shared Package: `packages/shared`

- `packages/shared` exports shared enums, API types, GTIN/DID/wallet validation helpers, and claim-topic constants through `packages/shared/src/index.ts`.
- It is compiled to `dist/` with TypeScript and consumed as `@galileo/shared` from the apps.

### Smart Contracts: `contracts`

- Contract source lives in `contracts/src` and is built/tested with Foundry, configured by `contracts/foundry.toml`.
- The Solidity compiler target in practice is `pragma solidity ^0.8.17` as seen in `contracts/script/Deploy.s.sol` and the contract sources.
- Vendored Solidity dependencies are referenced through remappings in `contracts/foundry.toml`:
  - `contracts/lib/openzeppelin-contracts`
  - `contracts/lib/solidity`
  - `contracts/lib/T-REX`
  - `contracts/lib/forge-std`
- Deployment is scripted through `contracts/script/Deploy.s.sol`.

## Tooling And Quality Gates

- Monorepo orchestration uses Turborepo from root `package.json` and `turbo.json`.
- TypeScript strictness is centralized in root `tsconfig.json`, then extended by per-package configs such as `apps/api/tsconfig.json`, `apps/dashboard/tsconfig.json`, `apps/scanner/tsconfig.json`, `packages/shared/tsconfig.json`, and `website/tsconfig.json`.
- Linting uses ESLint across the codebase via package-local configs such as `apps/dashboard/eslint.config.mjs`, `apps/scanner/eslint.config.mjs`, and `website/eslint.config.mjs`.
- Unit/integration tests:
  - `apps/api` uses Vitest, with tests under `apps/api/test` and config in `apps/api/vitest.config.ts`.
  - `packages/shared` exposes a `vitest` test script but no package-local test files were surfaced in `packages/shared/src`.
- E2E tests use Playwright in `apps/dashboard/e2e` with config in `apps/dashboard/playwright.config.ts`.
- Contract tests use `forge test` against `contracts/test`.
- Performance/quality auditing for the website uses Lighthouse CI via `.github/workflows/lighthouse.yml` and `website/lighthouse-budget.json`.

## Build, Run, And Release Surfaces

- Root developer entry points are the Turbo scripts in `package.json`: `dev`, `build`, `lint`, `typecheck`, `test`, and `test:e2e`.
- Database operations are exposed at the root with `db:push`, `db:seed`, and `db:studio`, all targeting `@galileo/api`.
- API local run/build surfaces are in `apps/api/package.json`:
  - `tsx watch src/main.ts` for development
  - `prisma generate && tsc` for build
  - `node dist/main.js` for production start
- API container build surface is `apps/api/Dockerfile`.
- Dashboard and scanner each use plain Next build/start scripts from their package manifests and have deployment-oriented `vercel.json` files at `apps/dashboard/vercel.json` and `apps/scanner/vercel.json`.
- The website builds independently with `npm` per `website/package.json` and `website/vercel.json`.
- Contract build/test/deploy surfaces are `forge build`, `forge test`, and `forge script`, as referenced in `.github/workflows/ci.yml`, `contracts/README.md`, and `contracts/.env.example`.

## Configuration Sources

- Root package-management and task graph configuration lives in `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `turbo.json`.
- Shared TypeScript defaults come from `tsconfig.json`.
- API runtime env validation is centralized in `apps/api/src/config.ts`.
- API schema/config sources include `apps/api/prisma/schema.prisma`, `apps/api/.env.example`, and the untracked/local override file `apps/api/.env`.
- Dashboard runtime API base URL resolution lives in `apps/dashboard/src/lib/constants.ts`; deployment headers/build behavior are in `apps/dashboard/vercel.json`.
- Scanner PWA/runtime config is split across `apps/scanner/vercel.json`, `apps/scanner/public/manifest.json`, and `apps/scanner/public/sw.js`.
- Website deployment behavior is configured in `website/vercel.json`; content comes from `website/content/blog` and the repository-level `specifications/` tree.
- Contract build/remapping config is `contracts/foundry.toml`; deploy env examples are in `contracts/.env.example`.
- Cross-stack local/testnet env examples exist at root in `.env.testnet.example`.
- CI/CD config is in `.github/workflows/ci.yml` and `.github/workflows/lighthouse.yml`.

## Not Present In The Current Stack

- No `docker-compose.yml`, Kubernetes manifests, Terraform, Pulumi, or Helm charts were found.
- No Nx, Rush, Lerna, or Bazel setup was found; Turborepo is the orchestrator actually in use.
- No Redis, message broker, or dedicated job runner is wired into the current application stack.
- No managed BaaS/auth stack such as Supabase, Firebase, Clerk, Auth0, or NextAuth is implemented in the current code.

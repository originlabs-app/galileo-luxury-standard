# Structure

## Top-Level Layout

The repository is organized as a workspace plus adjacent non-workspace projects:

- `apps/` contains deployable application surfaces inside the pnpm workspace.
- `packages/` contains reusable TypeScript packages inside the pnpm workspace.
- `contracts/` is a separate Foundry project, not part of `pnpm-workspace.yaml`.
- `website/` is a separate Next.js app at repo root, also not part of `pnpm-workspace.yaml`.
- `specifications/` holds protocol/spec content consumed by `website`.
- `governance/` holds governance documents and membership material.
- `docs/` holds additional repository documentation and screenshots.
- `.planning/` holds planning artifacts; `.planning/codebase/` is where this map lives.
- `.factory/` contains automation, validation, and skill material.
- `release/` and `planning/` are supporting project-management trees rather than runtime code.

## Workspace Layout

The actual pnpm workspace from `pnpm-workspace.yaml` includes only:

- `apps/api`
- `apps/dashboard`
- `apps/scanner`
- `packages/shared`

`turbo.json` defines shared `build`, `dev`, `lint`, `typecheck`, `test`, and `test:e2e` tasks for those workspace packages.

Expected-but-absent workspace areas:

- No `packages/ui`
- No `packages/config`
- No `packages/contracts`
- No `apps/website`

## `apps/api`

`apps/api` is the Fastify + Prisma backend package.

### Main directories

- `apps/api/src/main.ts`
  - Process entry point.
- `apps/api/src/server.ts`
  - Fastify composition root.
- `apps/api/src/config.ts`
  - Environment parsing and typed config.
- `apps/api/src/plugins/`
  - Fastify plugins that decorate the app instance.
- `apps/api/src/middleware/`
  - Request guards such as CSRF and RBAC.
- `apps/api/src/routes/`
  - Route handlers grouped by domain.
- `apps/api/src/services/`
  - Reusable domain/cross-cutting services.
- `apps/api/src/utils/`
  - Small backend helpers.
- `apps/api/src/generated/prisma/`
  - Generated Prisma client output committed into source.
- `apps/api/prisma/`
  - Prisma schema and seed script.
- `apps/api/test/`
  - Vitest suites and test helpers.
- `apps/api/uploads/`
  - Local development/test storage fallback target.
- `apps/api/dist/`
  - TypeScript build output.

### Route organization pattern

`apps/api/src/routes/` is grouped by business area:

- `apps/api/src/routes/auth/`
- `apps/api/src/routes/products/`
- `apps/api/src/routes/resolver/`
- `apps/api/src/routes/audit/`
- `apps/api/src/routes/webhooks/`
- `apps/api/src/routes/health.ts`

Each area follows the same pattern:

- Individual endpoint files named after the action, for example `login.ts`, `create.ts`, `mint.ts`, `resolve.ts`.
- A local `index.ts` that registers the grouped routes.
- Default-exported registration functions that accept `FastifyInstance`.

This is a flat-by-endpoint structure, not a controller/service/repository split.

### Service organization pattern

`apps/api/src/services/` is used selectively rather than universally:

- `apps/api/src/services/compliance/`
  - One file per check plus `index.ts`.
- `apps/api/src/services/webhooks/`
  - Queue, delivery, and type definitions.
- `apps/api/src/services/siwe.ts`
  - SIWE nonce handling.

Most product and auth workflows still live directly in route files.

### Naming conventions in the API package

- Plugin files are noun-based: `prisma.ts`, `auth.ts`, `storage.ts`.
- Middleware files are policy-based: `csrf.ts`, `rbac.ts`.
- Route files are endpoint/action-based: `create.ts`, `list.ts`, `refresh.ts`, `data-export.ts`.
- Shared backend helpers use kebab-case filenames: `token-hash.ts`, `prisma-errors.ts`, `route-error.ts`.
- Tests mirror feature areas with `*.test.ts` names in `apps/api/test/`.

### API-specific absences

- No `src/controllers/`
- No `src/repositories/`
- No `src/domain/`
- No `prisma/migrations/`

## `apps/dashboard`

`apps/dashboard` is the authenticated operational frontend built with Next.js App Router.

### Main directories

- `apps/dashboard/src/app/`
  - Route segments, layouts, and page entry points.
- `apps/dashboard/src/components/`
  - Local UI and feature components.
- `apps/dashboard/src/components/ui/`
  - Local primitive components; effectively an app-local design system.
- `apps/dashboard/src/components/providers/`
  - Cross-app providers such as the wallet provider.
- `apps/dashboard/src/hooks/`
  - React hooks, currently centered on auth state.
- `apps/dashboard/src/lib/`
  - API client, constants, wallet config, and utility helpers.
- `apps/dashboard/e2e/`
  - Playwright end-to-end specs.
- `apps/dashboard/playwright/`
  - Browser auth state and Playwright support files.
- `apps/dashboard/public/`
  - Static assets.

### Route layout

The app uses App Router route groups directly under `src/app`:

- `apps/dashboard/src/app/layout.tsx`
- `apps/dashboard/src/app/page.tsx`
- `apps/dashboard/src/app/login/page.tsx`
- `apps/dashboard/src/app/register/page.tsx`
- `apps/dashboard/src/app/dashboard/layout.tsx`
- `apps/dashboard/src/app/dashboard/page.tsx`
- `apps/dashboard/src/app/dashboard/products/page.tsx`
- `apps/dashboard/src/app/dashboard/products/new/page.tsx`
- `apps/dashboard/src/app/dashboard/products/[id]/page.tsx`

Patterns:

- Auth shell at the root, protected shell under `dashboard/`.
- Dynamic product detail route uses `[id]`.
- Pages that perform mutations are mostly client components.

### Component organization

Dashboard components are divided by purpose, not by route:

- Auth and session components:
  - `apps/dashboard/src/components/auth-guard.tsx`
  - `apps/dashboard/src/components/siwe-login.tsx`
  - `apps/dashboard/src/components/wallet-connection.tsx`
- Layout components:
  - `apps/dashboard/src/components/header.tsx`
  - `apps/dashboard/src/components/sidebar.tsx`
- Product workflow components:
  - `apps/dashboard/src/components/batch-import-dialog.tsx`
  - `apps/dashboard/src/components/image-upload.tsx`
- Primitive UI components:
  - `apps/dashboard/src/components/ui/*`

### Naming conventions in the dashboard package

- Route files follow Next.js App Router conventions: `layout.tsx`, `page.tsx`.
- Feature components use PascalCase filenames.
- Utility files use short lowercase names such as `api.ts`, `auth.ts`, `wallet.ts`.
- Dynamic segments follow standard Next naming, for example `[id]`.

### Dashboard-specific absences

- No server actions directory.
- No Redux/Zustand store directory.
- No shared component package outside this app.

## `apps/scanner`

`apps/scanner` is a public/mobile-oriented Next.js App Router app for QR and resolver flows.

### Main directories

- `apps/scanner/src/app/`
  - Entire application surface.
- `apps/scanner/public/`
  - PWA assets and service worker.

There is no `src/components/`, `src/lib/`, or `src/hooks/` directory today. Most logic is embedded directly into route files.

### Route layout

- `apps/scanner/src/app/layout.tsx`
- `apps/scanner/src/app/page.tsx`
- `apps/scanner/src/app/scan/page.tsx`
- `apps/scanner/src/app/01/[gtin]/21/[serial]/page.tsx`
- `apps/scanner/src/app/register-sw.tsx`

Patterns:

- Resolver input and display live in the root `page.tsx`.
- Camera scanning lives in its own `scan/page.tsx`.
- GS1 path handling uses nested dynamic segments under `01/[gtin]/21/[serial]`.
- Service-worker registration is kept beside the route tree, not in `public/`.

### PWA file layout

- `apps/scanner/public/manifest.json`
- `apps/scanner/public/sw.js`
- Icon assets in `apps/scanner/public/*.svg`

### Scanner-specific absences

- No local API route handlers.
- No component library directory.
- No dedicated test directory in this package.

## `packages/shared`

`packages/shared` is the only reusable TypeScript package in the workspace.

### Main directories

- `packages/shared/src/index.ts`
  - Barrel exports.
- `packages/shared/src/types/`
  - Cross-app TypeScript interfaces and enums.
- `packages/shared/src/constants/`
  - Shared constant sets such as roles, categories, and claim topics.
- `packages/shared/src/validation/`
  - Validation and identifier helpers.
- `packages/shared/test/`
  - Vitest suites for shared behavior.
- `packages/shared/dist/`
  - Build output for workspace consumption and packaging.

### File organization pattern

The package is intentionally small and domain-oriented:

- `types/` defines shape contracts.
- `constants/` defines allowed values and protocol constants.
- `validation/` contains pure functions with no runtime framework dependency.
- `src/index.ts` re-exports curated public API surface.

### Naming conventions

- Files are grouped by concept: `product.ts`, `user.ts`, `gtin.ts`, `did.ts`.
- Index barrels exist both at package root and inside some subfolders.
- Functions are mostly pure and named by action: `validateGtin`, `generateDid`, `buildLinkWalletMessage`.

## `website`

`website` is a separate Next.js application outside the pnpm workspace.

### Main directories

- `website/src/app/`
  - App Router pages and layouts.
- `website/src/components/`
  - Presentation components grouped by section.
- `website/src/lib/`
  - Filesystem readers, navigation builders, and theme/config helpers.
- `website/content/blog/`
  - Blog post source files.
- `website/public/`
  - Static assets.

### Route organization

The route tree mixes fixed content pages with dynamic filesystem-backed pages:

- Docs pages under `website/src/app/docs/**`
- Governance pages under `website/src/app/governance/**`
- Blog pages under `website/src/app/blog/**`
- Specification catalog under `website/src/app/specifications/**`

The main dynamic route patterns are:

- `website/src/app/blog/[slug]/page.tsx`
- `website/src/app/specifications/[category]/page.tsx`
- `website/src/app/specifications/[category]/[...slug]/page.tsx`

### Component grouping pattern

Components are grouped by site section rather than by low-level primitive only:

- `website/src/components/abysse/`
- `website/src/components/docs/`
- `website/src/components/governance/`
- `website/src/components/layout/`
- `website/src/components/seo/`
- `website/src/components/specifications/`
- `website/src/components/ui/`

### Repository coupling

`website` reaches outside its own directory:

- `website/src/lib/specifications.ts` reads `../specifications`.
- `website/src/lib/blog.ts` reads `website/content/blog`.

That file-layout dependency is part of the current structure, not just documentation.

### Website-specific absences

- No dedicated test directory.
- No integration into the root Turborepo task graph.

## `contracts`

`contracts` is a separate Foundry Solidity project.

### Main directories

- `contracts/src/`
  - Solidity source.
- `contracts/src/infrastructure/`
- `contracts/src/identity/`
- `contracts/src/compliance/`
- `contracts/src/compliance/modules/`
- `contracts/src/token/`
- `contracts/src/interfaces/`
  - Shared Solidity interfaces grouped by domain.
- `contracts/test/`
  - Foundry tests mirroring the source split.
- `contracts/script/`
  - Deployment scripts.
- `contracts/lib/`
  - Vendored dependencies.
- `contracts/out/`
  - Build artifacts.

### Source/test mirroring pattern

The test tree mirrors the source tree closely:

- `contracts/test/compliance/**`
- `contracts/test/identity/**`
- `contracts/test/infrastructure/**`
- `contracts/test/integration/**`
- `contracts/test/token/**`

This is a conventional Foundry layout with clear domain mirroring.

### Naming conventions

- Concrete contracts use PascalCase, for example `GalileoToken.sol`.
- Interfaces use `I*` prefixes, for example `IGalileoToken.sol`.
- Test files use `.t.sol`.
- Deployment scripts use `.s.sol`.

### Contract-specific absences

- No generated ABI export package for the TypeScript apps.
- No JS package wrapper under `packages/*` for contract artifacts.

## Content and Planning Trees

These directories matter structurally even though they are not runtime packages:

- `specifications/`
  - Protocol and schema source files; consumed by `website`.
- `governance/`
  - Governance documents and RFC material.
- `docs/`
  - Additional docs and screenshot assets.
- `.planning/`
  - Planning artifacts including `.planning/codebase/`.
- `.factory/`
  - Automation scaffolding, validation runs, and local skills.

## Common Naming and Location Conventions

Across the repository, a few conventions are consistent:

- Source code usually lives in `src/`.
- Tests live in `test/`, `e2e/`, or `contracts/test/` depending on toolchain.
- Next.js route files follow `layout.tsx`, `page.tsx`, and dynamic segment folder conventions.
- TypeScript utility/helper files are typically lowercase kebab-case or short lowercase names.
- Domain groupings are favored over technical layers in both frontend and backend packages.

## Structural Gaps Worth Remembering

- The root workspace and the repo root are not the same thing: `website/` and `contracts/` sit outside the pnpm workspace.
- There is no single shared frontend library; each app owns its own components.
- There is no backend package split beyond `apps/api`.
- There is no persistent infra/config directory for deployment automation in the repository root.

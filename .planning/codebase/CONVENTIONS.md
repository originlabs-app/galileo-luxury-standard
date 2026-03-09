# Code Conventions

## Workspace Shape

- The repo is a pnpm + Turbo monorepo rooted at `package.json`, with application code split across `apps/api`, `apps/dashboard`, `apps/scanner`, `packages/shared`, `contracts`, and `website`.
- Runtime boundaries are clear by folder:
  - `apps/api` is a Fastify + Prisma backend.
  - `apps/dashboard`, `apps/scanner`, and `website` are Next.js App Router apps.
  - `packages/shared` holds shared types, constants, and validation helpers.
  - `contracts/src` and `contracts/test` hold Solidity contracts and Foundry tests.

## Naming And File Layout

- TypeScript and TSX filenames are mostly kebab-case, especially in feature and route modules such as `apps/api/src/routes/products/batch-import.ts`, `apps/dashboard/src/components/batch-import-dialog.tsx`, and `apps/dashboard/src/components/providers/wallet-provider.tsx`.
- Next App Router files follow framework naming literally: `page.tsx`, `layout.tsx`, and dynamic segments like `apps/dashboard/src/app/dashboard/products/[id]/page.tsx`.
- Solidity contracts, interfaces, and test contracts use PascalCase file names such as `contracts/src/token/GalileoToken.sol`, `contracts/src/compliance/modules/BrandAuthorizationModule.sol`, and `contracts/test/token/GalileoToken.t.sol`.
- Route modules are grouped by domain and then registered through local index files like `apps/api/src/routes/products/index.ts` and `apps/api/src/routes/auth/index.ts`.
- Shared exports are centralized through a barrel file in `packages/shared/src/index.ts`; consumers generally import from `@galileo/shared` instead of deep package paths.

## Export And Module Patterns

- Default exports are the norm for route registration modules and Next pages/layouts, for example `apps/api/src/routes/products/create.ts`, `apps/dashboard/src/app/layout.tsx`, and `website/src/app/page.tsx`.
- Named exports are used for reusable utilities, schemas, constants, and components, for example `packages/shared/src/validation/auth.ts`, `apps/dashboard/src/lib/api.ts`, and `apps/dashboard/src/components/ui/button.tsx`.
- `apps/api` and `packages/shared` are ESM packages (`"type": "module"` in `apps/api/package.json` and `packages/shared/package.json`), and TypeScript source imports use `.js` suffixes for local modules, e.g. `apps/api/src/server.ts`.
- Next apps use the `@/*` alias from their local `tsconfig.json` files instead of relative traversal, e.g. `apps/dashboard/src/app/dashboard/products/new/page.tsx`.

## TypeScript Patterns

- The root `tsconfig.json` is strict and opinionated: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and `noUnusedParameters` are enabled for packages that extend it.
- `apps/api/tsconfig.json` and `packages/shared/tsconfig.json` extend the root config and emit build artifacts, while the Next apps use local `noEmit` configs in `apps/dashboard/tsconfig.json` and `apps/scanner/tsconfig.json`.
- Type inference is preferred over manual duplication. Common patterns include `z.infer` in `apps/api/src/config.ts` and literal arrays with `as const` in `apps/api/src/routes/products/create.ts` and `apps/dashboard/src/app/dashboard/products/new/page.tsx`.
- Shared domain types are expressed as interfaces and exported centrally from `packages/shared/src/types/*.ts` and `packages/shared/src/index.ts`.
- React state is mostly local and explicit with `useState`, `useEffect`, `useRef`, and `useCallback`, as seen in `apps/scanner/src/app/scan/page.tsx` and `apps/dashboard/src/components/batch-import-dialog.tsx`.
- `@tanstack/react-query` is installed and provided in `apps/dashboard/src/components/providers/wallet-provider.tsx`, but most dashboard data fetching still goes through the custom `api()` wrapper in `apps/dashboard/src/lib/api.ts` rather than `useQuery`/`useMutation` hooks.

## Component And Module Organization

- The dashboard follows a layered structure:
  - Route entries in `apps/dashboard/src/app/...`
  - feature components in `apps/dashboard/src/components/...`
  - design-system primitives in `apps/dashboard/src/components/ui/...`
  - helpers in `apps/dashboard/src/lib/...`
- The scanner app is much thinner and keeps most of its behavior directly in route files such as `apps/scanner/src/app/page.tsx` and `apps/scanner/src/app/scan/page.tsx`.
- The website app is content- and presentation-oriented; layout/navigation helpers live under `website/src/components/...` and content parsing helpers under `website/src/lib/...`.
- API organization is domain-first rather than service-layer-heavy. Route handlers often define their request schemas inline and call Prisma or plugins directly from the same file, e.g. `apps/api/src/routes/auth/login.ts` and `apps/api/src/routes/products/create.ts`.
- Contract code is separated by concern: interfaces in `contracts/src/interfaces`, implementations in folders like `contracts/src/token`, `contracts/src/identity`, and `contracts/src/compliance/modules`.

## Validation And Error Handling

- Zod is the dominant validation mechanism for backend and shared TypeScript code. Reusable primitives live in `packages/shared/src/validation/*.ts`, while route-specific schemas are defined inline in handlers such as `apps/api/src/routes/auth/login.ts`, `apps/api/src/routes/products/create.ts`, and `apps/api/src/routes/audit/export.ts`.
- Backend request validation generally uses `.safeParse(...)` plus early returns. Invalid input is returned as:
  - `success: false`
  - `error.code`
  - `error.message`
  - optional `error.details` from `parsed.error.flatten().fieldErrors`
- API success and error payloads are intentionally uniform with wrappers defined in `packages/shared/src/types/api.ts` and reused conceptually across routes like `apps/api/src/routes/products/list.ts` and `apps/api/src/routes/auth/me.ts`.
- Business-rule failures are usually handled inline with `reply.status(...).send(...)`. A small typed exception path exists via `RouteError` in `apps/api/src/utils/route-error.ts`, used in more transactional handlers such as `apps/api/src/routes/products/mint.ts`, `apps/api/src/routes/products/recall.ts`, and `apps/api/src/routes/products/transfer.ts`.
- Frontend code normally catches `ApiError` from `apps/dashboard/src/lib/api.ts` and maps it into local error state, as in `apps/dashboard/src/app/register/page.tsx` and `apps/dashboard/src/app/dashboard/products/new/page.tsx`.
- Solidity uses a mixed style:
  - `require(...)` strings remain common in implementation contracts like `contracts/src/token/GalileoToken.sol`.
  - custom errors are defined heavily in interfaces and some implementations, e.g. `contracts/src/interfaces/token/IGalileoToken.sol` and `contracts/src/identity/GalileoTrustedIssuersRegistry.sol`.

## Environment And Configuration

- Backend configuration is centralized and validated at startup in `apps/api/src/config.ts`, which loads `dotenv/config` and parses `process.env` with Zod before exporting `config`.
- Prisma uses a separate typed config in `apps/api/prisma.config.ts`, also loading `dotenv/config` and defaulting to a local Postgres URL when unset.
- Backend plugins read env directly only for narrowly scoped behavior, such as `apps/api/src/plugins/chain.ts` using `DEPLOYER_PRIVATE_KEY` and `apps/api/src/plugins/rate-limit.ts` disabling itself when `NODE_ENV === "test"`.
- The dashboard treats `NEXT_PUBLIC_API_URL` as required in production and throws during build/runtime resolution if absent; see `apps/dashboard/src/lib/constants.ts`.
- The scanner uses a looser public env fallback in `apps/scanner/src/app/page.tsx`, defaulting `NEXT_PUBLIC_RESOLVER_BASE_URL` to `http://localhost:4000`.
- The website reads `NODE_ENV` for content visibility rules in `website/src/lib/blog.ts`; no broader runtime env validation layer is present there.

## Repo-Specific Style Signals

- There is no single formatting dialect across the whole repo. Hand-written app code often uses semicolons and broader comments, e.g. `apps/api/src/server.ts` and `apps/dashboard/src/app/dashboard/products/new/page.tsx`, while generated or shadcn-style UI primitives in `apps/dashboard/src/components/ui/button.tsx` and `apps/dashboard/src/lib/utils.ts` are semicolon-free.
- Comments tend to explain security or runtime intent rather than syntax, especially in the API and contracts code, for example `apps/api/src/plugins/rate-limit.ts`, `apps/api/src/lib/api.ts`, and `contracts/test/integration/FullLifecycle.t.sol`.
- Security-sensitive behavior is made visible in code structure rather than hidden behind abstractions:
  - request redaction in `apps/api/src/server.ts`
  - CSRF header enforcement in `apps/api/src/middleware/csrf.ts`
  - cookie-based JWT auth in `apps/api/src/plugins/auth.ts`
- No repo-wide formatter config is checked in at the root. ESLint is present per package (`apps/api/eslint.config.js`, `apps/dashboard/eslint.config.mjs`, `packages/shared/eslint.config.js`, `website/eslint.config.mjs`), but formatting consistency depends on local tool defaults and generated code style.

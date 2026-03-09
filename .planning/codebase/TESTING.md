# Testing

## Current Test Stack

- `apps/api` uses Vitest with a Node environment via `apps/api/vitest.config.ts`.
- `packages/shared` also uses Vitest via `packages/shared/vitest.config.ts`.
- `apps/dashboard` uses Playwright for end-to-end coverage via `apps/dashboard/playwright.config.ts`.
- `contracts` uses Foundry tests (`*.t.sol`) driven by `contracts/foundry.toml`.
- No test runner configuration is present for `apps/scanner`.
- No test runner configuration is present for `website`.

## Test File Locations

- API tests live in `apps/api/test/*.test.ts`. The current suite is large and endpoint-focused, with files such as `apps/api/test/auth.test.ts`, `apps/api/test/products.test.ts`, `apps/api/test/security-hardening.test.ts`, and `apps/api/test/webhooks.test.ts`.
- Shared-package tests live in `packages/shared/test/*.test.ts`, e.g. `packages/shared/test/gtin.test.ts`, `packages/shared/test/did.test.ts`, and `packages/shared/test/auth.test.ts`.
- Dashboard E2E tests live in `apps/dashboard/e2e/*.spec.ts`, with authentication bootstrap in `apps/dashboard/e2e/auth.setup.ts`.
- Solidity tests live under `contracts/test/**/**/*.t.sol`, for example `contracts/test/token/GalileoToken.t.sol`, `contracts/test/compliance/GalileoCompliance.t.sol`, and `contracts/test/integration/FullLifecycle.t.sol`.
- There are no `*.test.*`, `*.spec.*`, `__tests__`, or `e2e` files under `apps/scanner`.
- There are no `*.test.*`, `*.spec.*`, `__tests__`, or `e2e` files under `website`.

## API Test Patterns

- The API suite behaves like integration testing around a real Fastify app instance. Most files call `buildApp()` from `apps/api/src/server.ts` and exercise routes with `app.inject(...)`, as seen in `apps/api/test/auth.test.ts`, `apps/api/test/products.test.ts`, and `apps/api/test/audit-export.test.ts`.
- The suite uses a real Postgres test database. `apps/api/test/global-setup.ts` sets `DATABASE_URL`, runs `pnpm prisma db push`, and truncates tables after the run.
- Individual tests also reset state aggressively with `cleanDb()` from `apps/api/test/helpers.ts`, typically in `beforeEach`.
- Tests frequently create users and sessions by calling real auth endpoints, then reuse cookies parsed by `parseCookies()` in `apps/api/test/helpers.ts`.
- Mocking is selective rather than total. External chain dependencies are commonly stubbed with `vi.mock(...)` for `viem`, `viem/accounts`, and `viem/chains` in files such as `apps/api/test/transfer.test.ts`, `apps/api/test/recall.test.ts`, and `apps/api/test/webhooks.test.ts`.
- Simpler plugin-level behavior is tested with lightweight Fastify instances and manual decorators, e.g. `apps/api/test/health.test.ts` and `apps/api/test/sentry.test.ts`.
- The suite emphasizes security and behavioral regressions, not just happy paths. Examples include `apps/api/test/security-hardening.test.ts`, `apps/api/test/csrf-resolver-conformity.test.ts`, and `apps/api/test/logging.test.ts`.

## Shared Package Test Patterns

- `packages/shared` is covered by narrow unit tests against pure functions and schemas.
- Tests are direct and deterministic, with no mocking infrastructure in the current files.
- Coverage focus is on domain helpers and reusable contracts:
  - GTIN validation in `packages/shared/test/gtin.test.ts`
  - DID generation/validation in `packages/shared/test/did.test.ts`
  - auth schema behavior in `packages/shared/test/auth.test.ts`
  - public/internal user typing expectations in `packages/shared/test/user-types.test.ts`
- `packages/shared/vitest.config.ts` is the only first-party config that enables code coverage collection (`provider: "v8"` and `include: ["src/**/*.ts"]`).

## Dashboard E2E Patterns

- Playwright is configured to run serially (`workers: 1`, `fullyParallel: false`) in `apps/dashboard/playwright.config.ts`.
- The dashboard suite is true cross-service E2E, not isolated browser-only testing:
  - it boots the API by running `cd ../api && pnpm build && PORT=4000 npx tsx dist/main.js`
  - it boots the dashboard via `pnpm build && PORT=3000 pnpm start`
- Auth is established once in `apps/dashboard/e2e/auth.setup.ts`, which registers a user through the UI and saves `playwright/.auth/user.json`.
- Most specs then reuse that stored session with `test.use({ storageState: "playwright/.auth/user.json" })`, as in `apps/dashboard/e2e/batch-import.spec.ts`.
- Tests interact with the real UI and real backend responses rather than mocking the network. Examples:
  - product lifecycle flow in `apps/dashboard/e2e/product-lifecycle.spec.ts`
  - audit export behavior in `apps/dashboard/e2e/audit-export.spec.ts`
  - file upload/import flows in `apps/dashboard/e2e/batch-import.spec.ts` and `apps/dashboard/e2e/product-upload.spec.ts`
  - auth and wallet-oriented flows in `apps/dashboard/e2e/siwe-login.spec.ts` and `apps/dashboard/e2e/wallet-auth.spec.ts`
- E2E fixtures are lightweight and ad hoc. Specs generate timestamp-based unique identifiers and temporary CSV files locally, e.g. `apps/dashboard/e2e/batch-import.spec.ts`.

## Contract Test Patterns

- Solidity tests are written with Foundry conventions: `contract <Name>Test is Test`, `setUp()`, `vm.prank`, `vm.expectRevert`, `vm.expectEmit`, and `vm.mockCall`.
- The suite mixes unit-style isolation and broader integration-style composition:
  - `contracts/test/token/GalileoToken.t.sol` isolates token logic by mocking external registry/compliance contracts.
  - `contracts/test/compliance/GalileoCompliance.t.sol` mocks modules and token callbacks.
  - `contracts/test/integration/FullLifecycle.t.sol` composes multiple real Galileo contracts while mocking ONCHAINID edges.
- Tests often mirror events locally because of Solidity 0.8.17 limitations, as called out in `contracts/test/token/GalileoToken.t.sol` and `contracts/test/infrastructure/GalileoAccessControl.t.sol`.
- The contract suite is concentrated on business rules, permissions, module wiring, and lifecycle behavior rather than fuzzing or invariant/property testing. No invariant test files are present under `contracts/test`.

## Fixtures, Mocks, And Test Data

- API fixtures are mostly code-built rather than file-based:
  - users, brands, and products are created through route calls or Prisma inside test files like `apps/api/test/webhooks.test.ts`
  - cookies are extracted from live auth responses through `apps/api/test/helpers.ts`
  - DB cleanup is done by SQL truncation in `apps/api/test/helpers.ts`
- Dashboard fixtures are browser-state and temp-file based:
  - persistent auth state in `playwright/.auth/user.json`
  - generated CSV files under `playwright/.tmp` from `apps/dashboard/e2e/batch-import.spec.ts`
- Contract fixtures are almost entirely programmatic. Common tools are `makeAddr`, `vm.mockCall`, `vm.mockCallRevert`, `vm.warp`, and direct contract deployment in `setUp()`.
- There is no shared, repo-wide test fixture library spanning API, frontend, and contracts.

## Coverage Posture

- The implemented test surface is strongest in `apps/api` and `contracts`, with additional targeted unit coverage in `packages/shared` and workflow coverage in `apps/dashboard/e2e`.
- Coverage reporting is not unified across the repo:
  - `packages/shared` has Vitest coverage config in `packages/shared/vitest.config.ts`
  - `apps/api` does not configure coverage in `apps/api/vitest.config.ts`
  - `apps/dashboard` Playwright config does not collect coverage
  - `contracts/foundry.toml` does not wire coverage commands
- Contract vendor libraries under `contracts/lib/**` include their own coverage scripts, but those belong to dependencies, not the first-party Galileo contract suite.
- There is no root-level threshold enforcement or combined coverage report in `package.json` or `turbo.json`.

## Notable Gaps

- `apps/scanner` has production code but no automated test suite.
- `website` has production code but no automated test suite.
- The dashboard has E2E coverage, but there are no component or unit tests under `apps/dashboard/src`.
- The root `pnpm test` script maps to Turbo tasks, which currently covers workspaces with a `test` script (`apps/api` and `packages/shared`), but not the first-party Foundry contracts or dashboard E2E runs.
- The root `pnpm test:e2e` script maps to Turbo `test:e2e`, which currently lines up with `apps/dashboard/package.json`; scanner and website are outside that posture.
- API tests depend on a locally reachable Postgres instance and a successful `prisma db push`, so they are heavier and more environment-sensitive than pure unit tests.
- No evidence of snapshot testing, visual regression testing, browser component testing, or contract invariant/fuzz testing was found in first-party code.

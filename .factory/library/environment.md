# Environment

Environment variables, external dependencies, and setup notes.

---

## PostgreSQL
- Running via Homebrew (PostgreSQL 14) on localhost:5432
- Local connections use the OS user (detected dynamically via `whoami` or `$PGUSER`)
- Dev database: galileo_dev
- Test database: galileo_test
- Test connection: controlled by `DATABASE_URL_TEST` env var (fallback: `postgresql://postgres@localhost:5432/galileo_test`)
- Dev connection: controlled by `DATABASE_URL` env var in `apps/api/.env`
- `.factory/init.sh` auto-detects the OS user and exports `DATABASE_URL_TEST`

## Node.js
- Version 22 (specified in .nvmrc)
- Current: v22.22.0

## Package Manager
- pnpm 10.30.0
- Workspace: apps/* and packages/* only
- website/ and contracts/ are NOT in the workspace

## Playwright
- Version 1.58.2 (installed globally)
- E2E config: apps/dashboard/playwright.config.ts
- E2E tests: apps/dashboard/e2e/

## Turbo passThroughEnv
- turbo.json `test` task has `passThroughEnv: ["DATABASE_URL_TEST"]`
- If you add a new env var needed by tests, you MUST add it to turbo.json `passThroughEnv` for the `test` task — otherwise turbo caching will mask it and tests silently use fallback values

## Vitest — API Test Isolation
- `fileParallelism: false` is set in apps/api/vitest.config.ts
- Required because API test files share the same galileo_test database
- Running test files in parallel causes foreign key violations during beforeEach cleanup hooks
- Do NOT remove this setting when adding new test files

## Prisma 7 Quirks
- `prisma db push` no longer supports `--skip-generate` flag (removed in Prisma 7)
- Use `--url` flag to override the datasource URL at push time (e.g., `prisma db push --url <connection_string>`)
- Configuration lives in `prisma.config.ts` (not package.json)
- Generator output path: `../src/generated/prisma`

## ESLint Compatibility
- ESLint is pinned to ^9 in workspace packages (flat config format)
- Verify compatibility with ESLint 9 when adding plugins

## API Environment Variables
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Min 32 chars, used for access tokens
- JWT_REFRESH_SECRET: Min 32 chars, used for refresh tokens
- PORT: Default 4000
- CORS_ORIGIN: Default http://localhost:3000 (must be explicit, not wildcard, for credentials)
- NODE_ENV: development | production | test
- DEPLOYER_PRIVATE_KEY: Optional. If absent, chain features disabled (mock mode).

## Dashboard Environment Variables
- NEXT_PUBLIC_API_URL: API base URL. Required in production, defaults to http://localhost:4000 in dev.

## New Dependencies (Sprint 2)
- viem: Ethereum client library (for chain plugin, mocked in tests)
- @fastify/cookie: Cookie parsing and setting for httpOnly auth
- qrcode + @types/qrcode: QR code PNG generation
- @playwright/test: E2E testing (devDependency in apps/dashboard)

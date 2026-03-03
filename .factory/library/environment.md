# Environment

Environment variables, external dependencies, and setup notes.

---

## PostgreSQL
- Running via Homebrew (PostgreSQL 14) on localhost:5432
- System user: pierrebeunardeau (no password needed for local connections)
- Dev database: galileo_dev
- Test database: galileo_test
- Dev connection: postgresql://pierrebeunardeau@localhost:5432/galileo_dev
- Test connection: postgresql://pierrebeunardeau@localhost:5432/galileo_test

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

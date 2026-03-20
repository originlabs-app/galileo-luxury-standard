# Galileo Protocol

## Overview

B2B SaaS platform enabling luxury brands to authenticate products via blockchain-backed Digital Product
Passports (DPP). Compliant with EU ESPR 2024/1781. pnpm Turborepo monorepo: Fastify 5 API + Next.js
dashboard + scanner PWA + Solidity contracts.

## Build / test / lint

```bash
pnpm install                                          # install all deps
pnpm dev                                              # start all dev servers
pnpm turbo build                                      # production build
pnpm turbo typecheck                                  # TypeScript validation
pnpm turbo lint                                       # ESLint
pnpm test                                             # unit tests (372)
pnpm --filter dashboard exec playwright test          # E2E tests (9 specs)
pnpm db:push                                          # push Prisma schema to DB
pnpm db:seed                                          # seed with sample data
pnpm --filter @galileo/api exec prisma generate       # regenerate Prisma client after schema changes
```

Copy env: `cp apps/api/.env.example apps/api/.env`
Test DB: set `DATABASE_URL_TEST` pointing to `galileo_test` (separate from dev DB).

## Architecture

| Workspace | Port | Role |
|-----------|------|------|
| `apps/api` | 4000 | Fastify 5 API — auth, products, blockchain, webhooks |
| `apps/dashboard` | 3000 | Next.js 16 B2B portal — product lifecycle management |
| `apps/scanner` | 3001 | Next.js 16 PWA — consumer QR verification |
| `apps/website` | — | Documentation portal |
| `packages/shared` | — | Shared Zod schemas, GTIN utils, DID generation |
| `contracts/` | — | Solidity ERC-3643 interfaces (Foundry) |

API only via Fastify routes — no Next.js Route Handlers anywhere.

## Development workflow

- Commits: conventional — `type(scope): description` (feat, fix, refactor, docs, test, chore)
- Run `pnpm turbo typecheck && pnpm test` before committing

## Prohibited patterns

- No Next.js Route Handlers in dashboard or scanner (all API calls go to Fastify at port 4000)
- No SQLite, no alternative ORM (PostgreSQL + Prisma only)
- No localStorage for tokens (httpOnly cookies only, no exceptions)
- No `any` in TypeScript — use `unknown` when type is truly unknown
- No JSON Schema for Fastify body/response — Zod only via `@fastify/type-provider-zod`
- No `pnpm install` without `--frozen-lockfile` in CI

## Domain terminology

- **DPP** — Digital Product Passport (EU regulation ESPR 2024/1781)
- **GTIN** — Global Trade Item Number (14-digit with check digit, GS1 standard)
- **DID** — Decentralized Identifier: `did:galileo:{gtin}:{serial}` format
- **GS1 Digital Link** — `/01/{gtin}/21/{serial}` resolver URL pattern
- **ERC-3643** — Compliant token standard for regulated asset transfers on Base
- **BRAND_ADMIN** — Role with product management capabilities, always scoped to one brand via `brandId`
- **ADMIN** — Super-admin (audit log, webhooks, cross-brand access)

## Known gotchas

- Prisma client is generated to `src/generated/prisma` (not default) — run `prisma generate` after any schema change
- `pnpm turbo typecheck` (not `pnpm typecheck`) — Turborepo pipeline required
- CSRF header `X-Galileo-Client` required on POST/PATCH/DELETE/PUT — dashboard sends automatically via central API helper
- Wallet auth (SIWE) uses one-time nonces — 5-min TTL, cannot reuse
- `__Host-` cookie prefix requires HTTPS in production — behaves differently locally
- Test isolation: `galileo_test` DB via `DATABASE_URL_TEST` env var

## How to pick up work

1. Read `docs/PLANS.md` — pick an item from `## Now`
2. If it links to an ExecPlan, read it
3. Verify ExecPlan references are still valid before starting
4. Implement slice by slice, run `pnpm turbo typecheck && pnpm test` after each slice
5. Use `/commit-harness` for each commit, `/pr-harness` when ready to merge

## Browser automation

Use `agent-browser` for web testing and verification. Always on localhost, never production.

```bash
agent-browser open http://localhost:3000   # navigate to page
agent-browser snapshot -i                  # get interactive elements with refs
agent-browser click @e1                    # interact using refs
agent-browser fill @e2 "text"             # fill input
```

Run `agent-browser --help` for all commands.

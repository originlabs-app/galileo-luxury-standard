# User Testing

Testing surface: tools, URLs, setup steps, isolation notes, known quirks.

**What belongs here:** How to manually test the application, entry points, testing tools, known issues.

---

## Testing Tools
- **curl**: Available for API endpoint testing
- **agent-browser**: For dashboard/scanner UI testing (may need connection)
- **psql**: For database state verification

## Entry Points
- API: http://localhost:4000
  - Health: GET /health
  - Swagger: GET /docs
  - Auth: POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me
- Dashboard: http://localhost:3000
  - Login: /login
  - Register: /register
  - Dashboard: /dashboard
  - Products: /dashboard/products
- Scanner: http://localhost:3001

## Setup Steps for Testing
1. Ensure PostgreSQL is running on port 5432
2. Start API: `cd apps/api && PORT=4000 pnpm dev`
3. Start Dashboard: `cd apps/dashboard && PORT=3000 pnpm dev`
4. Start Scanner: `cd apps/scanner && PORT=3001 pnpm dev`
5. Or start all: `pnpm dev` from root

## Test Accounts
- Register a new account via POST /auth/register or the /register page
- No pre-seeded accounts in dev environment

## Known Quirks
- esbuild build scripts are ignored (pnpm approve-builds needed to allow them)
- Only 2 workspace projects: @galileo/shared (packages/shared). No apps yet in monorepo-infra milestone.
- website/ uses npm (not pnpm), contracts/ uses forge

## Flow Validator Guidance: CLI/Terminal

All monorepo-infra assertions are tested via terminal commands. No browser or running services needed.

**Isolation rules:**
- Each flow validator runs read-only commands (`pnpm install`, `pnpm build`, `pnpm test`, etc.)
- No shared state conflicts — terminal commands are safe to run in parallel
- Do NOT modify any source files
- Do NOT start any services (no `pnpm dev`)
- Work from the repo root: `/Users/pierrebeunardeau/GalileoLuxury`

**How to report results:**
Write a JSON file to `.factory/validation/monorepo-infra/user-testing/flows/<group-id>.json` with format:
```json
{
  "groupId": "<group-id>",
  "assertions": {
    "<assertion-id>": {
      "status": "pass" | "fail" | "blocked",
      "evidence": "description of what was observed",
      "command": "command run",
      "exitCode": 0
    }
  },
  "frictions": [],
  "blockers": [],
  "toolsUsed": ["terminal"]
}
```

**Command reference:**
- `pnpm install` — install all workspace deps
- `pnpm build` — build all packages via Turborepo
- `pnpm lint` — lint all packages
- `pnpm typecheck` — typecheck all packages
- `pnpm test` — run all tests via Vitest
- `cd website && npm ci && npm run build` — verify website independently
- `cd contracts && forge build && forge test` — verify contracts independently (requires foundry)
- `pnpm db:push` — push Prisma schema (requires API app which doesn't exist yet in monorepo-infra)

**Important notes for monorepo-infra milestone:**
- Only `packages/shared` exists as a workspace package. `apps/` directory has no packages yet.
- `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio` scripts reference `@galileo/api` which doesn't exist yet — these are expected to fail in this milestone.
- The `contracts/` directory requires Foundry toolchain (`forge`) which may not be installed locally.

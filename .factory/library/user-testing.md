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

## Flow Validator Guidance: API (curl)

All API milestone assertions are tested via `curl` against `http://localhost:4000`. The API server must be running before tests.

**API Base URL:** `http://localhost:4000`

**Pre-seeded data:**
- Brand: "Galileo Luxe" (slug: galileo-luxe, did: did:galileo:brand:galileo-luxe)
- Admin user: email=admin@galileo.test, password=changeme123, role=BRAND_ADMIN

**Isolation rules:**
- Each flow validator uses its own unique email address for registration (e.g., `flow1-user@galileo.test`, `flow2-user@galileo.test`)
- Do NOT use the pre-seeded admin account `admin@galileo.test` for registration (it already exists)
- Each validator can read the pre-seeded data but must not modify other validators' data
- All curl commands target `http://localhost:4000`

**Env vars for API start (already configured in .env):**
```
DATABASE_URL="postgresql://pierrebeunardeau@localhost:5432/galileo_dev"
JWT_SECRET="galileo-dev-jwt-secret-must-be-at-least-32-chars-long"
JWT_REFRESH_SECRET="galileo-dev-jwt-refresh-secret-must-be-32-chars-long"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

**How to report results:**
Write a JSON file to `.factory/validation/api/user-testing/flows/<group-id>.json` with format:
```json
{
  "groupId": "<group-id>",
  "assertions": {
    "<assertion-id>": {
      "status": "pass" | "fail" | "blocked",
      "evidence": "description of what was observed (include actual curl output excerpts)",
      "command": "curl command run",
      "exitCode": 0
    }
  },
  "frictions": [],
  "blockers": [],
  "toolsUsed": ["curl"]
}
```

**Assertion-to-command mapping:**
- Registration: `curl -s -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' -d '{"email":"...","password":"...","brandName":"..."}'`
- Login: `curl -s -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}'`
- Refresh: `curl -s -X POST http://localhost:4000/auth/refresh -H 'Content-Type: application/json' -d '{"refreshToken":"..."}'`
- Me: `curl -s http://localhost:4000/auth/me -H 'Authorization: Bearer <token>'`
- Health: `curl -s http://localhost:4000/health`
- Swagger: `curl -s http://localhost:4000/docs`
- CORS: `curl -s -X OPTIONS http://localhost:4000/health -H 'Origin: http://localhost:3000' -H 'Access-Control-Request-Method: GET' -v`

**JWT decoding (without jq):**
To decode a JWT payload: `echo '<token>' | cut -d. -f2 | base64 -d 2>/dev/null`

**Prisma schema location:** `apps/api/prisma/schema.prisma`

**Important notes for api milestone:**
- The API uses Prisma 7 with `prisma.config.ts` (not prisma.config in package.json)
- Seed is run via `npx tsx prisma/seed.ts` from apps/api/ (not `pnpm prisma db seed`)
- VAL-API-012 (env validation fail-fast) requires starting the API WITHOUT env vars — do this in a subprocess
- VAL-API-014 (no PII in logs) requires capturing API stdout during auth operations
- VAL-API-018 (Prisma schema completeness) requires inspecting the schema file, not curl

## Flow Validator Guidance: Dashboard Browser (agent-browser)

Dashboard and scanner assertions are tested via `agent-browser` skill against the running Next.js apps.

**URLs:**
- Dashboard: http://localhost:3000
- Scanner: http://localhost:3001
- API: http://localhost:4000

**Services are already running.** Do NOT start or stop any services.

**Testing tool:** Use the `agent-browser` skill (invoke via Skill tool). Each subagent MUST use a unique browser session ID based on their assigned session prefix.

**Isolation rules:**
- Each flow validator gets its own unique browser session (different `--session` values)
- Each flow validator uses its own unique email for registration (NEVER use another validator's email)
- Do NOT clear browser storage/cookies for other sessions
- Do NOT modify database records created by other validators
- Do NOT call any service stop/start commands

**Pre-existing accounts in database:**
- `admin@galileo.test` / `changeme123` (BRAND_ADMIN, has brand "Galileo Luxe")
- `flow2-brand@galileo.test` / `TestPass123!` (BRAND_ADMIN, has brand "Flow2 Brand")

**How to report results:**
Write a JSON file to `.factory/validation/dashboard-scanner/user-testing/flows/<group-id>.json` with format:
```json
{
  "groupId": "<group-id>",
  "assertions": {
    "<assertion-id>": {
      "status": "pass" | "fail" | "blocked",
      "evidence": "description of what was observed (include screenshot descriptions, URL changes, visible elements)"
    }
  },
  "frictions": ["any UX friction observed"],
  "blockers": ["any blocking issues"],
  "toolsUsed": ["agent-browser"]
}
```

**Common testing patterns:**
1. Navigate to URL, take snapshot, verify content
2. Fill form fields, click submit, wait for navigation/response
3. Check URL after redirect
4. Take screenshots for visual evidence (theme colors, layout)

**Important notes:**
- Dashboard uses Next.js App Router — pages may take a moment to hydrate
- Auth tokens are stored in localStorage
- After login/register success, the app redirects to /dashboard
- After logout, tokens are cleared and user is redirected to /login
- The sidebar has disabled items (Transfers, Settings) that should be visually distinct
- VAL-DASH-013 and VAL-SCAN-002 (build assertions) should be tested via terminal `pnpm build` command, not browser

---
name: backend-worker
description: Builds Fastify API endpoints, Prisma schema, authentication, middleware, and backend tests
---

# Backend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- Fastify API routes and plugins
- Prisma schema design and migrations
- Authentication (httpOnly cookies, JWT, bcrypt, refresh tokens)
- Middleware (RBAC, CORS, auth guards)
- API tests (Vitest + Fastify inject)
- OpenAPI / Swagger configuration
- Blockchain integration (viem, mock mode)

## Work Procedure

1. **Read the feature description thoroughly.** Understand every precondition, expected behavior, and verification step.

2. **Read AGENTS.md** for mission boundaries, coding conventions, and known issues.

3. **Check preconditions.** Verify that dependencies from previous features exist:
   - Is the Prisma schema up to date? Run `cd apps/api && pnpm prisma db push`
   - Are shared types available from `@galileo/shared`?
   - Does the Fastify app bootstrap correctly?
   - Is the test database (galileo_test) accessible?

4. **Write tests FIRST (red).** Before any route or service implementation:
   - Use Vitest with Fastify's `inject()` method for route testing
   - For cookie-based auth: set cookies in inject headers: `headers: { cookie: 'galileo_at=<token>' }`
   - Cover: happy path, validation errors, auth errors, RBAC, edge cases
   - Each endpoint needs at minimum: success case, validation failure, auth failure, brand scoping
   - Mock viem with `vi.mock('viem')` for chain-related tests
   - Run tests to confirm they fail

5. **Implement to make tests pass (green).**
   - Follow Fastify 5 patterns (plugin system, schema validation)
   - Use Zod for request/response validation
   - Auth: extract JWT from `galileo_at` cookie (not Authorization header)
   - Set cookies with: `reply.setCookie('galileo_at', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 900 })`
   - CORS: ensure `credentials: true` in @fastify/cors config
   - Response envelope: `{ success: true, data: { ... } }` for all responses
   - Product brand scoping: filter by user's brandId unless ADMIN
   - Refresh tokens: hash with SHA-256 before DB storage
   - JWT payload: ONLY { sub: userId, role, brandId } — NO PII
   - Logging: NEVER log emails, passwords, or names — only user IDs
   - Import shared functions from `@galileo/shared` (validateGtin, generateDid, etc.)

6. **Prisma schema changes:**
   - Edit `apps/api/prisma/schema.prisma`
   - Run `cd apps/api && pnpm prisma db push` to apply to dev DB
   - The test setup will push to galileo_test automatically
   - After adding new enum values, regenerate client: `cd apps/api && pnpm prisma generate`

7. **Verify with all validators:**
   ```bash
   pnpm build            # API builds
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   pnpm test             # All tests pass (unit tests against galileo_test)
   ```

8. **Manual verification with curl:**
   - Start the API: check `.factory/services.yaml` for the start command
   - Test EACH endpoint with curl using cookies:
     ```bash
     # Login (get cookies)
     curl -v -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}' 2>&1 | grep Set-Cookie
     # Authenticated request with cookie
     curl -s http://localhost:4000/auth/me -b "galileo_at=<token>"
     # Product creation
     curl -s -X POST http://localhost:4000/products -b "galileo_at=<token>" -H 'Content-Type: application/json' -d '{"gtin":"...","serialNumber":"...","name":"...","category":"..."}'
     ```
   - Each curl = one `interactiveChecks` entry
   - **STOP the API server after testing**

## When to Return to Orchestrator

- PostgreSQL is not accessible on localhost:5432
- Prisma schema from previous feature is missing or broken
- @galileo/shared package is not importable
- Environment file (.env) is missing required variables
- Port 4000 is already in use
- Test database galileo_test not created (run init.sh)

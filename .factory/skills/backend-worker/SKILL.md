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
- Authentication (JWT, bcrypt, refresh tokens)
- Middleware (RBAC, CORS, auth guards)
- API tests
- OpenAPI / Swagger configuration

## Work Procedure

1. **Read the feature description thoroughly.** Understand every precondition, expected behavior, and verification step.

2. **Check preconditions.** Verify that dependencies from previous features exist:
   - Is the Prisma schema created? Can you run `pnpm db:push`?
   - Are shared types available from `@galileo/shared`?
   - Does the Fastify app bootstrap correctly?

3. **Write tests FIRST (red).** Before any route or service implementation:
   - Use Vitest with Fastify's `inject()` method for route testing
   - Cover: happy path, validation errors, auth errors, edge cases
   - Each endpoint needs at minimum: success case, validation failure, auth failure
   - Run tests to confirm they fail

4. **Implement to make tests pass (green).**
   - Follow Fastify 5 patterns (plugin system, schema validation)
   - Use Zod for request/response validation with @fastify/type-provider-zod or manual integration
   - Passwords: bcrypt with cost factor 12
   - JWTs: access token 15min, refresh token 7d
   - JWT payload: ONLY { sub: userId, role, brandId } — NO PII
   - Logging: NEVER log emails, passwords, or names — only user IDs
   - Import shared types from `@galileo/shared` where applicable

5. **Verify with all validators:**
   ```bash
   pnpm build            # API builds
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   pnpm test             # All tests pass (including new ones)
   ```

6. **Manual verification with curl:**
   - Start the API: check `.factory/services.yaml` for the start command
   - Test EACH endpoint with curl:
     ```bash
     # Health
     curl -s http://localhost:4000/health | jq .
     # Register
     curl -s -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"changeme123"}' | jq .
     # Login
     curl -s -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"changeme123"}' | jq .
     # Me (with token)
     curl -s http://localhost:4000/auth/me -H 'Authorization: Bearer <token>' | jq .
     ```
   - Each curl = one `interactiveChecks` entry with the exact command, response code, and key observations
   - **STOP the API server after testing** (kill the process by PID)

7. **Clean up test data:** If you created test users in the database during manual testing, note it but don't worry about cleanup for dev environment.

## Example Handoff

```json
{
  "salientSummary": "Implemented Fastify API auth system: POST /auth/register (with optional brand creation), POST /auth/login, POST /auth/refresh, GET /auth/me, GET /health. All 18 test cases pass via Fastify inject. Manual curl testing confirmed all endpoints return correct status codes and JWT tokens decode to minimal payload.",
  "whatWasImplemented": "apps/api/ with Fastify 5 bootstrap, Prisma plugin (client lifecycle), JWT auth plugin (@fastify/jwt), CORS plugin, Zod env validation (fail-fast). Routes: /auth/register (creates user + optional brand with did:galileo:brand:{slug}), /auth/login (bcrypt verify, returns tokens), /auth/refresh (token rotation), /auth/me (returns user profile without password). /health returns status, version, uptime. RBAC middleware prepared for future use. Swagger at /docs via @fastify/swagger.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "pnpm build", "exitCode": 0, "observation": "API builds without errors" },
      { "command": "pnpm typecheck", "exitCode": 0, "observation": "Zero type errors" },
      { "command": "pnpm lint", "exitCode": 0, "observation": "Zero lint errors" },
      { "command": "pnpm test", "exitCode": 0, "observation": "18 tests passing (12 new auth tests + 6 existing shared tests)" }
    ],
    "interactiveChecks": [
      { "action": "curl POST /auth/register with email+password", "observed": "201 response with accessToken and refreshToken" },
      { "action": "curl POST /auth/register with same email", "observed": "409 Conflict with generic error" },
      { "action": "curl POST /auth/login with correct credentials", "observed": "200 with tokens, decoded JWT shows only sub/role/brandId/iat/exp" },
      { "action": "curl POST /auth/login with wrong password", "observed": "401 Unauthorized, same message as non-existent email" },
      { "action": "curl GET /auth/me with Bearer token", "observed": "200 with user profile, no passwordHash in response" },
      { "action": "curl GET /auth/me without token", "observed": "401 Unauthorized" },
      { "action": "curl GET /health", "observed": "200 with {status:'ok', version, uptime}" },
      { "action": "curl GET /docs", "observed": "200 HTML page with Swagger UI rendered" }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "apps/api/test/auth.test.ts",
        "cases": [
          { "name": "POST /auth/register creates user and returns tokens", "verifies": "Successful registration flow" },
          { "name": "POST /auth/register with duplicate email returns 409", "verifies": "Email uniqueness enforcement" },
          { "name": "POST /auth/register with brandName creates brand with DID", "verifies": "Brand creation on registration" },
          { "name": "POST /auth/login returns tokens for valid credentials", "verifies": "Login success" },
          { "name": "POST /auth/login returns 401 for wrong password", "verifies": "Password validation" },
          { "name": "GET /auth/me returns user for valid token", "verifies": "Authenticated endpoint" },
          { "name": "GET /auth/me returns 401 without token", "verifies": "Auth guard" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- PostgreSQL is not accessible on localhost:5432
- Prisma schema from previous feature is missing or broken
- @galileo/shared package is not importable
- Environment file (.env) is missing required variables and no .env.example exists
- Port 4000 is already in use by another process

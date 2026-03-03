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
- (To be discovered during implementation)

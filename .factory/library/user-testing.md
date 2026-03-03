# User Testing

Testing surface: tools, URLs, setup steps, isolation notes, known quirks.

---

## Testing Tools
- **curl**: API endpoint testing (with cookie auth via `-b "galileo_at=<token>"`)
- **agent-browser**: Dashboard/scanner UI testing
- **Playwright**: E2E tests at apps/dashboard/e2e/
- **psql**: Database state verification

## Entry Points
- API: http://localhost:4000
  - Health: GET /health
  - Swagger: GET /docs (development only)
  - Auth: POST /auth/login, POST /auth/register, POST /auth/refresh, POST /auth/logout, GET /auth/me
  - Products: POST /products, GET /products, GET /products/:id, PATCH /products/:id
  - Mint: POST /products/:id/mint
  - QR: GET /products/:id/qr?size=300
  - Resolver: GET /01/:gtin/21/:serial (PUBLIC, no auth)
- Dashboard: http://localhost:3000
  - Login: /login
  - Register: /register
  - Dashboard: /dashboard
  - Products: /dashboard/products
  - Create Product: /dashboard/products/new
  - Product Detail: /dashboard/products/[id]
- Scanner: http://localhost:3001

## Auth — httpOnly Cookies

Sprint 2 uses httpOnly cookie auth. Key differences from Sprint 1:
- Login/register set cookies automatically (Set-Cookie headers)
- Dashboard uses `credentials:'include'` on all fetch calls
- No localStorage token storage
- curl testing: extract cookie from login response, pass with `-b "galileo_at=<value>"`
- agent-browser: cookies are handled automatically by the browser

**Getting auth cookies with curl:**
```bash
# Login and capture cookies
curl -v -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@galileo.test","password":"changeme123"}' \
  2>&1 | grep 'Set-Cookie'

# Use cookie for authenticated requests
curl -s http://localhost:4000/products -b "galileo_at=<token_value>"
```

## Setup Steps for Testing
1. Ensure PostgreSQL is running on port 5432
2. Run init.sh (creates galileo_dev + galileo_test DBs, pushes schema)
3. Start API: `cd apps/api && PORT=4000 pnpm dev`
4. Start Dashboard: `cd apps/dashboard && PORT=3000 pnpm dev`
5. Or start all: `pnpm dev` from root
6. Seed data: `cd apps/api && npx tsx prisma/seed.ts`

## Test Accounts
- Register new accounts via POST /auth/register or the /register page
- Seeded admin may exist: admin@galileo.test / changeme123 (BRAND_ADMIN, brand: Galileo Luxe)

## Known Quirks
- esbuild build scripts are ignored (pnpm approve-builds needed)
- website/ uses npm (not pnpm), contracts/ uses forge
- API process.exit(1) on port conflict — stop dev server before tests
- Playwright webServer config auto-starts API + Dashboard when running e2e tests

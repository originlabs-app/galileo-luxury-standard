# Context -- Galileo Protocol

> Generated and maintained by the Researcher loop.
> Codebase mapping + architecture analysis + research findings.
> Updated when the codebase structure changes significantly.

## Last Updated

2026-03-08 -- full bootstrap mapping by Researcher loop

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend (Dashboard) | Next.js + React + shadcn/ui + Tailwind | 16.1.6 / 19.2.4 / 4.2.1 |
| Frontend (Scanner) | Next.js + React + barcode-detector | 16.1.6 / 19.2.4 |
| Backend | Fastify 5 | 5.7.4 |
| Database | PostgreSQL | 16+ |
| ORM | Prisma | 7.4.2 |
| Validation | Zod | 4.3.6 |
| Blockchain | viem | 2.46.3 |
| Tests (unit) | Vitest | 4.0.18 |
| Tests (e2e) | Playwright | 1.58.2 |
| Monorepo | pnpm + Turborepo | 10.30.0 / 2.8.12 |

## Architecture Map

```
galileo-protocol/
+-- apps/
|   +-- api/                   # Fastify 5 API server (Prisma, PostgreSQL)
|   |   +-- prisma/schema.prisma
|   |   +-- src/
|   |   |   +-- config.ts              # Env validation (Zod)
|   |   |   +-- main.ts                # Entry point
|   |   |   +-- server.ts              # buildApp() — plugin + route registration
|   |   |   +-- middleware/
|   |   |   |   +-- csrf.ts            # X-Galileo-Client header check
|   |   |   |   +-- rbac.ts            # requireRole() middleware
|   |   |   +-- plugins/
|   |   |   |   +-- auth.ts            # JWT authentication decorator
|   |   |   |   +-- chain.ts           # viem client (mock mode — no deployer key)
|   |   |   |   +-- cookie.ts          # @fastify/cookie (with signing secret)
|   |   |   |   +-- cors.ts            # CORS config
|   |   |   |   +-- prisma.ts          # Prisma client decorator
|   |   |   |   +-- rate-limit.ts      # @fastify/rate-limit (disabled in test)
|   |   |   |   +-- security-headers.ts # @fastify/helmet (disabled in test)
|   |   |   |   +-- storage.ts         # R2/S3 storage + local fallback
|   |   |   +-- routes/
|   |   |   |   +-- auth/              # register, login, logout, refresh, me, link-wallet
|   |   |   |   +-- health.ts          # GET /health
|   |   |   |   +-- products/          # CRUD, mint, qr, recall, transfer, verify, upload
|   |   |   |   +-- resolver/          # GS1 Digital Link resolver
|   |   |   +-- utils/
|   |   |       +-- cookies.ts         # Cookie helpers (set/clear)
|   |   |       +-- password.ts        # bcrypt hash/verify
|   |   |       +-- prisma-errors.ts   # isPrismaUniqueViolation
|   |   |       +-- route-error.ts     # RouteError class
|   |   |       +-- schemas.ts         # errorResponseSchema
|   |   |       +-- slug.ts            # toSlug()
|   |   |       +-- cid.ts             # CIDv1 computation (multiformats)
|   |   |       +-- token-hash.ts      # SHA-256 token hashing
|   |   |       +-- tokens.ts          # JWT generation
|   |   +-- test/
|   |       +-- global-setup.ts        # DB setup + teardown
|   |       +-- helpers.ts             # parseCookies, cleanDb
|   |       +-- auth.test.ts           # 32 tests
|   |       +-- products.test.ts       # 27 tests
|   |       +-- mint.test.ts           # 10 tests
|   |       +-- recall.test.ts         # 10 tests
|   |       +-- transfer.test.ts
|   |       +-- verify.test.ts
|   |       +-- link-wallet.test.ts
|   |       +-- resolver-qr.test.ts    # 17 tests
|   |       +-- upload.test.ts         # 10 tests
|   |       +-- security-hardening.test.ts # 24 tests
|   |       +-- csrf-resolver-conformity.test.ts # 18 tests
|   |       +-- health.test.ts         # 3 tests
|   +-- dashboard/             # Next.js B2B dashboard (shadcn/ui, wagmi)
|   |   +-- src/
|   |       +-- app/
|   |       |   +-- dashboard/         # Authenticated pages (layout, products, detail)
|   |       |   +-- login/page.tsx
|   |       |   +-- register/page.tsx
|   |       +-- components/
|   |       |   +-- auth-guard.tsx     # SSR-safe auth guard
|   |       |   +-- header.tsx
|   |       |   +-- sidebar.tsx
|   |       |   +-- wallet-connection.tsx # wagmi wallet link
|   |       |   +-- providers/wallet-provider.tsx
|   |       |   +-- ui/               # shadcn components
|   |       +-- hooks/use-auth.tsx     # AuthProvider Context
|   |       +-- lib/
|   |           +-- api.ts            # Fetch wrapper
|   |           +-- auth.ts           # Auth utilities
|   |           +-- constants.ts
|   |           +-- wallet.ts         # Wallet config
|   +-- scanner/               # Next.js scanner PWA (QR, barcode-detector)
|       +-- src/app/
|       |   +-- page.tsx              # Verification page
|       |   +-- scan/page.tsx         # QR scanner
|       |   +-- layout.tsx
|       |   +-- register-sw.tsx       # Service worker registration
|       +-- public/sw.js             # Service worker
+-- packages/
|   +-- shared/                # @galileo/shared (Zod schemas, GTIN, DID)
|       +-- src/
|           +-- constants/     # categories, claim-topics, roles
|           +-- types/         # api, brand, event, product, user
|           +-- validation/    # auth, did, gtin, wallet
+-- contracts/                 # Solidity interfaces (ERC-3643)
|   +-- src/                   # Token, compliance, identity, infrastructure
|   +-- test/                  # Foundry tests (722 passing)
|   +-- script/Deploy.s.sol    # Deployment script
+-- specifications/            # Schemas, DID methods, compliance docs
+-- governance/                # TSC charter, anti-dominance rules
+-- website/                   # Next.js documentation portal
+-- release/                   # Release artifacts
```

## Database Schema

5 models: `User`, `Brand`, `Product`, `ProductPassport`, `ProductEvent`

- **User**: id, email, passwordHash, role (enum), brandId?, refreshToken?, walletAddress?
- **Brand**: id, name, slug (unique), did (unique)
- **Product**: id, gtin, serialNumber, did (unique), name, description?, category, status (enum: DRAFT/MINTING/ACTIVE/TRANSFERRED/RECALLED), brandId, walletAddress?, imageUrl?, imageCid?
- **ProductPassport**: id, productId (unique), digitalLink, metadata (JSON), txHash?, tokenAddress?, chainId?, mintedAt?
- **ProductEvent**: id, productId, type (enum: CREATED/UPDATED/MINTED/TRANSFERRED/VERIFIED/RECALLED), data (JSON), performedBy?

Key relations: User -> Brand (many-to-one), Product -> Brand (many-to-one), Product -> ProductPassport (one-to-one), Product -> ProductEvent (one-to-many), ProductEvent -> User (many-to-one via performedBy)

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | public | Create account (+ optional brand) |
| POST | /auth/login | public | Login (sets httpOnly cookies) |
| POST | /auth/logout | authenticated | Clear cookies |
| POST | /auth/refresh | cookie | Refresh access token |
| GET | /auth/me | authenticated | Current user info + walletAddress |
| POST | /auth/link-wallet | authenticated | Link wallet via EIP-191 signature |
| GET | /health | public | Health check |
| POST | /products | BRAND_ADMIN, OPERATOR, ADMIN | Create product |
| GET | /products | authenticated | List products (brand-scoped) |
| GET | /products/:id | authenticated | Get product detail |
| PATCH | /products/:id | BRAND_ADMIN, OPERATOR, ADMIN | Update DRAFT product |
| POST | /products/:id/mint | BRAND_ADMIN, ADMIN | Mock mint (DRAFT -> ACTIVE) |
| GET | /products/:id/qr | authenticated | QR code PNG |
| POST | /products/:id/recall | BRAND_ADMIN, ADMIN | Recall (ACTIVE -> RECALLED) |
| POST | /products/:id/transfer | BRAND_ADMIN, ADMIN | Transfer to wallet |
| POST | /products/:id/upload | BRAND_ADMIN, OPERATOR, ADMIN | Upload product image (multipart) |
| POST | /products/:id/verify | public | Record verification event |
| GET | /01/:gtin/21/:serial | public | GS1 Digital Link resolver (JSON-LD) |

## Patterns & Conventions

- Commit style: `type(scope): description` (conventional commits)
- API route schemas: description/tags/security/params/querystring only -- NO body/response schemas (conflict with Zod)
- ProductEvent.performedBy is nullable (public verify endpoint)
- Product lifecycle: DRAFT -> ACTIVE -> RECALLED; ACTIVE can transfer multiple times
- RouteError shared class in `apps/api/src/utils/route-error.ts`
- errorResponseSchema shared in `apps/api/src/utils/schemas.ts`
- Optimistic concurrency: `updateMany WHERE status=X` + count check
- Rate limiting + helmet disabled in test env (NODE_ENV === "test")
- Wallet constants shared in `packages/shared/src/validation/wallet.ts`
- Resolver includes `provenance` array (public events excluding UPDATED)
- Enums from @galileo/shared (ProductStatus, EventType) -- not raw strings
- Zod `.strict()` on all body schemas (create, update, register, login, link-wallet, recall, verify)
- Plugin architecture: fp() plugins decorate fastify instance
- Config validation: Zod schema in config.ts, loaded once at startup

## Test Architecture

- **Vitest**: 173 API tests across 12 files
- **Playwright**: 2 e2e tests (auth + product lifecycle)
- **Test DB**: `galileo_test` via `DATABASE_URL_TEST`
- **Global setup**: `test/global-setup.ts` -- pushes schema, truncates on teardown
- **File parallelism**: disabled (`fileParallelism: false` in vitest.config.ts)
- **Cleanup**: shared `cleanDb()` helper uses raw SQL TRUNCATE CASCADE (no flaky timeouts)
- **Mocking**: viem mocked in mint.test.ts (vi.mock before imports)

## Known Issues & Tech Debt

1. ~~**Flaky tests**~~ RESOLVED: cleanDb() with TRUNCATE CASCADE replaces cascading deleteMany
2. ~~**No `__Host-` cookie prefix**~~ RESOLVED: `__Host-galileo_at` (access, prod), `__Secure-galileo_rt` (refresh, prod)
3. ~~**No cookie signing**~~ RESOLVED: COOKIE_SECRET env var, @fastify/cookie signing configured
4. ~~**createProductBody lacks `.strict()`**~~ RESOLVED: `.strict()` on all body schemas
5. ~~**No file upload**~~ RESOLVED: POST /products/:id/upload with R2 storage + CIDv1
6. **Blockchain blocked** (P0): real chain deploy needs RPC key
7. **Smart Wallet pending** (P1): ERC-1271 verification not implemented
8. **No GDPR endpoints** (P2): erasure + export not implemented
9. **No multi-tenant isolation** (P2): app-level RBAC only, no database-level RLS
10. **No error tracking** (P2): no Sentry integration
11. **Register route has response schema** (info): register + login have Fastify response schemas which may strip fields -- inherited from Sprint 1, works because fields are explicitly listed

## Research Notes

### Zod v4 `.strict()` behavior
Zod v4 `.strict()` rejects any keys not in the schema. This is the correct behavior for OWASP input validation. `__proto__` and `constructor` keys are NOT special-cased by Zod -- they are treated as unknown keys and rejected by `.strict()`.

### `__Host-` cookie prefix constraints
- Requires `Secure` flag (HTTPS only)
- Requires `Path=/`
- Must NOT have `Domain` attribute
- Incompatible with refresh cookie's `Path=/auth/refresh` -- use `__Secure-` for refresh cookie instead

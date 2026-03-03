# Sprint 1 — Foundations

## You are building

**Galileo Protocol** — a B2B SaaS platform for luxury product authentication via Digital Product Passports (DPP) on Base L2.

The end-to-end flow: a luxury brand creates a product → mints its ERC-3643 on-chain passport → a customer scans a QR code → verifies authenticity via a GS1-conformant resolver.

This is Sprint 1 of 5. Your job is to stand up the full-stack monorepo, auth, database schema, API shell, dashboard shell, and CI. No blockchain integration yet — that's Sprint 2.

---

## What already exists

This repo (`GalileoLuxury/`) already contains:

### Specifications (65 files)
- `specifications/` — 26 markdown specs + 18 JSON schemas + 17 Solidity interfaces
- DID method: `did:galileo:01:{gtin}:21:{serial}` (GS1-native identifiers)
- GS1 Digital Link resolver spec (GSPEC-RESOLVER-002), conformant to GS1 1.2.0
- Digital Product Passport schema, lifecycle events, compliance modules

### Smart Contracts (Foundry, 30 .sol files, 722 tests)
- `contracts/src/token/GalileoToken.sol` — ERC-3643 single-supply token (1 token = 1 physical product)
- `contracts/src/compliance/` — 5 compliance modules (Brand, CPO, Jurisdiction, Sanctions, ServiceCenter)
- `contracts/src/identity/` — ONCHAINID registry (claims, trusted issuers)
- `contracts/src/infrastructure/GalileoAccessControl.sol` — RBAC with ONCHAINID integration
- `contracts/script/Deploy.s.sol` — Full deployment script
- `contracts/test/` — 13 test files, 722 tests passing

### Website (Next.js 16, deployed)
- `website/` — Marketing site + docs + blog + governance pages
- Uses: Next.js (latest), React 19, Tailwind v4, MDX, Vercel Analytics
- Design language: "ABYSSE" (dark ocean theme, cyan/emerald accents)

### Governance & Docs
- `governance/` — Charter, TSC structure, RFC process
- `ROADMAP.md` — Full roadmap with sprint plan and architectural constraints
- `.env.testnet.example` — Environment template with all required vars

---

## Architectural constraints (NON-NEGOTIABLE)

| # | Constraint | Details |
|---|-----------|---------|
| 1 | **ERC-3643 only** | No ERC-721. Product passports are permissioned T-REX tokens with compliance hooks. The contracts already implement this. |
| 2 | **Foundry only** | No Hardhat. Single toolchain. `forge build && forge test`. Already configured in `contracts/foundry.toml`. |
| 3 | **Fastify for API** | Dedicated API server. NOT Next.js Route Handlers. B2B multi-tenant + webhooks + background jobs + chain sync require separation from the frontend. |
| 4 | **No version pinning** | Use latest stable versions. Don't write "Next.js 15" — write "Next.js". The website already runs Next.js 16 / React 19. |
| 5 | **GTIN/serial from day 1** | Product identifiers use `did:galileo:01:{gtin}:21:{serial}`. No UUIDs as primary product IDs. GS1 Digital Link is core. |
| 6 | **T1/LEOX is Sprint 5** | No token, paymaster, or multichain work in Sprint 1-4. Focus on the product flow. |

---

## Sprint 1 scope

### 1. Monorepo setup

Create a **Turborepo** monorepo structure. The existing `website/` and `contracts/` directories stay where they are. Add new `apps/` and `packages/` directories.

```
GalileoLuxury/
├── apps/
│   ├── api/                    # Fastify API server (NEW)
│   ├── dashboard/              # Next.js brand dashboard (NEW)
│   └── scanner/                # Next.js PWA for QR scanning (NEW — shell only)
├── packages/
│   └── shared/                 # Shared types, constants, validation (NEW)
├── contracts/                  # Existing Foundry contracts (KEEP AS-IS)
├── website/                    # Existing marketing site (KEEP AS-IS)
├── specifications/             # Existing specs (KEEP AS-IS)
├── governance/                 # Existing governance docs (KEEP AS-IS)
├── turbo.json                  # Turborepo config (NEW)
├── package.json                # Root workspace config (NEW)
├── pnpm-workspace.yaml         # pnpm workspaces (NEW)
├── ROADMAP.md
└── ...
```

**Important:**
- Use `pnpm` as package manager (consistent with existing website setup)
- The `website/` directory is NOT part of the Turborepo workspace — it's independently deployed on Vercel and has its own `package.json`. Don't break it.
- `contracts/` is Foundry-based (Solidity, no JS toolchain) — also NOT part of the Turborepo workspace
- Only `apps/*` and `packages/*` are in the workspace

### 2. API server (`apps/api/`)

**Stack:** Fastify 5 + TypeScript + Prisma + PostgreSQL

#### Structure:
```
apps/api/
├── src/
│   ├── server.ts               # Fastify app bootstrap
│   ├── config.ts               # Env vars validation (using @fastify/env or zod)
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── register.ts     # POST /auth/register
│   │   │   ├── login.ts        # POST /auth/login
│   │   │   └── me.ts           # GET /auth/me (current user)
│   │   └── health.ts           # GET /health
│   ├── plugins/
│   │   ├── auth.ts             # JWT verification plugin
│   │   ├── prisma.ts           # Prisma client plugin
│   │   └── cors.ts             # CORS config
│   ├── middleware/
│   │   └── rbac.ts             # Role-based access control guard
│   └── utils/
│       └── password.ts         # bcrypt hash/verify
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script for dev
├── test/
│   └── auth.test.ts            # Auth route tests
├── package.json
├── tsconfig.json
└── .env.example
```

#### Auth system:
- Email + password (bcrypt, 12 rounds)
- JWT access tokens (15 min) + refresh tokens (7 days)
- MFA is Sprint 4 (not Sprint 1) — just prepare the DB schema for it
- RBAC roles: `ADMIN` (platform), `BRAND_ADMIN`, `OPERATOR`, `VIEWER`

#### Database schema (Prisma):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  BRAND_ADMIN
  OPERATOR
  VIEWER
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(VIEWER)
  brandId       String?
  brand         Brand?    @relation(fields: [brandId], references: [id])
  walletAddress String?   @unique
  mfaSecret     String?   // TOTP secret, Sprint 4
  mfaEnabled    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([brandId])
}

model Brand {
  id          String    @id @default(cuid())
  name        String
  did         String    @unique  // did:galileo:brand:{slug}
  slug        String    @unique
  logoUrl     String?
  website     String?
  country     String?   // ISO 3166-1 alpha-3
  users       User[]
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([slug])
}

model Product {
  id            String    @id @default(cuid())
  brandId       String
  brand         Brand     @relation(fields: [brandId], references: [id])
  name          String
  gtin          String    // GS1 GTIN-13 or GTIN-14
  serialNumber  String    // GS1 serial number (AI 21)
  did           String    @unique  // did:galileo:01:{gtin}:21:{serial}
  category      String    // watches, jewelry, leather-goods, fashion, etc.
  description   String?
  materials     Json?     // { "case": "18k gold", "strap": "alligator", ... }
  imageUrls     String[]  // R2 URLs
  metadataUri   String?   // CID-based URI for on-chain reference
  cidHash       String?   // CIDv1 computed locally (NOT pinned to IPFS)

  // On-chain state (populated after minting in Sprint 2)
  tokenAddress  String?   // ERC-3643 contract address on Base
  tokenId       BigInt?
  mintTxHash    String?
  chainId       Int?      // 84532 (Sepolia) or 8453 (mainnet)
  mintedAt      DateTime?

  // Status
  status        ProductStatus @default(DRAFT)

  // Relations
  events        ProductEvent[]
  passport      ProductPassport?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([gtin, serialNumber])
  @@index([brandId])
  @@index([did])
  @@index([gtin, serialNumber])
}

enum ProductStatus {
  DRAFT       // Created in dashboard, not minted
  MINTING     // Mint transaction submitted
  MINTED      // On-chain, token exists
  TRANSFERRED // Ownership transferred at least once
  DECOMMISSIONED // Product end-of-life
}

model ProductPassport {
  id          String    @id @default(cuid())
  productId   String    @unique
  product     Product   @relation(fields: [productId], references: [id])
  dppData     Json      // Full DPP JSON-LD document
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum EventType {
  CREATED
  MINTED
  TRANSFERRED
  VERIFIED
  CPO_CERTIFIED
  REPAIRED
  SERVICED
  OWNERSHIP_CHANGED
  DECOMMISSIONED
}

model ProductEvent {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  type        EventType
  data        Json?     // Event-specific payload
  actor       String?   // User ID or wallet address
  txHash      String?   // On-chain transaction hash (if applicable)
  createdAt   DateTime  @default(now())

  @@index([productId])
  @@index([type])
  @@index([createdAt])
}
```

#### API endpoints for Sprint 1:

```
POST   /auth/register     — { email, password, brandName? }
                           → Creates user + optionally creates brand
                           → Returns { user, accessToken, refreshToken }

POST   /auth/login         — { email, password }
                           → Returns { user, accessToken, refreshToken }

POST   /auth/refresh       — { refreshToken }
                           → Returns { accessToken, refreshToken }

GET    /auth/me            — (JWT required)
                           → Returns current user with brand

GET    /health             — No auth
                           → Returns { status: "ok", version, uptime }
```

That's it for Sprint 1 API. Product CRUD endpoints come in Sprint 2.

#### Config validation:

Use Zod to validate environment variables at startup. Required vars:

```
DATABASE_URL        — PostgreSQL connection string
JWT_SECRET          — Min 32 chars
JWT_REFRESH_SECRET  — Min 32 chars
PORT                — Default 4000
CORS_ORIGIN         — Default http://localhost:3000
NODE_ENV            — development | production | test
```

Fail fast if any required var is missing.

#### OpenAPI:

Use `@fastify/swagger` + `@fastify/swagger-ui` for auto-generated API docs at `/docs`.

### 3. Dashboard (`apps/dashboard/`)

**Stack:** Next.js (latest) + Tailwind CSS + shadcn/ui

#### Structure:
```
apps/dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (auth provider, sidebar)
│   │   ├── page.tsx            # Redirect to /dashboard or /login
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Register page
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout (sidebar + header)
│   │       ├── page.tsx        # Dashboard home (stats overview)
│   │       └── products/
│   │           └── page.tsx    # Products list (empty state for now)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── header.tsx          # Top header with user menu
│   │   └── auth-guard.tsx      # Client-side auth redirect
│   ├── lib/
│   │   ├── api.ts              # Fetch wrapper for API calls
│   │   ├── auth.ts             # Token storage, refresh logic
│   │   └── constants.ts        # API URL, etc.
│   └── hooks/
│       └── use-auth.ts         # Auth state hook
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

#### Design:
- **Dark theme** — consistent with the ABYSSE design language (dark backgrounds, cyan/emerald accents)
- Use shadcn/ui components as base — customize colors to match:
  - Background: `#020204` (obsidian)
  - Card: `#0a0a0f` (graphite)
  - Primary: `#00FFFF` (cyan)
  - Success: `#00FF88` (emerald)
  - Text: `#e8e6e3` (platinum)
  - Muted: `#9a9a9a` (silver)
- Serif font: `Cormorant Garamond` (headings)
- Sans font: `Outfit` (body)

#### Pages for Sprint 1:

1. **Login page** (`/login`)
   - Email + password form
   - Link to register
   - Calls `POST /auth/login`
   - Stores JWT in memory (not localStorage — use httpOnly cookie or in-memory + refresh flow)

2. **Register page** (`/register`)
   - Email + password + brand name
   - Calls `POST /auth/register`
   - Redirects to dashboard

3. **Dashboard home** (`/dashboard`)
   - Shows: "Welcome, {name}" + brand name
   - Stats cards (all zeros for now): Products, Minted, Transfers, Verifications
   - Empty activity feed
   - "Create your first product" CTA

4. **Products page** (`/dashboard/products`)
   - Empty state: illustration + "No products yet" + "Create Product" button (disabled, coming Sprint 2)

5. **Sidebar:**
   - Dashboard (home)
   - Products
   - Transfers (disabled, Sprint 3)
   - Settings (disabled, Sprint 4)
   - Logout

### 4. Scanner shell (`apps/scanner/`)

**Minimal shell only.** Just the Next.js project with a landing page that says "Galileo Scanner — Coming Soon" with the ABYSSE theme. No camera integration yet (Sprint 3).

```
apps/scanner/
├── src/
│   └── app/
│       ├── layout.tsx
│       └── page.tsx        # "Galileo Scanner — Coming Soon"
├── next.config.ts
├── package.json
└── tsconfig.json
```

### 5. Shared package (`packages/shared/`)

Shared TypeScript types, constants, and validation schemas.

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts         # User, Role types
│   │   ├── brand.ts        # Brand types
│   │   ├── product.ts      # Product, ProductStatus types
│   │   ├── event.ts        # EventType, ProductEvent types
│   │   └── api.ts          # API response wrappers, error types
│   ├── constants/
│   │   ├── roles.ts        # RBAC role definitions
│   │   ├── categories.ts   # Product categories (watches, jewelry, etc.)
│   │   └── claim-topics.ts # Mirror of GalileoClaimTopics from contracts
│   ├── validation/
│   │   ├── gtin.ts         # GTIN-13/14 validation + check digit
│   │   ├── did.ts          # did:galileo:... format validation
│   │   └── auth.ts         # Email, password validation schemas (Zod)
│   └── index.ts            # Barrel export
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**GTIN validation is critical.** The `gtin.ts` module must:
- Validate GTIN-13 (13 digits) and GTIN-14 (14 digits)
- Verify the check digit (mod 10 algorithm per GS1 spec)
- Generate the DID from GTIN + serial: `did:galileo:01:{gtin}:21:{serial}`
- Generate the GS1 Digital Link URL: `https://id.galileoprotocol.io/01/{gtin}/21/{serial}`

### 6. CI pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Lint + type check + test the monorepo apps
  apps:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: galileo
          POSTGRES_PASSWORD: placeholder
          POSTGRES_DB: galileo_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r lint
      - run: pnpm -r typecheck
      - run: pnpm -r test
        env:
          DATABASE_URL: postgres://galileo:placeholder@localhost:5432/galileo_test
          JWT_SECRET: YOUR_JWT_SECRET_HERE_MIN_32_CHARACTERS
          JWT_REFRESH_SECRET: YOUR_REFRESH_SECRET_HERE_MIN_32_CHARS

  # Smart contracts (independent from the JS monorepo)
  contracts:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: contracts
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge build
      - run: forge test -vvv

  # Website (independent, existing CI)
  website:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: website
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
```

Three independent jobs: `apps` (monorepo), `contracts` (Foundry), `website` (existing).

### 7. Root config files

**`turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {}
  }
}
```

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root `package.json`:**
```json
{
  "name": "galileo-protocol",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "db:push": "pnpm --filter api prisma db push",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## GDPR compliance (applies from Sprint 1)

Even in Sprint 1, apply GDPR-by-design:

- **Password hashing:** bcrypt with 12 rounds. Never store plaintext.
- **JWT:** Don't store sensitive data in JWT payload. Only: `{ sub: userId, role, brandId }`.
- **Database:** Prisma schema includes `createdAt`/`updatedAt` for audit trail. Prepare for data export (Art. 15) and erasure (Art. 17) — actual endpoints in Sprint 4.
- **No personal data in logs.** Log user IDs, not emails or names.
- **CORS:** Strict origin validation. Only allow the dashboard origin.

---

## Definition of Done (Sprint 1)

All of these must be true:

- [ ] `pnpm install` from root installs all workspace dependencies
- [ ] `pnpm dev` starts API (port 4000) + dashboard (port 3000) + scanner (port 3001) concurrently
- [ ] `pnpm build` builds all apps without errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm test` runs API tests (at least auth routes) and shared package tests (GTIN validation)
- [ ] API: `POST /auth/register` creates user + brand, returns JWT
- [ ] API: `POST /auth/login` authenticates, returns JWT
- [ ] API: `GET /auth/me` returns current user (JWT required)
- [ ] API: `GET /health` returns status
- [ ] API: Swagger docs available at `localhost:4000/docs`
- [ ] Dashboard: Login page works, calls API, stores token
- [ ] Dashboard: Register page works, creates account
- [ ] Dashboard: Dashboard home shows after login (auth guard works)
- [ ] Dashboard: Products page shows empty state
- [ ] Dashboard: Logout works
- [ ] Scanner: Shell page renders
- [ ] Shared: GTIN validation passes (valid/invalid GTINs, check digit)
- [ ] Shared: DID generation from GTIN + serial works
- [ ] CI: All three jobs pass (apps, contracts, website)
- [ ] Existing `website/` still builds and runs independently
- [ ] Existing `contracts/` still builds and tests pass (`forge test`)

---

## What NOT to do in Sprint 1

- No blockchain integration (no viem, no wagmi, no contract calls)
- No file uploads (R2 integration is Sprint 2)
- No MFA implementation (schema only — implementation is Sprint 4)
- No product CRUD (Sprint 2)
- No QR scanning (Sprint 3)
- No T1/LEOX anything (Sprint 5)
- No wallet linking (Sprint 2)
- Don't modify `website/` or `contracts/` — they're stable
- Don't add a database migration system beyond Prisma's built-in `prisma db push` (good enough for dev)

---

## Environment setup for local dev

```bash
# Prerequisites: Node.js (see .nvmrc), pnpm, PostgreSQL 16+

# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (or use Docker)
docker run -d --name galileo-db \
  -e POSTGRES_USER=galileo \
  -e POSTGRES_PASSWORD=placeholder \
  -e POSTGRES_DB=galileo_dev \
  -p 5432:5432 \
  postgres:16

# 3. Configure API
cp apps/api/.env.example apps/api/.env
# Edit: DATABASE_URL=postgres://galileo:galileo_dev@localhost:5432/galileo_dev

# 4. Push schema to DB
pnpm db:push

# 5. (Optional) Seed test data
pnpm db:seed

# 6. Start everything
pnpm dev
# → API:       http://localhost:4000
# → Dashboard: http://localhost:3000
# → Scanner:   http://localhost:3001
# → Swagger:   http://localhost:4000/docs
```

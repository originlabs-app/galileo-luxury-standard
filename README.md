# Galileo Protocol

**Open standard for luxury product traceability on blockchain**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/originlabs-app/galileo-luxury-standard/releases/tag/v1.0.0)

> *Protecting brand heritage and human craftsmanship through a common interoperable language.*

**Galileo Protocol — B2B SaaS for luxury product authentication via DPP (Digital Product Passports)**

---

## Overview

The Galileo Protocol provides specifications for Digital Product Passports, decentralized identity, and compliant token transfers.

### Key Features (Sprint 1, 2 & Hardening)

- **Privacy-First Architecture** — No personal data on-chain (GDPR compliant)
- **Digital Product Passports** — ESPR 2024/1781 ready schemas
- **Compliant Transfers** — ERC-3643 token standard with modular compliance
- **Authentication & RBAC** — httpOnly cookie auth, UserPublic/UserInternal roles, CSRF header protection (`X-Galileo-Client`)
- **Product Management** — CRUD operations with GTIN validation, DID generation (`did:galileo`), Dashboard product pages (list, create, detail)
- **Blockchain Integration** — Mock minting with synthetic on-chain data via viem chain client, optimistic concurrency control (updateMany WHERE status=DRAFT)
- **GS1 Conformity** — Digital Link 1.6.0 resolver with 14-digit GTIN padding, check digit validation, JSON-LD with custom `galileo`/`gs1` context namespaces
- **Security Hardening** — Scoped content-type parser, brandId null guards, validation bounds (name 255, serial 100, desc 2000, brandName 255), portable test DB (`DATABASE_URL_TEST`), SSR-safe refresh token handling, AuthProvider Context (single /auth/me fetch), CSRF on POST/PATCH/DELETE/PUT, E2E in CI with pnpm cache
- **Shared Validation** — Robust URL encoding, DID GTIN check digit fixes, `padGtin14()` normalization, 8 luxury categories aligned across API/dashboard/shared

---

## Architecture & Tech Stack

**Turborepo** monorepo using **pnpm** (exact semver pinned):
- **API**: Fastify 5 server, Prisma 7, PostgreSQL
- **Dashboard**: Next.js app, shadcn/ui, Playwright e2e tests
- **Shared**: Utilities for GTIN validation, URL encoding, DID generation

---

## Quick Start / Local Development

### Prerequisites
- Node.js 22, pnpm, PostgreSQL 16+

### Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Setup Database:**
   Ensure PostgreSQL is running. Run initialization script:
   ```bash
   ./init.sh
   ```
   *(Creates required databases including test isolation `galileo_test`)*

3. **Configure Environment:**
   Copy the example environment file for the API:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

4. **Initialize Database & Seed:**
   *(Guarded for production)*
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. **Start Development Servers:**
   ```bash
   pnpm dev
   ```

---

## Testing

**186 unit tests + 2 Playwright e2e tests.** Test database (`galileo_test`) is isolated via `DATABASE_URL_TEST`.

| Suite | Tests | Scope |
|-------|-------|-------|
| @galileo/shared | 63 | GTIN validation, DID generation, auth schemas, user types |
| @galileo/api | 123 | Auth (32), Products (27), Security (16), Mint (10), Resolver (17), CSRF (18), Health (3) |
| Playwright e2e | 2 | Auth setup + product lifecycle (create→DRAFT→mint→ACTIVE→QR) |

```bash
pnpm test              # Unit tests (186)
pnpm test:e2e          # Playwright e2e (2)
pnpm turbo typecheck   # TypeScript validation
pnpm turbo lint        # ESLint
pnpm turbo build       # Full build
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH | `/products` | Product CRUD with GTIN validation, RBAC, pagination |
| POST | `/products/:id/mint` | Mock minting with optimistic concurrency control |
| GET | `/01/:gtin/21/:serial` | GS1 Digital Link resolver (JSON-LD, 13/14-digit GTIN) |
| POST | `/auth/register` | Create account with brand |
| POST | `/auth/login` | Login (sets httpOnly cookies) |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user info |
| POST | `/auth/logout` | Logout (clears cookies) |
| GET | `/products/:id/qr` | QR code generation (PNG) |

---

## Security

Three independent security audits completed (Sprint 1 + Sprint 2 hardening rounds):

- **Authentication:** httpOnly cookies (SameSite=Lax), SHA-256 hashed refresh tokens, timing-safe login, CSRF header (`X-Galileo-Client`) on all mutating requests (POST/PATCH/DELETE/PUT)
- **Authorization:** RBAC with brandId scoping on all product routes, null-brandId guard (403)
- **Input Validation:** Zod schemas with bounds (name ≤255, serial ≤100, description ≤2000, brandName ≤255), scoped JSON parser (no global content-type override)
- **Frontend:** AuthProvider Context (single /auth/me fetch), SSR-safe AuthGuard (useSyncExternalStore), no localStorage tokens
- **Concurrency:** Optimistic concurrency control on mint (updateMany WHERE status=DRAFT, atomic 409 on race)
- **CI/CD:** pnpm cache + frozen-lockfile, Playwright E2E in CI, production API build for E2E, portable paths
- **GS1 Conformity:** GTIN check digit validation, 14-digit padding normalization, JSON-LD with IndividualProduct type and custom galileo/gs1 context

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## Repository Structure

```text
├── apps/
│   ├── api/                   # Fastify 5 API server
│   ├── dashboard/             # Next.js B2B dashboard
│   └── scanner/               # Next.js scanner shell (Coming Soon)
├── packages/
│   └── shared/                # @galileo/shared utilities
├── contracts/                 # Solidity interfaces
├── website/                   # Next.js documentation portal
└── specifications/            # Schemas, guides, DID methods
```

*For details on compliance (GDPR, MiCA, ESPR), governance, and contributions, see `specifications/`, `governance/`, and `CONTRIBUTING.md`.*

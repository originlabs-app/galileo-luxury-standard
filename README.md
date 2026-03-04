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

Includes 186 unit tests and 2 Playwright e2e tests. Test database (`galileo_test`) is isolated via `DATABASE_URL_TEST`.
- **Unit Tests:** `pnpm test` (63 shared + 123 API)
- **E2E Tests:** `pnpm test:e2e` (auth setup + product lifecycle)

---

## API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH | `/products` | Product CRUD with GTIN validation, RBAC, pagination |
| POST | `/products/:id/mint` | Mock minting with optimistic concurrency control |
| GET | `/01/:gtin/21/:serial` | GS1 Digital Link resolver (JSON-LD, 13/14-digit GTIN) |
| GET | `/products/:id/qr` | QR code generation (PNG) |

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

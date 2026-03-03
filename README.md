# Galileo Protocol

**Open standard for luxury product traceability on blockchain**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/originlabs-app/galileo-luxury-standard/releases/tag/v1.0.0)

> *Protecting brand heritage and human craftsmanship through a common interoperable language.*

**Galileo Protocol — B2B SaaS for luxury product authentication via DPP (Digital Product Passports)**

---

## Overview

The Galileo Protocol is an open, interoperable protocol for luxury product traceability. It provides specifications for Digital Product Passports, decentralized identity, compliant token transfers, and regulatory alignment (GDPR, MiCA, ESPR).

### Key Features

- **Privacy-First Architecture** — No personal data on-chain (GDPR compliant)
- **Digital Product Passports** — ESPR 2024/1781 ready schemas
- **Decentralized Identity** — `did:galileo` method (W3C DID Core v1.0)
- **Compliant Transfers** — ERC-3643 token standard with modular compliance
- **GS1 Integration** — Digital Link 1.6.0 resolver

---

## Tech Stack

This project is structured as a **Turborepo** monorepo using **pnpm workspaces**:
- **API**: Fastify 5 server with JWT auth, Prisma 7, PostgreSQL
- **Dashboard**: Next.js app with ABYSSE dark theme and shadcn/ui
- **Scanner**: Next.js shell app (Coming Soon)
- **Shared**: Common types, GTIN validation, and DID generation utilities

---

## Quick Start / Local Development

### Prerequisites
- Node.js 22
- pnpm
- PostgreSQL 16+

### Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Setup Database:**
   Ensure your PostgreSQL instance is running and create the `galileo_dev` database.

3. **Configure Environment:**
   Copy the example environment file for the API:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   *(Update the variables in `apps/api/.env` if necessary. Do not commit secrets.)*

4. **Initialize Database:**
   ```bash
   pnpm db:push
   ```

5. **Start Development Servers:**
   ```bash
   pnpm dev
   ```
   This command starts:
   - **API**: http://localhost:4000
   - **Dashboard**: http://localhost:3000
   - **Scanner**: http://localhost:3001

---

## Available Scripts

From the root directory, you can run:

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run ESLint across the monorepo
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm db:push` - Push Prisma schema changes to the database
- `pnpm db:seed` - Seed the database with initial data
- `pnpm db:studio` - Open Prisma Studio to explore the database

---

## Repository Structure

```
├── apps/
│   ├── api/                   # Fastify 5 API server
│   ├── dashboard/             # Next.js B2B dashboard
│   └── scanner/               # Next.js scanner shell (Coming Soon)
├── packages/
│   └── shared/                # @galileo/shared utilities
├── .github/workflows/
│   └── ci.yml                 # 3 independent CI jobs
├── contracts/                 # Solidity interfaces
├── website/                   # Next.js documentation portal
├── LICENSE                    # Apache 2.0
├── CONTRIBUTING.md            # RFC process & DCO sign-off
├── CODE_OF_CONDUCT.md         # Community standards
├── SECURITY.md                # Vulnerability disclosure policy
├── governance/                # TSC, membership, RFCs
├── specifications/            # Schemas, guides, DID methods
└── release/v1.0.0/            # Release artifacts
```

---

## Standards Compliance

| Standard | Version | Status |
|----------|---------|--------|
| W3C DID Core | v1.0 | ✓ Conformant |
| W3C Verifiable Credentials | v2.0 | ✓ Conformant |
| ERC-3643 (T-REX) | v4.1.3 | ✓ Extended |
| GS1 Digital Link | 1.6.0 | ✓ Conformant |
| GS1 Conformant Resolver | 1.2.0 | ✓ Conformant |
| EPCIS | 2.0 | ✓ Aligned |

---

## Regulatory Readiness

| Regulation | Deadline | Guide |
|------------|----------|-------|
| GDPR | Active | [gdpr-compliance.md](specifications/compliance/guides/gdpr-compliance.md) |
| MiCA | July 2026 | [mica-compliance.md](specifications/compliance/guides/mica-compliance.md) |
| ESPR | 2027 | [espr-readiness.md](specifications/compliance/guides/espr-readiness.md) |

---

## Contributing

We welcome contributions! Please read:

1. [CHARTER.md](governance/CHARTER.md) — Governance structure
2. [CONTRIBUTING.md](CONTRIBUTING.md) — RFC process and DCO sign-off
3. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Community standards
4. [SECURITY.md](SECURITY.md) — Vulnerability disclosure policy

---

## License

```
Copyright 2026 Galileo Protocol Contributors

Licensed under the Apache License, Version 2.0
```

See [LICENSE](LICENSE) for the full text.

---

## Links

- [Release Notes v1.0.0](https://github.com/originlabs-app/galileo-luxury-standard/releases/tag/v1.0.0)
- [Changelog](release/v1.0.0/CHANGELOG.md)
- [Specification Index](release/v1.0.0/PUBLICATION-BUNDLE.md)

---

*Galileo Protocol — Protecting Heritage Through Interoperability*

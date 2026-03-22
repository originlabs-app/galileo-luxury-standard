# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Harness engineering structure: AGENTS.md, ARCHITECTURE.md, docs/ reference layer
- Changesets pipeline: @changesets/cli + @changesets/changelog-github, GitHub Actions release workflow

## [2026-03-22] — Production Deployment

### Fixed
- **Prisma ESM imports** — postbuild script patches generated `.js` extensions on all ESM imports in `@prisma/client` (Prisma 7 compat)
- **Dockerfile path** — `contracts/deployments` now copied to `/app` instead of `/` in production stage
- **sed delimiter** — replaced `/` with `#` as delimiter in sed commands to avoid path conflicts

### Added
- **Dashboard deployed** — `apps/dashboard` live on Vercel at galileo-dashboard.vercel.app
- **Scanner deployed** — `apps/scanner` live on Vercel at galileo-scanner.vercel.app (monorepo config)
- **R2 storage configured** — Cloudflare R2 bucket wired for persistent image uploads (production)
- **Basescan API key** — contract verification on Base Sepolia now enabled
- **Changeset automation** — `@changesets/cli` + `@changesets/changelog-github` installed, `.changeset/config.json` set up, GitHub Actions `release.yml` workflow created

### Infrastructure
- **Prisma DB migrations** — `prisma migrate deploy` run on Railway production database; `Product` table and all relations created
- **Vercel env vars** — `NEXT_PUBLIC_API_URL` and related env vars corrected on both dashboard and scanner projects
- **Git worktrees cleaned** — 46 orphaned worktrees removed from `.claude/worktrees/`

## [1.0.0] — 2026-03-20

### Added
- Fastify 5 API: JWT auth (httpOnly cookies), SIWE wallet auth, products CRUD
- Batch operations: CSV import (500 products) and batch mint (100 products)
- GS1 Digital Link resolver (`/01/:gtin/21/:serial` → JSON-LD with `did:galileo` context)
- ERC-3643 compliant transfer with 5-module compliance check
- GDPR Art. 15 (data export) and Art. 17 (erasure) endpoints
- Append-only audit trail with CSV/JSON export
- Webhook system with HMAC-SHA256 signing and exponential backoff retry
- Next.js 16 dashboard with shadcn/ui, wagmi wallet integration, Playwright E2E tests
- Scanner PWA with barcode-detector and GS1 deep links
- Base Sepolia deployment configuration (live minting pending RPC key)
- 372 unit tests (303 API + 69 shared) + 9 Playwright E2E specs
- Sentry error tracking, Pino structured logging (PII redaction)

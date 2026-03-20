# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Harness engineering structure: AGENTS.md, ARCHITECTURE.md, docs/ reference layer

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

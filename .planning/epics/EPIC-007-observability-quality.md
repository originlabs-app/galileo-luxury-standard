# EPIC-007: Observability & Quality

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Test stability, error tracking, monitoring, and structured logging. Ensures the platform is observable and tests are reliable.

## Tasks

- [x] Fix flaky tests: mint.test.ts, products.test.ts, recall.test.ts timeout in full suite
- [ ] Consider per-file test database isolation (schema-per-suite)
- [ ] Sentry integration (error tracking)
- [ ] Vercel Analytics (frontend)
- [x] Health check endpoints with dependency status (DB, chain RPC) (Sprint #2, 25afe6c — pending Tester validation)
- [ ] Uptime monitoring
- [x] Structured logging (no PII) (Sprint #2, 0749206 — pending Tester validation)

## Acceptance Criteria

- All tests pass reliably in full suite (no flaky timeouts)
- Error tracking captures production issues
- Health check reports DB and chain RPC status

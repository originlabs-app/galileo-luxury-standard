# EPIC-007: Observability & Quality

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Test stability, error tracking, monitoring, and structured logging. Ensures the platform is observable and tests are reliable.

## Tasks

- [ ] Fix flaky tests: mint.test.ts, products.test.ts, recall.test.ts timeout in full suite
- [ ] Consider per-file test database isolation (schema-per-suite)
- [ ] Sentry integration (error tracking)
- [ ] Vercel Analytics (frontend)
- [ ] Health check endpoints with dependency status (DB, chain RPC)
- [ ] Uptime monitoring
- [ ] Structured logging (no PII)

## Acceptance Criteria

- All tests pass reliably in full suite (no flaky timeouts)
- Error tracking captures production issues
- Health check reports DB and chain RPC status

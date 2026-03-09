# EPIC-007: Observability & Quality

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Test stability, error tracking, monitoring, and structured logging. Ensures the platform is observable and tests are reliable.

## Tasks

- [x] Fix flaky tests: mint.test.ts, products.test.ts, recall.test.ts timeout in full suite
- [ ] Consider per-file test database isolation (schema-per-suite)
- [x] Sentry integration (error tracking) (Sprint #4, 78f3042)
- [ ] Vercel Analytics (frontend)
- [x] Health check endpoints with dependency status (DB, chain RPC) (Sprint #2, 25afe6c)
- [ ] Uptime monitoring
- [x] Structured logging (no PII) (Sprint #2, 0749206)
- [x] E2E Playwright: dashboard stats, filters, upload (Sprint #5, 6f1b932)
- [x] E2E Playwright: compliance, webhooks, audit export (Sprint #7, 60fb11e)
- [x] E2E Playwright: batch import + SIWE login (Sprint #8, a73f30c)

## Acceptance Criteria

- All tests pass reliably in full suite (no flaky timeouts)
- Error tracking captures production issues
- Health check reports DB and chain RPC status

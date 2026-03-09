# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #10 — Test Stability & Deployment Readiness

**Goal**: Fix the P0 FK constraint test flakiness (10 failing tests in batch-mint/batch-import), prepare Vercel deployment configs for frontend apps, create an API Dockerfile for containerized deployment, and draft the DPIA document required before mainnet.
**Started**: 2026-03-10
**Completed**: 2026-03-10
**Status**: archived

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T10.1 | Fix FK constraint violations in batch-mint/batch-import tests | EPIC-007 | validated | All 372+ tests pass consistently with zero FK violations. `pnpm test` green on full suite, 3 consecutive runs. | a4f22d0 |
| T10.2 | Vercel deployment config for dashboard + scanner | EPIC-008 | validated | `vercel.json` present for dashboard and scanner. `pnpm turbo build` passes. Vercel CLI `vercel build` (dry-run) succeeds if available. | cddf83a |
| T10.3 | API Dockerfile for containerized deployment | EPIC-008 | validated | `docker build -t galileo-api apps/api` succeeds. Container starts and responds to `/health`. Image size < 500MB. | d239545 |
| T10.4 | DPIA scaffold document | EPIC-006 | validated | DPIA document exists at `specifications/dpia/galileo-dpia.md` with all required EDPB sections. Content is accurate for current architecture. | 602b60f |

## Completion Criteria

- [x] All tasks validated, explicitly deferred, or blocked with reason
- [x] All tests pass
- [x] No P0 bugs introduced
- [x] CONTEXT.md updated if architecture changed

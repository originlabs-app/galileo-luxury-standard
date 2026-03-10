---
phase: 02-pilot-catalog-authoring-import
plan: "02"
subsystem: api
tags: [csv, fastify, prisma, zod, import]
requires:
  - phase: 02-pilot-catalog-authoring-import
    provides: Shared authoring validation and typed passport metadata helpers from 02-01
provides:
  - Validation-first CSV dry-run and commit semantics for Phase 2 batch import
  - Shared import services that normalize CSV rows into the Phase 2 authoring contract
  - Explicit OPERATOR import support aligned with manual authoring workspace rules
affects: [phase-02-dashboard-import, api, authoring, import]
tech-stack:
  added: []
  patterns:
    - Run batch import as a server-side dry-run first, then require explicit commit for writes
    - Normalize CSV rows into the shared authoring schema before any persistence or duplicate checks
key-files:
  created:
    - apps/api/src/services/products/catalog-authoring.ts
    - apps/api/src/services/products/import-csv.ts
  modified:
    - apps/api/src/routes/products/batch-import.ts
    - apps/api/test/batch-import.test.ts
    - apps/api/test/products.test.ts
key-decisions:
  - Default the import API to dry-run and require `dryRun=false` for commit so operators always review row outcomes before writes
  - Keep import authorization aligned with the broader authoring surface by allowing OPERATOR alongside BRAND_ADMIN and ADMIN
  - Normalize CSV materials into structured passport metadata and support quoted multiline fields without reopening route-local validation
patterns-established:
  - Batch import routes should return summary plus row-level review data that the dashboard can reuse directly
  - Import persistence should go through the same catalog authoring service shape as other authoring entrypoints
requirements-completed: [PROD-02, PROD-04]
duration: 24 min
completed: 2026-03-10
---

# Phase 2 Plan 02: CSV validation-first import service and API Summary

**Batch import now previews row outcomes before commit, writes imported authoring metadata through shared services, and allows scoped operators to import safely**

## Performance

- **Duration:** 24 min
- **Started:** 2026-03-10T09:38:00Z
- **Completed:** 2026-03-10T10:02:28Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Extracted reusable catalog authoring and CSV import services so batch import now normalizes rows into the shared Phase 2 authoring contract before any writes.
- Switched the batch import API to validation-first dry-run plus explicit commit semantics with row-level review output and commit-time revalidation.
- Expanded import authorization to `OPERATOR` and locked the new contract in with API coverage for dry-run feedback, commit rejection, and workspace-scoped operator success.

## Task Commits

Each task was committed atomically:

1. **Task 1: Move CSV normalization and authoring reuse into services** - `831808a` (feat)
2. **Task 2: Ship explicit dry-run plus commit semantics with explicit operator-role proof** - `c5a8c48` (feat)

## Files Created/Modified

- `apps/api/src/services/products/catalog-authoring.ts` - Centralizes imported product persistence around the shared identity and authoring contract.
- `apps/api/src/services/products/import-csv.ts` - Parses CSV content, normalizes authoring fields, runs row-level preflight checks, and supports preview or commit execution.
- `apps/api/src/routes/products/batch-import.ts` - Exposes default dry-run behavior, explicit commit mode, and operator-aligned workspace authorization.
- `apps/api/test/batch-import.test.ts` - Covers dry-run feedback, commit rejection, operator import authorization, and structured authoring persistence.
- `apps/api/test/products.test.ts` - Verifies the manual authoring baseline still allows OPERATOR to persist shared authoring fields.

## Decisions Made

- Kept the import contract explicit: preview is now the default response shape, and writes only happen when the caller sends `dryRun=false`.
- Reused the shared authoring contract from `02-01` by parsing CSV materials into structured metadata rather than preserving a separate flat CSV-only field model.
- Aligned import permissions with the rest of the product authoring surface so the lowest write-capable role remains `OPERATOR`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Parallel targeted Vitest runs against the shared test database caused transient foreign-key failures during verification. Rerunning the checks sequentially produced stable green results.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `02-03` can treat `/products/batch-import` as a true review-first API: default dry-run for preview and explicit commit once the operator accepts the server result.
- Import rows now reuse the shared authoring contract and typed passport metadata helpers, so the dashboard work can focus on state flow and review UX instead of route-local validation rules.

## Self-Check

PASSED

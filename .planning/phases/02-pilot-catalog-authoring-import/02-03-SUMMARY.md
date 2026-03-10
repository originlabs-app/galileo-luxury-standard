---
phase: 02-pilot-catalog-authoring-import
plan: "03"
subsystem: dashboard
tags: [nextjs, react, playwright, csv, import]
requires:
  - phase: 02-pilot-catalog-authoring-import
    provides: Validation-first batch import API semantics and shared authoring normalization from 02-02
provides:
  - Visible dashboard import entrypoint on the products workspace and empty state
  - Review-first batch import dialog that separates local preview, server validation, commit, and completion
  - Browser proof that operators see validation feedback before commit and that clean imports refresh the workspace
affects: [phase-02-media-durability, dashboard, operator-workspace, import]
tech-stack:
  added: []
  patterns:
    - Dashboard import flows should always dry-run against the API before enabling commit
    - Admin-scoped dashboard mutations should forward the active brandId when the API contract requires explicit workspace context
key-files:
  created: []
  modified:
    - apps/dashboard/src/app/dashboard/products/page.tsx
    - apps/dashboard/src/components/batch-import-dialog.tsx
    - apps/dashboard/e2e/batch-import.spec.ts
    - apps/dashboard/src/lib/api.ts
key-decisions:
  - Keep the products page import action visible in both the populated workspace and the empty state so CSV ingestion is never hidden behind dead wiring.
  - Make the dashboard import dialog review-first by disabling commit until the server returns a zero-error dry-run result.
  - Forward the active workspace brandId on dashboard imports so seeded ADMIN sessions and scoped operator flows hit the same validation-first API contract.
patterns-established:
  - Dashboard upload flows should model preview, validation, commit, and completion as explicit UI stages instead of one-shot submit states.
  - Browser proofs for operator imports should assert server review output before commit and confirm the products list refreshes after success.
requirements-completed: [PROD-02]
duration: 11 min
completed: 2026-03-10
---

# Phase 2 Plan 03: Dashboard import UX Summary

**The products workspace now exposes a real CSV import entrypoint with server review-before-commit and a browser proof for both clean and rejected imports**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-10T10:39:27Z
- **Completed:** 2026-03-10T10:50:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Reconnected the products workspace to a visible `Import CSV` action and refreshed the list after successful commits.
- Rebuilt the dialog around explicit local preview, server validation review, commit, and completion stages, with commit blocked until dry-run errors are zero.
- Added Playwright proof for the happy path and row-error path, and tightened the dashboard API helper so multipart requests no longer force JSON headers.

## Task Commits

Each task was committed atomically:

1. **Task 1: Reconnect the import entrypoint to the products workspace** - `9aa933e` (feat)
2. **Task 2: Prove the operator import journey in Playwright** - `5a175e9` (test)

## Files Created/Modified

- `apps/dashboard/src/app/dashboard/products/page.tsx` - Restores the visible import action in the products workspace and empty state, and refreshes page 1 after successful commits.
- `apps/dashboard/src/components/batch-import-dialog.tsx` - Models local preview, server dry-run review, commit gating, admin brand scoping, and completion feedback.
- `apps/dashboard/e2e/batch-import.spec.ts` - Verifies review-before-commit and row-level validation blocking in the dashboard.
- `apps/dashboard/src/lib/api.ts` - Preserves multipart `FormData` requests and surfaces structured API error details for dashboard callers.

## Decisions Made

- Kept CSV import as a first-class action on the products page instead of burying it behind disconnected or empty-state-only UI.
- Made zero-error dry-run the only path to an enabled commit action so operators cannot accidentally follow the old partial-write behavior.
- Used the authenticated workspace brand context on import requests so ADMIN verification and real operator sessions both honor the API workspace contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Forward active brand context on dashboard import requests**
- **Found during:** Task 2 (Playwright proof)
- **Issue:** Seeded ADMIN browser sessions hit `POST /products/batch-import` without `brandId`, so dry-run failed before the review state rendered.
- **Fix:** Sent the active workspace `brandId` with dry-run and commit requests from the import dialog.
- **Files modified:** `apps/dashboard/src/components/batch-import-dialog.tsx`
- **Verification:** `pnpm --filter @galileo/dashboard exec playwright test e2e/batch-import.spec.ts`
- **Committed in:** `5a175e9`

---

**Total deviations:** 1 auto-fixed (1 Rule 3 blocking issue)
**Impact on plan:** The fix stayed within the planned dashboard scope and was required to make the validation-first flow usable in real seeded sessions.

## Issues Encountered

- Playwright's configured `webServer` boot path still hit an unrelated existing API TypeScript error in `apps/api/src/routes/products/batch-import.ts`, which is outside this plan's owned files. I verified the dashboard flow by reusing a source-run API server on `:4000` and a live dashboard server on `:3000`, then reran the exact Playwright spec successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `02-05` can focus on media durability and broader validation coverage because the operator import entrypoint, review step, and commit proof are now in place.
- The dashboard now mirrors the server's validation-first import contract, so future work can build on one shared operator mental model instead of patching partial-write behavior.

## Self-Check

PASSED

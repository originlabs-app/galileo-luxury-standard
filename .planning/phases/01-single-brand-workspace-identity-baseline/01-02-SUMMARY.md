---
phase: 01-single-brand-workspace-identity-baseline
plan: "02"
subsystem: api
tags: [fastify, prisma, authz, workspace, vitest]
requires:
  - phase: 01-01
    provides: authenticated workspace identity on request.user
provides:
  - shared workspace membership and same-brand helpers for product routes
  - server-enforced brand scoping for product reads and mutations
  - regression coverage for null-brand and cross-workspace product access
affects: [01-03, workspace-authz, product-routes]
tech-stack:
  added: []
  patterns: [shared route authorization helpers, server-authoritative workspace scoping]
key-files:
  created: [apps/api/src/utils/workspace.ts]
  modified:
    [
      apps/api/src/routes/products/create.ts,
      apps/api/src/routes/products/get.ts,
      apps/api/src/routes/products/list.ts,
      apps/api/src/routes/products/stats.ts,
      apps/api/src/routes/products/update.ts,
      apps/api/test/products.test.ts,
      apps/api/test/security-hardening.test.ts,
    ]
key-decisions:
  - "Workspace membership and same-brand checks now live in one API utility instead of per-route guards."
  - "Non-ADMIN product writes continue to ignore request body brandId and bind to the authenticated workspace brand."
patterns-established:
  - "Route handlers call shared workspace helpers before querying or mutating brand-scoped records."
  - "Authorization regressions for null-brand and cross-workspace product access stay locked in API tests."
requirements-completed: [AUTH-03]
duration: 12 min
completed: 2026-03-09
---

# Phase 1 Plan 02: Server-Enforced Product Workspace Scoping Summary

**Shared workspace membership and same-brand guards now enforce mono-brand product reads and mutations on the API before dashboard shell restrictions.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-09T19:48:32Z
- **Completed:** 2026-03-09T20:00:37Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Extracted reusable workspace helpers for membership checks, brand filters, same-brand enforcement, and mutation brand resolution.
- Removed duplicated null-brand and cross-brand authorization logic from product read and mutation routes.
- Added regression coverage for null-brand users and non-admin brand override attempts so AUTH-03 is locked at the API boundary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract reusable single-brand workspace guards for product reads** - `0fb743c` (feat)
2. **Task 2: Apply the shared workspace guard to product mutations and lock coverage to the shared path** - `ad26c5e` (feat)

## Files Created/Modified

- `apps/api/src/utils/workspace.ts` - Shared workspace membership, same-brand, and mutation brand resolution helpers.
- `apps/api/src/routes/products/get.ts` - Product detail route now delegates same-brand enforcement to the shared helper.
- `apps/api/src/routes/products/list.ts` - Product list route now builds its brand filter through the shared helper.
- `apps/api/src/routes/products/stats.ts` - Product stats route now uses the shared workspace filter path.
- `apps/api/src/routes/products/create.ts` - Product creation now resolves effective brand scope through the shared helper.
- `apps/api/src/routes/products/update.ts` - Product updates now reuse the shared same-brand guard.
- `apps/api/test/security-hardening.test.ts` - Added read-route hardening coverage for `/products/stats` null-brand denial.
- `apps/api/test/products.test.ts` - Added mutation-focused null-brand and body brand override regressions.

## Decisions Made

- Centralized workspace authorization in `apps/api/src/utils/workspace.ts` so later product routes can reuse one enforcement path.
- Kept the ADMIN override explicit in the helper while preserving the existing rule that non-admin writes always use the authenticated workspace brand.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The combined two-file Vitest invocation was slow to stream output in this environment, so the final verification was observed as two equivalent file-level runs: `test/products.test.ts` and `test/security-hardening.test.ts`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Product authorization is now server-authoritative, so the dashboard shell can tighten around the same mono-brand rules without relying on hidden UI alone.
- No blockers identified for downstream workspace or product flows.

## Self-Check: PASSED

- FOUND: `.planning/phases/01-single-brand-workspace-identity-baseline/01-02-SUMMARY.md`
- FOUND: `0fb743c`
- FOUND: `ad26c5e`

---
*Phase: 01-single-brand-workspace-identity-baseline*
*Completed: 2026-03-09*

---
phase: 01-single-brand-workspace-identity-baseline
plan: 04
subsystem: api
tags: [fastify, zod, prisma, vitest, gs1, did]
requires: []
provides:
  - Shared GTIN plus serial validation for Galileo product identity inputs
  - DID and GS1 Digital Link helpers that validate canonical identity data before derivation
  - Manual product creation and batch import routes that enforce one identity contract
affects: [phase-02-catalog-authoring-import, product-routes, resolver]
tech-stack:
  added: []
  patterns:
    - Shared Zod identity schemas exported from @galileo/shared
    - Derived DID and Digital Link helpers validate inputs before generating persistent identifiers
key-files:
  created:
    - packages/shared/src/validation/product-identity.ts
  modified:
    - packages/shared/src/validation/did.ts
    - packages/shared/src/index.ts
    - packages/shared/test/did.test.ts
    - apps/api/src/routes/products/create.ts
    - apps/api/src/routes/products/batch-import.ts
    - apps/api/test/products.test.ts
    - apps/api/test/security-hardening.test.ts
key-decisions:
  - Centralize GTIN and serial validation in one shared schema so every identity-creating route rejects the same invalid inputs.
  - Require DID and Digital Link helpers to validate identity inputs before generating derived identifiers.
patterns-established:
  - Route-level product validation should compose the shared product identity schema instead of reimplementing GTIN or serial rules locally.
  - Identity regression coverage should assert both rejection of invalid serial formats and deterministic DID plus Digital Link outputs for valid inputs.
requirements-completed: [PROD-01, PROD-03]
duration: 8 min
completed: 2026-03-09
---

# Phase 1 Plan 04: Product Identity Validation Summary

**Shared GTIN plus serial validation for Galileo product identifiers, with DID and GS1 Digital Link generation enforced consistently across manual create and batch import routes**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-09T19:37:16Z
- **Completed:** 2026-03-09T19:44:44Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added a shared product identity schema that enforces valid GTINs plus DID-safe serial formats before persistence.
- Aligned DID and GS1 Digital Link helpers to the shared schema so invalid identifiers fail before any derived identifier is generated.
- Reused the shared contract in manual product creation and CSV batch import, and expanded API regressions for strict serial handling and deterministic outputs.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add canonical shared validation for GTIN plus serial identity inputs** - `f475347` (feat)
2. **Task 2: Reuse the shared identity schema in all reachable identity-creating product routes** - `9274f75` (feat)

## Files Created/Modified

- `packages/shared/src/validation/product-identity.ts` - Shared GTIN plus serial schema, validation helpers, and canonical GTIN-14 normalization.
- `packages/shared/src/validation/did.ts` - DID and Digital Link helpers now validate through the shared identity contract.
- `packages/shared/src/index.ts` - Exports the shared product identity contract for API consumers.
- `packages/shared/test/did.test.ts` - Covers strict serial rejection and canonical identity normalization in the shared layer.
- `apps/api/src/routes/products/create.ts` - Composes the shared identity schema for manual product creation.
- `apps/api/src/routes/products/batch-import.ts` - Reuses the same shared identity schema for imported rows before creation.
- `apps/api/test/products.test.ts` - Adds product-route regressions for invalid serial rejection and deterministic identifier generation.
- `apps/api/test/security-hardening.test.ts` - Keeps the serial-length boundary assertion aligned to the DID contract.

## Decisions Made

- Exported the GTIN plus serial Zod schema from `@galileo/shared` so API routes can extend it instead of duplicating validation.
- Treated serial validity as part of identifier generation, not just route parsing, so downstream callers cannot create invalid DIDs or Digital Links accidentally.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated the serial-length security regression to the new DID contract**
- **Found during:** Task 2 (Reuse the shared identity schema in all reachable identity-creating product routes)
- **Issue:** The security regression suite still asserted the legacy 100-character serial limit after the shared identity contract moved the platform to the DID-safe 20-character maximum.
- **Fix:** Updated the impacted API regression to fail at 21 characters so it matches the new shared contract.
- **Files modified:** `apps/api/test/security-hardening.test.ts`
- **Verification:** `pnpm --filter @galileo/api exec vitest run test/products.test.ts` and the route-level validations passed with the new serial limit.
- **Committed in:** `9274f75`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The deviation kept an existing regression suite aligned with the intended identity contract. No scope creep.

## Issues Encountered

- Running API integration suites in parallel caused false failures because the test database is shared. Verification was rerun sequentially, which matches the repo's `fileParallelism: false` test configuration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Manual create and batch import now share one identity validation contract, so phase 2 catalog work can extend product authoring without reopening GTIN or serial consistency questions.
- Resolver and lifecycle work can rely on stored Galileo DIDs and GS1 Digital Links being generated only from valid identifiers.

## Self-Check: PASSED

- Verified `.planning/phases/01-single-brand-workspace-identity-baseline/01-04-SUMMARY.md` exists.
- Verified task commits `f475347` and `9274f75` exist in git history.

---
*Phase: 01-single-brand-workspace-identity-baseline*
*Completed: 2026-03-09*

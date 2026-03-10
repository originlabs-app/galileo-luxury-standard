---
phase: 02-pilot-catalog-authoring-import
plan: "01"
subsystem: api
tags: [zod, fastify, prisma, resolver, validation]
requires:
  - phase: 01-single-brand-workspace-identity-baseline
    provides: Immutable GTIN and serial validation, DID plus Digital Link generation, and DRAFT-only product mutation boundaries
provides:
  - Shared Phase 2 authoring schemas and typed passport metadata helpers in @galileo/shared
  - Product create and patch routes aligned to one authoring contract
  - Resolver material composition reads through the typed passport metadata envelope with legacy fallback
affects: [phase-02-import, phase-02-authoring-ui, api, resolver, shared-validation]
tech-stack:
  added: []
  patterns:
    - Layer mutable passport authoring validation on top of immutable product identity validation
    - Store structured passport extras under ProductPassport.metadata.authoring with typed read and write helpers
key-files:
  created:
    - packages/shared/src/validation/product-authoring.ts
  modified:
    - packages/shared/src/constants/categories.ts
    - packages/shared/src/index.ts
    - apps/api/src/routes/products/create.ts
    - apps/api/src/routes/products/update.ts
    - apps/api/src/routes/resolver/resolve.ts
    - apps/api/test/products.test.ts
    - apps/api/test/resolver-qr.test.ts
key-decisions:
  - Keep GTIN, serialNumber, DID, and Digital Link outside the shared authoring schema so identity remains immutable after creation
  - Store structured materials and linked media under ProductPassport.metadata.authoring, while resolver reads still tolerate legacy root-level metadata.materials until import migrates
patterns-established:
  - Shared authoring schemas should own category, description, materials, and media validation for every mutable product-authoring entrypoint
  - Resolver reads should go through shared passport metadata helpers instead of assuming raw JSON field placement
requirements-completed: [PROD-04]
duration: 21 min
completed: 2026-03-10
---

# Phase 2 Plan 01: Shared authoring contract and typed passport metadata Summary

**Shared Phase 2 authoring validation now governs product create, patch, and resolver material reads through a typed passport metadata envelope**

## Performance

- **Duration:** 21 min
- **Started:** 2026-03-10T09:14:00Z
- **Completed:** 2026-03-10T09:34:50Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added a shared `@galileo/shared` authoring module for mutable passport fields, including materials, linked media descriptors, and typed metadata envelope helpers.
- Replaced route-local authoring validation in product create and patch with the shared schemas while keeping immutable identity fields outside the editable contract.
- Updated resolver material composition reads to use the shared metadata helper and kept legacy root-level metadata compatibility covered by tests.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract the shared authoring schema and typed passport metadata envelope** - `be685ef` (feat)
2. **Task 2: Align create, patch, and resolver semantics to the shared contract** - `21571e2` (feat)

## Files Created/Modified

- `packages/shared/src/validation/product-authoring.ts` - Defines the shared Phase 2 authoring schemas and typed passport metadata read/write helpers.
- `packages/shared/src/constants/categories.ts` - Exposes the shared category validation message used by the authoring contract.
- `packages/shared/src/index.ts` - Re-exports the new shared authoring schemas and metadata helpers.
- `apps/api/src/routes/products/create.ts` - Reuses the shared authoring schema and writes materials plus media through the typed passport metadata envelope.
- `apps/api/src/routes/products/update.ts` - Reuses the shared patch schema and updates typed passport metadata without reopening immutable identity fields.
- `apps/api/src/routes/resolver/resolve.ts` - Reads material composition through the shared passport metadata helper instead of a route-local raw JSON assumption.
- `apps/api/test/products.test.ts` - Verifies create and patch now persist materials inside the typed metadata envelope.
- `apps/api/test/resolver-qr.test.ts` - Verifies resolver material composition works for both the typed envelope and legacy metadata shape.

## Decisions Made

- Kept the mutable Phase 2 authoring layer separate from the immutable identity layer so later import and dashboard work cannot accidentally weaken GTIN, serial, DID, or Digital Link guarantees.
- Versioned the typed authoring envelope at `metadata.authoring.version = 1` and preserved legacy root-level material reads until the remaining import path is migrated.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Preserve resolver reads for legacy passport metadata**
- **Found during:** Task 2 (Align create, patch, and resolver semantics to the shared contract)
- **Issue:** Existing records and the current import path can still store materials at `metadata.materials`, so a typed-envelope-only resolver read would have dropped public material composition for those products.
- **Fix:** Added legacy fallback to the shared metadata reader and covered it with a resolver compatibility test.
- **Files modified:** `packages/shared/src/validation/product-authoring.ts`, `apps/api/src/routes/resolver/resolve.ts`, `apps/api/test/resolver-qr.test.ts`
- **Verification:** `pnpm --filter @galileo/api exec vitest run test/resolver-qr.test.ts -t "includes hasMaterialComposition when product uses legacy metadata.materials"`
- **Committed in:** `21571e2`

**2. [Rule 3 - Blocking] Adapt shared metadata writes to Prisma JSON input typing**
- **Found during:** Task 2 verification
- **Issue:** Prisma JSON fields rejected the generic metadata record returned by the shared helper, blocking API typecheck.
- **Fix:** Cast route writes to `Prisma.InputJsonValue` at the create and patch persistence boundaries.
- **Files modified:** `apps/api/src/routes/products/create.ts`, `apps/api/src/routes/products/update.ts`
- **Verification:** `pnpm --filter @galileo/api exec tsc --noEmit`
- **Committed in:** `21571e2`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes were required to keep the new shared contract compatible with existing data and valid at the Prisma persistence boundary. No scope creep beyond the plan intent.

## Issues Encountered

- The broad `pnpm --filter @galileo/api exec vitest run test/products.test.ts test/resolver-qr.test.ts` verification command did not complete reliably in this shell environment. The plan-specific task verifications passed when run sequentially, and `pnpm --filter @galileo/api exec tsc --noEmit` passed after the Prisma JSON typing fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 now has one shared mutable authoring contract available to CSV import and dashboard authoring work.
- Resolver and API persistence now agree on where structured passport draft metadata lives, so `02-02` can focus on validation-first import behavior instead of redefining the passport shape.

## Self-Check

PASSED

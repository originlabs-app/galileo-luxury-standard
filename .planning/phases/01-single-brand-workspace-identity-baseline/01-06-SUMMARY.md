---
phase: 01-single-brand-workspace-identity-baseline
plan: "06"
subsystem: testing
tags: [vitest, fastify, prisma, auth, products, wallets]
requires:
  - phase: 01-single-brand-workspace-identity-baseline
    provides: Product identity validation, workspace authz guards, and link-wallet conflict handling from plans 01-01 through 01-05
provides:
  - Deterministic full-file API regression fixtures for product authz and identity creation
  - Stable duplicate-wallet conflict proof that keeps first-user ownership intact
affects: [phase-01-verification, api-regression, auth-boundaries]
tech-stack:
  added: []
  patterns:
    [
      "Direct Prisma fixture creation followed by route-level login for auth-bound API tests",
      "Per-test deterministic fixture IDs to avoid repeated full-file identity collisions",
    ]
key-files:
  created:
    [
      ".planning/phases/01-single-brand-workspace-identity-baseline/01-06-SUMMARY.md",
    ]
  modified:
    [
      "apps/api/test/helpers.ts",
      "apps/api/test/products.test.ts",
      "apps/api/test/link-wallet.test.ts",
    ]
key-decisions:
  - "Product regression auth fixtures now create users directly in Prisma and obtain cookies through /auth/login so the suite proves product behavior without brittle register-then-update setup."
  - "The link-wallet route stayed unchanged because full-file runtime verification already returned 409; the proof gap was closed by making the regression deterministic and asserting original ownership remains linked."
patterns-established:
  - "API regression suites should use deterministic fixture IDs for brands and emails when full files recreate auth state repeatedly."
  - "Conflict regressions should assert both the HTTP response and the persisted ownership state after the rejected mutation."
requirements-completed: [AUTH-01, AUTH-03, PROD-01, PROD-03]
duration: 20 min
completed: 2026-03-09
---

# Phase 01 Plan 06: API verification gap closure Summary

**Deterministic full-file product and wallet-link API regressions that prove single-brand authz, identity creation, and duplicate-wallet conflict handling**

## Performance

- **Duration:** 20 min
- **Started:** 2026-03-09T20:50:27Z
- **Completed:** 2026-03-09T21:10:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Stabilized `products.test.ts` so all 47 product API checks pass as a full file with deterministic brands, emails, and authenticated fixtures.
- Removed brittle product-suite dependency on register-then-role-mutation setup by creating fixture users directly in Prisma and authenticating through `/auth/login`.
- Hardened `link-wallet.test.ts` so duplicate-wallet regressions use per-test identities and verify the first user keeps the linked address after the second user receives `409 CONFLICT`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make the full-file product regression suite deterministic** - `28a46e2` (test)
2. **Task 2: Reproduce and lock duplicate-wallet conflicts to `409`** - `4135270` (test)

## Files Created/Modified
- `apps/api/test/helpers.ts` - Added deterministic fixture ID generation shared by API regression suites.
- `apps/api/test/products.test.ts` - Reworked fixture setup to use deterministic identities and direct Prisma user creation before login.
- `apps/api/test/link-wallet.test.ts` - Made per-test user emails deterministic and strengthened duplicate-wallet ownership assertions.

## Decisions Made
- Product route coverage should authenticate through the real login route while seeding users directly in Prisma, because this keeps session proofs intact without coupling product regressions to registration mutation side effects.
- Duplicate-wallet handling did not require route changes in this checkout; the verification gap was in the durability of the regression proof, so the fix stayed in `link-wallet.test.ts`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The original `products.test.ts` setup failed before route assertions due to brittle fixture recreation around repeated brand and user identities. Converting the suite to deterministic fixture IDs and direct Prisma user seeding resolved the blocker and let the full-file proof run green.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 01 server-side verification evidence now includes a green full-file product regression and a deterministic duplicate-wallet conflict proof.
- Phase 01 can proceed to browser-side verification closure in `01-07-PLAN.md` without outstanding API fixture flakiness from this plan.

## Self-Check

PASSED

- Found summary file on disk.
- Found both task commits in `git log`.

---
*Phase: 01-single-brand-workspace-identity-baseline*
*Completed: 2026-03-09*

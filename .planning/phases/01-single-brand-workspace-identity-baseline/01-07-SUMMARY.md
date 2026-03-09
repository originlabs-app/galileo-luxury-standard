---
phase: 01-single-brand-workspace-identity-baseline
plan: "07"
subsystem: testing
tags: [playwright, siwe, auth, nextjs, wagmi]
requires:
  - phase: "01-01"
    provides: "Cookie-based auth, SIWE verification endpoints, and linked-wallet session issuance"
  - phase: "01-03"
    provides: "Setup-check-first dashboard routing and mono-brand shell behavior"
provides:
  - "Browser proof that linked-wallet SIWE lands on /dashboard/setup"
  - "Browser proof that one protected 401 triggers /auth/refresh, retries successfully, and survives page reload"
  - "Minimal dashboard-home selector cleanup needed to keep auth proof runs deterministic"
affects: [phase-01-verification, auth, dashboard]
tech-stack:
  added: []
  patterns:
    - "Browser-side SIWE wallet bridge for Playwright while keeping the real nonce and verify requests"
    - "One-shot Playwright 401 interception to prove refresh and retry behavior against the real client wrapper"
key-files:
  created:
    - apps/dashboard/e2e/auth-persistence.spec.ts
  modified:
    - apps/dashboard/e2e/auth.setup.ts
    - apps/dashboard/e2e/siwe-login.spec.ts
    - apps/dashboard/e2e/dashboard-home.spec.ts
    - apps/dashboard/src/components/siwe-login.tsx
key-decisions:
  - "Use a test-only browser wallet bridge in the SIWE component so Playwright can drive the real browser login path without replacing the API flow."
  - "Prove refresh persistence by forcing a single protected browser request to return 401, then observing the real /auth/refresh request, successful retry, and authenticated page reload."
patterns-established:
  - "Seed linked-wallet browser fixtures in Playwright setup rather than logging in via raw API calls when the browser route itself is the missing proof."
  - "Prefer targeted selector and timing cleanup inside the touched spec when Playwright health noise blocks requirement coverage."
requirements-completed: [AUTH-01, AUTH-02]
duration: 14min
completed: 2026-03-09
---

# Phase 1 Plan 07: Browser verification gap closure Summary

**Playwright browser proofs now cover linked-wallet SIWE setup landing plus forced refresh-and-retry session persistence across a real dashboard reload**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-09T21:12:00Z
- **Completed:** 2026-03-09T21:26:22Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added a deterministic linked-wallet browser harness so Playwright can drive the real SIWE login page and prove the first authenticated landing route is `/dashboard/setup`.
- Added a focused auth-persistence browser spec that forces one protected dashboard request to fail with `401`, proves `/auth/refresh` runs, proves the original request retries successfully, and proves the dashboard stays authenticated after `page.reload()`.
- Kept Playwright cleanup narrow by fixing only the dashboard-home activity-feed assertions that were blocking the targeted auth proof run.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a browser proof that linked-wallet SIWE lands on `/dashboard/setup`** - `043b933` (feat)
2. **Task 2: Add a browser proof for `401 -> refresh -> retry` and real page refresh persistence** - `50b5cfb` (test)

## Files Created/Modified

- `apps/dashboard/e2e/auth.setup.ts` - Seeds the deterministic linked-wallet admin fixture used by the browser auth proofs.
- `apps/dashboard/e2e/siwe-login.spec.ts` - Drives the login page through a linked-wallet SIWE sign-in and asserts `/dashboard/setup` as the first authenticated destination.
- `apps/dashboard/src/components/siwe-login.tsx` - Accepts a test-only browser wallet bridge so Playwright can connect and sign without bypassing the real SIWE API path.
- `apps/dashboard/e2e/auth-persistence.spec.ts` - Forces a protected `401`, observes `/auth/refresh`, verifies the retry succeeds, and checks auth survives a real reload.
- `apps/dashboard/e2e/dashboard-home.spec.ts` - Uses narrower activity-feed selectors and timing checks so the auth proof suite stays deterministic.

## Decisions Made

- Used a browser-side test seam in `siwe-login.tsx` instead of API-side login shortcuts because the missing requirement evidence was specifically about the browser route after SIWE.
- Left `apps/dashboard/src/lib/api.ts` unchanged because the existing refresh flow already satisfied the new browser proof once the test forced a single protected request to return `401`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added a test-only SIWE wallet bridge for Playwright**
- **Found during:** Task 1
- **Issue:** The browser suite had no deterministic wallet provider hook to exercise the real SIWE login page with a linked wallet.
- **Fix:** Added a test-only bridge in `siwe-login.tsx` and seeded the linked wallet during Playwright auth setup.
- **Files modified:** `apps/dashboard/src/components/siwe-login.tsx`, `apps/dashboard/e2e/auth.setup.ts`, `apps/dashboard/e2e/siwe-login.spec.ts`
- **Verification:** `pnpm --filter @galileo/dashboard exec playwright test e2e/auth.setup.ts e2e/siwe-login.spec.ts`
- **Committed in:** `043b933`

**2. [Rule 3 - Blocking] Tightened dashboard-home activity-feed assertions**
- **Found during:** Task 2
- **Issue:** Existing activity-feed assertions were failing because the card title is not exposed as a heading role and the list vs empty-state check was racing the loading transition.
- **Fix:** Replaced the brittle heading-role assertion with an exact text check and wrapped the list-or-empty-state assertion in a short poll.
- **Files modified:** `apps/dashboard/e2e/dashboard-home.spec.ts`
- **Verification:** `pnpm --filter @galileo/dashboard exec playwright test e2e/auth.setup.ts e2e/auth-persistence.spec.ts e2e/dashboard-home.spec.ts`
- **Committed in:** `50b5cfb`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to generate the requested browser evidence. Scope stayed within the touched auth proof files.

## Issues Encountered

- Shell-safe fixture seeding in `auth.setup.ts` took one iteration because inline `tsx --eval` quoting conflicted with Prisma client cleanup. Replacing it with `prisma db execute --stdin` resolved the fixture update cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 01 now has browser-level evidence for both `AUTH-01` linked-wallet setup landing and `AUTH-02` refresh persistence.
- The phase is ready for closeout and downstream planning with no remaining browser-auth verification gap in this plan scope.

## Self-Check

PASSED

---
*Phase: 01-single-brand-workspace-identity-baseline*
*Completed: 2026-03-09*

---
phase: 01-single-brand-workspace-identity-baseline
plan: "03"
subsystem: ui
tags: [nextjs, react, playwright, auth, workspace]
requires:
  - phase: 01-01
    provides: Server-authoritative `/auth/me` hydration for cookie-backed dashboard auth.
provides:
  - Setup-check-first auth landing across email/password and SIWE sign-in paths.
  - Computed pilot workspace readiness messaging for blocking access issues and informational hints.
  - Mono-brand dashboard shell that keeps the active brand visible and hides future-phase navigation.
affects: [phase-1-setup-check, dashboard-shell, workspace-access]
tech-stack:
  added: []
  patterns:
    - Computed workspace access evaluation derived from authenticated profile data instead of persisted onboarding state.
    - Playwright setup seeding that creates an approved pilot user state before shell specs run.
key-files:
  created:
    - apps/dashboard/src/app/dashboard/setup/page.tsx
    - apps/dashboard/src/lib/workspace-access.ts
  modified:
    - apps/dashboard/src/app/login/page.tsx
    - apps/dashboard/src/app/register/page.tsx
    - apps/dashboard/src/components/siwe-login.tsx
    - apps/dashboard/src/components/auth-guard.tsx
    - apps/dashboard/src/components/sidebar.tsx
    - apps/dashboard/src/components/header.tsx
    - apps/dashboard/src/app/dashboard/page.tsx
    - apps/dashboard/e2e/auth.setup.ts
    - apps/dashboard/e2e/dashboard-home.spec.ts
    - .planning/phases/01-single-brand-workspace-identity-baseline/01-VALIDATION.md
key-decisions:
  - "Setup-check stays computed from authenticated profile data and blocks only on role or brand assignment gaps."
  - "The pilot shell surfaces one active brand context and removes future-phase teaser navigation instead of hinting at multi-brand behavior."
patterns-established:
  - "Auth landing contract: successful sign-in routes to `/dashboard/setup` before any private workspace page."
  - "Pilot shell contract: header and sidebar always render the active brand and current role from auth context."
requirements-completed: [AUTH-01, AUTH-03]
duration: 14 min
completed: 2026-03-09
---

# Phase 1 Plan 3: Setup-Check-First Workspace Summary

**Setup-check-first dashboard auth with computed workspace readiness and a mono-brand pilot shell**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-09T19:47:00Z
- **Completed:** 2026-03-09T20:00:40Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Successful login, registration, and SIWE flows now land on `/dashboard/setup` before operators enter the private workspace.
- The new setup page separates blocking access problems from informational readiness hints using authenticated role and brand data.
- The dashboard shell now stays visibly locked to the active pilot brand and removes disabled future-phase navigation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Route every successful sign-in to the setup-check screen first** - `b8408f5` (`feat`)
2. **Task 2: Tighten the shell to the single pilot brand workspace** - `c9a1189` (`feat`)

## Files Created/Modified

- `apps/dashboard/src/app/dashboard/setup/page.tsx` - Adds the computed setup-check screen and continue gate into the workspace.
- `apps/dashboard/src/lib/workspace-access.ts` - Centralizes readiness evaluation from authenticated profile data.
- `apps/dashboard/src/components/auth-guard.tsx` - Redirects ineligible authenticated users back to the setup-check screen.
- `apps/dashboard/src/components/sidebar.tsx` - Shows the active pilot brand and removes future-phase teaser links.
- `apps/dashboard/src/components/header.tsx` - Keeps brand and role context visible in the shell header.
- `apps/dashboard/e2e/auth.setup.ts` - Seeds the approved pilot admin and verifies register/login landing behavior.
- `apps/dashboard/e2e/dashboard-home.spec.ts` - Covers mono-brand shell expectations and setup-to-dashboard handoff.

## Decisions Made

- Successful auth does not bypass access review; every entry path lands on setup-check first and lets approved users continue explicitly.
- Pilot shell context is operational, not marketing-heavy: active brand plus current role stay visible while off-scope navigation stays hidden.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Playwright setup seeding initially used an ESM-only path helper that conflicted with the dashboard test runtime, so the helper was rewritten to resolve the repo root from `process.cwd()`.
- Dashboard shell assertions needed exact-match selectors once the mono-brand UI introduced overlapping link text.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 auth now has a stable setup-check-first landing contract that later product and wallet flows can rely on.
- The dashboard shell reflects the single-brand pilot boundary cleanly, reducing UI ambiguity for remaining phase work.

## Self-Check

PASSED

- Found `.planning/phases/01-single-brand-workspace-identity-baseline/01-03-SUMMARY.md`
- Found commit `b8408f5`
- Found commit `c9a1189`

---
*Phase: 01-single-brand-workspace-identity-baseline*
*Completed: 2026-03-09*

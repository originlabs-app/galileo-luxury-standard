---
phase: 01-governance-foundation
plan: 06
subsystem: governance
tags: [governance, membership, dues, tiers, observer, member, founding-partner, agreement]

# Dependency graph
requires:
  - phase: 01-02
    provides: Governance charter with membership tier definitions and TSC structure
provides:
  - Three-tier membership structure documentation (Observer, Member, Founding Partner)
  - Revenue-scaled dues schedule ensuring SME/artisan accessibility
  - Legal membership agreement template with antitrust provisions
  - Closed Founding Partner window documentation
affects:
  - Future membership onboarding (legal review needed for AGREEMENT.md)
  - Phase 2+ adopter participation (membership tiers define contribution rights)

# Tech tracking
tech-stack:
  added: []
  patterns: [Revenue-scaled dues, Linux Foundation membership model]

key-files:
  created:
    - governance/membership/MEMBERSHIP_LEVELS.md
    - governance/membership/AGREEMENT.md
  modified: []

key-decisions:
  - "Three revenue bands: SME (<EUR 10M), Mid-Market (EUR 10M-100M), Enterprise (>EUR 100M)"
  - "50% discount for nonprofits, academic institutions, and government agencies"
  - "Founding Partner window closed at ratification - no new admissions"
  - "Active Contributor status is individual, not organizational"
  - "60-day grace period for dues non-payment before membership lapse"
  - "Agreement template requires legal review before execution"

patterns-established:
  - "Organizational vs Individual rights: membership is organizational, meritocracy is individual"
  - "Membership does not purchase spec access (free under Apache 2.0) - dues fund governance operations"
  - "Time-limited founding privileges prevent permanent two-class hierarchy"

# Metrics
duration: 6min
completed: 2026-01-30
---

# Phase 1 Plan 06: Membership System Summary

**Three-tier membership structure with revenue-scaled dues for SME accessibility, explicit Founding Partner closure, and comprehensive legal agreement template**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-30T12:23:00Z
- **Completed:** 2026-01-30T12:28:48Z
- **Tasks:** 2/2
- **Files created:** 2

## Accomplishments

- Created comprehensive membership tier documentation covering Observer, Member, and Founding Partner levels
- Designed revenue-scaled dues structure ensuring small artisans and SMEs can participate meaningfully
- Documented explicit Founding Partner window closure to prevent late-entry privilege seeking
- Built legal membership agreement template with full antitrust compliance provisions
- Established clear separation between organizational membership and individual meritocratic rights

## Task Commits

Each task was committed atomically:

1. **Task 1: Create membership levels documentation** - `1f6ad3d` (docs)
2. **Task 2: Create membership agreement template** - `8922391` (docs)

**Plan metadata:** Pending

## Files Created

- `governance/membership/MEMBERSHIP_LEVELS.md` - Membership tier definitions (429 lines)
  - Three tiers with explicit rights and obligations
  - Observer tier with full Apache 2.0 commercial use
  - Revenue-scaled dues schedule with SME/Mid/Enterprise bands
  - Founding Partner marked as CLOSED with transitional sunset provisions
  - Comparison table for clear rights visualization
  - References CHARTER.md as authoritative source

- `governance/membership/AGREEMENT.md` - Legal membership agreement template (600 lines)
  - Parties, membership tier, and term definitions
  - Rights and obligations by tier
  - Dues payment terms with 60-day grace period
  - Intellectual property provisions (Apache 2.0, DCO, patent grant)
  - Antitrust compliance section with prohibited topics
  - Limitation of liability and warranty disclaimers
  - Dispute resolution through mediation then arbitration
  - Clear legal review requirement disclaimer

## Decisions Made

1. **Revenue Bands:** Three bands (SME <EUR 10M, Mid-Market EUR 10M-100M, Enterprise >EUR 100M) with exact amounts TBD by Governing Board
   - Rationale: Balances accessibility for artisans with meaningful contribution from large houses

2. **Special Category Discounts:** 50% for nonprofits, academics, and government
   - Rationale: Encourages research and public sector participation

3. **Active Contributor Individual Status:** TSC voting tied to individual contributions, not organizational membership
   - Rationale: Maintains meritocratic principle - influence earned through contribution

4. **Grace Period:** 60 days before membership lapse on non-payment
   - Rationale: Allows for accounting delays without immediately penalizing good-faith members

5. **Agreement Template Approach:** Template requiring legal review rather than executable document
   - Rationale: Jurisdiction-specific requirements need counsel input before use

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward document creation following plan specifications and CONTEXT.md decisions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 1 Governance Foundation Status:**

With this plan complete, all 6 plans in Phase 1 are ready:
- 01-01: IP Foundation (LICENSE, DCO) - Complete
- 01-02: Governance Charter - Complete
- 01-03: RFC Process - Complete
- 01-04: Versioning Policy - Complete
- 01-05: TSC Operations - Complete
- 01-06: Membership System - Complete

**Ready for:**
- Phase 2: Architecture Foundation (neutral governance now established per TradeLens research guidance)
- Legal review of AGREEMENT.md before actual membership enrollment

**Blockers/Concerns:**
- None for Phase 2 progression
- AGREEMENT.md requires legal counsel review before execution
- Dues amounts (EUR [X]/[Y]/[Z]) need Governing Board determination

**GOV-01 Requirement Addressed:**
This plan completes the "regles de participation" requirement from PROJECT.md, establishing clear membership rules that:
- Enable both large houses and artisans to participate (revenue-scaled dues)
- Define Observer rights including free commercial use (Apache 2.0)
- Close Founding Partner window to prevent privilege-seeking
- Prepare legal framework for membership enrollment

---
*Phase: 01-governance-foundation*
*Plan: 06*
*Completed: 2026-01-30*

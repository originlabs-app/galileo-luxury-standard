# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #12 — Steady State

**Goal**: No autonomous work available. All remaining feature work is blocked on operator inputs.
**Started**: 2026-03-11
**Status**: empty (steady state)

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| — | No tasks — all remaining work is blocked | — | — | — | — |

### Status values
- `todo` — Not started
- `in_progress` — Developer is working on it
- `done` — Developer committed, awaiting validation
- `validated` — Tester confirmed it meets verification criteria
- `blocked` — Cannot proceed, reason in Notes
- `deferred` — Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [x] All tasks validated, explicitly deferred, or blocked with reason
- [ ] All tests pass (BLOCKED: WIP changes from Phase 3 break 54+ tests — operator decision pending)
- [x] No P0 bugs introduced
- [x] CONTEXT.md updated if architecture changed

## Task Briefs

No tasks to brief. The Researcher confirmed steady state on 2026-03-11.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

### Blockers awaiting operator input

1. **WIP changes from Phase 3** (commit 9f4a8fc): Uncommitted schema/route changes introduce MINTING status, new EventTypes, ~15 new ProductPassport fields. Tests expect old DRAFT->ACTIVE flow. 54+ tests fail. Options: (a) complete the Phase 3 feature + update all tests, or (b) revert uncommitted changes to restore green state. This is an operator decision — the changes are WIP code, not a regression.

2. **RPC key** (`BASE_SEPOLIA_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `BASESCAN_API_KEY`): Unlocks Phase 3 plan 03-02 (real Base Sepolia deployment). Without this, the remaining Phase 3 plans (03-02 through 03-05) cannot proceed.

3. **DB migration approval**: Unlocks REPAIRED/CPO_CERTIFIED event types, MFA, PostgreSQL RLS.

4. **Hosting accounts**: Unlocks actual Vercel + API deployment for hosted demo.

### When operator provides input

- If RPC key is provided: Researcher will create a sprint with Phase 3 tasks (03-02 through 03-05), aligned with `.planning/phases/03-base-sepolia-deployment-live-minting/`.
- If operator decides to revert WIP: Developer reverts uncommitted changes, tests return to green.
- If operator decides to complete Phase 3 feature: Developer completes the feature, updates all 54+ affected tests.

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

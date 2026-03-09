# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #8 — Batch Operations & Wallet Auth

**Goal**: Add batch CSV import/mint for brand onboarding at scale, and implement SIWE (Sign-In With Ethereum) wallet login. These are the highest-priority non-blocked P1 tasks. Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. RLS (🔒) skipped — needs operator approval.
**Started**: 2026-03-09
**Status**: archived (all 5/5 validated)

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T8.1 | Batch CSV import endpoint | EPIC-006 | validated | Upload CSV with 100 products, all created with correct GTIN validation. Errors reported per row. | 25aa114 |
| T8.2 | Batch mint endpoint | EPIC-006 | validated | POST /products/batch-mint with array of product IDs, all minted. Partial failure handled gracefully. | ccc86e8 |
| T8.3 | Dashboard: CSV import UI | EPIC-006 | validated | Upload button, file picker, progress feedback, error summary displayed. Works on desktop and mobile. | 96ba874 |
| T8.4 | SIWE wallet login (EIP-4361) | EPIC-005 | validated | User can login with wallet signature. Nonce endpoint, SIWE message format, session created on success. | d590d24 |
| T8.5 | E2E Playwright: batch import, batch mint, SIWE login | EPIC-007 | validated | Automated Playwright specs covering Sprint #8 features. Run with `pnpm --filter dashboard exec playwright test`. | a73f30c |

## Completion Criteria

- [x] All tasks validated, explicitly deferred, or blocked with reason
- [x] All tests pass
- [x] No P0 bugs introduced
- [x] CONTEXT.md updated if architecture changed

## Notes

Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. Sprint #8 pulled forward non-blocked P1 tasks: batch operations (EPIC-006) and SIWE wallet login (EPIC-005).

🔒 PostgreSQL RLS was NOT included — requires operator approval. Smart Wallet Coinbase (ERC-1271) gets partial coverage through viem's verifyMessage in T8.4.

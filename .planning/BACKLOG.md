# Backlog -- Galileo Protocol

> **What to do** -- user stories not yet in a sprint, organized by EPIC and prioritized.
> The backlog defines WHAT to build. When promoted to SPRINT.md, the Researcher adds HOW (implementation briefs).
> Every task belongs to an EPIC. EPICs are the functional bricks.

## Hierarchy

```
EPICs (functional bricks, in epics/)
  +-- Backlog (WHAT -- user stories, this file)
        +-- Sprint (WHAT + HOW -- tasks with implementation briefs, SPRINT.md)
```

## Priority Legend

- `P0` -- Critical: blocks users or breaks the product
- `P1` -- High: important for next milestone
- `P2` -- Medium: improves quality or DX
- `P3` -- Low: nice to have, future

## Tasks

### P0 -- Critical

- [x] `EPIC-007` Fix flaky test suites (mint, products, recall) -- DONE (Sprint #1, 3ac8bf6)

- [x] `EPIC-007` Fix FK constraint violations in combined test runs (verify, transfer, upload) -- RESOLVED (verified 2026-03-09: all 13 test files, 186 tests pass consistently in combined runs)
  - **Context**: Root cause was inconsistent cleanup/re-seed in beforeEach. Fixed by ensuring all test files use cleanDb() + re-seed parent rows (brand, user) consistently. fileParallelism: false prevents inter-file races.
  - **Verify**: All 13 test files pass when run together via `pnpm test` -- confirmed

- [ ] `EPIC-003` Deploy contracts on Base Sepolia -- [source: ROADMAP 3.1] -- BLOCKED (needs RPC key)
  - **Context**: All 12 contracts via Deploy.s.sol. Post-deploy config needed.
  - **Verify**: All contracts verified on Basescan Sepolia, addresses committed

- [ ] `EPIC-003` Replace mock mint with real ERC-3643 mint -- [source: ROADMAP 3.2] -- BLOCKED (depends on 3.1)
  - **Context**: Wire API to deployed contracts via viem
  - **Verify**: Mint creates real on-chain token, ProductPassport has real txHash

### P1 -- High

- [x] `EPIC-005` OWASP input validation audit -- DONE (Sprint #1, 75d4038)
- [x] `EPIC-005` Cookie hardening -- DONE (Sprint #1, 61ebf4e)
- [x] `EPIC-006` File upload to R2 + CID -- DONE (Sprint #1, 9600650)

- [x] `EPIC-004` Scanner material composition display -- DONE (Sprint #2, f91652f)
- [x] `EPIC-004` Scanner deep link -- DONE (Sprint #2, fdcefe1)

- [ ] `EPIC-005` Smart Wallet Coinbase support -- [source: ROADMAP 3.3]
  - **Context**: ERC-1271 verification, passkey, gasless. Requires Smart Wallet SDK integration.
  - **Verify**: Smart Wallet users can connect and sign transactions

- [ ] `EPIC-002` Remaining lifecycle events (REPAIRED, CPO_CERTIFIED) -- [source: ROADMAP 3.5]
  - **Context**: New EventType enum values, new API endpoints, schema migration
  - **Verify**: Events recorded and visible in provenance timeline

- [ ] `EPIC-002` Transfer flow with compliance check -- [source: ROADMAP 3.5]
  - **Context**: 5 compliance modules: jurisdiction, sanctions, brand auth, CPO, service center
  - **Verify**: Transfer blocked when compliance fails, with reason

### P2 -- Medium

- [x] `EPIC-007` Health check with dependency status -- DONE (Sprint #2, 25afe6c)
- [x] `EPIC-007` Structured logging (no PII) -- DONE (Sprint #2, 0749206)

- [ ] `EPIC-007` Sentry integration -- [source: ROADMAP 4.4]
  - **Context**: Error tracking for API and frontend
  - **Verify**: Errors captured in Sentry dashboard

- [ ] `EPIC-005` MFA: TOTP + passkey -- [source: ROADMAP 4.5]
  - **Context**: Enterprise-grade MFA for brand admin users
  - **Verify**: TOTP enrollment and verification flow works

- [ ] `EPIC-005` SIWE (EIP-4361) for wallet login -- [source: ROADMAP 4.5]
  - **Context**: Sign-In With Ethereum, ERC-1271 smart wallet verification
  - **Verify**: Users can login with wallet signature

- [x] `EPIC-006` GDPR erasure endpoint -- DONE (Sprint #3, 22eb6c4)

- [x] `EPIC-006` GDPR data export endpoint -- DONE (Sprint #3, 8532fc3)

- [ ] `EPIC-006` Audit trail -- [source: ROADMAP 4.3]
  - **Context**: Append-only log of who did what, when
  - **Verify**: All mutations recorded with actor, action, timestamp

- [x] `EPIC-008` Publish Swagger at /docs in production -- DONE (Sprint #3, 1ddbea6)

- [ ] `EPIC-002` Webhook system -- [source: ROADMAP 3.5]
  - **Context**: Real-time notifications for mint, transfer, CPO events
  - **Verify**: Webhook configured, events delivered to endpoint

- [ ] 🔒 `EPIC-006` PostgreSQL Row-Level Security -- [source: ROADMAP 4.2]
  - **Context**: Database-level brand isolation (currently app-level RBAC only)
  - **Verify**: Cross-brand data access impossible even with direct SQL

### P3 -- Low

- [ ] `EPIC-006` Batch operations: CSV import, batch mint -- [source: ROADMAP 4.2]
  - **Context**: Critical for brand onboarding at scale
  - **Verify**: CSV with 100 products imports and mints successfully

- [ ] `EPIC-006` DPIA draft -- [source: ROADMAP 4.3]
  - **Context**: Required before mainnet per EDPB Guidelines 02/2025
  - **Verify**: DPIA document completed and reviewed

- [ ] `EPIC-006` Human review for compliance rejections -- [source: ROADMAP 4.3]
  - **Context**: GDPR Art. 22 -- automated decisions need human review option
  - **Verify**: Rejected transfers can be escalated to human review

- [ ] `EPIC-008` Deploy frontend to Vercel -- [source: ROADMAP 4.7]
  - **Context**: Dashboard + scanner + website
  - **Verify**: All three apps live on Vercel

- [ ] `EPIC-008` Deploy API to dedicated host -- [source: ROADMAP 4.7]
  - **Context**: Railway, Render, or VPS
  - **Verify**: API accessible at production URL

- [ ] 🔒 `EPIC-008` Deploy contracts to Base mainnet -- [source: ROADMAP 4.7]
  - **Context**: Only after testnet E2E passes
  - **Verify**: Contracts deployed, verified, ownership transferred to multisig

- [ ] `EPIC-007` Vercel Analytics -- [source: ROADMAP 4.4]
  - **Context**: Frontend analytics for dashboard and scanner
  - **Verify**: Analytics dashboard shows page views

- [ ] `EPIC-007` Uptime monitoring -- [source: ROADMAP 4.4]
  - **Context**: External monitoring for API and frontend
  - **Verify**: Alerts configured for downtime

## Gated (POST-PILOT)

- [ ] `EPIC-009` T1 token ecosystem -- all tasks (see EPIC-009)
- [ ] `EPIC-010` Open source & DX -- all tasks (see EPIC-010)

## Rules

- Every task must belong to an EPIC (`EPIC-{NNN}-{slug}`)
- If no EPIC exists for a task, the Researcher creates one first
- Each task should be completable in ONE Developer cycle (~1 session)
- If a task is too big, break it down
- Include verification criteria
- The Researcher reorders by priority regularly

# Backlog -- Galileo Protocol

> **What to do** -- user stories not yet in a sprint, organized by EPIC and prioritized.
> The backlog defines WHAT to build. When promoted to SPRINT.md, the Researcher adds HOW (implementation briefs).
> Every task belongs to an EPIC. EPICs are the functional bricks.
>
> **Roadmap rebase (2026-03-09)**: Restructured per Codex audit. Priority: pilot closeout → real chain → lifecycle → tenant isolation → auth hardening. T1/LEOX stays post-pilot gate.

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

## Work Types

feature · improvement · UI · backend · security · performance · observability · data/DB migration · infrastructure · refactoring · testing · documentation

---

## Done (Sprints #1-4)

- [x] `EPIC-007` Fix flaky test suites — Sprint #1, 3ac8bf6
- [x] `EPIC-007` Fix FK constraint violations — Sprint #1, verified
- [x] `EPIC-005` OWASP input validation audit — Sprint #1, 75d4038
- [x] `EPIC-005` Cookie hardening — Sprint #1, 61ebf4e
- [x] `EPIC-006` File upload to R2 + CID — Sprint #1, 9600650
- [x] `EPIC-004` Scanner material composition display — Sprint #2, f91652f
- [x] `EPIC-004` Scanner deep link — Sprint #2, fdcefe1
- [x] `EPIC-007` Health check with dependency status — Sprint #2, 25afe6c
- [x] `EPIC-007` Structured logging (no PII) — Sprint #2, 0749206
- [x] `EPIC-008` Publish Swagger at /docs in production — Sprint #3, 1ddbea6
- [x] `EPIC-006` GDPR data export endpoint — Sprint #3, 8532fc3
- [x] `EPIC-006` GDPR erasure endpoint — Sprint #3, 22eb6c4
- [x] `EPIC-007` Sentry integration — Sprint #4, 78f3042
- [x] `EPIC-006` Audit trail — Sprint #4, 75e15ca
- [x] `EPIC-002` Product list filtering by status and category — Sprint #4, ff33ff6

---

## Sprint #5 — Pilot Closeout / Dashboard Ops (done)

- [x] `EPIC-002` GET /products/stats endpoint — Sprint #5, 78bbd38
- [x] `EPIC-002` Dashboard home: live stats + recent activity — Sprint #5, e5770c3
- [x] `EPIC-002` Dashboard product list: filter UI (status + category dropdowns) — Sprint #5, e8fcc48
- [x] `EPIC-006` Dashboard product image upload UI — Sprint #5, e17b6e5
- [x] `EPIC-007` E2E Playwright: dashboard stats, filters, upload — Sprint #5, 6f1b932

---

## Sprint #6 — Real Chain Unblock

> BLOCKED on RPC key. When operator provides the key, this sprint unlocks.

### P0 -- Critical

- [ ] `EPIC-003` Deploy contracts on Base Sepolia — [source: ROADMAP 3.1] — BLOCKED (needs RPC key)
  - **Context**: All 12 contracts via Deploy.s.sol. Post-deploy: commit addresses to config.
  - **Verify**: All contracts verified on Basescan Sepolia, addresses committed

- [ ] `EPIC-003` Configure RPC + contract addresses in API config
  - **Context**: Add contract addresses, authenticated RPC URL to config.ts. Update chain.ts plugin to use real addresses.
  - **Verify**: chain.ts connects to authenticated RPC, contract addresses available to routes

- [ ] `EPIC-003` Replace mock mint with real ERC-3643 mint — [source: ROADMAP 3.2]
  - **Context**: Wire mint.ts to deployed ERC-3643 contracts via viem. Real txHash, real tokenAddress.
  - **Verify**: Mint creates real on-chain token, ProductPassport has real txHash

- [ ] `EPIC-007` Health check: verify RPC connectivity
  - **Context**: Health endpoint already checks DB + chain. Enhance to verify authenticated RPC responds and contract is reachable.
  - **Verify**: /health returns degraded when RPC unreachable

- [ ] `EPIC-007` E2E Playwright: real mint flow (create → mint on-chain → verify → scan)
  - **Context**: Extend product-lifecycle.spec.ts to verify real txHash, Basescan link, scanner resolution
  - **Verify**: E2E covers the full pilot path with real on-chain data

---

## Sprint #7 — Compliance & Event Delivery (done)

### P1 -- High

- [ ] `EPIC-002` 🔒 Add REPAIRED, CPO_CERTIFIED, OWNERSHIP_CHANGED event types
  - **Context**: New EventType enum values in schema.prisma. Requires DB migration. Update @galileo/shared enums.
  - **Verify**: New event types available, old data intact after migration

- [ ] `EPIC-002` Remaining lifecycle endpoints (REPAIRED, CPO_CERTIFIED) — depends on 🔒 above
  - **Context**: New API endpoints POST /products/:id/repair, POST /products/:id/certify-cpo
  - **Verify**: Events recorded and visible in provenance timeline

- [x] `EPIC-002` Transfer flow with compliance check — Sprint #7 T7.1, 72746f2
  - **Context**: 5 compliance modules: jurisdiction, sanctions, brand auth, CPO, service center
  - **Verify**: Transfer blocked when compliance fails, with reason

- [x] `EPIC-002` Webhook system (outbox/retry pattern) — Sprint #7 T7.2, 3b805f1
  - **Context**: In-memory outbox + retry queue for event delivery. NOT direct HTTP callbacks.
  - **Verify**: Webhook configured, events delivered reliably with retry on failure

- [ ] `EPIC-006` Human review for compliance rejections — [source: ROADMAP 4.3] — depends on 🔒 above
  - **Context**: GDPR Art. 22 — automated decisions need human review option
  - **Verify**: Rejected transfers can be escalated to human review

- [x] `EPIC-007` E2E Playwright: compliance + webhooks + audit export — Sprint #7 T7.5, 60fb11e
  - **Context**: End-to-end coverage of compliance rejection/approval flows and audit export
  - **Verify**: E2E passes for happy path + compliance rejection scenario

---

## Sprint #8 — Tenant Isolation & Operations

### P1 -- High

- [ ] 🔒 `EPIC-006` PostgreSQL Row-Level Security — [source: ROADMAP 4.2]
  - **Context**: Database-level brand isolation. Currently app-level RBAC only. Audit ALL routes and Prisma queries first.
  - **Verify**: Cross-brand data access impossible even with direct SQL

- [ ] `EPIC-006` Batch operations: CSV import, batch mint — [source: ROADMAP 4.2]
  - **Context**: Critical for brand onboarding at scale
  - **Verify**: CSV with 100 products imports and mints successfully

- [x] `EPIC-006` Audit trail export + admin reporting — Sprint #7 T7.3, d6aac65
  - **Context**: Export audit log as CSV/JSON for compliance. Per-brand reporting.
  - **Verify**: ADMIN can export audit data, brand admins see only their brand

---

## Sprint #9 — Auth & Wallet Hardening

### P1 -- Security

- [x] `EPIC-005` Fix wallet-link: add nonce + expiry to signed message — Sprint #7 T7.4, 7e0eb06
  - **Context**: Current message is static (`"Link wallet to Galileo: {email}"`). No nonce, no expiry. Replay attack possible. Add server-generated nonce + timestamp, verify both.
  - **Verify**: Message includes nonce + expiry, old signatures rejected, replay blocked

- [ ] `EPIC-005` SIWE (EIP-4361) for wallet login — [source: ROADMAP 4.5]
  - **Context**: Sign-In With Ethereum. Requires nonce endpoint, SIWE message format, ERC-1271 verification.
  - **Verify**: Users can login with wallet signature

- [ ] `EPIC-005` Smart Wallet Coinbase support (ERC-1271) — [source: ROADMAP 3.3]
  - **Context**: ERC-1271 verification, passkey, gasless. Requires Smart Wallet SDK integration.
  - **Verify**: Smart Wallet users can connect and sign transactions

- [ ] `EPIC-005` MFA: TOTP + passkey — [source: ROADMAP 4.5]
  - **Context**: Enterprise-grade MFA for brand admin users
  - **Verify**: TOTP enrollment and verification flow works

- [ ] `EPIC-007` E2E Playwright: wallet link (with nonce) + SIWE login + MFA enrollment
  - **Context**: Full auth/wallet E2E coverage. Mock wallet interactions with Playwright.
  - **Verify**: E2E covers wallet link, SIWE login, MFA TOTP enrollment + verification

---

## Sprint #10+ — Production & Infrastructure

### P2 -- Medium

- [ ] `EPIC-008` Deploy frontend to Vercel — [source: ROADMAP 4.7]
  - **Context**: Dashboard + scanner + website
  - **Verify**: All three apps live on Vercel

- [ ] `EPIC-008` Deploy API to dedicated host — [source: ROADMAP 4.7]
  - **Context**: Railway, Render, or VPS
  - **Verify**: API accessible at production URL

- [ ] 🔒 `EPIC-008` Deploy contracts to Base mainnet — [source: ROADMAP 4.7]
  - **Context**: Only after testnet E2E passes
  - **Verify**: Contracts deployed, verified, ownership transferred to multisig

- [ ] `EPIC-007` Vercel Analytics — [source: ROADMAP 4.4]
  - **Context**: Frontend analytics for dashboard and scanner
  - **Verify**: Analytics dashboard shows page views

- [ ] `EPIC-007` Uptime monitoring — [source: ROADMAP 4.4]
  - **Context**: External monitoring for API and frontend
  - **Verify**: Alerts configured for downtime

- [ ] `EPIC-006` DPIA draft — [source: ROADMAP 4.3]
  - **Context**: Required before mainnet per EDPB Guidelines 02/2025
  - **Verify**: DPIA document completed and reviewed

---

## Audits (cross-cutting, not sprint-bound)

> Run these as deep-dive audits before the relevant sprint.

- [ ] **Audit 1: Pilot path** — create → mint → scan → verify → transfer (end-to-end). Chain plugin has no contract addressing (chain.ts:17). Run before Sprint #6.
- [ ] **Audit 2: Multi-tenant / data isolation** — all routes, Prisma queries, exports, audit-log, upload, QR. Run before Sprint #8.
- [ ] **Audit 3: Auth-wallet security** — static message, no nonce, no SIWE, no ERC-1271. Run before Sprint #9.
- [ ] **Audit 4: Event model / operational analytics** — stats, activity, lifecycle, webhooks depend on incomplete event model. Run before Sprint #7.
- [ ] **Audit 5: Doc-roadmap drift** — Sentry/audit/filtering validated in code but ROADMAP.md/README.md lag behind. Mini sprint for hygiene.

---

## Gated (POST-PILOT)

- [ ] `EPIC-009` T1 token ecosystem -- all tasks (see EPIC-009)
- [ ] `EPIC-010` Open source & DX -- all tasks (see EPIC-010)

---

## Rules

- Every task must belong to an EPIC (`EPIC-{NNN}-{slug}`)
- If no EPIC exists for a task, the Researcher creates one first
- Each task should be completable in ONE Developer cycle (~1 session)
- If a task is too big, break it down
- Include verification criteria
- The Researcher reorders by priority regularly
- 🔒 = requires explicit operator approval (DB migrations, deploys, destructive ops)

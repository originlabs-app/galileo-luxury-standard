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

- [ ] `EPIC-007` Fix flaky test suites (mint, products, recall) -- [source: ROADMAP 4.8]
  - **Context**: beforeEach DB cleanup hooks timeout (10s) under concurrent test execution. Shared PostgreSQL causes lock contention during deleteMany cascades. fileParallelism is already false but individual file runs still contend.
  - **Verify**: `pnpm --filter api test` passes 3 consecutive runs with zero timeouts

- [ ] `EPIC-003` Deploy contracts on Base Sepolia -- [source: ROADMAP 3.1] -- BLOCKED (needs RPC key)
  - **Context**: All 12 contracts via Deploy.s.sol. Post-deploy config needed.
  - **Verify**: All contracts verified on Basescan Sepolia, addresses committed

- [ ] `EPIC-003` Replace mock mint with real ERC-3643 mint -- [source: ROADMAP 3.2] -- BLOCKED (depends on 3.1)
  - **Context**: Wire API to deployed contracts via viem
  - **Verify**: Mint creates real on-chain token, ProductPassport has real txHash

### P1 -- High

- [ ] `EPIC-005` OWASP input validation audit -- [source: ROADMAP 4.1]
  - **Context**: Audit all API routes against OWASP top 10. Check for prototype pollution, mass assignment, injection vectors.
  - **Verify**: Each route reviewed, findings documented, fixes applied. No prototype pollution possible.

- [ ] `EPIC-005` Cookie hardening -- [source: ROADMAP 4.1]
  - **Context**: Add `__Host-` prefix for production cookies, cookie signing via @fastify/cookie secret, log warning when secure:false in dev.
  - **Verify**: Production cookies use `__Host-galileo_at` prefix. Cookie secret configured. Dev mode logs warning about insecure cookies.

- [ ] `EPIC-006` File upload to R2 + CID -- [source: ROADMAP 3.7]
  - **Context**: Photo/certificate upload to Cloudflare R2 with local CIDv1 computation for tamper-evidence. Dashboard upload UI.
  - **Verify**: Product create/edit form has photo upload. Photos stored in R2. CID computed and stored.

- [ ] `EPIC-004` Scanner material composition display -- [source: ROADMAP 3.4]
  - **Context**: Show material composition from DPP data in scanner verification page
  - **Verify**: Scanner shows material composition when available in product data

- [ ] `EPIC-004` Scanner deep link -- [source: ROADMAP 3.4]
  - **Context**: Scanning QR goes directly to product page (not scanner home)
  - **Verify**: QR scan opens product verification page directly

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

- [ ] `EPIC-007` Sentry integration -- [source: ROADMAP 4.4]
  - **Context**: Error tracking for API and frontend
  - **Verify**: Errors captured in Sentry dashboard

- [ ] `EPIC-007` Structured logging (no PII) -- [source: ROADMAP 4.4]
  - **Context**: JSON structured logs with correlation IDs, no personal data
  - **Verify**: Logs are parseable JSON, no PII present

- [ ] `EPIC-007` Health check with dependency status -- [source: ROADMAP 4.4]
  - **Context**: Existing /health endpoint extended with DB + chain RPC status
  - **Verify**: /health returns { db: "ok", chain: "ok|disabled" }

- [ ] `EPIC-005` MFA: TOTP + passkey -- [source: ROADMAP 4.5]
  - **Context**: Enterprise-grade MFA for brand admin users
  - **Verify**: TOTP enrollment and verification flow works

- [ ] `EPIC-005` SIWE (EIP-4361) for wallet login -- [source: ROADMAP 4.5]
  - **Context**: Sign-In With Ethereum, ERC-1271 smart wallet verification
  - **Verify**: Users can login with wallet signature

- [ ] `EPIC-006` GDPR erasure endpoint -- [source: ROADMAP 4.3]
  - **Context**: DELETE /users/:id/data -- delete from PostgreSQL + R2
  - **Verify**: User data fully erased, CID becomes orphan

- [ ] `EPIC-006` GDPR data export endpoint -- [source: ROADMAP 4.3]
  - **Context**: GET /users/:id/data -- return all user data as JSON
  - **Verify**: Returns complete user data package

- [ ] `EPIC-006` Audit trail -- [source: ROADMAP 4.3]
  - **Context**: Append-only log of who did what, when
  - **Verify**: All mutations recorded with actor, action, timestamp

- [ ] `EPIC-008` Publish Swagger at /docs in production -- [source: ROADMAP 4.6]
  - **Context**: Currently guarded to non-production only
  - **Verify**: /docs accessible in production

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

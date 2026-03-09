# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #11 — Doc-Roadmap Drift Audit

**Goal**: Update README.md and ROADMAP.md to reflect the actual state of the project after 10 sprints of autonomous development. Both files are frozen at Sprint #2 state — test counts, API endpoints, feature list, and sprint checkboxes are all stale.
**Started**: 2026-03-10
**Status**: active

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T11.1 | Doc-roadmap drift audit: update README.md and ROADMAP.md | EPIC-007 | todo | README test counts match actual (372 unit + 9 e2e specs). API table lists all 20 endpoints. Key Features reflects Sprints 1-10. ROADMAP Sprint 3/4 checkboxes updated for completed work. No broken links. | — |

### Status values
- `todo` — Not started
- `in_progress` — Developer is working on it
- `done` — Developer committed, awaiting validation
- `validated` — Tester confirmed it meets verification criteria
- `blocked` — Cannot proceed, reason in Notes
- `deferred` — Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated, explicitly deferred, or blocked with reason
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### T11.1 — Doc-Roadmap Drift Audit

**Type**: documentation
**Priority**: P2
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Context**: ROADMAP.md and README.md have not been updated since Sprint #2. Ten sprints of work (3-10) added major features (GDPR, audit trail, SIWE, Smart Wallet, batch operations, webhooks, compliance, Vercel Analytics, Dockerfile, DPIA) that are not reflected in these files. External readers and potential contributors see outdated information.

**Files to modify**:
- `README.md` — update test counts, API table, Key Features, testing section, repo structure, wallet section
- `ROADMAP.md` — update Sprint 3/4 checkboxes, "Immediate Execution Focus" section, sprint status markers

**IMPORTANT**: Do NOT rewrite these files from scratch. Surgically update the stale sections while preserving the operator's prose, vision sections, token architecture, GDPR architecture, and architectural constraints verbatim.

---

#### Part A — README.md Updates

**A1. Key Features section (line 18-28)**

Replace the header `### Key Features (Sprint 1, 2 & Hardening)` with `### Key Features` (drop the sprint reference — it dates the content).

Update the bullet list to reflect current state. Add these items after the existing bullets:

```markdown
- **GDPR Compliance** — Data export (Art. 15) and erasure (Art. 17) endpoints, PII-free structured logging, DPIA scaffold
- **Audit Trail** — Append-only audit log with CSV/JSON export, actor sanitization on user deletion
- **Wallet Authentication** — SIWE (EIP-4361) login, ERC-1271 Smart Wallet support (Coinbase), nonce-protected wallet linking
- **Batch Operations** — CSV import (up to 500 products) and batch mint (up to 100), with row-level validation and error reporting
- **Transfer Compliance** — 5-module compliance check (jurisdiction, sanctions, brand auth, CPO, service center)
- **Webhook System** — Outbox pattern with HMAC-SHA256 signing and exponential backoff retry
- **Observability** — Sentry error tracking, Vercel Analytics, structured Pino logging with PII redaction
- **Deployment Ready** — Vercel configs for frontend apps, multi-stage Dockerfile for API, HEALTHCHECK directive
```

Update the existing "Blockchain Integration" bullet — change "Mock minting" to "Mock minting (real chain deployment pending RPC key)".

Update the existing "Authentication & RBAC" bullet — add ", SIWE wallet login, Smart Wallet (ERC-1271)" at the end.

**A2. Architecture & Tech Stack section (line 32-37)**

Add the scanner line:
```markdown
- **Scanner**: Next.js PWA with QR scanning (barcode-detector), material composition display, GS1 deep links
```

**A3. Testing section (line 86-102)**

Replace the entire testing block with current numbers:

```markdown
## Testing

**372 unit tests + 9 Playwright e2e specs.** Test database (`galileo_test`) is isolated via `DATABASE_URL_TEST`.

| Suite | Tests | Scope |
|-------|-------|-------|
| @galileo/shared | 69 | GTIN validation, DID generation, auth schemas, user types, wallet validation |
| @galileo/api | 303 | Auth (32), Products (27), Security (24), Mint (10), Resolver/QR (17), CSRF (18), Health (6), Logging (3), GDPR (12), Upload (10), Recall (10), Transfer, Verify, Link-Wallet, Sentry, Webhooks, Batch-Import, Batch-Mint, SIWE, Audit, Audit-Export |
| Playwright e2e | 9 specs | Auth, product lifecycle, dashboard home, product filters, product upload, transfer compliance, audit export, batch import, SIWE + wallet auth |

```bash
pnpm test              # Unit tests (372)
pnpm --filter dashboard exec playwright test  # Playwright e2e (9 specs)
pnpm turbo typecheck   # TypeScript validation
pnpm turbo lint        # ESLint
pnpm turbo build       # Full build
```
```

**A4. API Endpoints table (line 106-119)**

Replace with the complete table from CONTEXT.md (all 20 endpoints):

```markdown
## API Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | public | Create account (+ optional brand) |
| POST | `/auth/login` | public | Login (sets httpOnly cookies) |
| POST | `/auth/logout` | authenticated | Clear cookies |
| POST | `/auth/refresh` | cookie | Refresh access token |
| GET | `/auth/me` | authenticated | Current user info + wallet address |
| POST | `/auth/link-wallet` | authenticated | Link wallet via EIP-191 signature |
| GET | `/auth/me/data` | authenticated | GDPR data export (Art. 15) |
| DELETE | `/auth/me/data` | authenticated + CSRF | GDPR erasure (Art. 17) |
| GET | `/auth/nonce` | authenticated | Generate nonce for wallet-link signing |
| GET | `/auth/siwe/nonce` | public | Generate SIWE nonce |
| POST | `/auth/siwe/verify` | public | Verify SIWE signature, issue session |
| GET | `/health` | public | Health check (DB + chain status) |
| POST | `/products` | BRAND_ADMIN+ | Create product |
| GET | `/products` | authenticated | List products (brand-scoped, filterable) |
| GET | `/products/:id` | authenticated | Product detail |
| PATCH | `/products/:id` | BRAND_ADMIN+ | Update DRAFT product |
| POST | `/products/:id/mint` | BRAND_ADMIN+ | Mock mint (DRAFT -> ACTIVE) |
| POST | `/products/:id/recall` | BRAND_ADMIN+ | Recall product (ACTIVE -> RECALLED) |
| POST | `/products/:id/transfer` | BRAND_ADMIN+ | Transfer to wallet (with compliance check) |
| POST | `/products/:id/verify` | public | Record verification event |
| POST | `/products/:id/upload` | BRAND_ADMIN+ | Upload product image (multipart) |
| GET | `/products/:id/qr` | authenticated | QR code (PNG) |
| GET | `/products/stats` | authenticated | Product statistics |
| POST | `/products/batch-import` | BRAND_ADMIN+ | CSV import (max 500 rows) |
| POST | `/products/batch-mint` | BRAND_ADMIN+ | Batch mint DRAFT products (max 100) |
| GET | `/01/:gtin/21/:serial` | public | GS1 Digital Link resolver (JSON-LD) |
| GET | `/audit-log` | ADMIN | Audit log entries (paginated) |
| GET | `/audit-log/export` | ADMIN | Export audit log (CSV/JSON) |
| POST | `/webhooks` | ADMIN | Register webhook subscription |
| GET | `/webhooks` | ADMIN | List webhook subscriptions |
```

**A5. Security section (line 122-133)**

Update the first line: replace "Three independent security audits completed (Sprint 1 + Sprint 2 hardening rounds):" with "Security hardened across 10 sprints of development:".

Add these bullets after the existing list:
```markdown
- **Cookie Hardening:** `__Host-galileo_at` (access) + `__Secure-galileo_rt` (refresh) prefixes in production, signed cookies via `@fastify/cookie`
- **Wallet Security:** Nonce-protected wallet linking (5-min TTL), SIWE with one-time nonce, ERC-1271 Smart Wallet verification
- **Compliance:** Transfer compliance check (5 modules), GDPR Art. 15/17 endpoints, audit trail with PII sanitization
```

**A6. Wallet section (line 78-83)**

Update to reflect current wallet support:
```markdown
### Wallet Integration

- **Browser wallets**: MetaMask, Rabby, and other injected wallets via wagmi
- **Smart Wallets**: Coinbase Smart Wallet with passkey support (ERC-1271 verification)
- **SIWE Login**: Sign-In With Ethereum for wallet-only authentication
- **Wallet Linking**: Nonce-protected EIP-191 signature flow for linking wallet to existing account
```

**A7. Repository Structure (line 140-150)**

Update scanner line — remove "(Coming Soon)":
```
│   └── scanner/               # Next.js scanner PWA (QR scanning, GS1 deep links)
```

---

#### Part B — ROADMAP.md Updates

**B1. Sprint status markers at top (line ~237-245)**

Update the sprint plan diagram — mark Sprints 1-4 status accurately:
```
Sprint 1 (Week 1-2)    Foundations         → Phase 0 + Phase 2 setup + Phase 3 shell          ✅
Sprint 2 (Week 3-4)    Product & Passport  → Mock mint, GS1 resolver, QR, 186 tests + 2 e2e   ✅
Sprint 3 (Week 5-6)    Real Chain & Scan   → Scanner PWA ✅, real chain deploy ⚠️ (blocked: RPC key)
Sprint 4 (Week 7-8)    Stabilisation       → Security ✅, GDPR ✅, audit ✅, multi-tenant ⚠️ (RLS 🔒), deploy configs ✅
  ── POST-PILOT GATE ──
Sprint 5 (Week 9-12)   T1/LEOX            → Phase 6 (only after KPI validation)
Sprint 6 (Week 13-16)  Open Source         → DX, docs, SDK, Docker, community (parallel w/ S5)
```

**B2. Sprint 3 checkboxes (section 3.3-3.8)**

Update these checkboxes that were completed in Sprints 3-10:

Section 3.3 Wallet Integration:
- Check `Smart Wallet Coinbase support` — add "(Sprint #9, 081ee0e/ce70f02)"

Section 3.4 Scanner PWA:
- Check `Material composition display` — add "(Sprint #2, f91652f)"
- Check `Deep link: scanning QR goes directly to product page` — add "(Sprint #2, fdcefe1)"

Section 3.5 Lifecycle Events & Transfers:
- Check `Transfer flow with compliance check (5 modules)` — add "(Sprint #7, 72746f2)"
- Check `Webhook system for real-time notifications` — add "(Sprint #7, 3b805f1)"

Section 3.7 File Upload:
- Check `Photo/certificate upload → Cloudflare R2 + local CID computation` — add "(Sprint #1, 9600650)"
- Check `Dashboard: photo upload UI` — add "(Sprint #5, e17b6e5)"

**B3. Sprint 4 checkboxes (section 4.1-4.8)**

Section 4.1 Security Hardening:
- Check `Input validation audit against OWASP top 10` — add "(Sprint #1, 75d4038)"
- Check `Consider __Host- cookie prefix` — add "(Sprint #1, 61ebf4e)"
- Check `Cookie signing via @fastify/cookie secret` — add "(Sprint #1, 61ebf4e)"

Section 4.2 Multi-Tenant Isolation:
- Check `Batch operations: CSV import of products, batch mint` — add "(Sprint #8, 25aa114/ccc86e8)"

Section 4.3 GDPR Compliance:
- Check `DELETE /users/:id/data` — add "(Sprint #3, 22eb6c4, implemented as DELETE /auth/me/data)"
- Check `GET /users/:id/data` — add "(Sprint #3, 8532fc3, implemented as GET /auth/me/data)"
- Check `Audit trail` — add "(Sprint #4, 75e15ca)"
- Check `DPIA draft` — add "(Sprint #10, 602b60f)"

Section 4.4 Monitoring & Observability:
- Check `Sentry integration` — add "(Sprint #4, 78f3042)"
- Check `Vercel Analytics` — add "(Sprint #9, 178035d)"
- Check `Health check endpoints with dependency status` — add "(Sprint #2, 25afe6c)"
- Check `Structured logging (no PII)` — add "(Sprint #2, 0749206)"

Section 4.5 Authentication:
- Check `SIWE (EIP-4361) for wallet login with ERC-1271` — add "(Sprint #8/9, d590d24/081ee0e)"

Section 4.6 API & Documentation:
- Check `Publish Swagger at /docs in production` — add "(Sprint #3, 1ddbea6)"

Section 4.8 Test Stability:
- Check `Fix mint.test.ts` — add "(Sprint #1, 3ac8bf6)"
- Check `Fix products.test.ts` — add "(Sprint #1, verified)"
- Check `Fix recall.test.ts` — add "(Sprint #1, verified)"

**B4. "Immediate Execution Focus" section (line ~285-314)**

This entire section is outdated — it describes priorities that have been addressed or are blocked. Replace the content while keeping the heading:

```markdown
## Immediate Execution Focus

The project has reached **steady state** for autonomous non-blocked work (as of Sprint #10).

### Completed pilot path (Sprints 1-10)
- [x] Create product with GTIN validation and DID generation
- [x] Mock mint with optimistic concurrency (real chain blocked on RPC key)
- [x] Scan QR and resolve DPP via GS1 Digital Link
- [x] Verify product authenticity (public endpoint)
- [x] Transfer with 5-module compliance check
- [x] Scanner PWA with QR scanning, material composition, deep links
- [x] Dashboard: full product management, batch operations, wallet connection
- [x] Security: SIWE, Smart Wallet, nonce-protected wallet linking, GDPR, audit trail
- [x] Observability: Sentry, Vercel Analytics, structured logging, health checks
- [x] Deployment: Vercel configs, API Dockerfile, DPIA scaffold

### Blocked — awaiting operator input
1. **RPC key** — unlocks Sprint #6 (real chain deployment on Base Sepolia)
2. **DB migration approval (🔒)** — unlocks REPAIRED/CPO_CERTIFIED events, MFA, RLS
3. **Hosting accounts** — unlocks actual Vercel + API deployment
4. **Contract deployment approval (🔒)** — unlocks Base mainnet
```

**B5. Sprint 2 "Delivered" line (line ~281)**

Update the test count reference: change "186 unit tests + 2 Playwright e2e tests passing" to "186 unit tests + 2 Playwright e2e tests passing (grown to 372 + 9 specs by Sprint #10)".

---

#### Approach

1. Open README.md, apply changes A1 through A7 surgically (edit specific sections)
2. Open ROADMAP.md, apply changes B1 through B5 surgically (check boxes, update markers)
3. Run `pnpm turbo typecheck` and `pnpm turbo build` to verify no breakage (documentation-only change, but good hygiene)
4. Commit: `docs: update README and ROADMAP for Sprints 3-10 drift (Audit 5)`

**Patterns to follow**:
- Preserve operator's prose verbatim — only update factual data (counts, checkboxes, feature lists)
- Use commit hashes from BACKLOG.md/EPICs when checking boxes in ROADMAP
- Keep README concise — detailed API docs live in Swagger at /docs
- Do NOT add emojis to README (badges are fine, emoji markers are not)

**Edge cases**:
- ROADMAP has double-spaced line numbers from the persisted output — Developer should work from the actual file, not the plan's line references
- Some ROADMAP checkboxes reference endpoints at different paths than implemented (e.g., `DELETE /users/:id/data` vs actual `DELETE /auth/me/data`) — add a note in parentheses
- The "186 tests" number appears in multiple places in ROADMAP — update all occurrences
- Scanner repo structure line says "(Coming Soon)" — scanner is fully functional, remove this

**Tests**: No new tests. Documentation-only change.

**Verify**:
1. README test counts match actual: 372 unit tests (69 shared + 303 API), 9 e2e specs
2. README API table lists all endpoints from CONTEXT.md (30 rows)
3. README Key Features section includes GDPR, audit, SIWE, batch ops, webhooks, compliance, observability, deployment
4. ROADMAP Sprint 3 checkboxes: Smart Wallet, material composition, deep link, compliance, webhooks, file upload checked
5. ROADMAP Sprint 4 checkboxes: OWASP, cookies, batch ops, GDPR, audit, DPIA, Sentry, Analytics, health, logging, SIWE, Swagger, test fixes checked
6. ROADMAP "Immediate Execution Focus" updated to steady-state summary
7. No broken markdown formatting (tables render correctly)
8. `pnpm turbo build` still passes

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

Sprint #11 is a lightweight documentation sprint. All remaining feature work is blocked on operator inputs (RPC key, DB migration approval, hosting accounts).

Steady state confirmed: no promotable P1/P2 tasks remain that don't depend on blocked items or operator approval.

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

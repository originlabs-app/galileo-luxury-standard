# Galileo Protocol — Roadmap

## Vision

Build the **open standard for luxury product traceability on blockchain** — adopted by all brands, from independent maisons to global groups.

**Short-term (Sprints 1-4):** A luxury brand creates a product, mints its on-chain passport, and a customer scans a QR code to see the Digital Product Passport.

**Medium-term (Sprints 5-6):** Integrate T1 as the ecosystem utility token. Prepare for open source adoption: SDK, Docker, sandbox, documentation.

**Long-term:** Become the neutral, interoperable alternative to proprietary solutions (Aura, Arianee). Position as the **only open standard combining GS1 Digital Link + W3C DID + ERC-3643 + ESPR 2024/1781 compliance** in a single stack.

### Why brands will adopt

1. **Regulatory pressure** — ESPR 2027 mandates DPPs for textiles/footwear, then leather, then watches
2. **Anti-counterfeiting** — Luxury loses ~$50B/year to counterfeiting (OECD 2024)
3. **Interoperability** — CPO products changing brands (service, resale) need a common standard
4. **Neutrality** — Unlike Aura (LVMH-led), Galileo has anti-dominance governance (max 2 TSC seats per org)
5. **Cost** — Open source = no SaaS license, only infrastructure cost

---

## GDPR Compliance Architecture

> Based on [EDPB Guidelines 02/2025](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf) on processing personal data through blockchain technologies.

**Core principle: ZERO personal data on-chain.** The EDPB is explicit — technical impossibility of deletion is not a valid justification under GDPR.

### What goes on-chain (immutable, public)

- Token ID (uint256) — not personal data
- Product DID (`did:galileo:01:{gtin}:21:{serial}`) — identifies the product, not the person
- IPFS content hash (CID) — integrity proof, not the data itself
- Brand identity claims (ONCHAINID) — corporate identity, not personal
- Transfer events — wallet addresses only (pseudonymous)
- CPO certification status — boolean, no personal details
- Compliance check results — pass/fail, no personal data

### What stays off-chain (deletable, access-controlled)

- Customer names, emails, shipping addresses → PostgreSQL (GDPR-deletable)
- Product photos, certificates → Cloudflare R2 (deletable)
- KYC/AML documents → dedicated provider (retention per 5AMLD: 5 years, then deleted)
- Wallet-to-identity mappings → PostgreSQL (deletable on request)
- Transaction metadata (who bought what) → PostgreSQL

### CRAB Model (already in specs)

The specifications define the **CRAB** (Create-Read-Archive-Burn) model for GDPR erasure:
1. **Create** — personal data stored off-chain with on-chain hash reference
2. **Read** — access controlled by RBAC + ONCHAINID claims
3. **Archive** — after retention period, data moved to cold storage
4. **Burn** — off-chain data deleted; on-chain hash becomes an orphan pointer (unresolvable but not personal data per EDPB guidance)

### IPFS — Compute CID, Don't Pin

**Critical decision:** We compute the IPFS CID locally (for tamper-evidence) but **do NOT pin to the IPFS network**.

Why:
- IPFS is a content-addressed network — once pinned, data can be replicated by any node
- No mechanism to enforce deletion across IPFS nodes ([GDPR incompatible](https://discuss.ipfs.tech/t/ipfs-and-gdpr-cpra-compliance/13978))
- CID computation is a pure hash function — gives the same integrity guarantee without network distribution
- Actual data served from R2 (fast, deletable, geo-restricted if needed)

Flow:
```
Product data → compute CID locally → store CID on-chain → store data on R2
GDPR delete request → delete from R2 → CID on-chain becomes unresolvable → done
```

### DPIA Requirement

The EDPB requires a Data Protection Impact Assessment (DPIA) before processing personal data via blockchain. This must be completed before mainnet deployment.

### Wallet Addresses as Pseudonymous Data

Per EDPB guidelines, wallet addresses are **pseudonymous personal data** (indirect identification possible with additional info). Mitigation:
- Wallet-to-identity mapping stored off-chain only (deletable)
- On-chain transfer events contain wallet addresses but no identity link
- Right to erasure: delete the off-chain mapping → wallet becomes anonymous

### Smart Contract Considerations

Per [Article 22 GDPR](https://www.arthurcox.com/knowledge/personal-data-on-the-chain-edpb-guidelines-for-blockchain-technologies/), smart contracts executing automated decisions about individuals require safeguards. Our compliance modules (jurisdiction check, sanctions screening) are automated decisions → must provide:
- Human review option for rejected transfers
- Clear explanation of why a transfer was blocked (`canTransferWithReason()` already implemented)
- Right to contest the automated decision

Sources:
- [EDPB Guidelines 02/2025 (PDF)](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf)
- [Clifford Chance Analysis](https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2025/06/edpb-draft-guidelines-on-personal-data-processing-through-blockc.html)
- [Oxford Academic — Reconciling Blockchain and Data Protection](https://academic.oup.com/cybersecurity/article/11/1/tyaf002/8024082)

---

## Token Architecture: LEOX + T1

### Current State

| Token | Chain | Supply | Price | Status |
|-------|-------|--------|-------|--------|
| LEOX | Ethereum (ERC-20) | 150M | ~$0.009 | Live, MEXC/BitMart/Uniswap |
| AVIA | Avalanche (ERC-20) | 100M | ~$0.007 | Live, low liquidity |

### T1 — "Tokenizd One"

T1 unifies the ecosystem across Galileo (luxury), Kepler (aviation), and Tokenizd (TaaS).

- **Supply:** 1 billion T1 (fixed, deflationary via buy-back-and-burn)
- **Issuer:** Origin Labs SASU (decision made — no new entity needed)
- **Multi-chain:** Base L2 (primary, where Galileo contracts live) + Ethereum (bridge for LEOX migration)
- **Classification:** Utility token (not EMT, not ART under MiCA)

### Architecture Decision (validated)

1. **App + all business logic on Base ONLY**
   - Dashboard/API, mint, transfer, resolver, paymaster: everything on Base
2. **LEOX stays legacy on Ethereum**
   - Liquidity/history preserved on Ethereum
   - Only usable in the Base app if bridged (as "LEOX.b")
3. **T1 canonical on Base, multichain via bridge**
   - Primary issuance of T1 on Base
   - Ethereum version is a bridged representation (NOT independent double mint)
4. **Paymaster constraint**
   - Base paymaster cannot debit LEOX on Ethereum directly
   - "Gas paid in LEOX/T1" in the Base app = T1 (Base) or bridged LEOX.b
5. **Implementation phases:**
   - Phase 1: T1 native Base + paymaster Base
   - Phase 2: LEOX Ethereum → T1 Base migration portal
   - Phase 3: optional T1 on Ethereum for liquidity (bridge), product stays Base-first

### Coexistence Model

LEOX and T1 coexist initially. Migration portal available for voluntary swap.

```
Phase 1 (now)     LEOX lives on Ethereum, Galileo contracts on Base
Phase 2 (T1)      T1 launches on Base, migration portal LEOX→T1 opens
Phase 3 (mature)  T1 is primary utility token, LEOX holders can still migrate
```

### Gas Abstraction via Paymaster

Users never hold or spend ETH. All gas is paid in T1 or bridged LEOX.b via an ERC-4337 Paymaster on Base:

```
User action (mint, transfer, certify)
  → Smart Wallet creates UserOperation
  → GalileoPaymaster checks T1/LEOX.b balance (on Base)
  → Paymaster sponsors ETH gas on Base
  → Deducts equivalent T1/LEOX.b from user wallet
  → Transaction executed — zero ETH friction
```

The Paymaster contract:
- Accepts T1 and bridged LEOX.b as gas payment tokens (Base only)
- Uses Chainlink/Pyth price feed for T1→ETH conversion
- Applies the same 5-15% discount for T1 vs LEOX.b
- Revenue from gas fees flows into buy-back-and-burn pool
- Cannot debit LEOX on Ethereum directly — bridge required first

### T1 Utility in Galileo

| Action | Payment | T1 Benefit |
|--------|---------|------------|
| Mint a product DPP | EUR, T1, or LEOX | 10% discount with T1 |
| Transfer ownership | EUR, T1, or LEOX | 5% discount with T1 |
| CPO certification | EUR, T1, or LEOX | 10% discount with T1 |
| Gas fees | T1 or LEOX (via Paymaster) | No ETH needed, 5-15% discount with T1 |
| Premium API access | Staking T1 | Unlock advanced features |
| Governance votes | Hold T1 | Vote on protocol evolution |

### T1 Utility in Kepler/Aerocert

| Action | T1 Benefit |
|--------|------------|
| Blockchain anchoring fee | 5-15% discount vs EUR |
| Premium API access | Staking T1 |
| Diploma verification | Micro-payment in T1 |

### Buy-back-and-burn

- Quarterly: 1-5% of net revenues from all 4 entities → buy T1 on DEX → burn
- Net revenues = gross - external fees (Stripe, gas, VAT, audits) only
- Audited by independent firm
- Percentage adjustable by DAO vote (within 1-5% range)

### Smart Contracts (T1-specific, separate from Galileo ERC-3643)

| Contract | Purpose |
|----------|---------|
| `T1Token.sol` | ERC-20 on Base, fixed 1B supply |
| `MigrationPortal.sol` | LEOX→T1 swap with KYC, anti-whale vesting |
| `BuybackBurn.sol` | DEX buy + burn, oracle-fed revenue data |
| `StakingAccess.sol` | Stake T1 → unlock premium tiers |
| `DiscountManager.sol` | On-chain discount logic (5-15%) |
| `TreasuryDAO.sol` | Multi-sig treasury for ecosystem fund |

### Legal — Open Items

- [ ] SASU can issue utility token under MiCA? (validate with counsel)
- [ ] Inter-entity liquidity contribution structure (convention between 4 entities)
- [ ] Fiscal treatment of token revenues for Origin Labs SASU
- [ ] LEOX ownership resolution (Nathaniel litigation) — T1 launches independently

---

### Phase Status Legend

| Marker | Meaning |
|--------|---------|
| ✅ | Implemented (code exists in repo today) |
| 🔲 | Planned (described but not yet coded) |
| ⚠️ | Partially done |

---

## Architectural Constraints (validated)

These decisions were locked before Sprint 1. They are **not negotiable** without explicit re-evaluation.

| # | Constraint | Rationale |
|---|-----------|-----------|
| 1 | **ERC-3643 only** (no ERC-721) | Repo is built on ERC-3643/T-REX compliance modules. Introducing ERC-721 would create two incompatible token models. Product passports = permissioned tokens with compliance hooks. |
| 2 | **Foundry only** (no Hardhat) | Already in place (`forge build`, `forge test`, 722 tests). One toolchain = one source of truth. |
| 3 | **Fastify API only** (no Next.js Route Handlers for API) | B2B multi-tenant + webhooks + background jobs + chain sync = dedicated API server. Next.js handles frontend only. |
| 4 | **Don't pin Next.js version** | Use whatever version is current. Repo already runs latest — pinning "15" creates drift. |
| 5 | **GTIN/serial identifiers from day 1** | DID format is `did:galileo:01:{gtin}:21:{serial}`, not UUID. GS1 Digital Link resolver is core — identifiers must be GS1-native from Sprint 2. |
| 6 | **T1/LEOX = post-pilot gate** | Sprint 5 only starts after MVP KPIs validated: create→mint→scan→verify stable on Base Sepolia with real brand data. |

---

## Sprint Plan (MVP)

The roadmap is organized in **6 sprints** mapping to the detailed phases below.

```
Sprint 1 (Week 1-2)    Foundations         → Phase 0 + Phase 2 setup + Phase 3 shell          ✅
Sprint 2 (Week 3-4)    Product & Passport  → Mock mint, GS1 resolver, QR, 186 tests + 2 e2e   ✅
Sprint 3 (Week 5-6)    Real Chain & Scan   → Base Sepolia deploy, scanner PWA, lifecycle events
Sprint 4 (Week 7-8)    Stabilisation       → Security, multi-tenant, GDPR, prod deploy
  ── POST-PILOT GATE ──
Sprint 5 (Week 9-12)   T1/LEOX            → Phase 6 (only after KPI validation)
Sprint 6 (Week 13-16)  Open Source         → DX, docs, SDK, Docker, community (parallel w/ S5)
```

### Sprint 1 — Foundations (Week 1-2) ✅ Complete

**Goal:** Technical stack up and running — auth, data model, CI green.

- [x] Monorepo setup (Turborepo): `apps/api` (Fastify), `apps/dashboard` (Next.js), `apps/scanner` (Next.js PWA), `packages/shared`
- [x] Auth: email/password + JWT, RBAC (admin, brand-admin, operator, viewer). MFA deferred to Sprint 4.
- [x] DB schema (Prisma 7): `Brand`, `Product`, `ProductPassport`, `ProductEvent`, `User`
- [x] Fastify 5 API: auth endpoints (register/login/refresh/me), health check, OpenAPI/Swagger
- [x] CI pipeline (GitHub Actions): 3 independent jobs (apps, contracts, website)
- [x] Dashboard: ABYSSE theme, login/register/dashboard/products pages, sidebar, auth guard
- [x] Scanner shell: Coming Soon page with ABYSSE theme
- [x] Smart contract CI: `forge build && forge test` in contracts job
- [x] `@galileo/shared`: GTIN-13/14 validation (GS1 mod-10), DID generation, Zod auth schemas, TypeScript types
- [x] Security hardening: SHA-256 hashed refresh tokens, timing-safe login, atomic token rotation, password max length, Swagger prod guard

**Delivered:** 63 tests passing, 68/68 validation assertions, 25 commits. Code reviewed with 7 critical + 16 important findings addressed.

**Exit:** `pnpm dev` starts all apps. Auth flow works. CI green. ✅

### Sprint 2 — Product & Passport Creation (Week 3-4) ✅ Complete

**Goal:** A brand-admin can create a product, mint its ERC-3643 passport on Base Sepolia, and a resolver returns the DPP via GS1 Digital Link.

- [x] Product CRUD API: POST/GET/PATCH products with GTIN validation and RBAC
- [x] DID generation: `did:galileo:01:{gtin}:21:{serial}` (GS1-native, shared package)
- [ ] Contract deployment on Base Sepolia (existing `Deploy.s.sol`) — still pending, mock mode used
- [x] Mint flow: API prepares mock mint → synthetic on-chain data → status ACTIVE → optimistic concurrency control
- [x] GS1 Digital Link resolver: `GET /01/:gtin/21/:serial` returns JSON-LD DPP with custom galileo/gs1 context
- [x] QR code generation from Digital Link URL (PNG endpoint)
- [x] Dashboard: product list, product create form, product detail with edit, mint button, QR download
- [x] Security debt: httpOnly cookie auth, pin deps, test DB isolation, shared type split, URL-encode serial, DID check digit validation
- [ ] Photo/certificate upload → R2 + local CID computation (deferred to Sprint 3)
- [ ] Gas benchmarks documented (deferred — mock mode, no real chain)

**Delivered:** 186 unit tests + 2 Playwright e2e tests passing. 8 luxury categories aligned across API/dashboard/shared. Auth via httpOnly cookies with CSRF header protection. AuthProvider Context for single /auth/me fetch. SSR-safe AuthGuard. Optimistic concurrency control on mint. GS1 Digital Link resolver with 14-digit GTIN padding, check digit validation, and conformant JSON-LD (@type=IndividualProduct, custom galileo/gs1 namespaces). CI with pnpm cache, frozen-lockfile, and E2E tests. Portable init.sh and services.yaml.

**Exit:** Brand creates product → mints mock passport → QR resolves to DPP JSON-LD. Security debt from Sprint 1 + 2 audits fully cleared (3 rounds: Sprint 1 hardening, Sprint 2 hardening, Sprint 2 hardening round 2). Real Sepolia deployment deferred to Sprint 3. ✅

## Immediate Execution Focus (next 1-2 weeks)

The priority is **not** to advance every roadmap lane in parallel.
The immediate objective is to close the shortest path to a credible pilot:

**create product → real mint on Base Sepolia → scan QR → verify DPP**

Everything else stays secondary until this path is stable and demonstrable.

### Immediate priorities

1. **Real chain deployment on Base Sepolia**
   - deploy and verify contracts
   - record deployment addresses
   - configure authenticated RPC
2. **Replace mock mint with real mint**
   - wire API to deployed contracts
   - persist real tx and token data
   - verify identity registry flow
3. **Deliver scanner PWA minimum**
   - scan QR
   - resolve product
   - render verification result cleanly
4. **Prove the pilot with E2E**
   - create → mint → scan → verify
5. **Validate every important PR before merge**
   - local checks
   - GitHub checks
   - E2E when available
   - explicit verdict: mergeable / not-mergeable / uncertain

### Merge discipline from now on

For important GalileoLuxury PRs, merge should happen only after:
- local review worktree validation
- GitHub checks review
- explicit statement of what was tested
- explicit note when E2E was not run

### Sprint 3 — Scanner, Real Chain & Verification (Week 5-6)

**Prerequisite from Sprint 2:** Mock minting is complete. Sprint 3 starts with real Base Sepolia deployment before building the scanner.

**Goal:** Anyone can scan a QR code and verify product authenticity — on real chain.

#### 3.1 Real Chain Deployment (P0)

- [ ] Deploy contracts on Base Sepolia via `Deploy.s.sol` (all 12 contracts)
- [ ] Post-deploy: configure sanctions oracle, add trusted issuer in TIR, register identities, grant AGENT_ROLE, unpause token
- [ ] Verify all contracts on Basescan Sepolia
- [ ] Record addresses in `contracts/deployments/base-sepolia.json`
- [ ] Configure authenticated RPC URL (Alchemy/QuickNode) in `apps/api/src/plugins/chain.ts` — replace public `http()` fallback
- [ ] Document gas benchmarks for each operation

#### 3.2 Real Mint Integration (P0)

- [ ] Replace mock mint with real ERC-3643 mint via viem + deployed contracts
- [ ] Implement Identity Registry verification before mint (`isVerified()`)
- [ ] Use `GalileoToken.mint()` with proper AGENT_ROLE
- [ ] Update ProductPassport with real on-chain data (txHash, tokenAddress, chainId)
- [ ] Add RPC_URL to config.ts env schema with fallback transport

#### 3.3 Wallet Integration (P0)

- [x] Integrate wagmi + RainbowKit in dashboard for wallet connection (PR #15)
- [x] Implement `POST /auth/link-wallet` API endpoint with EIP-191 signature verification (PR #21)
- [ ] Smart Wallet Coinbase support (passkey, gasless) with ERC-1271 verification
- [ ] Mint flow: review product data → wallet popup → sign tx → confirmation

#### 3.4 Scanner PWA (P0)

- [x] Scanner PWA shell: paste link → resolve → verification result (PR #16)
- [x] PWA manifest, SVG icons, viewport/theme config, standalone display
- [x] Security hardening: XSS fix, JSON.parse safety, no phantom API call
- [x] QR scanning: `getUserMedia` + `barcode-detector` (ZXing WASM ponyfill) — `/scan` route (PR #17)
- [x] Public verification page: provenance timeline in scanner + resolver API (PR #22)
- [ ] Material composition display
- [x] Service worker for offline cache of previously scanned products
- [ ] Deep link: scanning QR goes directly to product page

#### 3.5 Lifecycle Events & Transfers (P1)

- [x] Lifecycle events API: CREATED, UPDATED, MINTED events working
- [x] Recall endpoint: `POST /products/:id/recall` — ACTIVE → RECALLED with reason + RECALLED event
- [x] Dashboard recall button + event timeline icons for all event types (PR #20)
- [x] Transfer endpoint: `POST /products/:id/transfer` — wallet-to-wallet with TRANSFERRED event (PR #23)
- [x] Verify endpoint: `POST /products/:id/verify` — public, records VERIFIED event with optional auth
- [ ] Remaining events: `OWNERSHIP_CHANGED`, `REPAIRED`, `CPO_CERTIFIED`
- [ ] Event logging (append-only, off-chain + on-chain anchoring)
- [ ] Transfer flow with compliance check (5 modules: jurisdiction, sanctions, brand auth, CPO, service center)
- [ ] CPO certification flow
- [ ] Webhook system for real-time notifications (mint, transfer, CPO) — enables CRM/ERP integration

#### 3.6 JSON-LD Compliance Fixes (P1)

> From W3C/GS1 compliance audit (see `planning/research-w3c-compliance.md`)

- [x] **C1:** Add Galileo JSON-LD context to resolver `@context` array (`https://vocab.galileoprotocol.io/contexts/galileo.jsonld`)
- [x] **C2:** Change `@type` from `"Product"` to `"IndividualProduct"` (align with dpp-core.schema.json) — already done
- [x] **C3:** Add `@type: "Brand"` to brand object, use `@id` instead of custom `did` property
- [x] **I1:** Fix GS1 context URL from `https://gs1.org/voc` to canonical `https://ref.gs1.org/voc/`
- [x] **I2:** Add `@id` (product DID) to root JSON-LD object (currently anonymous blank node) — already done
- [x] **I3:** Add `serialNumber` field to resolver response (required for `IndividualProduct`)
- [x] **I4:** Tighten DID serial regex in `packages/shared/src/validation/did.ts` from `.+` to `[A-Za-z0-9\-\.]{1,20}` per DID-METHOD.md ABNF
- [x] **M5:** Add explicit mappings for `status`, `passport.*` properties in `galileo.jsonld` (prevent `@vocab` fallback to Schema.org)
- [x] Update test assertions to expect `IndividualProduct` (currently expect `Product`)

#### 3.7 File Upload (P1)

- [ ] Photo/certificate upload → Cloudflare R2 + local CID computation (CIDv1)
- [ ] Dashboard: photo upload UI in product create/edit form

#### 3.8 E2E Tests (P0)

- [ ] E2E test: create → mint (real chain) → scan → verify → transfer → re-verify

**Exit:** Full product lifecycle works end-to-end on Base Sepolia. Customer scans QR, sees verified DPP. JSON-LD response is W3C/GS1 conformant.

### Sprint 4 — Stabilisation & Production (Week 7-8)

**Goal:** Production-ready for the first brand pilot.

#### 4.1 Security Hardening (P0)

- [x] Rate limiting on all endpoints (`@fastify/rate-limit` — 5/min auth, 60/min resolver, 100/min default)
- [ ] Input validation audit against OWASP top 10
- [x] Security headers via `@fastify/helmet` (CSP, HSTS, X-Frame-Options, CORP, COOP, referrer-policy)
- [ ] Consider `__Host-` cookie prefix for production (`__Host-galileo_at`)
- [ ] Cookie signing via `@fastify/cookie` secret (defense in depth on top of JWT signature)
- [ ] Log warning when `secure: false` in development mode

#### 4.2 Multi-Tenant Isolation (P0)

- [ ] PostgreSQL Row-Level Security (RLS) or schema-per-brand
- [ ] Currently brandId scoping via RBAC — needs database-level enforcement
- [ ] Batch operations: CSV import of products, batch mint via factory (critical for brand onboarding)

#### 4.3 GDPR Compliance (P0)

- [ ] `DELETE /users/:id/data` — GDPR erasure (Art. 17): delete from PostgreSQL + R2, CID becomes orphan
- [ ] `GET /users/:id/data` — GDPR data export (Art. 15)
- [ ] Audit trail: who did what, when (append-only log)
- [ ] Human review endpoint for compliance rejections (GDPR Art. 22)
- [ ] DPIA draft (required before mainnet per EDPB Guidelines 02/2025)

#### 4.4 Monitoring & Observability (P1)

- [ ] Sentry integration (error tracking)
- [ ] Vercel Analytics (frontend)
- [ ] Health check endpoints with dependency status (DB, chain RPC)
- [ ] Uptime monitoring
- [ ] Structured logging (no PII)

#### 4.5 Authentication (P1)

- [ ] MFA: TOTP + passkey (enterprise-grade security)
- [ ] SIWE (EIP-4361) for wallet login with ERC-1271 smart wallet verification

#### 4.6 API & Documentation (P1)

- [ ] API documentation auto-generated from Fastify schemas (OpenAPI/Swagger)
- [ ] Publish Swagger at `/docs` in production (currently guarded)

#### 4.7 Production Deployment (P0)

- [ ] Deploy frontend: Vercel (dashboard + scanner + website)
- [ ] Deploy API: dedicated host (Railway, Render, or VPS)
- [ ] Deploy contracts: Base mainnet (chainId 8453) — only after testnet E2E passes
- [ ] Use dedicated RPC provider (Alchemy/QuickNode — NOT public `mainnet.base.org`)
- [ ] Transfer contract ownership to multisig (Safe)
- [ ] Create `contracts/deployments/base-mainnet.json`
- [ ] Host Galileo JSON-LD context at `https://vocab.galileoprotocol.io/contexts/galileo.jsonld`

**Exit:** MVP stable. First brand can onboard and use the full create→mint→scan→verify flow in production.

### Sprint 5 — T1/LEOX & Multichain (Week 9-12) — POST-PILOT GATE

**Entry criteria (ALL must be met):**
- [ ] Sprint 4 exit criteria validated
- [ ] At least 1 brand pilot active with real products
- [ ] Create→mint→scan→verify flow stable (< 1% error rate)
- [ ] No critical/high severity bugs open

See Phase 6 below for detailed scope.

### Sprint 6 — Open Source Adoption (Week 13-16) — PARALLEL WITH SPRINT 5

**Entry criteria:** Sprint 4 exit validated, at least 1 brand pilot active.

**Goal:** Make Galileo Protocol adoptable by any brand without Origin Labs support.

#### 6.1 Developer Experience (P0)

- [ ] Docker Compose for local dev (PostgreSQL + API + Dashboard + Scanner — single `docker compose up`)
- [ ] SDK TypeScript (`@galileo/sdk`): typed API client, DPP helpers, GTIN validation — publishable on npm
- [ ] CLI tool: `npx @galileo/cli create-product --gtin ... --name ...` for integrators
- [ ] Sandbox hosted at `sandbox.galileoprotocol.io` with demo data and scannable QR codes
- [ ] Auto-generated REST/OpenAPI clients for Python, Go, Java (multi-stack brand support)

#### 6.2 Documentation (P0)

- [ ] Architecture Decision Records (ADRs): document the "why" (ERC-3643 vs ERC-721, Fastify vs Next.js API, etc.)
- [ ] Integration Guide: step-by-step "How to connect your ERP to Galileo"
- [ ] Smart Contract Deployment Guide: Base Sepolia → mainnet runbook
- [ ] Schema Extension Guide: how to create a custom DPP schema (e.g., Swiss watchmaking)
- [ ] API Reference: auto-generated + curl/SDK examples
- [ ] Compliance Mapping: ESPR article → Galileo field mapping table
- [ ] Video tutorials: "Create your first DPP in 10 minutes"

#### 6.3 Packaging & Distribution (P1)

- [ ] Publish npm packages: `@galileo/shared`, `@galileo/sdk`, `@galileo/contracts`
- [ ] Docker images on GitHub Container Registry: `galileo/api`, `galileo/dashboard`, `galileo/scanner`
- [ ] Helm chart for Kubernetes deployment (enterprise brands)
- [ ] Terraform/Pulumi modules for infrastructure-as-code
- [ ] CI workflow: auto-publish images and npm packages on each release

#### 6.4 Community & Governance Activation (P1)

- [ ] Recruit 3-5 TSC members (targets: ex-LVMH tech, GS1 expert, W3C contributor, ERC-3643 association member)
- [ ] Create Discord server (devs) + mailing list (decision-makers)
- [ ] Submit first public RFC (e.g., "Multi-language DPP schema") to demonstrate process
- [ ] Monthly public TSC office hours (recorded, like Hyperledger/CNCF)
- [ ] Bug bounty program (even symbolic at first)
- [ ] "Good first issue" labeling for contributor onboarding
- [ ] White-label scanner: allow brands to customize logo, colors, domain

#### 6.5 Design Partners (P0)

- [ ] Identify and approach 2-3 design partners (mid-market brands, not LVMH/Kering initially)
- [ ] Targets: independent French brands, independent Swiss watchmakers, CPO specialists (Vestiaire Collective, The RealReal)
- [ ] Offer technical support in exchange for public feedback/case studies
- [ ] Measure: time-to-DPP, cost/product, QR scan rate
- [ ] Publish case studies after pilots

#### 6.6 Go-to-Market Phases

```
Month 1-3   Seed      → 2-3 design partners, free support, gather feedback
Month 4-6   Validate  → Case studies, ESPR conference talks (GS1 Global Forum, EthCC)
Month 7-12  Scale     → Certification program, approach larger groups, paid membership
Month 12+   Found.    → Create foundation (Linux Foundation project), transfer IP, hire ED
```

#### 6.7 Business Model: Open Core + Managed SaaS

```
Open Source (free)              Managed SaaS (Origin Labs revenue)
├── Specifications              ├── Hosted instances per brand
├── Smart contracts             ├── SLA + support
├── API + Dashboard + Scanner   ├── Monitoring + backups
├── SDK + CLI                   ├── Custom compliance modules
└── Documentation               └── Analytics dashboard
```

**Exit:** Any developer can `docker compose up`, create a DPP, mint on-chain, and scan a QR in < 15 minutes. 2+ design partners active. npm packages published. Documentation complete.

---

## Phase 0 — Repo Cleanup ✅ Done

Finalize the open-source repository for v1.0.0 publication.

| Task | Scope | Status |
|------|-------|--------|
| Fix 15 spec/repo audit findings | Broken cross-refs, ID collisions, NOTICE, schemas | ✅ Done (0f5aeb6) |
| Website fixes | Missing pages, governance rewrite, SEO, legal | ✅ Done (63591d1) |
| CI lint fixes | Footer useSyncExternalStore, unused KineticText | ✅ Done (3da012c) |
| Fix 4 smart contract issues (M-1 to M-4) | Emergency access, RBAC migration, underflow, mint guard | Pending (Sprint 1) |
| Website deployed on galileoprotocol.io | Vercel, domain, analytics | Pending (Sprint 1) |

**Exit criteria:** All audit findings resolved, `forge test` passes, website live.

---

## Phase 1 — Testnet Full-Stack Launch (Weeks 2-4) ⚠️ Partially done (mock mode — real deploy in Sprint 3)

Deploy and validate the **entire stack** on Base Sepolia before touching mainnet.

### Prerequisites

- Set up GitHub Actions CI: `forge build && forge test` on every PR (separate from website CI)

### Environment Setup

```
contracts/.env.example     → Foundry deploy keys, RPC URLs, Basescan API
.env.testnet.example       → Full stack: DB, R2, JWT, contract addresses
```

All secrets stored in `.env` files (gitignored). Examples committed for onboarding.

### 1.1 Testnet Wallet Setup

- Generate a dedicated **testnet deployer wallet** (never use mainnet keys)
- Fund with Base Sepolia ETH via [faucets](https://docs.base.org/tools/network-faucets)
- Generate 3 additional test wallets: `brand-admin`, `certifier`, `buyer`
- Store all testnet private keys in `contracts/.env` (gitignored)

### 1.2 Contract Deployment (Base Sepolia, chainId 84532)

```bash
cd contracts
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY, BASE_SEPOLIA_RPC, BASESCAN_API_KEY

forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

Deploy order (handled by `Deploy.s.sol`):
1. `GalileoAccessControl` → RBAC foundation
2. `GalileoClaimTopicsRegistry` → 12 claim topics
3. `GalileoTrustedIssuersRegistry` → issuer management
4. `GalileoIdentityRegistryStorage` → identity storage
5. `GalileoIdentityRegistry` → ties everything together
6. `GalileoCompliance` → modular compliance engine
7. 5 compliance modules (Brand, CPO, Jurisdiction, Sanctions, ServiceCenter)
8. `GalileoToken` factory → one-click product token creation

Post-deploy:
- Log all addresses → `contracts/.env` (deployed addresses section)
- Verify all contracts on [Basescan Sepolia](https://sepolia.basescan.org)
- Grant `AGENT_ROLE` to `brand-admin` and `certifier` wallets

### 1.3 End-to-End Testnet Validation

Run through the **complete product lifecycle** on Base Sepolia:

```
Step 1: Setup
  → Register brand-admin identity (ONCHAINID)
  → Register certifier identity
  → Register buyer identity
  → Add brand-admin as trusted issuer
  → Add France (250) to allowed jurisdictions

Step 2: Product Creation
  → Brand-admin mints a GalileoToken (product: "Test Watch, GTIN 01234567890128")
  → Verify token exists on-chain (totalSupply = 1, owner = brand-admin)
  → Verify product DID resolves

Step 3: Primary Sale
  → Brand-admin transfers token to buyer
  → Compliance modules validate: jurisdiction OK, brand authorized, no sanctions
  → Buyer now owns the token

Step 4: CPO Certification
  → Certifier calls certifyCPO() on the token
  → CPO status updated on-chain
  → CPO event emitted

Step 5: Secondary Sale
  → Buyer transfers to a new wallet (resale)
  → Compliance re-validated
  → Full provenance chain visible on Basescan

Step 6: Service / Repair
  → Service center logs a repair event
  → Audit trail updated
```

### 1.4 Gas Benchmarks

Measure and document gas costs for each operation on Base Sepolia:

| Operation | Expected Gas | Cost @ 0.01 gwei |
|-----------|-------------|-------------------|
| Deploy full stack | ~15M gas | — (one-time) |
| Mint product token | ~300-500K | — |
| Transfer (with compliance) | ~200-400K | — |
| CPO certification | ~100-200K | — |
| Register identity | ~200-300K | — |

### 1.5 Testnet Deployment Record

After validation, create `contracts/deployments/base-sepolia.json`:
```json
{
  "chainId": 84532,
  "deployedAt": "2026-03-XX",
  "deployer": "0x...",
  "contracts": {
    "accessControl": "0x...",
    "claimTopicsRegistry": "0x...",
    "trustedIssuersRegistry": "0x...",
    "identityRegistryStorage": "0x...",
    "identityRegistry": "0x...",
    "compliance": "0x...",
    "brandAuthModule": "0x...",
    "cpoCertModule": "0x...",
    "jurisdictionModule": "0x...",
    "sanctionsModule": "0x...",
    "serviceCenterModule": "0x...",
    "tokenFactory": "0x..."
  }
}
```

This file IS committed (no secrets — only public contract addresses).

### 1.6 Mainnet Deployment (after full validation)

Only after testnet E2E passes:
- Deploy to Base mainnet (chainId 8453)
- Use dedicated RPC provider (Alchemy/QuickNode — NOT public `mainnet.base.org`)
- Verify all contracts on Basescan
- Transfer ownership to multisig (Safe)
- Create `contracts/deployments/base-mainnet.json`

**Exit criteria:** Full lifecycle test passes on Base Sepolia. All contracts verified. Gas benchmarks documented. Deployment addresses recorded.

---

## Phase 2 — Backend API (Weeks 3-5) ⚠️ Partially done

Node.js / TypeScript API that orchestrates on-chain and off-chain operations.

### Stack

- **Runtime:** Node.js 22 LTS
- **Framework:** Fastify (lightweight, TypeScript-first)
- **Chain interaction:** viem (Base L2)
- **Database:** PostgreSQL (brand accounts, product metadata, wallet-identity mappings)
- **Object storage:** Cloudflare R2 (images, certificates — GDPR-deletable)
- **Integrity:** IPFS CID computed locally, hash anchored on-chain (NO IPFS pinning)
- **Auth:** Email/password (JWT) + linked wallet for transaction signing

### GDPR-Compliant Data Flow

```
Product creation:
  Brand fills form (name, GTIN, serial, materials, photos)
  → Backend stores product data in PostgreSQL
  → Photos/certificates uploaded to R2
  → CID computed locally from DPP JSON
  → CID stored on-chain when token is minted
  → NO personal data touches the blockchain

GDPR erasure request:
  → Delete customer data from PostgreSQL
  → Delete assets from R2
  → On-chain CID becomes unresolvable orphan
  → Product token still exists (product identity ≠ personal data)
```

### Core endpoints

```
POST   /auth/register          — Brand creates account (email + password)
POST   /auth/login             — Returns JWT
POST   /auth/link-wallet       — Link an Ethereum wallet to the account

POST   /products               — Create product (metadata + images → R2 + CID)
GET    /products               — List brand's products
GET    /products/:id           — Get product details + on-chain status
POST   /products/:id/mint      — Mint ERC-3643 token (requires wallet signature)

POST   /products/:id/transfer  — Initiate ownership transfer
POST   /products/:id/certify   — Issue CPO certification
POST   /products/:id/repair    — Log repair event

GET    /dpp/:did               — Public DPP resolver (returns JSON-LD)
GET    /verify/:gtin/:serial   — Public verification endpoint

DELETE /users/:id/data         — GDPR erasure (Art. 17)
GET    /users/:id/data         — GDPR data export (Art. 15)
```

### Key design decisions

- **GDPR by design:** Personal data strictly off-chain. On-chain = product identity + integrity hashes only.
- **CID without IPFS:** Compute hash locally for tamper-evidence. Serve data from R2 (deletable, fast CDN). Never pin to IPFS network.
- **Wallet abstraction:** Brand users sign in with email. For on-chain ops, backend prepares tx, user signs via linked wallet. No private keys server-side.
- **Human review for compliance rejections:** `canTransferWithReason()` provides explanation; rejected transfers can be escalated to human review (GDPR Art. 22 compliance).

**Exit criteria:** API deployed, a brand can register, create a product, mint its token, DPP is publicly resolvable, and GDPR erasure works.

---

## Phase 3 — Brand Dashboard (Weeks 4-7) ⚠️ Partially done (core CRUD + auth done, wallet/transfer/settings pending)

Web dashboard for brands to manage their products and tokens.

### Stack

- **Framework:** Next.js (App Router, latest)
- **UI:** Tailwind CSS + shadcn/ui
- **Wallet:** wagmi + RainbowKit (for transaction signing)
- **Hosting:** Vercel

### Screens

1. **Login / Register** — Email + password, link wallet
2. **Dashboard home** — Product count, recent activity, on-chain stats
3. **Product list** — Table with status (draft / minted / transferred / certified)
4. **Product create** — Form: name, GTIN, serial, materials, photos, DPP fields
5. **Product detail** — Full DPP view, on-chain history, QR code generator
6. **Mint flow** — Review product data → sign transaction → confirmation
7. **Transfer flow** — Enter recipient → compliance check → sign → confirm
8. **CPO certification** — Certify a pre-owned product (if authorized certifier)
9. **Settings** — Brand profile, wallet management, API keys
10. **GDPR panel** — Data export, erasure request

### Key interactions

```
Brand creates product → fills DPP form → uploads photos
  → Backend stores in DB + R2, computes IPFS CID locally
  → Brand clicks "Mint" → wallet popup → signs tx
  → Backend submits to Base → token created
  → QR code generated (GS1 Digital Link URL)
  → Brand prints QR, attaches to physical product
```

**Exit criteria:** A brand user can log in, create a product with photos, mint its on-chain passport, and download a QR code.

---

## Phase 4 — Scanner / Verifier PWA (Weeks 6-8) 🔲 Planned

Mobile-first Progressive Web App for end customers to verify product authenticity.

### Stack

- **Framework:** Next.js (same monorepo or separate)
- **QR scanning:** `html5-qrcode` or native camera API
- **Hosting:** Vercel (PWA with service worker)

### Flow

```
Customer scans QR on product
  → Opens PWA at galileoprotocol.io/verify/{gtin}/{serial}
  → PWA calls /dpp/:did API
  → Displays:
     - Product identity (name, brand, serial)
     - Authenticity status (verified on-chain)
     - Full provenance timeline (creation → transfers → repairs → CPO)
     - Material composition (ESPR compliance)
     - Carbon footprint
     - Current owner status
     - Brand certificate
```

### Design

- No login required (public verification)
- No personal data displayed (GDPR — only product data)
- Works offline for previously scanned products (service worker cache)
- Deep link: scanning the QR goes directly to the product page
- Luxury-grade UI consistent with the Abysse design language

**Exit criteria:** A customer scans a QR code and sees a verified Digital Product Passport with full provenance history.

---

## Phase 5 — GS1 Digital Link Resolver (Weeks 5-7) ✅ Done

Standards-compliant resolver that maps GS1 URIs to Galileo DIDs.

### Responsibilities

- Resolve `https://galileoprotocol.io/01/{gtin}/21/{serial}` to the appropriate DPP
- Return GS1 linkset JSON per the resolution protocol spec (GSPEC-RESOLVER-002)
- Support content negotiation (JSON-LD, HTML, linkset)
- Context-aware routing based on caller role (GSPEC-RESOLVER-003)

### Implementation

- Integrated into the backend API (not a separate service)
- Route: `GET /01/:gtin/21/:serial` (GS1 Digital Link format)
- Resolves to `did:galileo:01:{gtin}:21:{serial}`
- Looks up on-chain token → fetches off-chain DPP → returns formatted response

**Exit criteria:** A GS1-conformant Digital Link URL resolves to a complete DPP response.

---

## Phase 6 — T1 Token Integration (Weeks 9-12) 🔲 POST-PILOT GATE

> **Gate:** This phase only starts after Sprint 4 exit criteria are met AND at least one brand pilot is active with real products on the create→mint→scan→verify flow. See Sprint 5 entry criteria above.

### 6.1 T1 Smart Contracts

Deploy T1 token contracts on Base:
- `T1Token.sol` — ERC-20, 1B supply, no mint function (fixed supply)
- `MigrationPortal.sol` — LEOX→T1 swap with KYC gate and anti-whale vesting
- `StakingAccess.sol` — Stake T1 to unlock premium API tiers
- `DiscountManager.sol` — Calculate and apply T1 payment discounts

### 6.2 Migration Portal (Web)

- KYC/AML verification (MiCA compliant, third-party provider)
- Connect Ethereum wallet (LEOX) + Base wallet (T1)
- Display swap rate, vesting schedule, early adopter bonus
- Execute migration: lock LEOX on Ethereum → mint T1 on Base

### 6.3 T1 Payment Integration

- Backend accepts T1 as payment for Galileo operations (mint, transfer, certify)
- Discount engine: 5-15% off vs EUR pricing
- Revenue tracking for quarterly buy-back-and-burn

### 6.4 Governance Module

- On-chain voting for protocol parameters
- Multi-sig treasury (5-7 signataires)
- Proposal factory with quorum rules

**Exit criteria:** T1 deployed on Base, LEOX migration portal live, T1 accepted as payment in Galileo API.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Brand Dashboard                         │
│                    (Next.js + wagmi)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS + JWT
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend API                             │
│               (Fastify + TypeScript)                        │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐ │
│  │  Auth    │  │ Products │  │ Resolver  │  │ Chain Sync │ │
│  │ (JWT)   │  │ (CRUD)   │  │ (GS1 DL)  │  │ (events)   │ │
│  └─────────┘  └──────────┘  └───────────┘  └────────────┘ │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐                 │
│  │  GDPR   │  │ T1 Pay   │  │ Discount  │                 │
│  │ (erase) │  │ (viem)   │  │ (5-15%)   │                 │
│  └─────────┘  └──────────┘  └───────────┘                 │
└───────┬──────────┬──────────────┬───────────────┬──────────┘
        │          │              │               │
        ▼          ▼              ▼               ▼
   PostgreSQL   Cloudflare R2   CID (local)    Base L2
   (accounts,   (images,        (integrity     ┌──────────────┐
    products,    certificates,   hash only,     │ ERC-3643     │
    GDPR data)   GDPR-deletable) NO IPFS pin)  │ (product     │
                                                │  tokens)     │
                                                ├──────────────┤
                                                │ T1 Token     │
                                                │ (ERC-20,     │
                                                │  staking,    │
                                                │  governance) │
                                                └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Scanner PWA                               │
│              (Next.js PWA, public)                           │
│         GET /verify/:gtin/:serial → DPP view                │
│         No personal data displayed (GDPR)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               LEOX Migration Portal                         │
│         Ethereum LEOX → Base T1 (KYC + vesting)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Timeline Summary

```
Week 1-2      Sprint 1 — Foundations (monorepo, auth, DB, CI, dashboard shell)         ✅
Week 3-4      Sprint 2 — Product & Passport (mock mint, GS1 resolver, QR)              ✅
Week 5-6      Sprint 3 — Real Chain & Scanner (Base Sepolia deploy, PWA, lifecycle)
Week 7-8      Sprint 4 — Stabilisation (security, multi-tenant, GDPR, prod deploy)
  ── POST-PILOT GATE ──
Week 9-12     Sprint 5 — T1/LEOX (paymaster, migration portal, multichain)
Week 13-16    Sprint 6 — Open Source Adoption (DX, SDK, Docker, docs, community)
```

**Testnet milestone: Week 6** — Full lifecycle on Base Sepolia (create → mint on real chain → scan → verify).
**Production-ready: Week 8** — First brand pilot can onboard on Base mainnet.
**T1-ready: Week 12** — Only after MVP KPIs validated. T1 deployed, migration portal live, Paymaster active.
**Open source ready: Week 16** — Any developer can `docker compose up` and create a DPP in < 15 minutes.

---

## Tech Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| Blockchain | Base L2 (Coinbase) | Low gas, EVM-compatible, enterprise credibility |
| Smart contracts | Solidity 0.8.20+, **Foundry only** | ERC-3643 T-REX framework, 722 tests. No Hardhat — single toolchain. |
| Backend API | Node.js 22, **Fastify**, TypeScript | Dedicated API server (not Next.js Route Handlers). B2B multi-tenant + webhooks + jobs require separation. |
| Database | PostgreSQL | Proven, relational, GDPR-deletable |
| Object storage | Cloudflare R2 | S3-compatible, no egress fees, global CDN, deletable |
| Integrity | CID computed locally (NO IPFS pinning) | Tamper-evidence without GDPR risk |
| Dashboard | Next.js (latest), Tailwind, shadcn/ui, wagmi | Consistent with existing website stack. No version pinning. |
| Scanner | Next.js PWA | No app store, instant access via QR scan |
| Auth | Email/JWT + linked wallet | Accessible for non-crypto brands |
| Hosting | Vercel | Already configured for the website |
| Chain interaction | viem | TypeScript-native, lightweight, Base-compatible |
| T1 token | ERC-20 on Base | Same chain as Galileo contracts |
| LEOX bridge | Ethereum ↔ Base | Migration portal for LEOX→T1 swap |

---

## Technical Decisions (validated)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| GS1 Resolver | **Own resolver** (not delegated) | Full control, integrated in API, GS1 1.2.0 conformant, testsuite from sprint 1 |
| Wallet UX | **Smart Wallet Coinbase + EOA** | Best UX (passkey, gasless), requires ERC-1271 verification from day 1 |
| Gas sponsoring | **Paymaster (ERC-4337)** | Gas paid in T1/LEOX via Paymaster abstraction. Users never hold ETH. |
| MFA | **Day 1 (TOTP + passkey)** | Enterprise-grade security from the start |
| VC proof format | **Data Integrity** | W3C-native, JSON-LD friendly, aligned with did:galileo. Ed25519Signature2020 |
| RPC provider | **Dedicated provider** (not public Base RPC) | Public endpoints rate-limited, not suitable for production |
| QR scanning | **getUserMedia + ZXing fallback** | BarcodeDetector still experimental. ZXing reliable cross-browser |
| Object storage | **R2 versioned buckets + lifecycle retention rules** | S3-compatible, no egress fees. Object Lock not yet available on Cloudflare R2; evaluate AWS S3 with Object Lock if WORM compliance is legally required |
| IPFS CID version | **CIDv1** (not v0) | Self-describing, multibase, recommended by IPFS spec |
| JSON Schema strategy | **Mixed draft-07 + 2020-12** | draft-07 for DPP/events (tooling support), 2020-12 for VC/linkset (W3C alignment) |
| Auth model | **SIWE (EIP-4361) + email/password** | SIWE for wallet login, ERC-1271 for smart wallet verification |

### Standards Versions (pinned)

| Standard | Version | Status | Source |
|----------|---------|--------|--------|
| Base L2 | chainId 8453 (mainnet) / 84532 (Sepolia) | Production | [docs.base.org](https://docs.base.org/chain/using-base) |
| GS1 Digital Link URI | 1.6.0 | Ratified (April 2025) | [gs1.org](https://ref.gs1.org/standards/digital-link/uri-syntax/) |
| GS1 Conformant Resolver | 1.2.0 | Ratified (January 2026) | [gs1.org](https://ref.gs1.org/standards/resolver/) |
| W3C VC Data Model | 2.0 | W3C Recommendation (May 2025) | [w3.org](https://www.w3.org/TR/vc-data-model/) |
| W3C VC JSON Schema | — | Candidate Recommendation Draft (Feb 2025) | [w3.org](https://www.w3.org/TR/vc-json-schema/) |
| EIP-4361 (SIWE) | 1.0 | Final | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-4361) |
| EIP-1271 | 1.0 | Final | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-1271) |

---

## Open Questions

### Resolved

- [x] Multi-brand from day 1 or single-brand MVP? → **Multi-tenant from Sprint 4** (RLS or schema-per-brand). Sprint 1-3 use brandId RBAC scoping.
- [x] CSRF protection model? → **Custom header `X-Galileo-Client`** on POST/PATCH/DELETE/PUT (implemented Sprint 2).
- [x] Dedicated RPC provider? → **Yes, Sprint 3** (Alchemy or QuickNode). Public `http()` fallback only for local dev.

### Open

- [ ] Native app timeline? (after PWA validation — Sprint 6+ based on scan metrics)
- [ ] DPIA: when to complete? (required before mainnet per EDPB Guidelines 02/2025 — target Sprint 4)
- [ ] KYC provider for T1 migration portal? (Sumsub, Onfido, Synaps?)
- [ ] T1/LEOX swap ratio? (market-based, fixed, or hybrid?)
- [ ] MiCA validation timeline with counsel for SASU-issued utility token?
- [ ] GS1 testsuite integration: CI or manual? ([testsuite](https://gs1.github.io/GS1DL-resolver-testsuite/))
- [ ] Docker Compose timeline: Sprint 4 (dev convenience) or Sprint 6 (open source)?
- [ ] Sandbox hosting: self-hosted or managed? Budget for `sandbox.galileoprotocol.io`?
- [ ] Design partner targets: which 2-3 brands for first pilots? (independent maisons preferred)
- [ ] Foundation timeline: Linux Foundation or independent? (Sprint 6+ decision)
- [ ] T1 ecosystem scope: Galileo (luxury) + Kepler (aviation) + future verticals — governance model for multi-vertical token?

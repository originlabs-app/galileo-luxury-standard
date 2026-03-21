# Galileo Protocol — Product Roadmap

## Vision

Build the **open standard for luxury product traceability on blockchain** — adopted by all brands, from independent maisons to global groups.

> *The only open standard combining GS1 Digital Link + W3C DID + ERC-3643 + ESPR 2024/1781 compliance in a single stack.*

**Why brands will adopt:**
1. **Regulatory pressure** — ESPR 2027 mandates DPPs for textiles/footwear, then leather, then watches
2. **Anti-counterfeiting** — Luxury loses ~$50B/year to counterfeiting (OECD 2024)
3. **Interoperability** — CPO products changing brands (service, resale) need a common standard
4. **Neutrality** — Unlike Aura (LVMH-led), Galileo has anti-governance dominance (max 2 TSC seats per org)
5. **Cost** — Open source = no SaaS license, only infrastructure cost

**Post-pilot gate** (before Phase 4): MVP KPIs validated — create → mint → scan → verify stable on Base Sepolia with real brand data.

---

## Status Legend

| Marker | Meaning |
|--------|---------|
| ✅ | Done — shipped and tested |
| 🔄 | In Progress — WIP branch exists |
| 📋 | Planned — next to implement |
| 💡 | Future — roadmapped, post-pilot |
| 🔒 | Blocked — requires operator input |

---

## Phase 1 — Foundation ✅ Done

Everything shipped across Sprints 1–10.

### Authentication & Security
- ✅ Email/password login with SHA-256 hashed refresh tokens, timing-safe comparison
- ✅ httpOnly cookie auth (`__Host-galileo_at` + `__Secure-galileo_rt` prefixes)
- ✅ CSRF protection via `X-Galileo-Client` header on all mutating requests
- ✅ RBAC: ADMIN, BRAND_ADMIN, OPERATOR, VIEWER roles with `brandId` scoping
- ✅ SIWE (Sign-In With Ethereum / EIP-4361) with one-time nonce (5-min TTL)
- ✅ Wallet linking via EIP-191 signature, nonce-protected
- ✅ ERC-1271 Smart Wallet support (Coinbase passkey)
- ✅ GDPR: data export (Art. 15) and erasure (Art. 17) endpoints
- ✅ Rate limiting (per-IP + per-user)
- ✅ API versioning (`/v1/` prefix)

### Product Lifecycle
- ✅ Product CRUD: create, read, update (DRAFT only), delete
- ✅ GTIN validation (GS1 mod-10 check digit), 14-digit normalization
- ✅ DID generation: `did:galileo:01:{gtin}:21:{serial}`
- ✅ Lifecycle state machine: DRAFT → MINTING → ACTIVE → TRANSFERRED / RECALLED
- ✅ Mock mint with optimistic concurrency control (`updateMany WHERE status=DRAFT`, atomic 409)
- ✅ Recall endpoint (ACTIVE → RECALLED)
- ✅ Transfer with 5-module compliance check (jurisdiction, sanctions/OFAC, brand auth, CPO, service center)
- ✅ Product image upload (multipart, Cloudflare R2 ready)
- ✅ QR code generation (PNG endpoint) per GS1 Digital Link spec
- ✅ Batch CSV import (up to 500 rows, row-level validation + error reporting)
- ✅ Batch mint (up to 100 DRAFT products at once)
- ✅ Public verification endpoint (`POST /products/:id/verify`)

### GS1 & Blockchain
- ✅ GS1 Digital Link resolver: `GET /01/:gtin/21/:serial` returns JSON-LD DPP
- ✅ JSON-LD with `IndividualProduct` type and custom `galileo`/`gs1` context namespaces
- ✅ `@galileo/shared`: Zod schemas, GTIN/DID utilities, URL encoding, 8 luxury categories
- ✅ viem chain client configured (Base Sepolia, fallback transport)
- ✅ ERC-3643 Solidity interfaces (Foundry, 722 contract tests)

### Dashboard (B2B Portal)
- ✅ Product list with filtering, sorting, pagination
- ✅ Product create form with GTIN/serial validation
- ✅ Product detail page with full lifecycle state machine UI (mint / transfer / recall buttons)
- ✅ Batch import UI (CSV drag-and-drop, row-level error display)
- ✅ Audit log page with CSV/JSON export and date range filtering
- ✅ Settings page (profile, GDPR data export/deletion)
- ✅ Setup wizard (onboarding flow)
- ✅ Wallet connection (wagmi, MetaMask / Rabby / Coinbase Smart Wallet)
- ✅ Error boundaries on all critical pages

### Scanner PWA (Consumer)
- ✅ QR scanning via `barcode-detector` (ZXing WASM ponyfill) + `getUserMedia`
- ✅ Public product verification page with provenance timeline
- ✅ Material composition display
- ✅ GS1 deep link routing (`/01/:gtin/21/:serial`)
- ✅ PWA manifest, service worker, offline cache of previously scanned products
- ✅ Camera guidance UX

### Observability & Operations
- ✅ Health probes (`GET /health` — DB + chain connectivity)
- ✅ Structured Pino logging with PII redaction
- ✅ Sentry error tracking (API + Dashboard)
- ✅ Vercel Analytics
- ✅ Webhook system: outbox pattern (PostgreSQL), HMAC-SHA256 signing, exponential backoff retry
- ✅ Audit trail: append-only `AuditLog` table, actor sanitization on user deletion
- ✅ Vercel deploy configs (dashboard + scanner)
- ✅ Multi-stage API Dockerfile with HEALTHCHECK
- ✅ CI: GitHub Actions (apps + contracts + website), pnpm cache, frozen-lockfile

### Testing
- ✅ 372 unit tests (303 API + 69 shared)
- ✅ 9 Playwright e2e specs (auth, product lifecycle, batch import, SIWE, audit export, transfer compliance)
- ✅ Test DB isolation (`galileo_test` via `DATABASE_URL_TEST`)

---

## Phase 2 — Blockchain Live 🔄 In Progress

**Goal:** Real on-chain minting on Base Sepolia. The mock mint becomes a real ERC-3643 transaction.

**WIP branch:** `base-sepolia-deployment-live-minting`

### Contract Deployment 🔒 Blocked (RPC key required)
- 🔒 Deploy all 12 ERC-3643 contracts to Base Sepolia via `Deploy.s.sol`
- 🔒 Post-deploy setup: sanctions oracle, TIR trusted issuer, identity registry, AGENT_ROLE, unpause token
- 🔒 Verify contracts on Basescan Sepolia
- 🔒 Record addresses in `contracts/deployments/base-sepolia.json`
- 🔒 Configure authenticated RPC URL (Alchemy/QuickNode) in `apps/api/src/plugins/chain.ts`

### Real Mint Integration 📋 Planned
- 📋 Replace mock mint with real `GalileoToken.mint()` via viem + deployed contracts
- 📋 Identity Registry verification before mint (`isVerified()`)
- 📋 Use proper AGENT_ROLE for minting
- 📋 Update `ProductPassport` with real `txHash`, `tokenAddress`, `chainId`, `mintedAt`
- 📋 Add `RPC_URL` to `config.ts` env schema with fallback transport
- 📋 Document gas benchmarks for mint / transfer / recall

### Real Transfer & Recall On-Chain 📋 Planned
- 📋 Wire transfer endpoint to real `GalileoToken.transferWithCompliance()` on-chain
- 📋 Wire recall endpoint to real on-chain burn/freeze
- 📋 Store transaction hashes for all on-chain events in `ProductEvent`

### Scanner Verification Against Chain 📋 Planned
- 📋 Scanner verifies token ownership on-chain (not just DB record)
- 📋 Display on-chain provenance: txHash, block number, timestamp
- 📋 Link to Basescan for each event

### Webhook Notifications for On-Chain Events 📋 Planned
- 📋 Emit `product.minted`, `product.transferred`, `product.recalled` webhook events with txHash
- 📋 On-chain event listener (viem `watchContractEvent`) feeding the outbox

### Mint UX in Dashboard 📋 Planned
- 📋 Mint flow: review product data → wallet popup → sign tx → confirmation screen with txHash
- 📋 Transaction pending state (spinner, block confirmations)
- 📋 Basescan link in product detail after mint

---

## Phase 3 — Enterprise Ready 💡 Future

**Goal:** Production-grade multi-tenant SaaS. Multiple brands can use the platform independently.

### Multi-Tenant Workspace Isolation
- 💡 Row-Level Security (RLS) in PostgreSQL per workspace/brand 🔒 (DB migration approval required)
- 💡 Workspace slug routing (`/dashboard/[workspaceSlug]/...`)
- 💡 Cross-workspace admin view for ADMIN role

### Role Refinement
- 💡 OPERATOR role: read-only product access + verify actions (no mint/transfer)
- 💡 VIEWER role: read-only, no actions
- 💡 Invite flow: email invitation with role assignment
- 💡 MFA (TOTP/WebAuthn) for BRAND_ADMIN and ADMIN 🔒 (DB migration approval required)

### Audit & Compliance Exports
- 💡 Audit log export with advanced date/actor/action filtering
- 💡 PDF audit report generation (regulatory-ready, branded)
- 💡 DPIA completion (required before mainnet by EDPB Guidelines 02/2025)
- 💡 Automated GDPR retention enforcement (archive after retention period)

### Batch & Bulk Operations
- 💡 Bulk product status update (bulk recall, bulk archive)
- 💡 Bulk transfer to new owner wallet
- 💡 Import progress with background job tracking
- 💡 Export products to CSV/Excel

### API Key Management (B2B Integrations)
- 💡 API key creation, rotation, revocation per brand
- 💡 Scoped permissions per key (read-only, write, webhook-only)
- 💡 API key usage analytics

### Webhook Delivery Dashboard
- 💡 Webhook delivery history with status (delivered, failed, retrying)
- 💡 Manual retry for failed deliveries
- 💡 Webhook event filtering per subscription

---

## Phase 4 — Token Economy 💡 Future

**Gate:** MVP KPIs validated on Base Sepolia (stable create → mint → scan → verify with real brand data).

> Token architecture details: see GDPR Compliance Architecture and Token Architecture sections below.

### T1 Token Launch on Base
- 💡 Deploy `T1Token.sol` (ERC-20, 1B fixed supply) on Base
- 💡 Gas abstraction via `GalileoPaymaster` (ERC-4337): T1/LEOX.b pays gas, no ETH needed
- 💡 Payment integration: mint/transfer fees payable in EUR, T1, or LEOX (10% discount with T1)

### LEOX Migration Portal
- 💡 `MigrationPortal.sol`: LEOX (Ethereum) → T1 (Base) swap with KYC + anti-whale vesting
- 💡 Bridge UI in dashboard
- 💡 LEOX.b bridged representation on Base

### Staking & Premium Features
- 💡 `StakingAccess.sol`: stake T1 → unlock premium API tiers
- 💡 `DiscountManager.sol`: on-chain discount logic (5–15%)
- 💡 Premium features: advanced analytics, priority support, higher batch limits

### Governance
- 💡 `TreasuryDAO.sol`: multi-sig treasury for ecosystem fund
- 💡 T1 holder voting on protocol evolution
- 💡 Buy-back-and-burn: quarterly 1–5% of net revenues → buy T1 on DEX → burn (`BuybackBurn.sol`)

### Legal Prerequisites (open items)
- 💡 MiCA utility token classification validation with counsel (Origin Labs SASU)
- 💡 Inter-entity liquidity contribution structure (convention between 4 entities)
- 💡 LEOX ownership resolution (Nathaniel litigation) — T1 launches independently

---

## Phase 5 — Scale & Compliance 💡 Future

### Mainnet Deployment
- 💡 Base Mainnet deployment (migrate from Base Sepolia after audit)
- 💡 Smart contract security audit (Trail of Bits or equivalent)
- 💡 DPIA completed and signed off

### Multi-Chain Support
- 💡 Ethereum mainnet bridge for LEOX holders
- 💡 Polygon support (low-gas alternative for emerging markets)
- 💡 Cross-chain DPP resolver (resolve DID regardless of chain)

### Internationalization
- 💡 i18n: EN, FR, IT, ZH, JA (luxury markets)
- 💡 RTL layout support (AR)
- 💡 GS1 Digital Link localized descriptions

### Mobile Native Scanner
- 💡 React Native scanner app (iOS + Android) replacing PWA
- 💡 Offline-first with local encrypted cache
- 💡 NFC tag reading (in addition to QR)
- 💡 AR overlay for product authentication in-store

### Analytics & Reporting
- 💡 Brand dashboard: scan heatmaps, verification frequency, geographic distribution
- 💡 Counterfeiting detection: unusual scan patterns, geographic anomalies
- 💡 SOC 2 Type II preparation
- 💡 ISO 27001 alignment

### Open Source & Developer Experience
- 💡 Public SDK: `@galileo/sdk` (TypeScript, Python)
- 💡 Docker Compose sandbox (one-command local setup)
- 💡 Developer documentation portal (`apps/website`)
- 💡 Sandbox environment with testnet contracts + seeded demo data

---

## GDPR Compliance Architecture

> Based on [EDPB Guidelines 02/2025](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf).

**Core principle: ZERO personal data on-chain.**

### What goes on-chain (immutable, public)
- Token ID (uint256) — not personal data
- Product DID (`did:galileo:01:{gtin}:21:{serial}`) — identifies the product, not the person
- IPFS content hash (CID) — integrity proof, not the data itself
- Brand identity claims (ONCHAINID) — corporate identity, not personal
- Transfer events — wallet addresses only (pseudonymous)

### What stays off-chain (deletable, access-controlled)
- Customer names, emails, shipping addresses → PostgreSQL (GDPR-deletable)
- Product photos, certificates → Cloudflare R2 (deletable)
- KYC/AML documents → dedicated provider (5-year retention per 5AMLD, then deleted)
- Wallet-to-identity mappings → PostgreSQL (deletable on request)

### CRAB Model (Create-Read-Archive-Burn)
1. **Create** — personal data stored off-chain with on-chain hash reference
2. **Read** — access controlled by RBAC + ONCHAINID claims
3. **Archive** — after retention period, moved to cold storage
4. **Burn** — off-chain data deleted; on-chain CID becomes an orphan pointer (unresolvable, not personal data per EDPB)

### IPFS — Compute CID, Don't Pin
We compute the IPFS CID locally (tamper-evidence) but **do NOT pin to the IPFS network** (GDPR incompatible). Actual data is served from R2 (fast, deletable, geo-restricted).

---

## Token Architecture: LEOX + T1

### Current Token State

| Token | Chain | Supply | Status |
|-------|-------|--------|--------|
| LEOX | Ethereum (ERC-20) | 150M | Live, MEXC/BitMart/Uniswap |
| AVIA | Avalanche (ERC-20) | 100M | Live, low liquidity |

### T1 — "Tokenizd One"

T1 unifies the ecosystem across Galileo (luxury), Kepler (aviation), and Tokenizd (TaaS):
- **Supply:** 1 billion T1 (fixed, deflationary via buy-back-and-burn)
- **Issuer:** Origin Labs SASU
- **Chain:** Base L2 (primary) + Ethereum (bridge for LEOX migration)
- **Classification:** Utility token (not EMT, not ART under MiCA)

### Coexistence Model

```
Phase 1 (now)     LEOX lives on Ethereum, Galileo contracts on Base (mock mode)
Phase 2 (chain)   Real ERC-3643 contracts on Base Sepolia, real minting
Phase 3 (T1)      T1 launches on Base, migration portal LEOX → T1 opens
Phase 4 (mature)  T1 is primary utility token, LEOX holders can still migrate
```

### T1 Utility in Galileo

| Action | Payment | T1 Benefit |
|--------|---------|------------|
| Mint a product DPP | EUR, T1, or LEOX | 10% discount with T1 |
| Transfer ownership | EUR, T1, or LEOX | 5% discount with T1 |
| Gas fees | T1 or LEOX (via Paymaster) | No ETH needed, 5–15% discount with T1 |
| Premium API access | Staking T1 | Unlock advanced features |
| Governance votes | Hold T1 | Vote on protocol evolution |

---

## Architectural Constraints (locked)

| # | Constraint | Rationale |
|---|-----------|-----------|
| 1 | **ERC-3643 only** (no ERC-721) | Product passports = permissioned tokens with compliance hooks |
| 2 | **Foundry only** (no Hardhat) | One toolchain = one source of truth (`forge build`, `forge test`) |
| 3 | **Fastify API only** (no Next.js Route Handlers) | Multi-tenant B2B + webhooks + background jobs = dedicated API server |
| 4 | **GTIN/serial identifiers** | DID format `did:galileo:01:{gtin}:21:{serial}` — GS1-native from day 1 |
| 5 | **T1/LEOX = post-pilot gate** | Phase 4 only after MVP KPIs validated on Base Sepolia |
| 6 | **PostgreSQL only** | No SQLite, no alternative ORM |
| 7 | **httpOnly cookies only** | No localStorage for tokens, ever |

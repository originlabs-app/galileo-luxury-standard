# Galileo Protocol — Roadmap

Galileo Protocol is an open-source platform enabling luxury brands to issue blockchain-backed Digital Product Passports (DPPs). Built for compliance with EU ESPR regulation 2024/1781, it combines GS1 Digital Link, W3C Decentralized Identifiers, and ERC-3643 regulated token transfers on Base L2. The protocol is neutral by design — no single organization controls it, and the open-source stack means any brand, developer, or reseller can participate without vendor lock-in.

## Vision

Build the **open standard for luxury product traceability on blockchain** — adopted by brands of all sizes, from independent maisons to global groups.

> *The only open standard combining GS1 Digital Link + W3C DID + ERC-3643 + ESPR 2024/1781 compliance in a single stack.*

**Why brands adopt Galileo:**
1. **Regulatory compliance** — ESPR 2027 mandates Digital Product Passports for textiles and footwear, with leather and watches to follow
2. **Anti-counterfeiting** — The luxury industry loses an estimated $50B per year to counterfeiting (OECD 2024)
3. **Interoperability** — Products changing hands across brands, resellers, and repair centers need a common, open standard
4. **Neutral governance** — Unlike industry consortia controlled by incumbents, Galileo caps representation at 2 TSC seats per organization
5. **Zero licensing cost** — Open source: brands pay only infrastructure costs, not SaaS fees

**Milestone gate before Phase 4:** MVP KPIs validated on Base Sepolia — stable create → mint → scan → verify flow with real brand data.

---

## Status Legend

| Marker | Meaning |
|--------|---------|
| ✅ | Shipped and tested |
| 🔄 | In Progress |
| 📋 | Planned — next to implement |
| 💡 | Future — roadmapped, post-pilot |
| 🔒 | Requires explicit approval before execution |

---

## Current Status — v1.0 Live

As of March 2026, Galileo Protocol v1.0 is fully deployed in production. All four platform components — API, Dashboard, Scanner, and Website — are live and operational.

### What shipped in v1.0
- ✅ **API** — Authentication, product lifecycle management, GS1 Digital Link resolver, webhooks, and audit trail
- ✅ **Dashboard** — B2B portal for brand administrators: product management, batch import, and audit export
- ✅ **Scanner PWA** — Consumer-facing QR verification app with provenance timeline and offline support
- ✅ **Website** — Documentation portal and public changelog

### Upcoming
- 📋 **End-to-end browser testing** — Wallet sign-in, full product lifecycle, and QR scan verification validated in the browser
- 📋 **Production smoke test** — GS1 Digital Link resolution and scanner-to-API integration confirmed end-to-end

---

## Phase 1 — Foundation ✅ Complete

All features shipped across the initial development cycle.

### Authentication & Security
- ✅ Session-based authentication with secure cookie handling (no localStorage)
- ✅ Web3 wallet sign-in via Sign-In With Ethereum (SIWE / EIP-4361) with one-time nonce (5-min TTL)
- ✅ RBAC: ADMIN, BRAND_ADMIN, OPERATOR, VIEWER roles with per-brand data scoping
- ✅ ERC-1271 Smart Wallet support (Coinbase passkey compatible)
- ✅ Wallet linking via EIP-191 signature
- ✅ GDPR: data export (Art. 15) and erasure (Art. 17) endpoints
- ✅ CSRF protection, rate limiting (per-IP + per-user), and API versioning

### Product Lifecycle
- ✅ Product registry with GTIN validation (GS1 mod-10 check digit) and 14-digit normalization
- ✅ DID generation: `did:galileo:01:{gtin}:21:{serial}`
- ✅ Lifecycle state machine: DRAFT → MINTING → ACTIVE → TRANSFERRED / RECALLED
- ✅ Optimistic concurrency control for safe concurrent minting
- ✅ Product recall and ownership transfer
- ✅ ERC-3643 compliant transfer with five-module compliance check (jurisdiction, sanctions/OFAC, brand authorization, CPO status, service center)
- ✅ Product image upload with cloud storage integration
- ✅ QR code generation per GS1 Digital Link specification
- ✅ Bulk CSV import (up to 500 products per batch, with per-row validation and error reporting)
- ✅ Batch minting (up to 100 DRAFT products at once)
- ✅ Public product verification endpoint

### GS1 & Blockchain
- ✅ GS1 Digital Link resolver: `GET /01/:gtin/21/:serial` → JSON-LD Digital Product Passport
- ✅ `@galileo/shared`: Zod schemas, GTIN validation, DID utilities, GS1 URL encoding, 8 luxury categories
- ✅ viem chain client configured for Base Sepolia with fallback transport
- ✅ ERC-3643 Solidity interfaces (Foundry, 722 contract tests)

### B2B Dashboard
- ✅ Product list with filtering, sorting, and pagination
- ✅ Product creation with real-time GTIN and serial validation
- ✅ Product detail with full lifecycle controls (mint, transfer, recall)
- ✅ Batch CSV import with drag-and-drop and per-row error reporting
- ✅ Audit log with CSV/JSON export and date-range filtering
- ✅ GDPR self-service (data export and account deletion)
- ✅ Brand onboarding wizard
- ✅ Web3 wallet connection (MetaMask, Rabby, Coinbase Smart Wallet via wagmi)
- ✅ Error boundaries on all critical pages

### Consumer Scanner PWA
- ✅ QR scanning via native Barcode Detection API (ZXing WASM fallback)
- ✅ Product authenticity page with full provenance timeline
- ✅ Material composition display
- ✅ GS1 Digital Link deep-link routing (`/01/:gtin/21/:serial`)
- ✅ Offline caching of previously scanned products
- ✅ Camera guidance UX

### Observability & Operations
- ✅ Health probes (database + blockchain connectivity)
- ✅ Structured logging with PII redaction
- ✅ Error tracking and alerting
- ✅ Webhook system: outbox pattern, HMAC-SHA256 signing, exponential backoff retry
- ✅ Append-only audit trail with actor anonymization on account deletion
- ✅ Multi-stage Docker image with health check
- ✅ CI pipeline (automated typecheck, lint, and test on every push)

### Testing
- ✅ 372 unit tests (API + shared library)
- ✅ 9 end-to-end scenarios (auth, product lifecycle, batch import, wallet sign-in, audit export, transfer compliance)
- ✅ Isolated test database environment

---

## Phase 2 — Blockchain Live 🔄 In Progress

**Goal:** Real on-chain minting on Base Sepolia. The simulated mint becomes a real ERC-3643 transaction signed and submitted to the chain.

### Contract Deployment 🔒
> Requires operator approval before execution.

- 🔒 Deploy all 12 ERC-3643 contracts to Base Sepolia
- 🔒 Post-deploy configuration: sanctions oracle, trusted issuer registry, identity registry, and minting agent role
- 🔒 Verify contracts on the Base Sepolia block explorer
- 🔒 Record deployed contract addresses in the deployment manifest
- 🔒 Configure authenticated RPC endpoint

### Real Mint Integration 📋
- 📋 Replace simulated minting with real `GalileoToken.mint()` via viem and deployed contracts
- 📋 Identity Registry verification before mint
- 📋 Proper agent role enforcement for minting transactions
- 📋 Record real transaction hash, contract address, chain ID, and timestamp on each passport
- 📋 Document gas benchmarks for mint, transfer, and recall operations

### Real Transfer & Recall On-Chain 📋
- 📋 Transfer endpoint calls `GalileoToken.transferWithCompliance()` on-chain
- 📋 Recall endpoint triggers on-chain token freeze or burn
- 📋 Transaction hashes stored for all on-chain events

### Scanner — On-Chain Verification 📋
- 📋 Scanner verifies token ownership directly against the chain (not just the database)
- 📋 Display on-chain provenance: transaction hash, block number, timestamp
- 📋 Link to the block explorer for each on-chain event

### Webhook Notifications for On-Chain Events 📋
- 📋 Emit `product.minted`, `product.transferred`, `product.recalled` webhook events with transaction hash
- 📋 On-chain event listener feeding the webhook outbox in real time

### Dashboard — Minting UX 📋
- 📋 Mint flow: review product data → wallet prompt → sign transaction → confirmation with transaction hash
- 📋 Transaction pending state (spinner, block confirmation progress)
- 📋 Block explorer link in product detail after a successful mint

### Developer Tools 📋
- 📋 **Bridge page** — Bridge testnet ETH to Base Sepolia directly from the protocol website, with no third-party tools required
- 📋 **Gas estimator** — Preview the cost of minting, transferring, and recalling a product before signing any transaction
- 📋 **Developer faucet** — Distribute testnet ETH to developers and brands building on Base Sepolia, rate-limited by wallet address

---

## Phase 3 — Enterprise Ready 💡 Planned

**Goal:** Production-grade multi-tenant SaaS. Multiple brands operate independently with full data isolation.

### Multi-Tenant Workspace Isolation
- 💡 Row-level security at the database level per workspace
- 💡 Workspace-scoped URL routing
- 💡 Cross-workspace visibility for the ADMIN role

### Role & Access Refinement
- 💡 Refined OPERATOR role: verify actions without write access
- 💡 Team invite flow: email invitation with role assignment
- 💡 MFA: TOTP and passkey support for administrators

### Extended Product Events
- 💡 New lifecycle events: REPAIRED, CPO_CERTIFIED, OWNERSHIP_CHANGED
- 💡 Corresponding API endpoints for repair certification and CPO workflows
- 💡 Human review workflow for compliance rejections (GDPR Art. 22)

### Audit & Compliance Exports
- 💡 Advanced audit log filtering by actor, action, and date range
- 💡 PDF compliance report generation (regulatory-ready, branded output)
- 💡 GDPR Data Protection Impact Assessment (DPIA) completed
- 💡 Automated data retention enforcement

### Bulk Operations
- 💡 Bulk status updates (bulk recall, bulk archive)
- 💡 Bulk ownership transfer
- 💡 Background job tracking for large imports
- 💡 Product export to CSV and Excel

### API Key Management
- 💡 API key creation, rotation, and revocation per brand
- 💡 Scoped permissions per key (read-only, write, webhook-only)
- 💡 API key usage analytics

### Webhook Management UI
- 💡 Delivery history with per-event status (delivered, failed, retrying)
- 💡 Manual retry for failed deliveries
- 💡 Per-subscription event filtering

### Token Factory 💡
- 💡 No-code interface for brands to deploy their own ERC-3643 token contract without writing Solidity
- 💡 Guided deployment flow using pre-audited templates

### Token Explorer 💡
- 💡 Public explorer for all Galileo tokens on Base — browse any ERC-3643 token and view its full transfer history
- 💡 Interactive provenance visualization (timeline and graph) per token ID

### Additional Tools 💡
- 💡 Batch token transfer to multiple recipients in a single transaction
- 💡 Recall and burn manager with dual-confirmation (brand admin + on-chain signature)
- 💡 Product authenticator as a standalone public web page — NFC or QR verification with no app install required
- 💡 Authenticity certificate viewer — printable format with product metadata, ownership history, and compliance claims
- 💡 USDC payment integration for ownership transfers and certification services on Base

---

## Phase 4 — Token Economy 💡 Future

**Gate:** MVP KPIs validated on Base Sepolia with real brand data.

> Token architecture details: see the Token Architecture section below.

### T1 Token Launch on Base
- 💡 Deploy T1 utility token (ERC-20, 1B fixed supply, deflationary via buy-back-and-burn)
- 💡 Gas abstraction via ERC-4337 Paymaster: brands and users pay gas in T1 — no ETH required
- 💡 Flexible payment: mint and transfer fees accepted in EUR, T1, or LEOX (10% discount with T1)

### LEOX Migration Portal
- 💡 On-chain migration: LEOX (Ethereum) → T1 (Base) with KYC verification and anti-whale vesting
- 💡 Bridge interface in the dashboard
- 💡 LEOX bridged representation on Base

### Staking & Premium Features
- 💡 Stake T1 to unlock premium API tiers, advanced analytics, and priority support
- 💡 On-chain discount logic (5–15% depending on staking tier)

### Governance
- 💡 Multi-sig treasury governed by T1 holders
- 💡 On-chain voting on protocol evolution
- 💡 Buy-back-and-burn: quarterly allocation of protocol revenues → purchase T1 on open market → burn

### Identity & Compliance Tooling 💡
- 💡 Public interface to verify the ERC-3643 claim status of any wallet address
- 💡 Self-service KYC/KYB onboarding portal for partners and resellers
- 💡 Public browser for the Trusted Issuers Registry (TIR), verifiable on-chain

### Autonomous Protocol Agent 💡
- 💡 An on-chain agent capable of handling routine operations autonomously: batch minting, identity registration, and claim issuance
- 💡 Verifiable on-chain brand profiles showcasing participation history and compliance credentials

---

## Phase 5 — Scale & Compliance 💡 Future

### Mainnet Deployment
- 💡 Base Mainnet deployment following independent smart contract security audit
- 💡 GDPR Data Protection Impact Assessment (DPIA) completed and signed off
- 💡 Coordinated migration from Base Sepolia testnet

### Multi-Chain Support
- 💡 Ethereum mainnet bridge for existing token holders
- 💡 Alternative chain support for lower-gas markets
- 💡 Cross-chain DPP resolver: resolve a DID regardless of which chain it was issued on

### Internationalization
- 💡 Full i18n support for luxury markets: EN, FR, IT, ZH, JA
- 💡 RTL layout support
- 💡 Localized GS1 Digital Link descriptions

### Mobile Native Scanner
- 💡 Native iOS and Android scanner app replacing the PWA
- 💡 Offline-first with local encrypted cache
- 💡 NFC tag reading in addition to QR
- 💡 Augmented reality overlay for in-store authentication

### Analytics & Reporting
- 💡 Brand analytics: scan heatmaps, verification frequency, geographic distribution
- 💡 Counterfeiting anomaly detection: unusual scan patterns and geographic outliers
- 💡 SOC 2 Type II certification
- 💡 ISO 27001 alignment

### Open Source Developer Experience
- 💡 Public SDK: `@galileo/sdk` (TypeScript and Python)
- 💡 CLI tool: `npx @galileo/cli create-product` — standalone command-line DPP creation
- 💡 Docker Compose sandbox for one-command local setup
- 💡 Comprehensive developer documentation portal
- 💡 Sandbox environment with testnet contracts and pre-seeded demo data
- 💡 Helm chart for Kubernetes deployments
- 💡 Published npm packages: `@galileo/shared`, `@galileo/sdk`, `@galileo/contracts`
- 💡 Docker images on GitHub Container Registry

### Community & Governance
- 💡 Technical Steering Committee: 3–5 members, max 2 seats per organization (anti-dominance rule)
- 💡 Discord server and developer mailing list
- 💡 Public bug bounty program
- 💡 Design partner program: 2–3 mid-market luxury brands for the initial pilot

---

## Future Directions

> This section captures ideas the community is excited about. Nothing here is committed — these are directions worth exploring as the protocol matures. If any of these resonates with you, open a discussion on GitHub.

### AI-Powered Features
- 💡 **Counterfeit pattern detection** — ML-based analysis of anomalous scan patterns to surface potential counterfeit hotspots before they scale
- 💡 **Consumer product assistant** — Conversational AI embedded in the scanner to answer questions about a product's provenance, materials, and care instructions
- 💡 **Automated DPP content generation** — From a product photo, generate the initial Digital Product Passport fields to accelerate brand onboarding
- 💡 **ESPR compliance assistant** — Intelligent analysis of DPPs to identify gaps against ESPR 2027 requirements before regulatory deadlines
- 💡 **Dashboard onboarding agent** — Conversational guide for brand administrators navigating complex workflows for the first time
- 💡 **Audit log intelligence** — Natural language summaries and anomaly detection across audit logs

### Extended Blockchain Capabilities
- 💡 **Crypto payment integration** — Accept cryptocurrency payments for certification and minting fees
- 💡 **On-chain brand verifications** — Complementary identity claims for verified brands, building a trustworthy registry of participants
- 💡 **Sponsored transactions** — Protocol-sponsored gas fees for consumer interactions — zero friction for end-users scanning products
- 💡 **Smart Wallet for brand admins** — Passkey-based wallets for seamless and secure brand operations
- 💡 **Multi-asset bridge** — Extend the bridge interface to support ERC-20 tokens alongside native ETH
- 💡 **Cross-chain interoperability** — Resolve DPPs regardless of origin chain via established cross-chain messaging protocols

### Data & Privacy
- 💡 **Database-level isolation** — Per-brand row-level security at the database layer for maximum multi-tenant data separation
- 💡 **Extended MFA** — TOTP and passkey second factors for all administrator roles
- 💡 **Extended lifecycle events** — New product states for repair, CPO certification, and ownership transfer scenarios

---

## GDPR Compliance Architecture

> Based on [EDPB Guidelines 02/2025](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf).

**Core principle: zero personal data on-chain.**

### What goes on-chain (immutable, public)
- Token ID (uint256) — not personal data
- Product DID (`did:galileo:01:{gtin}:21:{serial}`) — identifies the product, not a person
- IPFS content hash (CID) — an integrity proof, not the data itself
- Brand identity claims (ONCHAINID) — corporate identity, not personal data
- Transfer events — wallet addresses only (pseudonymous)

### What stays off-chain (deletable, access-controlled)
- Customer names, emails, shipping addresses → database (GDPR-deletable)
- Product photos and certificates → cloud storage (deletable)
- KYC/AML documents → dedicated provider (5-year retention per 5AMLD, then deleted)
- Wallet-to-identity mappings → database (deletable on request)

### CRAB Model (Create-Read-Archive-Burn)
1. **Create** — personal data stored off-chain with an on-chain hash reference
2. **Read** — access controlled by RBAC and ONCHAINID claims
3. **Archive** — after the retention period, moved to cold storage
4. **Burn** — off-chain data deleted; the on-chain CID becomes an unresolvable orphan pointer (not personal data per EDPB guidelines)

### IPFS — Compute CID, Don't Pin
We compute the IPFS CID locally for tamper-evidence but do **not** pin to the IPFS network (incompatible with GDPR deletion requirements). Actual data is served from deletable, geo-restricted cloud storage.

---

## Token Architecture: LEOX + T1

### Current Token State

| Token | Chain | Supply | Status |
|-------|-------|--------|--------|
| LEOX | Ethereum (ERC-20) | 150M | Live — MEXC, BitMart, Uniswap |
| AVIA | Avalanche (ERC-20) | 100M | Live — low liquidity |

### T1 — Tokenizd One

T1 unifies the ecosystem across Galileo (luxury), Kepler (aviation), and Tokenizd (TaaS):
- **Supply:** 1 billion T1 (fixed supply, deflationary via buy-back-and-burn)
- **Issuer:** Origin Labs SASU
- **Chain:** Base L2 (primary) + Ethereum (bridge for LEOX migration)
- **Classification:** Utility token (not EMT, not ART under MiCA)

### Coexistence Model

```
Now        LEOX lives on Ethereum; Galileo contracts on Base (pre-mainnet)
Phase 2    Real ERC-3643 contracts on Base Sepolia; real on-chain minting
Phase 4    T1 launches on Base; LEOX → T1 migration portal opens
Maturity   T1 is the primary utility token; LEOX holders can still migrate
```

### T1 Utility in Galileo

| Action | Accepted Payment | T1 Benefit |
|--------|-----------------|------------|
| Mint a product DPP | EUR, T1, or LEOX | 10% discount with T1 |
| Transfer ownership | EUR, T1, or LEOX | 5% discount with T1 |
| Gas fees | T1 or LEOX (via Paymaster) | No ETH needed; 5–15% discount |
| Premium API access | Stake T1 | Unlock advanced tiers |
| Governance votes | Hold T1 | Vote on protocol evolution |

---

## Architectural Constraints

These decisions are locked. Changing them would require a governance vote.

| # | Constraint | Rationale |
|---|-----------|-----------|
| 1 | **ERC-3643 only** (not ERC-721) | Product passports are permissioned tokens with compliance hooks — ERC-721 has no compliance layer |
| 2 | **Foundry only** (not Hardhat) | One toolchain, one source of truth |
| 3 | **Dedicated API server** (not framework route handlers) | Multi-tenant B2B with webhooks and background jobs requires a standalone server |
| 4 | **GTIN/serial identifiers** | DID format `did:galileo:01:{gtin}:21:{serial}` — GS1-native from day one |
| 5 | **T1/LEOX gated behind pilot** | Phase 4 only after MVP KPIs validated with real brand data |
| 6 | **PostgreSQL only** | No alternative databases or ORMs |
| 7 | **httpOnly cookies for auth** | No localStorage token storage, ever |

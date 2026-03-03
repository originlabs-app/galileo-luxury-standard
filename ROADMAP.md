# Galileo Protocol — Roadmap

## Vision

Build a working end-to-end demo: a luxury brand creates a product, mints its on-chain passport, and a customer scans a QR code to see the Digital Product Passport. Integrate T1 as the ecosystem utility token across Galileo (luxury) and Kepler (aviation).

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

## Phase 0 — Repo Cleanup (Week 1) ⚠️ Partially done

Finalize the open-source repository for v1.0.0 publication.

> **Note:** Cross-references to renamed files (`hybrid-architecture.md` → `hybrid-architecture.md`, `crypto-agility.md` → `crypto-agility.md`) still present in `README.md`, `resolution-protocol.md`, `DID-METHOD.md`.

| Task | Scope | Status |
|------|-------|--------|
| Fix 15 spec/repo audit findings | Broken cross-refs, ID collisions, NOTICE, schemas | **Done** (0f5aeb6) |
| Website fixes | Missing pages, governance rewrite, SEO, legal | **Done** (5458fb9→0a7082e) |
| Fix 4 smart contract issues (M-1 to M-4) | Emergency access, RBAC migration, underflow, mint guard | Pending |
| Website deployed on galileoprotocol.io | Vercel, domain, analytics | Pending |

**Exit criteria:** All audit findings resolved, `forge test` passes, website live.

---

## Phase 1 — Testnet Full-Stack Launch (Weeks 2-4) 🔲 Planned

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

## Phase 2 — Backend API (Weeks 3-5) 🔲 Planned

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

## Phase 3 — Brand Dashboard (Weeks 4-7) 🔲 Planned

Web dashboard for brands to manage their products and tokens.

### Stack

- **Framework:** Next.js 15+ (App Router)
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

## Phase 5 — GS1 Digital Link Resolver (Weeks 5-7) 🔲 Planned

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

## Phase 6 — T1 Token Integration (Weeks 6-10) 🔲 Planned

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
Week 1        Phase 0 — Repo cleanup + v1.0.0 ⚠️ (partially done)
Week 2-4      Phase 1 — Testnet full-stack launch (deploy, validate E2E, gas benchmarks)
Week 3-5      Phase 2 — Backend API (auth, products, mint, GDPR, resolver)
Week 4-7      Phase 3 — Brand dashboard (create, mint, manage)
Week 5-7      Phase 5 — GS1 resolver (integrated in API)
Week 6-8      Phase 4 — Scanner PWA (public verification)
Week 6-10     Phase 6 — T1 token contracts + migration portal + Paymaster
```

Phases overlap intentionally. Phase 1 (testnet) must be validated before Phase 2+ can connect to real contracts. The backend API and resolver are built together. The dashboard and scanner consume the same API. T1 integration happens in parallel once the core product flow works.

**Testnet milestone: Week 4** — Full lifecycle test passes on Base Sepolia.
**Demo-ready target: Week 8** — Full product flow (create → mint → scan → verify).
**T1-ready target: Week 10** — T1 deployed, migration portal live, Paymaster active, gas paid in T1/LEOX.

---

## Tech Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| Blockchain | Base L2 (Coinbase) | Low gas, EVM-compatible, enterprise credibility |
| Smart contracts | Solidity 0.8.20+, Foundry | ERC-3643 T-REX framework, 722 tests (to be revalidated once Foundry CI is established) |
| Backend API | Node.js 22, Fastify, TypeScript | Same ecosystem as frontend, viem for chain |
| Database | PostgreSQL | Proven, relational, GDPR-deletable |
| Object storage | Cloudflare R2 | S3-compatible, no egress fees, global CDN, deletable |
| Integrity | CID computed locally (NO IPFS pinning) | Tamper-evidence without GDPR risk |
| Dashboard | Next.js, Tailwind, shadcn/ui, wagmi | Consistent with existing website stack |
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

- [ ] Multi-brand from day 1 or single-brand MVP?
- [ ] Native app timeline? (after PWA validation)
- [ ] DPIA: when to complete? (required before mainnet per EDPB)
- [ ] KYC provider for T1 migration portal? (Sumsub, Onfido, Synaps?)
- [ ] T1/LEOX swap ratio? (market-based, fixed, or hybrid?)
- [ ] MiCA validation timeline with counsel for SASU-issued utility token?
- [ ] Dedicated RPC provider? (Alchemy, QuickNode, Infura for Base)
- [ ] GS1 testsuite integration: CI or manual? ([testsuite](https://gs1.github.io/GS1DL-resolver-testsuite/))

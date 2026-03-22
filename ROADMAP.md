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

## Déploiement Production

### Statut des apps

| App | Cible | Statut |
|-----|-------|--------|
| `apps/api` | Railway | ✅ En prod (health OK, faucet OK, auth OK) |
| `website/` | Vercel (`galileo-luxury-standard`) | ✅ En prod (site vitrine ABYSSE) |
| `apps/dashboard` | Vercel (à créer) | ⏳ Pas encore déployé |
| `apps/scanner` | Vercel (à créer) | ⏳ Pas encore déployé |

### Priorités immédiates

#### P0 — Bloquants
- [ ] **Migrations Prisma sur DB Railway** — La table `Product` n'existe pas, le résolveur GS1 retourne 500. Il faut exécuter `prisma migrate deploy` ou `prisma db push` contre la DB de production.

#### P1 — Déploiements manquants
- [ ] **Déployer apps/dashboard sur Vercel** — Back-office B2B pour les marques (gestion produits/DPP)
- [ ] **Déployer apps/scanner sur Vercel** — PWA consommateur pour scanner les QR et vérifier l'authenticité blockchain

#### P2 — Configuration prod
- [ ] **Configurer R2 storage sur Railway** — Actuellement en mode `local`, les uploads d'images ne persistent pas entre redémarrages
- [ ] **Ajouter clé API Basescan** — Nécessaire pour la vérification des contrats sur Base Sepolia
- [ ] **Clean up worktrees git** — ~25 worktrees orphelins à supprimer dans `.claude/worktrees/`

#### P3 — Tests & Validation
- [ ] **Test navigateur end-to-end** — Connexion wallet, faucet, flow complet sur le dashboard
- [ ] **Smoke test scanner** — Vérifier le scan QR et la résolution GS1 Digital Link
- [ ] **Vérifier communication dashboard ↔ API** — S'assurer que les env vars pointent vers la bonne URL API

### Notes
- L'API a été fixée le 22/03/2026 : Prisma 7 ESM imports (.js extensions) + chemin contracts/deployments dans le Dockerfile
- Règle : toujours éditer en local + git push, ne jamais utiliser l'éditeur web GitHub sauf si parfaitement justifié

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

### Public Bridge Interface 📋 Planned
> **Target:** Help luxury brands onboard onto Base chain easily — get ETH on Base Sepolia without needing to navigate external bridges.

- 📋 New public page at `galileoprotocol.io/bridge` (`apps/website` — no auth required)
- 📋 "Connect Wallet" button supporting MetaMask and WalletConnect (wagmi)
- 📋 Bridge ETH from Ethereum Sepolia → Base Sepolia using L1 Standard Bridge (`0xfd0Bf71F60660E2f608ed56e1659C450eB113120` on Sepolia)
- 📋 Free to use during testnet phase
- 📋 Real-time bridge status: transaction confirmation, block progress, estimated arrival time (~1–3 min)
- 📋 Link to Etherscan / Basescan for each bridge transaction
- 📡 Future (mainnet): bridge ETH Mainnet → Base Mainnet via the same L1 Standard Bridge pattern
- 📡 Future: reverse direction — Base → Ethereum (7-day optimistic rollup challenge window, clearly communicated)

### Gas Estimator 📋 Planned
- 📋 Public page at `galileoprotocol.io/gas` — calculate estimated minting, transfer, and recall costs before execution
- 📋 Shows current Base gas price, estimated ETH cost, and equivalent in EUR/USD

### Galileo Testnet Faucet 📋 Planned
- 📋 Public page distributing testnet ETH to developers and brands testing on Base Sepolia — no third-party faucets needed
- 📋 Rate-limited by wallet address and IP, with optional GitHub OAuth for higher allowance

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

### Extended Product Lifecycle Events
- 💡 New event types: `REPAIRED`, `CPO_CERTIFIED`, `OWNERSHIP_CHANGED` (DB migration required 🔒)
- 💡 New endpoints: `POST /products/:id/repair`, `POST /products/:id/certify-cpo`
- 💡 Human review workflow for compliance rejections (GDPR Art. 22 — automated decisions)

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

### Uptime & Observability
- 💡 External uptime monitoring (Uptime Robot or equivalent) with alerts
- 💡 SLA dashboard for brands

### Token Factory 💡 Future
- 💡 No-code interface for brands to deploy their own ERC-3643 token contract (configure name, symbol, compliance rules) without writing Solidity
- 💡 Wizard-based deployment flow with pre-audited templates; brand receives deployed contract address and ownership

### Token Explorer 💡 Future
- 💡 Public explorer for all Galileo tokens on Base — browse any ERC-3643 token, view full transfer history and chain of custody
- 💡 Interactive provenance visualization (timeline / graph) per token ID

### Batch Transfer / Multi-sender 💡 Future
- 💡 Send ERC-3643 authentication tokens to multiple recipients in a single transaction — ideal for collection launches
- 💡 Paste or upload recipient list, preview gas cost, one-click batch execution

### Airdrop Tool 💡 Future
- 💡 Distribute tokens to a list of addresses via CSV upload, with gas cost preview before execution
- 💡 Progress tracker showing per-address status (pending, confirmed, failed)

### Recall / Burn Manager 💡 Future
- 💡 Dedicated interface for brands to recall a product by burning its token, with full traceability and audit record
- 💡 Requires dual confirmation (brand admin + on-chain signature) to prevent accidental burns

### Product Authenticator (standalone) 💡 Future
- 💡 Public web page — no app install required — for NFC/QR → on-chain verification of any Galileo product
- 💡 Works on mobile browser; displays authenticity certificate and full provenance chain

### Certificate Viewer 💡 Future
- 💡 Public page showing the full authenticity certificate for a given token ID, accessible via shareable link
- 💡 Renders product metadata, ownership history, and compliance claims in a printable format

### USDC Payments Integration 💡 Future
- 💡 Enable USDC payments for ownership transfers, certification services, and marketplace transactions via Coinbase CDP
- 💡 Allows brands to accept crypto payments for authentication services without handling volatile assets
- 💡 Native USDC settlement on Base — no conversion needed, stable value for brand treasury

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

### Identity Claim Verifier 💡 Future
- 💡 Public interface to verify the ERC-3643 claim status of any wallet address (accredited investor, authorized reseller, etc.)
- 💡 Returns claim type, issuer, and expiry without exposing underlying personal data

### KYC/KYB Onboarding Portal 💡 Future
- 💡 Self-service form for partners and resellers to submit verification documents and receive their identity token
- 💡 Integrates with a KYC provider (e.g., Synaps or Onfido); status tracked in the dashboard

### Trusted Issuer Registry Browser 💡 Future
- 💡 Public explorer listing all trusted issuers recognized in the Galileo ecosystem and their authorized claim types
- 💡 Verifiable on-chain via the Trusted Issuers Registry (TIR) contract

### Onchain Agent (Coinbase CDP AgentKit) 💡 Future
- 💡 Autonomous agent with onchain capabilities via Coinbase CDP AgentKit to automate token management, compliance checks, and identity verification for brands
- 💡 Handles routine operations: batch minting, identity registration, and claim issuance without manual intervention
- 💡 Reduces operational overhead for brands managing large product catalogs on-chain

### Onchain Social Profile (Coinbase) 💡 Future
- 💡 Brand profiles powered by Coinbase's onchain identity system, complementing ERC-3643 identity with public-facing brand reputation
- 💡 Verification badges and social proof for luxury brands in the Galileo ecosystem
- 💡 Verifiable onchain credentials showcase brand participation and compliance history to consumers and partners

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
- 💡 CLI tool: `npx @galileo/cli create-product` — standalone command-line DPP creation
- 💡 Docker Compose sandbox (one-command local setup)
- 💡 Developer documentation portal (`apps/website`)
- 💡 Sandbox environment with testnet contracts + seeded demo data (`sandbox.galileoprotocol.io`)
- 💡 Helm chart for Kubernetes deployments
- 💡 Publish npm packages: `@galileo/shared`, `@galileo/sdk`, `@galileo/contracts`
- 💡 Docker images on GitHub Container Registry

### Community & Governance
- 💡 Recruit 3–5 TSC members (max 2 seats per organization — anti-dominance rule)
- 💡 Discord server + mailing list for ecosystem developers
- 💡 Bug bounty program
- 💡 Identify 2–3 design partners (mid-market luxury brands for pilot)

### Mainnet Bridge UI 💡 Future
- 💡 Upgrade the bridge page to support Ethereum mainnet ↔ Base mainnet transfers — same UX as the testnet bridge
- 💡 Gas estimates in USD, mainnet block confirmation progress, Etherscan / Basescan links

### Reverse Bridge (Base → Ethereum) 💡 Future
- 💡 Support withdrawals from Base back to Ethereum mainnet via the optimistic rollup mechanism
- 💡 7-day challenge window clearly communicated in the UI with countdown timer and status tracking

---

## Brainstorming — Idées non implémentées

> Features identifiées en brainstorming ou dans l'historique git mais jamais codées. Aucune décision d'implémenter prise — à évaluer lors de futures sprints.

### Intégration IA / LLM
> *Brainstorm oral — aucun fichier git ne trace ces idées. À affiner.*

- 💡 **Détection de contrefaçon par IA** — Analyse des patterns de scan anormaux (fréquence, géographie, timing) via ML pour détecter les tentatives de falsification de DPP
- 💡 **Assistant de vérification produit** — LLM intégré dans le scanner pour répondre aux questions consommateurs sur le produit (composition, provenance, histoire) à partir des métadonnées DPP
- 💡 **Génération automatique de contenu DPP** — À partir d'une photo ou d'une référence produit, un LLM génère les champs DPP (catégorie, matières, pays d'origine) en pré-remplissage
- 💡 **Audit de conformité ESPR assisté par IA** — Analyse automatique des DPP d'une marque pour identifier les champs manquants ou non conformes aux exigences réglementaires ESPR 2027
- 💡 **Support client IA pour le dashboard** — Agent conversationnel pour guider les BRAND_ADMIN dans la création de produits, l'import CSV, et les opérations de lifecycle
- 💡 **Analyse sémantique des audits** — LLM pour résumer et détecter des patterns inhabituels dans les audit logs (ex: pic de recalls, transferts répétés sur un même produit)

### Scope Coinbase élargi
> *Items Coinbase discutés mais non implémentés au-delà de ce qui est dans les phases 3–4.*

- 💡 **Coinbase Commerce** — Accepter des paiements en crypto directement via Coinbase Commerce pour les frais de certification et mint, sans passer par un DEX
- 💡 **Coinbase Verifications** — Intégrer le système de vérifications on-chain de Coinbase pour les claims de marque (country of origin, brand authenticity) — complémentaire à ERC-3643
- 💡 **Base Paymaster (sponsored transactions)** — Sponsor les frais de gas pour les consommateurs scannant un QR, offrant une expérience Web3 transparente (aucun wallet requis)
- 💡 **Smart Wallet pour les marques** — Déployer des Coinbase Smart Wallets pour les BRAND_ADMIN pour une expérience passkey sans seed phrase

### Bridge avancé
> *Étendu au-delà des items déjà dans Phase 2 et Phase 5.*

- 💡 **Bridge multi-actifs** — Supporter le bridging de tokens ERC-20 (LEOX, USDC) en plus de l'ETH natif
- 💡 **Bridge vers Polygon** — Route alternative pour les marques souhaitant des frais de gas ultra-faibles (marchés émergents, petites maisons)
- 💡 **Wormhole / LayerZero integration** — Interoperabilité cross-chain pour les DPP : résoudre un DID quelle que soit la chaîne où il est enregistré
- 💡 **Bridge status API** — Endpoint public pour vérifier le statut de n'importe quelle transaction de bridge, utile pour les intégrations ERP de marques

### Features backlog non planifiées (issues git)
> *Issues et tâches identifiées dans les sprints passés mais repoussées.*

- 💡 **Uptime monitoring externe** — Alertes Uptime Robot ou Better Stack pour l'API et les frontends (mentionné Sprint #10, jamais implémenté)
- 💡 **PostgreSQL Row-Level Security** — Isolation DB-level par brand/workspace, actuellement en app-level RBAC seulement (🔒 migration DB requise)
- 💡 **MFA : TOTP + passkey** — Authentification à deux facteurs pour BRAND_ADMIN et ADMIN (🔒 migration DB requise — champs `totpSecret`, `totpEnabled`)
- 💡 **Human review pour rejets de compliance** — GDPR Art. 22 : les décisions automatisées de blocage de transfert doivent offrir une option de révision humaine
- 💡 **Events lifecycle étendus** — Types REPAIRED, CPO_CERTIFIED, OWNERSHIP_CHANGED (🔒 migration DB requise)

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

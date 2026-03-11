# Requirements: Galileo Protocol

**Defined:** 2026-03-09
**Core Value:** Luxury brands can prove a product's authenticity and lifecycle through a neutral, interoperable, regulation-ready Digital Product Passport that is actually verifiable end to end.

## v1 Requirements

Requirements for the current pilot cycle: one luxury brand running a real end-to-end Base Sepolia flow.

### Authentication & Access

- [x] **AUTH-01**: Operator can sign in to the pilot workspace using an approved Galileo authentication flow
- [x] **AUTH-02**: Operator session persists securely across dashboard navigation and refresh
- [x] **AUTH-03**: Operator actions are restricted to the single pilot brand workspace and authorized roles

### Product Identity & Catalog

- [x] **PROD-01**: Operator can create a product manually with validated GTIN and serial data
- [x] **PROD-02**: Operator can batch import products from CSV with validation feedback
- [x] **PROD-03**: System generates a persistent product identifier set for each item, including GS1 Digital Link URL and Galileo DID
- [x] **PROD-04**: Operator can manage core passport metadata and linked media needed for public verification

### On-Chain Issuance & Transfer

- [x] **CHAIN-01**: System can deploy or reference the active Base Sepolia contract stack through a canonical environment manifest
- [ ] **CHAIN-02**: Operator can mint a product passport on Base Sepolia and the system stores the real transaction hash, contract address, and explorer URL
- [ ] **CHAIN-03**: System exposes pending, confirmed, and failed blockchain transaction states with recovery guidance for operators
- [ ] **CHAIN-04**: Operator can transfer product ownership through the current compliance flow and store the resulting on-chain evidence

### Public Verification

- [ ] **VERI-01**: Physical QR or GS1 Digital Link scan resolves to the correct public product passport
- [ ] **VERI-02**: Public scanner experience works on mobile without requiring a wallet connection
- [ ] **VERI-03**: Public passport view shows verifiable provenance data, including live chain evidence and current lifecycle state
- [ ] **VERI-04**: Resolver returns standards-aligned JSON-LD output suitable for interoperable verification

### Lifecycle & Evidence

- [ ] **LIFE-01**: System records lifecycle events for product creation, minting, verification, transfer, and recall with auditable timestamps
- [ ] **LIFE-02**: Authorized operator can recall a product and public verification reflects the recalled state
- [ ] **LIFE-03**: Operator can export an audit trail or evidence bundle suitable for pilot demos and compliance review

### Security & Operations

- [ ] **SECO-01**: Platform keeps customer PII off-chain and validates untrusted input across operator and public flows
- [ ] **SECO-02**: Hosted pilot exposes public URLs for dashboard, API, and scanner so a non-engineer can complete the end-to-end demo flow
- [x] **SECO-03**: System stores and displays deployment metadata needed to inspect the pilot environment, including chain ID, contract addresses, and explorer references

## v2 Requirements

Deferred until the single-brand pilot proves the product end to end.

### Access & Tenancy

- **TEN-01**: Platform supports multi-brand tenancy with row-level security and tenant-safe data isolation
- **AUTH-04**: Operator can enable MFA with TOTP and passkeys

### Extended Provenance

- **CPO-01**: Authorized resale or service actors can add CPO and repair lifecycle events
- **VC-01**: Platform can issue partner-verifiable attestations for repair, service, or certification events

### Ecosystem Expansion

- **OSS-01**: Galileo provides open-source SDK, CLI, Docker images, and sandbox tooling for third-party adoption
- **BRND-01**: Third-party brands can self-onboard using documented APIs and operator tooling
- **MAIN-01**: Platform supports audited Base mainnet deployment for production use

### Token & Governance

- **TOKN-01**: Galileo launches T1 as a utility token after pilot success and legal approval
- **GOV-01**: Governance model formalizes anti-dominance controls across participating organizations and future protocol users

## Out of Scope

Explicitly excluded from the current pilot roadmap.

| Feature | Reason |
|---------|--------|
| Multi-brand self-serve onboarding | Blocked by pending RLS / tenant-isolation approval and not required to prove the pilot |
| Consumer wallet-first ownership UX | Adds support and recovery complexity before the operator-led pilot is proven |
| Loyalty, token-gated, or metaverse experiences | Distracts from authenticity, interoperability, and compliance value |
| Rich mutable passport payloads or customer data on-chain | Conflicts with privacy goals, cost control, and data-correction needs |
| Base mainnet rollout | Requires contract audit and successful testnet pilot first |
| T1 launch during the pilot cycle | Explicitly gated behind pilot success and legal readiness |
| Open-source distribution during the pilot cycle | Explicitly gated behind pilot success and packaging work |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| PROD-01 | Phase 1 | Complete |
| PROD-03 | Phase 1 | Complete |
| PROD-02 | Phase 2 | Complete |
| PROD-04 | Phase 2 | Complete |
| CHAIN-01 | Phase 3 | Complete |
| CHAIN-02 | Phase 3 | Pending |
| CHAIN-03 | Phase 3 | Pending |
| SECO-03 | Phase 3 | Complete |
| CHAIN-04 | Phase 4 | Pending |
| LIFE-01 | Phase 4 | Pending |
| LIFE-02 | Phase 4 | Pending |
| LIFE-03 | Phase 4 | Pending |
| VERI-01 | Phase 5 | Pending |
| VERI-02 | Phase 5 | Pending |
| VERI-03 | Phase 5 | Pending |
| VERI-04 | Phase 5 | Pending |
| SECO-01 | Phase 6 | Pending |
| SECO-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation*

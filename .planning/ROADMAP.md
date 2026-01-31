# Roadmap: Galileo Luxury Standard

## Overview

This roadmap transforms the Galileo Luxury Standard from concept to publishable specification through 8 phases. Following research guidance (TradeLens failure analysis), governance is established FIRST before any technical work. Phases progress through architectural foundations, data models, identity infrastructure (critical dependency for tokens), token/compliance layer, GS1 resolver integration, infrastructure specifications, and compliance documentation. Every phase delivers concrete, verifiable specification artifacts.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Governance Foundation** - Establish neutral governance before technical work (TradeLens lesson)
- [x] **Phase 2: Architecture Foundation** - Define hybrid on-chain/off-chain architecture and cryptographic patterns
- [x] **Phase 3: Core Data Models** - Complete ESPR-ready DPP and lifecycle event schemas
- [x] **Phase 4: Identity Infrastructure** - Enable participant verification via ERC-3643 identity layer
- [ ] **Phase 5: Token & Compliance Layer** - Enable compliant ownership transfer (depends on Phase 4)
- [ ] **Phase 6: GS1 Resolver Integration** - Bridge physical products to digital identities
- [ ] **Phase 7: Infrastructure & Security** - Complete operational infrastructure specifications
- [ ] **Phase 8: Compliance Documentation** - Enable adopters to achieve regulatory compliance

## Phase Details

### Phase 1: Governance Foundation
**Goal**: Establish neutral, independent governance that prevents single-organization control and enables competing luxury brands to participate
**Depends on**: Nothing (first phase)
**Requirements**: GOV-01, GOV-02, GOV-03, GOV-04
**Success Criteria** (what must be TRUE):
  1. Governance charter defines neutral decision-making process with veto rights preventing single-organization control
  2. RFC contribution process enables any organization to propose specification changes
  3. Apache 2.0 license documentation establishes standard as non-capturable commons
  4. Semantic versioning policy ensures backward compatibility guarantees for adopters
**Plans**: 6 plans in 2 waves

Plans:
- [x] 01-01-PLAN.md — IP Foundation: Apache 2.0 LICENSE, NOTICE, DCO (GOV-03)
- [x] 01-02-PLAN.md — Governance Charter: CHARTER.md, CODE_OF_CONDUCT.md (GOV-01 core)
- [x] 01-03-PLAN.md — RFC Process: CONTRIBUTING.md, rfcs/* (GOV-02)
- [x] 01-04-PLAN.md — Versioning Policy: VERSIONING.md (GOV-04)
- [x] 01-05-PLAN.md — TSC Operations: tsc/* (GOV-01 completion)
- [x] 01-06-PLAN.md — Membership System: membership/* (participation rules)

---

### Phase 2: Architecture Foundation
**Goal**: Define architectural patterns that ensure GDPR compliance and prepare for post-quantum cryptography
**Depends on**: Phase 1
**Requirements**: FOUND-01, FOUND-02, FOUND-06
**Success Criteria** (what must be TRUE):
  1. Architecture document defines clear on-chain/off-chain data boundaries with GDPR-compliant separation
  2. Product identity schema follows W3C DID specification for decentralized, non-revocable identifiers
  3. Crypto-agile specification enables signature scheme migration without breaking changes
  4. Legal validation confirms no personal data stored on-chain (EDPB 2025 guidance compliance)
**Plans**: 3 plans in 2 waves

Plans:
- [x] 02-01-PLAN.md — Hybrid Architecture: GDPR-compliant on-chain/off-chain boundaries (FOUND-01)
- [x] 02-02-PLAN.md — Crypto-Agility: Post-quantum cryptography migration path (FOUND-06)
- [x] 02-03-PLAN.md — Product Identity: W3C DID method and document schema (FOUND-02)

---

### Phase 3: Core Data Models
**Goal**: Deliver ESPR-ready DPP schema and complete lifecycle event schemas aligned with EPCIS 2.0
**Depends on**: Phase 2
**Requirements**: FOUND-04, EVENT-01, EVENT-02, EVENT-03, EVENT-04, EVENT-05, EVENT-06, EVENT-07, EVENT-08
**Success Criteria** (what must be TRUE):
  1. DPP schema includes ESPR-mandated fields (GTIN, material composition, carbon footprint, repair instructions, compliance declarations)
  2. Lifecycle event schemas cover full product journey: creation, commission, first sale, repair/MRO, resale, decommission
  3. All schemas align with EPCIS 2.0 standard and use Core Business Vocabulary (CBV)
  4. JSON-LD format enables semantic interoperability and linked data queries
  5. Molecular signature extension supports ultra-luxury provenance verification (terroir, materials)
**Plans**: 3 plans in 2 waves

Plans:
- [x] 03-01-PLAN.md — DPP Core Schema: JSON-LD contexts, ESPR mandatory fields, product-specific schemas (FOUND-04)
- [x] 03-02-PLAN.md — Lifecycle Event Schemas: EPCIS 2.0 events for creation, sale, repair, resale, decommission (EVENT-01 to EVENT-06)
- [x] 03-03-PLAN.md — EPCIS Alignment & Extensions: CBV vocabulary mapping, GS1 integration, molecular signatures (EVENT-07, EVENT-08)

---

### Phase 4: Identity Infrastructure
**Goal**: Enable participant verification and claim-based identity as foundation for compliant token transfers
**Depends on**: Phase 2
**Requirements**: IDENT-01, IDENT-02, IDENT-03, IDENT-04, IDENT-05, IDENT-06
**Success Criteria** (what must be TRUE):
  1. Identity Registry interfaces enable verification of participant identity before any token transfer
  2. Trusted Issuers Registry enables management of authorized claim issuers (KYC providers, regulators)
  3. Claim Topics Registry defines standard claim types for luxury domain (KYC verified, KYB verified, jurisdiction, authorized retailer)
  4. ONCHAINID specification enables ERC-734/735 compliant identity contracts
  5. W3C Verifiable Credentials specification enables privacy-preserving off-chain claim issuance
**Plans**: 3 plans in 2 waves

Plans:
- [x] 04-01-PLAN.md — Identity Registry Interfaces: Extended ERC-3643 IIdentityRegistry, IIdentityRegistryStorage, event definitions (IDENT-01, IDENT-02)
- [x] 04-02-PLAN.md — Trust and Claims Registries: ITrustedIssuersRegistry, IClaimTopicsRegistry, predefined claim topics (IDENT-03, IDENT-04)
- [x] 04-03-PLAN.md — ONCHAINID and Verifiable Credentials: ONCHAINID specification, W3C VC 2.0 integration, JSON Schema (IDENT-05, IDENT-06)

**Note**: CRITICAL DEPENDENCY - Token layer (Phase 5) cannot function without identity infrastructure complete.

---

### Phase 5: Token & Compliance Layer
**Goal**: Enable compliant ownership transfer with pluggable compliance rules and multi-sig agent controls
**Depends on**: Phase 4 (identity registry required for compliance verification)
**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-06
**Success Criteria** (what must be TRUE):
  1. Token interfaces extend ERC-3643 standard for luxury product ownership representation
  2. Modular compliance enables pluggable rules (jurisdiction restrictions, balance limits, time locks)
  3. KYC/KYB hooks specification enables pre-transfer identity verification
  4. AML/sanctions screening hooks specification enables transfer blocking for compliance
  5. Ownership transfer specification enables basic sale and resale flows with compliance checks
**Plans**: TBD

Plans:
- [ ] 05-01: TBD (token interfaces)
- [ ] 05-02: TBD (compliance modules)
- [ ] 05-03: TBD (hooks and transfer flow)

**Note**: Research flag - Requires legal review for jurisdiction-specific compliance module design.

---

### Phase 6: GS1 Resolver Integration
**Goal**: Bridge physical products to digital identities via GS1 Digital Link standard (ESPR-mandated)
**Depends on**: Phase 2, Phase 5
**Requirements**: FOUND-03, FOUND-05, INFRA-01
**Success Criteria** (what must be TRUE):
  1. GS1 Digital Link URI structure defined (https://id.galileo.luxury/01/{GTIN}/21/{Serial})
  2. Context-aware routing delivers role-appropriate views (consumer vs. brand vs. regulator)
  3. Resolution protocol connects physical product identifiers to on-chain and off-chain data
**Plans**: TBD

Plans:
- [ ] 06-01: TBD (URI structure and resolution)
- [ ] 06-02: TBD (context routing)

---

### Phase 7: Infrastructure & Security
**Goal**: Complete operational infrastructure specifications for access control, audit, and data governance
**Depends on**: Phase 5
**Requirements**: INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. RBAC framework defines access control model for all data and operations
  2. Audit trail specification enables immutable logging of all privileged operations
  3. Data retention policies align GDPR deletion rights with AML 5-year retention requirements
  4. Hybrid storage specification defines on-chain/off-chain synchronization protocol (event sourcing pattern)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD (access control and audit)
- [ ] 07-02: TBD (retention and hybrid sync)

---

### Phase 8: Compliance Documentation
**Goal**: Enable adopters to achieve regulatory compliance through comprehensive implementation guides
**Depends on**: Phases 3, 5, 6, 7
**Requirements**: COMPL-01, COMPL-02, COMPL-03
**Success Criteria** (what must be TRUE):
  1. GDPR guide enables adopters to implement right-to-erasure in hybrid architecture (CRAB model)
  2. MiCA guide maps specification to CASP requirements and Travel Rule compliance (June 2026 deadline)
  3. ESPR guide provides DPP readiness checklist for 2027 mandatory compliance
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (regulatory guides)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
Note: Phase 3 and 4 can proceed in parallel after Phase 2 completes (no dependency between them).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Governance Foundation | 6/6 | Complete | 2026-01-30 |
| 2. Architecture Foundation | 3/3 | Complete | 2026-01-30 |
| 3. Core Data Models | 3/3 | Complete | 2026-01-30 |
| 4. Identity Infrastructure | 3/3 | Complete | 2026-01-31 |
| 5. Token & Compliance Layer | 0/TBD | Not started | - |
| 6. GS1 Resolver Integration | 0/TBD | Not started | - |
| 7. Infrastructure & Security | 0/TBD | Not started | - |
| 8. Compliance Documentation | 0/TBD | Not started | - |

## Dependency Graph

```
Phase 1 (Governance)
    |
    v
Phase 2 (Architecture)
    |
    +--------+--------+
    |                 |
    v                 v
Phase 3 (Data)    Phase 4 (Identity)
    |                 |
    |                 v
    |           Phase 5 (Token)
    |                 |
    +--------+--------+
             |
             v
       Phase 6 (Resolver)
             |
             v
       Phase 7 (Infrastructure)
             |
             v
       Phase 8 (Compliance Docs)
```

## Coverage Summary

| Category | Requirements | Phase | Count |
|----------|--------------|-------|-------|
| Governance (GOV) | GOV-01, GOV-02, GOV-03, GOV-04 | 1 | 4 |
| Foundation (FOUND) | FOUND-01, FOUND-02, FOUND-06 | 2 | 3 |
| Foundation (FOUND) | FOUND-04 | 3 | 1 |
| Foundation (FOUND) | FOUND-03, FOUND-05 | 6 | 2 |
| Events (EVENT) | EVENT-01 to EVENT-08 | 3 | 8 |
| Identity (IDENT) | IDENT-01 to IDENT-06 | 4 | 6 |
| Token (TOKEN) | TOKEN-01 to TOKEN-06 | 5 | 6 |
| Infrastructure (INFRA) | INFRA-01 | 6 | 1 |
| Infrastructure (INFRA) | INFRA-02 to INFRA-05 | 7 | 4 |
| Compliance (COMPL) | COMPL-01 to COMPL-03 | 8 | 3 |

**Total: 38 requirements mapped across 8 phases**

---
*Roadmap created: 2026-01-30*
*Last updated: 2026-01-31 (Phase 4 complete)*

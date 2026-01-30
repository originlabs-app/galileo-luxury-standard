# Feature Landscape: Luxury Product Traceability Specification

**Domain:** Luxury product traceability (watches, jewelry, leather goods, fashion)
**Researched:** 2026-01-30
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

This document maps the feature landscape for an open-source luxury traceability specification, categorizing features into table stakes (must-have), differentiators (competitive advantage), and anti-features (deliberate exclusions). The specification must address EU Digital Product Passport (DPP) regulatory requirements, integrate with established standards (GS1, EPCIS, W3C DIDs), and serve the unique needs of luxury brands including anti-counterfeiting, ownership transfer, and circular economy support.

---

## Table Stakes Features

Features users and regulators expect. Missing these = specification is non-compliant or unusable.

### 1. Digital Product Passport (DPP) Core Data Fields

| Data Field | Why Expected | Complexity | Dependencies |
|------------|--------------|------------|--------------|
| **Unique Product Identifier** (GTIN/Serial) | EU ESPR mandates ISO/IEC 15459 compliant identifiers | Low | GS1 Digital Link integration |
| **Product Description** | Basic transparency requirement | Low | Schema definition |
| **Manufacturer/Brand Identity** | Regulatory traceability requirement | Low | Identity registry |
| **Material Composition** | EU DPP requirement for textiles, sustainability claims | Medium | Supply chain data collection |
| **Country of Origin** | Trade compliance, consumer transparency | Low | Supply chain integration |
| **Manufacturing Date** | Provenance verification | Low | Event capture |
| **Compliance Declarations** | CE marking, conformity certificates, technical documentation | Medium | Document storage, signing |
| **Repair/Maintenance Instructions** | ESPR circularity requirement | Low | Content management |
| **Disposal/Recycling Information** | End-of-life regulatory requirement | Low | Content management |
| **Carbon Footprint Data** | Sustainability reporting (phased requirement) | High | LCA integration, scope 3 data |

**Regulatory Source:** EU Ecodesign for Sustainable Products Regulation (ESPR) 2024, with delegated acts for textiles expected 2027.

### 2. Lifecycle Event Tracking (EPCIS-Aligned)

| Event Type | Why Expected | Complexity | Dependencies |
|------------|--------------|------------|--------------|
| **Object Event: Creation** | Establishes product birth, links DPP to physical item | Medium | Manufacturing system integration |
| **Object Event: Commission** | Product enters commerce | Low | ERP integration |
| **Transaction Event: Sale** | First sale, ownership transfer | Medium | POS/e-commerce integration |
| **Transaction Event: Resale** | Secondary market transfer | High | Secondary market APIs, identity verification |
| **Transformation Event: Repair/MRO** | Service history, parts replacement | Medium | Service center integration |
| **Object Event: Decommission** | End of life, destruction, recycling | Low | Reverse logistics |
| **Aggregation Event: Packaging** | Batch/lot tracking for logistics | Medium | Warehouse management systems |

**Standard:** GS1 EPCIS 2.0 with CBV (Core Business Vocabulary). JSON-LD format for modern system integration.

### 3. Compliance Checks (Regulatory Table Stakes)

| Check Type | Why Expected | Complexity | Dependencies |
|------------|--------------|------------|--------------|
| **KYC (Know Your Customer)** | EU AML 6th Directive requires for luxury goods >EUR 10,000 | High | Identity verification provider integration |
| **AML (Anti-Money Laundering)** | Obliged entity requirement for luxury dealers | High | Transaction monitoring, reporting |
| **Sanctions Screening** | OFAC, EU sanctions list compliance | Medium | Sanctions list API integration |
| **PEP Screening** | Politically Exposed Persons check | Medium | PEP database integration |
| **Adverse Media Screening** | Reputational risk management | Medium | News/media monitoring API |
| **Jurisdictional Restrictions** | Export controls, trade restrictions | Medium | Compliance rules engine |

**Regulatory Source:** EU AML Package 2024 (AMLR, AMLD6), establishing luxury goods dealers as "obliged entities."

### 4. Identity & Authentication Infrastructure

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Product Identity (DID)** | Decentralized, globally unique product identifiers | Medium | W3C DID standard, resolver infrastructure |
| **Participant Identity (ONCHAINID)** | ERC-3643 compliant identity for compliance | High | Identity registry, claim issuers |
| **Brand Authority** | Verified brand identity for issuing claims | Medium | Trusted issuer registry |
| **Claim Verification** | Verifiable credentials for compliance attestations | Medium | W3C VC standard |
| **NFC/QR Data Carrier** | Physical-digital link via GS1 Digital Link | Low | Tag/label production |

### 5. Access Control & Data Governance

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Role-Based Access** | Different data views for consumers, brands, regulators | Medium | Permission framework |
| **Data Minimization** | GDPR Article 5(1)(c) compliance | Medium | Selective disclosure |
| **Consent Management** | Customer data sharing consent | Medium | Consent registry |
| **Audit Trail** | Immutable record of data access and changes | Low | Blockchain/append-only log |
| **Data Retention Policies** | 5-year minimum for AML, GDPR limitations | Medium | Automated data lifecycle |

---

## Differentiators

Features that set the specification apart. Not strictly required, but provide competitive advantage.

### 1. User Experience Innovations

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Gasless Transactions (ERC-4337)** | Users never need to hold ETH; brands sponsor gas | High | Paymaster infrastructure, bundler |
| **Social Recovery** | Lost wallet recovery via trusted contacts | High | Account abstraction, guardian management |
| **Passkey Authentication** | No seed phrases; WebAuthn/FIDO2 login | High | ERC-4337, passkey infrastructure |
| **One-Click Resale** | Seamless handoff to secondary markets | Medium | Resale platform integrations |
| **Multi-language Support** | Global luxury market reach | Low | i18n content framework |
| **Offline Verification** | Verify authenticity without internet | High | Cryptographic proof on NFC chip |

### 2. Advanced Traceability

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Multi-Tier Supply Chain** | Track raw materials through multiple transformations | High | Supplier onboarding, data aggregation |
| **Component-Level Tracking** | Individual parts tracked (movements, gems, leathers) | High | BOM integration, component IDs |
| **Provenance Visualization** | Interactive journey map for consumers | Medium | Frontend, data aggregation |
| **Sustainability Scoring** | Aggregated environmental impact metrics | High | LCA data, calculation engine |
| **Artisan Attribution** | Credit individual craftspeople | Low | Artisan registry, consent |

### 3. Secondary Market Enablement

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Certified Pre-Owned (CPO) Framework** | Brand-certified resale with warranty | Medium | Certification workflow, warranty extension |
| **Price History** | Historical transaction values (privacy-preserving) | Medium | Aggregated analytics, anonymization |
| **Condition Scoring** | Standardized grading for resale | Medium | Inspection protocol, ML models |
| **Instant Authentication API** | Third-party verification for resale platforms | Low | Public API, rate limiting |
| **Warranty Transfer** | Automated warranty handoff on ownership change | Medium | Smart contract logic |

### 4. Brand Engagement & CRM

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Decentralized Messaging** | Direct brand-to-owner communication | Medium | DIDComm or equivalent |
| **Exclusive Access NFTs** | Proof of ownership unlocks experiences | Low | Token-gating infrastructure |
| **Service Booking Integration** | Schedule repairs/servicing via DPP | Medium | Service center APIs |
| **Personalization Layer** | Custom content based on ownership | Medium | Content management, privacy |

### 5. Regulatory Future-Proofing

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Modular Compliance** | Pluggable compliance modules per jurisdiction | High | Compliance rules engine |
| **EU DPP Registry Ready** | Prepared for EU central registry (mid-2026) | Medium | API compatibility |
| **CBAM Integration** | Carbon border adjustment mechanism data | High | Carbon accounting, customs |
| **EUDR Compliance** | EU Deforestation Regulation for leather goods | High | Geolocation data, supplier attestations |

### 6. Interoperability Excellence

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Multi-Chain Support** | Deploy on multiple EVM chains | High | Chain abstraction layer |
| **Cross-Consortium Recognition** | Interop with Aura, Arianee protocols | High | Bridge protocols, claim mapping |
| **Legacy System Adapters** | Connect ERP, PLM, PIM systems | Medium | ETL/integration framework |
| **GS1 Resolver Federation** | Participate in global resolver network | Medium | GS1 Digital Link conformance |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

### 1. Financial Speculation Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Price Speculation Tools** | Attracts wrong user base, regulatory scrutiny | Focus on utility: authenticity, provenance, service |
| **Trading/Exchange Integration** | Conflates collectibles with securities | Support ownership transfer only, no price discovery |
| **Fractional Ownership** | Securities law complexity (Howey test) | One product = one owner (or explicit co-ownership registry) |
| **Yield/Staking Mechanisms** | Attracts financial regulators, wrong incentives | No token economics beyond utility |

### 2. Over-Engineering

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Custom Blockchain** | Unnecessary complexity, ecosystem fragmentation | Use established EVM chains (Ethereum, Polygon, etc.) |
| **Native Token** | Regulatory burden, speculation | Use existing tokens (ETH, MATIC) or stablecoins for gas |
| **Complex Governance Token** | DAO fatigue, low participation | Simple multisig or consortium governance |
| **On-Chain Storage of Large Data** | Expensive, slow, unnecessary | IPFS/Arweave for content, blockchain for hashes/proofs |
| **Proprietary Identity Standard** | Ecosystem fragmentation | Use W3C DID, ONCHAINID standards |

### 3. Privacy Violations

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Public Owner Identity** | GDPR violation, theft risk | Pseudonymous addresses, selective disclosure |
| **Transaction Amount On-Chain** | Competitive intelligence leak | Off-chain settlement data, zero-knowledge proofs |
| **Location Tracking** | Privacy invasion, theft risk | Aggregate supply chain location, not owner location |
| **Biometric Storage** | Regulatory minefield, breach liability | Local biometric verification only, no central storage |
| **Purchase History Aggregation** | Profiling without consent | Opt-in analytics only, anonymized |

### 4. Centralization Traps

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Single Point of Failure** | Undermines trust proposition | Decentralized resolver network, multi-party infrastructure |
| **Proprietary Data Format** | Lock-in, interoperability failure | JSON-LD, GS1/EPCIS standards |
| **Brand-Controlled Ownership** | Defeats purpose of ownership proof | Permissionless transfers (within compliance bounds) |
| **Revocable Product Identity** | Undermines permanence | Immutable product creation, separate status layer |
| **Closed Verifier Network** | Bottleneck, trust concentration | Open verification with cryptographic proofs |

### 5. Scope Creep

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full E-Commerce Platform** | Not core competency, already solved | Integrate with existing platforms |
| **Payment Processing** | Regulatory complexity, liability | Point to established payment rails |
| **Insurance Products** | Requires insurance licensing | Partner with insurers, provide data hooks |
| **Dispute Resolution** | Legal complexity, jurisdiction issues | Define arbitration hooks, don't build tribunal |
| **AI-Powered Authentication** | ML model maintenance burden | Define verification interface, let implementers choose |

---

## Feature Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FOUNDATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Product Identity (DID)  ──┬──>  GS1 Digital Link Resolver              │
│                            │                                             │
│  Participant Identity      │                                             │
│  (ONCHAINID/ERC-3643)  ────┼──>  Identity Registry                      │
│                            │                                             │
│  Data Schemas (JSON-LD)    │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           CORE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  DPP Core Data             │                                             │
│      │                     │                                             │
│      ▼                     │                                             │
│  Lifecycle Events (EPCIS)──┼──>  Access Control & Permissions           │
│      │                     │                                             │
│      ▼                     │                                             │
│  Compliance Checks ────────┘                                             │
│  (KYC/AML/Sanctions)                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIFFERENTIATOR LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Account Abstraction ──>  Gasless Tx  ──>  Social Recovery              │
│      │                                                                   │
│      ▼                                                                   │
│  Secondary Market Enablement  ──>  CPO Framework  ──>  Warranty Transfer│
│      │                                                                   │
│      ▼                                                                   │
│  Brand Engagement  ──>  Decentralized Messaging  ──>  Token-Gating      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Critical Path Dependencies

1. **Product Identity** must precede all other features
2. **Participant Identity** required before compliance checks
3. **Lifecycle Events** depend on Product Identity + Integration hooks
4. **Ownership Transfer** depends on Participant Identity + Compliance
5. **Account Abstraction** can be added incrementally (not blocking)
6. **Secondary Market** features depend on core ownership + compliance

---

## MVP Recommendation

For minimum viable specification, prioritize:

### Phase 1: Foundation (Table Stakes - Regulatory Compliance)
1. Product Identity schema (W3C DID + GS1 Digital Link)
2. DPP Core Data schema (JSON-LD)
3. Basic Lifecycle Events (creation, sale, transfer)
4. Participant Identity (ERC-3643 ONCHAINID integration)
5. KYC/AML compliance hooks (interface, not implementation)

### Phase 2: Core Operations
6. Full EPCIS event support (repair/MRO, resale)
7. Access control framework
8. Resolver specification
9. Verification protocol

### Defer to Post-MVP
- Account abstraction (ERC-4337) - valuable but not blocking
- Multi-tier supply chain - high complexity
- Brand messaging - CRM integration complexity
- Cross-consortium interop - requires ecosystem maturity

---

## Complexity Assessment Summary

| Complexity | Feature Count | Examples |
|------------|---------------|----------|
| **Low** | 12 | Product description, NFC integration, disposal info |
| **Medium** | 18 | Event capture, access control, CPO framework |
| **High** | 14 | KYC/AML integration, gasless transactions, multi-chain |

**Total Features Catalogued:** 44 table stakes + differentiators

---

## Sources

### Regulatory & Standards
- [EU Digital Product Passport Guide - Climatiq](https://www.climatiq.io/blog/digital-product-passports-what-you-need-to-know-to-be-ready-for-regulatory-compliance-in-2025)
- [GS1 Digital Product Passport Provisional Standard](https://www.gs1.org/standards/standards-emerging-regulations/DPP)
- [GS1 EPCIS 2.0 Standard](https://www.gs1.org/standards/epcis)
- [W3C Decentralized Identifiers (DIDs) v1.1](https://www.w3.org/TR/did-1.1/)
- [ERC-3643 Official Documentation](https://docs.erc3643.org/erc-3643)

### Industry Implementations
- [Aura Blockchain Consortium](https://auraconsortium.com/)
- [Arianee Protocol Documentation](https://docs.arianee.org/)
- [Arianee Digital Passport Schema](https://docs.arianee.org/docs/nft-schema)

### Compliance
- [EU AML Regulations 2025 - Bolder Group](https://boldergroup.com/insights/blogs/eu-aml-regulations-2025-key-changes-for-luxury-businesses/)
- [AML Compliance for Luxury Goods - iDenfy](https://www.idenfy.com/blog/aml-luxury-goods/)
- [Luxury Goods AML Requirements - Financial Crime Academy](https://financialcrimeacademy.org/luxury-goods-and-aml-requirements/)

### Secondary Market
- [BCG: Resale's Next Chapter](https://www.bcg.com/publications/2025/how-fashion-luxury-brands-can-win-secondhand-market)
- [Secondary Luxury Market Academic Review](https://www.tandfonline.com/doi/full/10.1080/23311975.2025.2523405)

### Technical Standards
- [ERC-4337 Account Abstraction](https://docs.erc4337.io/)
- [GS1 Verifiable Credentials Landscape](https://ref.gs1.org/docs/2025/VCs-and-DIDs-tech-landscape)
- [Kaleido ERC-3643 Overview](https://www.kaleido.io/blockchain-blog/erc-3643-standard-for-tokenized-assets)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| DPP Requirements | HIGH | EU ESPR regulation is published; GS1 standards are mature |
| Lifecycle Events | HIGH | EPCIS 2.0 is well-documented standard |
| Compliance (KYC/AML) | MEDIUM-HIGH | Requirements clear; implementation varies by jurisdiction |
| ERC-3643 Features | HIGH | Standard achieved Final status; well-documented |
| Account Abstraction | MEDIUM | ERC-4337 mature, but best practices still evolving |
| Interoperability | MEDIUM | Standards exist but cross-platform adoption varies |
| Anti-Features | MEDIUM | Based on industry observation, not formal research |

---

## Open Questions for Phase-Specific Research

1. **Which DID method?** - did:ethr vs did:web vs did:ion for product identities
2. **Claim schema standardization** - Industry consensus on claim types and formats
3. **Resolver federation model** - How to participate in GS1 resolver network
4. **Compliance module architecture** - Pluggable vs monolithic compliance engine
5. **Privacy-preserving verification** - ZK proof requirements for sensitive data

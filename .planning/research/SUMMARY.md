# Project Research Summary

**Project:** Galileo Luxury Standard
**Domain:** Open-source industrial specification for luxury product traceability
**Researched:** 2026-01-30
**Confidence:** MEDIUM-HIGH

## Executive Summary

The Galileo Luxury Standard addresses three converging regulatory deadlines: EU ESPR 2027 (Digital Product Passport), MiCA June 2026 (crypto-asset compliance), and GDPR-by-design requirements. Research reveals this domain sits at a critical intersection where multiple blockchain consortiums have failed (TradeLens, we.trade, Marco Polo, Contour) — not due to technical issues, but governance imbalances, commercial viability blindness, and compliance violations.

The recommended approach is a **hybrid on-chain/off-chain architecture** using ERC-3643 compliant tokens for permissioned ownership transfer, GS1 Digital Link for physical-digital bridging, and strict GDPR data separation patterns. The stack prioritizes production-proven technologies over novelty: ERC-3643 ($32B+ already tokenized), OpenZeppelin v5.5.0 (99% test coverage), GS1 standards (global retail interoperability), and optional ERC-4337 account abstraction for consumer UX. Critical design principle: blockchain stores only hashes, timestamps, and pseudonymous ownership — never personal data.

The primary risks are non-technical: (1) consortium governance imbalance driving away competing brands, (2) GDPR Article 17 violations from on-chain personal data causing regulatory sanctions, and (3) technically elegant but commercially unviable specifications that become shelfware. Prevention requires independent governance established before any technical work, legal review of every schema, and implementation cost analysis for every architectural decision.

## Key Findings

### Recommended Stack

Research identifies a production-ready technology stack built on three regulatory-compliant pillars: ERC-3643 for permissioned tokens with built-in compliance, GS1 Digital Link for ESPR-mandated ISO/IEC 15459 identifiers, and crypto-agile architecture for post-quantum preparation.

**Core technologies:**
- **ERC-3643 + ONCHAINID**: MiCA-compliant permissioned tokens with identity verification via ERC-734/735 claims — $32B+ already tokenized, 92+ organizations in association
- **OpenZeppelin Contracts v5.5.0**: Base utilities with WebAuthn support, ERC-7930 interoperable addresses, 99% test coverage, formal verification
- **GS1 Digital Link Resolver CE v3.0+**: Self-hosted resolver for product identifiers, microservices architecture, ESPR-compliant ISO/IEC 15459 standard
- **Noir 1.0+ / Circom 2.x**: Zero-knowledge proof circuits for privacy-preserving verification (ownership, authenticity, compliance attestations without exposing data)
- **ERC-4337 EntryPoint v0.7 + ERC-7579**: Account abstraction for gasless consumer UX, modular smart accounts, paymaster gas sponsorship
- **Foundry v1.5.1+ / Viem**: Development tooling with 5.2x faster compilation, compile-time type safety, 35kB bundle size

**Critical stack decisions:**
- ERC-3643 chosen over ERC-20 or ERC-1400 because MiCA-ready identity infrastructure prevents compliance-after-the-fact retrofits
- GS1 Digital Link is the only standard satisfying ESPR's ISO/IEC 15459 requirement AND working with existing POS scanners
- Account abstraction (ERC-4337) enables "luxury consumers should never manage private keys" requirement but can be deferred to post-MVP
- Crypto-agility pattern (abstraction layer for signature schemes) prepares for post-quantum transition without premature adoption

**Key dependencies:**
- ERC-3643 contracts depend on ONCHAINID deployed on target chain
- GS1 Resolver CE requires customization (community-maintained, not officially supported by GS1)
- ZKP circuits require security audit before production (OpenZeppelin offers specialized ZKP audits)

### Expected Features

Research categorizes features into three tiers: table stakes (regulatory compliance), differentiators (competitive advantage), and anti-features (deliberate exclusions to avoid pitfalls).

**Must have (table stakes):**
- **Digital Product Passport core fields**: GTIN/Serial, material composition, carbon footprint, compliance declarations, repair instructions — mandated by EU ESPR for luxury goods
- **Lifecycle event tracking (EPCIS 2.0 aligned)**: Creation, sale, resale, repair/MRO, decommission events with JSON-LD format
- **Compliance checks**: KYC/AML/sanctions screening for EU AML 6th Directive (luxury goods dealers are "obliged entities" for purchases >EUR 10,000)
- **Identity infrastructure**: Product DIDs (W3C standard), participant identity (ONCHAINID), brand authority verification, NFC/QR data carriers
- **Access control & data governance**: Role-based access, data minimization (GDPR Article 5), consent management, immutable audit trail, 5-year retention for AML

**Should have (competitive advantage):**
- **Gasless transactions (ERC-4337)**: Users never hold ETH, brands sponsor gas, social recovery, passkey authentication (WebAuthn/FIDO2)
- **Advanced traceability**: Multi-tier supply chain tracking, component-level tracking (movements, gems, leathers), provenance visualization
- **Secondary market enablement**: Certified Pre-Owned framework, price history (privacy-preserving), condition scoring, instant authentication API, warranty transfer
- **Interoperability excellence**: Multi-chain support, cross-consortium recognition (Aura, Arianee), legacy ERP/PLM adapters, GS1 resolver federation

**Defer to v2+ (not essential for launch):**
- Multi-tier supply chain tracking (high complexity, supplier onboarding challenges)
- Brand engagement/CRM features (decentralized messaging, exclusive access NFTs, service booking)
- Cross-consortium interoperability (requires ecosystem maturity)
- Sustainability scoring (LCA data collection complexity)

**Anti-features (explicitly avoid):**
- **No financial speculation**: No price speculation tools, trading/exchange integration, fractional ownership, yield/staking (attracts wrong regulatory scrutiny)
- **No over-engineering**: No custom blockchain, no native token, no complex governance token, no on-chain large data storage
- **No privacy violations**: No public owner identity, no transaction amounts on-chain, no location tracking, no biometric storage (GDPR minefield)
- **No centralization traps**: No single point of failure, no proprietary data formats, no brand-controlled ownership, no revocable product identity
- **No scope creep**: No full e-commerce platform, no payment processing, no insurance products, no dispute resolution tribunal

### Architecture Approach

Research identifies a **hybrid on-chain/off-chain model** as the only GDPR-compliant approach. EDPB 2025 guidance explicitly states personal data must NOT be stored on-chain, even encrypted or hashed. The architecture follows an event sourcing pattern with blockchain as the authoritative source of truth for non-personal attestations.

**Major components:**

1. **Physical Layer**: Products with GS1 QR/NFC containing Digital Link URIs (https://id.galileo.luxury/01/{GTIN}/21/{Serial})

2. **Resolver Layer (Off-Chain)**: GS1 Digital Link Resolver CE with context-aware routing to consumer/brand/regulator views, microservices architecture separating data entry from resolution

3. **Data Layer (Hybrid)**:
   - **Off-chain**: PII (encrypted), full DPP content, detailed lifecycle events, repair records, certificates — all with GDPR erasure capability
   - **On-chain**: Content hashes, ownership transfers, compliance attestation results (boolean only), identity claim references, timestamps

4. **Blockchain Layer (EVM)**:
   - **ERC-3643 Token System**: Token contract with transfer hooks, Identity Registry mapping addresses to ONCHAINID, Modular Compliance with pluggable rules, Trusted Issuers Registry, Claim Topics Registry
   - **ERC-4337 Account Abstraction**: Smart accounts for brands/consumers, Paymaster for gas sponsorship, Bundler aggregating UserOperations
   - **ONCHAINID Identity Layer**: Per-participant identity contracts with ERC-734 keys and ERC-735 claims (KYC, jurisdiction, accreditation)

**Critical architectural patterns:**
- **Event sourcing**: On-chain events as authoritative log, off-chain stores as derived materialized views
- **GDPR right-to-erasure**: Off-chain data deletion + encryption key destruction (CRAB model: Create-Read-Append-Burn) makes on-chain references meaningless
- **Sync health monitoring**: Real-time metrics on sync lag, failure rate, drift detection between on-chain and off-chain state
- **Modular compliance**: Pluggable compliance modules (CountryRestrictions, MaxBalance, TimeBasedLock) instead of monolithic hardcoded rules

**Data flow patterns:**
1. **Product registration**: Brand → Off-chain DPP storage → Hash computation → Smart account mints token with GS1 ID + hash → GS1 resolver registration
2. **Consumer verification**: Scan QR → GS1 resolver → Off-chain store retrieves DPP → Blockchain verifies hash → Consumer sees verified data
3. **Ownership transfer**: Seller initiates → Token checks Identity Registry → Compliance modules validate → Transfer executes (or rejects)
4. **Gasless UX**: Consumer request → Smart account creates UserOp → Bundler validates with Paymaster → EntryPoint executes → Consumer never touches ETH

### Critical Pitfalls

Research documents five critical pitfalls that cause project failure, major rewrites, or legal exposure — all preventable with specific architectural and governance decisions.

1. **Consortium Governance Imbalance (The TradeLens Pattern)** — Dominant founding member creates power asymmetry, competing brands refuse to join. TradeLens (Maersk-led), we.trade, Marco Polo, Contour all failed for this reason between 2022-2023. **Prevention**: Establish independent governance body BEFORE technical work, veto rights preventing single-organization control, neutral IP custodianship, transparent decision-making.

2. **GDPR Right-to-Erasure Trap (Article 17 Collision)** — Personal data written on-chain makes erasure technically impossible, EDPB explicitly rejects "technical impossibility" defense, fines up to 4% global revenue or €20M. Pseudonymous identifiers and hashes of personal data still considered personal data. **Prevention**: Strict on-chain/off-chain separation, encryption key destruction protocol, off-chain PII storage, DID architecture without PII, GDPR legal review for every schema change.

3. **ERC-3643 Agent Privilege Abuse Vector** — Agent roles (freeze, forced transfer, recovery) required for regulatory compliance create centralized attack vector if single-key controlled. **Prevention**: Multi-sig agent controls (N-of-M), time-locked privileged operations (24-72 hour delay), immutable agent action audit trail, role separation, hardware security modules.

4. **Identity Registry Manipulation** — Unauthorized modification of Identity Registry or Claim Topics Registry silently alters compliance rules, enabling compliance bypass. **Prevention**: Registry governance framework (formal proposal/review/approval), multi-sig registry ownership, immutable claim topic baseline, real-time registry change monitoring.

5. **Hybrid Architecture Data Synchronization Failures** — Blockchain immutability + off-chain mutability create inconsistent state views without proper sync protocol. **Prevention**: Source of truth hierarchy (on-chain events authoritative), event sourcing pattern, sync health monitoring, conflict resolution protocol, idempotent sync operations.

**Moderate pitfalls** (cause delays, not failure):
- ERC-4337 complexity underestimation (requires specialized auditor, EntryPoint interaction patterns, storage layout management)
- GS1 mobile readiness gap (70% lack mobile-optimized product pages, breaks consumer trust)
- DPP data fragmentation (supplier data scattered across incompatible systems)
- Commercial viability blindness (technically excellent, commercially undeployable)
- Standards fragmentation (competing standards prevent network effects)

## Implications for Roadmap

Based on architectural dependencies, regulatory deadlines, and pitfall prevention, research suggests a six-phase structure prioritizing governance before technology, identity infrastructure before tokens, and MVP delivery before advanced features.

### Phase 1: Foundation & Governance
**Rationale:** Consortium governance imbalance is the #1 killer of blockchain consortiums (TradeLens, we.trade, Marco Polo, Contour). Establishing independent governance BEFORE any technical specification work is the only proven pattern to avoid dominant-player syndrome.

**Delivers:**
- Governance charter with veto rights, conflict-of-interest policies, neutral IP custodianship
- Architecture patterns document (hybrid on-chain/off-chain, GDPR compliance model)
- Contribution guidelines, versioning policy, decision-making process
- Competing luxury brand participation (absence of Kering/Chanel/Hermes from Aura mirrors TradeLens failure pattern)

**Addresses:** Pitfall #1 (governance imbalance)

**Avoids:** Starting technical work under single-organization control

**Research flag:** Standard governance patterns available from Linux Foundation, Apache Foundation models

---

### Phase 2: Core Data Models & Schemas
**Rationale:** DPP schema and lifecycle events have no blockchain dependencies and form the foundation for all subsequent work. Can proceed in parallel with identity layer once architecture patterns are stable. ESPR compliance requires these schemas regardless of blockchain technology choices.

**Delivers:**
- Digital Product Passport JSON Schema (ESPR-compliant core fields: GTIN, material composition, carbon footprint, compliance declarations, repair instructions)
- Lifecycle events schemas (EPCIS 2.0 aligned: creation, sale, resale, repair, decommission)
- TypeScript type definitions derived from JSON schemas
- GDPR legal review of schemas (no personal data on-chain validation)

**Addresses:** Table stakes features (DPP core, lifecycle events)

**Uses:** GS1 URI Syntax 1.6.0, EPCIS 2.0 standard, JSON-LD format

**Avoids:** Pitfall #2 (GDPR trap) through legal review before finalization

**Research flag:** GS1 EPCIS and DPP standards are mature (HIGH confidence), skip research-phase

---

### Phase 3: Identity Infrastructure
**Rationale:** CRITICAL DEPENDENCY — Token layer cannot function without identity registry. ERC-3643 compliance verification requires ONCHAINID claims, trusted issuers registry, and claim topics registry. This must be complete and frozen before Phase 4 begins. Build order implication from ARCHITECTURE.md: "Identity layer MUST be complete before token layer."

**Delivers:**
- Identity specification (ERC-3643 integration patterns)
- Solidity interfaces: IIdentityRegistry, IIdentityRegistryStorage, ITrustedIssuersRegistry, IClaimTopicsRegistry
- ONCHAINID integration guide (ERC-734 keys, ERC-735 claims)
- Identity claim topics for luxury domain (KYC verified, KYB verified, jurisdiction, accredited collector, authorized retailer, authorized service center)
- Registry governance framework (multi-sig controls, change monitoring)

**Addresses:** Table stakes feature (identity infrastructure), Pitfall #4 (registry manipulation)

**Uses:** ERC-3643 @erc3643org/erc-3643, ONCHAINID standard

**Avoids:** Single-organization identity control, registry manipulation vulnerabilities

**Research flag:** NEEDS DEEPER RESEARCH — ONCHAINID integration patterns not well-documented, DID method selection (did:ethr vs did:web vs did:ion) requires phase-specific research

---

### Phase 4: Token & Compliance Contracts
**Rationale:** Depends entirely on Phase 3 identity layer. Cannot start until identity interfaces are frozen. Implements core ownership transfer and compliance verification logic. Agent privilege controls must include multi-sig and time-locks from the start to avoid Pitfall #3.

**Delivers:**
- Token interface specification (IToken extending ERC-3643)
- Modular compliance specification (IModularCompliance, IComplianceModule)
- Solidity interfaces for compliance modules (CountryRestrictions, MaxBalance, ConditionalTransfer, TimeBasedLock)
- Agent role controls with multi-sig requirements (freeze, forced transfer, recovery operations)
- Compliance module isolation requirements (prevents vulnerability cascading)

**Addresses:** Core ownership transfer, compliance checks (KYC/AML), Pitfall #3 (agent abuse), Pitfall #4 (compliance manipulation)

**Uses:** ERC-3643 T-REX token standard, OpenZeppelin v5.5.0 base contracts

**Implements:** Token contract, Identity Registry, Modular Compliance from architecture

**Avoids:** Single-key agent control, monolithic compliance, hardcoded rules

**Research flag:** NEEDS LEGAL REVIEW — Compliance module design requires jurisdiction-specific legal validation for KYC/AML/sanctions requirements

---

### Phase 5: GS1 Resolver Integration & Hybrid Sync
**Rationale:** Bridges physical products to digital identities. GS1 Digital Link is ESPR-mandated (ISO/IEC 15459 requirement). Must address Pitfall #7 (mobile readiness) by including consumer UX requirements, not just resolver infrastructure. Implements Pitfall #5 prevention (sync protocol with event sourcing).

**Delivers:**
- GS1 Digital Link resolver specification (URI structure, link types, content negotiation)
- Context routing specification (consumer vs. brand vs. regulator views)
- Hybrid sync protocol (event sourcing, source of truth hierarchy, conflict resolution)
- Mobile UX requirements (performance, localization, accessibility)
- Sync health monitoring specification (lag metrics, failure detection, drift alerts)

**Addresses:** Physical-digital bridge, DPP data carrier (QR/NFC), Pitfall #5 (sync failures), Pitfall #7 (mobile readiness)

**Uses:** GS1 Digital Link Resolver CE v3.0+, GS1 URI Syntax 1.6.0, event sourcing pattern

**Implements:** Resolver layer, context router, hybrid data layer from architecture

**Avoids:** Blockchain-as-database anti-pattern, consumer UX as afterthought

**Research flag:** Standard patterns (GS1 Digital Link specification mature), but resolver CE customization requires implementation expertise

---

### Phase 6: Account Abstraction (Optional / Post-MVP)
**Rationale:** ERC-4337 enables gasless consumer UX and is a strong differentiator, but FEATURES.md research recommends deferring to post-MVP due to high complexity. Can be added incrementally without blocking core functionality. Requires specialized security audit (EntryPoint interactions, storage layout, transient storage hazards).

**Delivers:**
- Account abstraction integration specification (ERC-4337 + ERC-7579 modular accounts)
- Paymaster design patterns (verifying paymaster, ERC-20 paymaster, reputation-based)
- Smart account module architecture (validators, executors, fallback handlers, hooks)
- UserOperation flow documentation (gasless transfer, bundler submission, paymaster sponsorship)
- Security audit requirements (bundler interaction patterns, storage collision prevention)

**Addresses:** Differentiator features (gasless transactions, social recovery, passkey authentication), Pitfall #6 (ERC-4337 complexity)

**Uses:** eth-infinitism EntryPoint v0.7, Permissionless.js, Pimlico Alto bundler, ERC-7579 standard

**Implements:** Account abstraction layer, paymaster, smart account from architecture

**Avoids:** EOA-only flows, single-key consumer wallets, complexity underestimation

**Research flag:** NEEDS SPECIALIZED AUDIT — ERC-4337 security patterns require auditor with account abstraction experience, not just general smart contract audit

---

### Phase Ordering Rationale

**Why this order:**
1. **Governance before technology** (Pitfall #1 prevention): Every failed consortium started with technology and retrofitted governance
2. **Data models independent of blockchain** (Phase 2 parallelizable): ESPR compliance schemas needed regardless of smart contract implementation
3. **Identity before tokens** (architectural dependency): ERC-3643 compliance verification impossible without identity registry
4. **Resolver after contracts** (integration layer): Requires token addresses and contract ABIs to integrate
5. **Account abstraction last** (optional complexity): Strong UX benefit but not blocking for core functionality, high audit complexity

**How this avoids pitfalls:**
- Phase 1 addresses Pitfall #1 (governance) before any technical decisions
- Phase 2 includes GDPR legal review (Pitfall #2 prevention)
- Phase 3 includes registry governance (Pitfall #4 prevention)
- Phase 4 requires multi-sig agent controls (Pitfall #3 prevention)
- Phase 5 specifies sync protocol (Pitfall #5 prevention)
- Phase 6 deferred acknowledges Pitfall #6 (complexity) without abandoning feature

**Critical path:**
- Phase 1 blocks all other phases (governance foundation)
- Phase 3 blocks Phase 4 (identity dependency)
- Phase 4 blocks Phase 5 (contract addresses needed for resolver integration)
- Phase 2 can proceed in parallel with Phase 3 once architecture stable
- Phase 6 can be added anytime post-Phase 4

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Identity Infrastructure):** ONCHAINID integration patterns sparse in documentation, DID method selection (did:ethr vs did:web vs did:ion) requires ecosystem evaluation, claim issuer ecosystem discovery (which KYC/KYB providers support ONCHAINID)
- **Phase 4 (Compliance Contracts):** Jurisdiction-specific legal review for compliance module design, MiCA requirements mapping to smart contract logic, AML/sanctions screening integration patterns
- **Phase 6 (Account Abstraction):** ERC-4337 security audit patterns (EntryPoint v0.7 interaction edge cases), bundler infrastructure decision (self-hosted vs. Pimlico/Alchemy/Stackup), paymaster gas economics modeling

**Phases with standard patterns (skip research-phase):**
- **Phase 2 (Data Models):** GS1 EPCIS 2.0, GS1 DPP provisional standard, JSON Schema well-documented
- **Phase 5 (GS1 Resolver):** GS1 Digital Link standard mature (HIGH confidence), resolver CE architecture documented

**Open questions requiring validation:**
1. **L1 vs L2 selection:** Which EVM chain for production deployment (Ethereum mainnet vs. Polygon vs. Arbitrum vs. Base) — impacts gas costs, security model, ecosystem
2. **GS1 Resolver maintenance:** Community Edition not officially maintained by GS1, requires custom development budget or alternative resolver investigation
3. **PQC timeline:** When does Ethereum Foundation expect ZKnox (post-quantum) integration — impacts crypto-agility implementation urgency
4. **DID method consensus:** Industry trend toward did:ethr vs did:web for product identities (W3C DID standard allows multiple methods)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | ERC-3643 ($32B+ tokenized), OpenZeppelin (99% test coverage), GS1 standards (global adoption), Foundry/Viem (industry standard), Noir/Circom (production-proven on Aztec) — all verified against official documentation |
| Features | MEDIUM-HIGH | DPP requirements clear from EU ESPR regulation (HIGH), EPCIS 2.0 well-documented (HIGH), compliance requirements explicit in EU AML Package 2024 (HIGH), but ESPR delegated acts for luxury goods not finalized until 2027-2028 (uncertainty on specific data fields) |
| Architecture | HIGH | ERC-3643 reference implementation documented, hybrid on-chain/off-chain pattern verified against EDPB GDPR guidance, event sourcing pattern established, GS1 Digital Link resolver architecture specified — all patterns have production implementations |
| Pitfalls | HIGH | TradeLens, we.trade, Marco Polo, Contour failures documented with primary sources (Frontiers journal, GTR, Ledger Insights), GDPR/blockchain collision documented in EDPB 2025 guidance and CNIL documentation, ERC-3643 and ERC-4337 vulnerabilities documented in audit reports |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

**Technical gaps requiring validation during implementation:**
1. **GS1 Resolver CE maintenance model:** Community Edition lacks official GS1 support — need to budget for custom development or evaluate alternative GS1-conformant resolvers (commercial options exist but introduce vendor lock-in)
2. **ESPR delegated acts timeline:** Luxury goods DPP data schema requirements not finalized until 2027-2028 — specification may require revision when delegated acts publish, maintain flexibility in Phase 2 schemas
3. **PQC migration timeline:** Post-quantum cryptography preparation documented, but Ethereum Foundation ZKnox integration timeline uncertain — crypto-agility pattern provides hedge, monitor ETH roadmap quarterly
4. **DID method selection:** W3C DID standard allows multiple methods (did:ethr, did:web, did:ion), research didn't identify luxury industry consensus — validate during Phase 3 with Aura, Arianee, and identity providers
5. **Claim issuer ecosystem:** Which KYC/KYB providers support ONCHAINID claims format — requires Phase 3 discovery and potential custom integration development
6. **L1/L2 chain selection:** Research didn't specify production deployment chain — evaluate Ethereum mainnet (security, decentralization) vs. Polygon (lower gas) vs. L2s (Arbitrum, Base) based on gas economics, finality, ecosystem during Phase 4

**Commercial gaps requiring validation:**
7. **Implementation cost framework:** Need to validate that specification is economically deployable (avoid we.trade "technically excellent, commercially unviable" trap) — Phase 1 should establish cost modeling requirement for architectural decisions
8. **Supplier incentive model:** DPP compliance requires multi-tier supply chain data, but research notes confidentiality barriers and lack of supplier incentives — need to design value proposition during Phase 2 schema work or accept tiered data availability
9. **Early adopter recruitment:** Governance imbalance prevention requires competing luxury brand participation (not just LVMH-affiliated brands) — Phase 1 governance formation critical for Kering, Richemont, Hermes, Chanel recruitment

**Regulatory monitoring:**
10. **MiCA implementation timeline:** Regulation in force June 2026, but member state implementation may vary — monitor national legislation during Phases 3-4 to ensure compliance modules address jurisdiction-specific requirements
11. **GDPR enforcement evolution:** EDPB 2025 guidance establishes blockchain precedent, but enforcement actions may clarify gray areas (node operator liability model) — engage GDPR legal counsel during Phase 2 schema review and Phase 5 sync architecture

## Sources

### Primary Sources (HIGH Confidence)

**Official Standards & Specifications:**
- [EIP-3643 Specification](https://eips.ethereum.org/EIPS/eip-3643) — Final status, official token standard
- [ERC3643 Official Documentation](https://www.erc3643.org/) — Association with 92+ organizations
- [OpenZeppelin v5.5.0 Release](https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v5.5.0) — October 2025, latest stable
- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link) — Official GS1 specification
- [GS1 EPCIS 2.0 Standard](https://www.gs1.org/standards/epcis) — Lifecycle events standard
- [W3C Decentralized Identifiers v1.1](https://www.w3.org/TR/did-1.1/) — W3C Recommendation
- [ERC-4337 Documentation](https://docs.erc4337.io/) — Official account abstraction standard
- [ERC-7579 Specification](https://eips.ethereum.org/EIPS/eip-7579) — Final status, modular accounts
- [NIST FIPS 203/204/205](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards) — Post-quantum cryptography standards
- [Noir Documentation](https://noir-lang.org/docs/) — ZKP circuit language
- [Circom Documentation](https://docs.circom.io/) — ZKP circuits
- [Foundry Documentation](https://book.getfoundry.sh/) — Smart contract development
- [Viem Documentation](https://viem.sh/) — TypeScript Ethereum library

**Regulatory Documentation:**
- [EU ESPR Regulation 2024](https://eur-lex.europa.eu/eli/reg/2024/1781/oj) — Digital Product Passport requirements
- [EU AML Package 2024 (AMLR, AMLD6)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1624) — Luxury goods dealers as obliged entities
- [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/) — Right to erasure
- [EDPB Blockchain Guidance](https://www.omfif.org/2025/06/european-data-protection-board-puts-blockchain-at-a-gdpr-crossroads/) — 2025 guidance on personal data
- [CNIL Blockchain and GDPR](https://www.cnil.fr/en/blockchain-and-gdpr-solutions-responsible-use-blockchain-context-personal-data) — French DPA guidance

**Consortium Failure Documentation:**
- [Frontiers: TradeLens Failure Analysis](https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2025.1503595/full) — Academic research via commons theory
- [Computerworld: TradeLens Demise](https://www.computerworld.com/article/1615596/maersks-tradelens-demise-likely-a-death-knell-for-blockchain-consortiums.html) — Governance analysis
- [GTR: Marco Polo Liquidation](https://www.gtreview.com/news/fintech/marco-polo-brings-in-liquidators-as-funds-run-dry/) — Commercial viability failure
- [Ledger Insights: Contour Shutdown](https://www.ledgerinsights.com/contour-blockchain-trade-finance-network-shutter/) — 90% efficiency gain insufficient
- [GTR: we.trade Shutdown](https://www.gtreview.com/news/top-stories/we-trade-calls-it-quits-after-running-out-of-cash/) — "Excellent project, implementation failed"

### Secondary Sources (MEDIUM Confidence)

**Industry Implementation Patterns:**
- [Aura Blockchain Consortium](https://auraconsortium.com/) — LVMH-led luxury traceability
- [Arianee Protocol Documentation](https://docs.arianee.org/) — Alternative luxury traceability protocol
- [Kaleido ERC-3643 Overview](https://www.kaleido.io/blockchain-blog/erc-3643-standard-for-tokenized-assets) — Implementation guide
- [OpenZeppelin ZKP Practice](https://www.openzeppelin.com/zkp) — ZKP audit services
- [Pimlico Documentation](https://docs.pimlico.io/) — ERC-4337 bundler and paymaster

**Security Analysis:**
- [AICerts: ERC-3643 Security Best Practices](https://store.aicerts.ai/blog/smart-contract-security-in-erc-3643-best-practices-and-vulnerability-insights/) — Vulnerability catalog
- [Hacken: ERC-4337 Account Abstraction Overview](https://hacken.io/discover/erc-4337-account-abstraction/) — Security considerations
- [OpenZeppelin: ERC-4337 Incremental Audit](https://blog.openzeppelin.com/erc-4337-account-abstraction-incremental-audit) — Audit findings
- [QuillAudits: ERC-3643 Explained](https://www.quillaudits.com/blog/rwa/erc-3643-explained) — Architecture breakdown

**Compliance & DPP Implementation:**
- [GS1 EU: DPP Standards Guide](https://gs1.eu/wp-content/uploads/2025/04/GS1-Standards-Enabling-DPP-V2.2-April-2025.pdf) — DPP implementation
- [Acquis Compliance: DPP Guide 2025-2030](https://www.acquiscompliance.com/blog/digital-product-passport-dpp-eu-espr-compliance/) — Timeline and requirements
- [Circularise: DPPs Required by EU Legislation](https://www.circularise.com/blogs/dpps-required-by-eu-legislation-across-sectors) — Sector coverage
- [Bar Code Graphics: GS1 Mobile Readiness](https://www.barcode.graphics/mobile-readiness-the-first-step-in-your-gs1-digital-link-strategy/) — Consumer UX gap
- [iDenfy: AML Luxury Goods](https://www.idenfy.com/blog/aml-luxury-goods/) — KYC/AML requirements

### Tertiary Sources (LOW Confidence, Require Validation)

- Zero-knowledge proof gas cost estimates for on-chain verification — vary by circuit complexity and chain (L1 vs L2)
- PQC signature size impact on blockchain throughput — testnet data, not production-validated
- Specific bundler infrastructure providers' reliability metrics — vendor-provided statistics
- DID method adoption trends — anecdotal, no authoritative industry-wide survey

---

*Research completed: 2026-01-30*
*Research team: 4 parallel specialists (Stack, Features, Architecture, Pitfalls)*
*Ready for roadmap: YES*

---

## Next Steps for Orchestrator

This SUMMARY.md provides:
1. **Phase structure suggestion** (6 phases with rationale and dependencies)
2. **Research flags** (which phases need deeper research vs. standard patterns)
3. **Confidence assessment** (gaps requiring validation during implementation)
4. **Pitfall prevention mapping** (which phases address which critical risks)

**Recommended action:** Proceed to requirements definition phase. Use suggested phase structure as starting point for roadmap, but validate:
- Governance recruitment feasibility (can we attract competing brands?)
- Schema finalization timeline (ESPR delegated acts may shift requirements)
- Chain selection criteria (gas economics vs. security vs. ecosystem)
- Account abstraction priority (defer to post-MVP or include in MVP?)

**Critical decision point:** Phase 1 (Governance) must establish independent structure before technical work begins, or risk repeating TradeLens failure pattern. This is the single most important finding from research.

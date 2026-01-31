# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable
**Current focus:** Phase 5 (Token & Compliance Layer) - IN PROGRESS

## Current Position

Phase: 5 of 8 (Token & Compliance Layer)
Plan: 4 of 6 in current phase
Status: In progress
Last activity: 2026-01-31 - Completed 05-04-PLAN.md (Jurisdiction and Transfer Flows)

Progress: [██████████████████░ ] ~76%

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 5 min
- Total execution time: 93 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Governance Foundation | 6/6 | 27 min | 5 min |
| 2. Architecture Foundation | 3/6 | 9 min | 3 min |
| 3. Core Data Models | 3/3 | 20 min | 7 min |
| 4. Identity Infrastructure | 3/3 | 14 min | 5 min |
| 5. Token & Compliance | 4/6 | 23 min | 6 min |

**Recent Trend:**
- Last 5 plans: 04-03 (5 min), 05-01 (4 min), 05-02 (5 min), 05-03 (7 min), 05-04 (7 min)
- Trend: Consistent execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: 8-phase structure derived from 38 requirements (governance-first approach per TradeLens research)
- Roadmap: Phase 4 (Identity) MUST complete before Phase 5 (Token) - critical dependency
- Roadmap: Phases 3 and 4 can run in parallel after Phase 2 (no dependency between data models and identity)
- 01-01: Apache 2.0 exact text used without modifications for legal clarity
- 01-01: DCO 1.1 chosen over CLA for lower contributor friction
- 01-04: 10-year deprecation sunset chosen for luxury industry timelines (vs. 12-24 months software norm)
- 01-04: Semiannual releases (March, September) for ERP integration predictability
- 01-04: 72-hour coordinated disclosure for critical security vulnerabilities
- 01-02: TSC composition: 11 members (6 elected + 3 appointed + 2 transitional Founding Partner)
- 01-02: Anti-dominance provision: max 2 TSC seats per organization
- 01-02: Veto on breaking changes requires technical justification + alternative proposal, 90-day resolution
- 01-02: Hybrid transparency: private deliberations, public decisions with rationale
- 01-02: 4-level graduated sanctions (correction, warning, temporary ban, permanent ban)
- 01-03: RFC review periods: 2 weeks minor, 30 days major, 60 days breaking
- 01-03: Champion assignment for each RFC to prevent abandonment
- 01-03: Lazy consensus as default decision mechanism
- 01-03: English authoritative, community translations encouraged but non-binding
- 01-06: Three revenue bands (SME <10M, Mid-Market 10M-100M, Enterprise >100M) for accessible dues
- 01-06: 50% discount for nonprofits, academics, and government agencies
- 01-06: Founding Partner window explicitly CLOSED at ratification
- 01-06: Active Contributor status is individual (meritocratic), membership is organizational
- 01-06: 60-day grace period for dues non-payment before membership lapse
- 01-05: Staggered TSC elections (~3 seats/year) for governance continuity
- 01-05: Condorcet/Schulze voting method for TSC elections
- 01-05: Time zone rotation quarterly for global participation
- 01-05: Reduced quorum (6/11) for security-only emergency sessions
- 01-05: Recordings not published to encourage candid competitor discussion
- 02-01: Strict on-chain/off-chain separation: only non-personal references, hashes, booleans on-chain
- 02-01: Encrypted/hashed PII explicitly prohibited on-chain (EDPB 02/2025 position)
- 02-01: Off-chain-first pattern: content stored off-chain before on-chain event emission
- 02-01: Source of truth hierarchy: on-chain for ownership/attestation, off-chain for content/PII
- 02-01: CRAB model for erasure: key destruction renders on-chain hash orphaned
- 02-01: 30-day timeline for erasure requests per GDPR standard
- 02-02: ML-DSA-65 (NIST Level 3) as target algorithm for standard products
- 02-02: ML-DSA-87 (NIST Level 5) for high-value items
- 02-02: 2027-2029 hybrid period requires BOTH classical AND PQC signatures valid
- 02-02: Phase 3 (2030+) accepts PQC-only, rejects classical-only
- 02-02: Key rotation NEVER invalidates historical signatures (10+ year provenance)
- 02-03: W3C DID Core v1.0 targeted (v1.1 experimental, intentionally avoided)
- 02-03: GS1 Application Identifiers (01, 8006, 8010, 253) for product-to-DID mapping
- 02-03: Dual-resolution: HTTPS resolver + GS1 Digital Link for interoperability
- 02-03: Product DIDs are non-revocable (deactivated but never deleted for provenance)
- 02-03: Off-chain DID documents with on-chain content hash for integrity verification
- 03-01: 14-digit GTIN required per GS1 Digital Link 1.4.0 standard
- 03-01: Schema.org IndividualProduct as @type (not Product) for unique item instances
- 03-01: Material composition percentages must sum to 100 per ESPR requirement
- 03-01: Repairability index 1-10 scale matching French/EU standard
- 03-01: Five provenance grades (museum_piece, collector, excellent, good, standard) for secondary market differentiation
- 03-02: RFC 6920 ni: URI with SHA-256 hash for eventID (CBV 2.0 standard, content-addressable)
- 03-02: Same EPC in inputEPCList and outputEPCList for non-destructive repair transformations
- 03-02: Anonymized customer DIDs (did:galileo:customer:anon-{hash}) for GDPR compliance
- 03-02: TransformationEvent has no action field per EPCIS 2.0 specification
- 03-02: Five-level CPO status enum (certified_pre_owned, authenticated, unverified, brand_certified, marketplace_certified)
- 03-03: Custom Galileo dispositions: cpo_certified, vault_storage, authentication_pending for luxury-specific states
- 03-03: Molecular signature types: DNA_TAGGANT, SPECTRAL, ISOTOPIC, COMBINED
- 03-03: Leather verification methods: PCR_AMPLIFICATION, NEXT_GEN_SEQUENCING, QPCR, DIGITAL_PCR, LAMP
- 03-03: Isotopic methods: IRMS, EA_IRMS, SIMS, LA_ICP_MS, MC_ICP_MS, TIMS for origin verification
- 03-03: Artisan privacy: Pseudonymous DIDs by default, opt-in public profiles
- 03-03: Mastery levels include French MOF and Japanese Living Treasure designations
- 03-03: Context-aware routing: consumer, brand, regulator, service_center views
- 04-01: Extend ERC-3643 via inheritance (IGalileoIdentityRegistry extends IIdentityRegistry)
- 04-01: uint256 for claim topics as keccak256 hash of namespace strings
- 04-01: Consent verification as view function querying ONCHAINID hasConsent()
- 04-01: Brand DID required in storage binding for audit trail
- 04-01: Events organized in library pattern for reuse across implementations
- 04-02: keccak256 for topic IDs - deterministic, collision-resistant, EVM-native
- 04-02: IClaimIssuer type (not address) per ERC-3643 standard for interface enforcement
- 04-02: Compliance vs heritage topic classification (365-day renewal vs permanent)
- 04-02: Granular topic revocation - issuer can lose authority for specific claims only
- 04-02: Issuer suspension mechanism for investigation without permanent action
- 04-02: 365-day default expiry aligns with regulatory reporting cycles
- 04-02: Heritage topics (origin, authenticity) permanent until fraud discovered
- 04-03: Claim data encoding: abi.encode(keccak256(vcJson), vcURI) for integrity + retrieval
- 04-03: RFC 8785 JCS canonicalization for deterministic JSON hashing
- 04-03: DataIntegrityProof with eddsa-rdfc-2022 as default cryptosuite
- 04-03: Three status lists by credential type (KYC, luxury, heritage)
- 04-03: Caching TTL: 5 min for compliance, 24h for heritage
- 04-03: On-chain consent with expiry for GDPR-compliant cross-brand sharing
- 04-03: Roles (service_center, authenticator) via claim topics, not ParticipantType
- 04-03: CREATE2 factory deployment for cross-chain address consistency
- 05-01: Single-supply pattern: Each product gets separate token deployment with totalSupply = 1
- 05-01: Re-export ERC-3643 IToken with comprehensive NatSpec for Galileo context
- 05-01: CPO certification as first-class interface feature with certify/revoke lifecycle
- 05-01: Transfer with reason codes using keccak256 hashes for compliance audit trail
- 05-01: Event library pattern (TokenEvents) matching Phase 4 IdentityEvents approach
- 05-02: Re-export ERC-3643 IModularCompliance with documentation (not redefine)
- 05-02: ModuleTypes library with 8 types: JURISDICTION, BALANCE, TIME, ROLE, SANCTIONS, BRAND, CERTIFICATION, SERVICE
- 05-02: CPOMode enum: NOT_REQUIRED, REQUIRED_FOR_RESALE, ALWAYS_REQUIRED for flexibility
- 05-02: Five service types: REPAIR, RESTORATION, AUTHENTICATION, CUSTOMIZATION, INSPECTION
- 05-02: All compliance modules include identityRegistry() for IGalileoIdentityRegistry.batchVerify()
- 05-03: KYC_ENHANCED required for transfers >EUR 10,000 (aligned with EU 4AMLD threshold)
- 05-03: Chainalysis oracle as Layer 1, off-chain API as Layer 2 for latency mitigation (60+ day lag)
- 05-03: Strict mode (fail-closed) recommended for production sanctions checking
- 05-03: Supplementary blocklist for addresses not yet in Chainalysis oracle
- 05-03: Risk score thresholds: 0-30 (auto-approve), 31-70 (review), 71-100 (block)
- 05-04: ISO 3166-1 numeric codes (uint16) for country identification per ERC-3643 standard
- 05-04: Allow/Restrict dual-mode pattern for jurisdiction modules (whitelist vs blacklist)
- 05-04: Predefined country groups: OFAC_SANCTIONED, EU_SANCTIONED, FATF_GREYLIST, etc.
- 05-04: Sanctions check always highest priority in conflict resolution
- 05-04: 8-step transfer validation sequence: pause -> freeze -> identity -> compliance -> execute -> notify
- 05-04: Standard transfer reason codes (12 types) for complete audit trail

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Research Flags (from SUMMARY.md)

- **Phase 4 (Identity):** COMPLETE - ONCHAINID integration patterns fully specified
- **Phase 5 (Token):** Requires legal review for jurisdiction-specific compliance modules
- **Phase 6 (Resolver):** GS1 Resolver CE customization requires implementation expertise

## Session Continuity

Last session: 2026-01-31T15:45:XX Z
Stopped at: Completed 05-04-PLAN.md (Jurisdiction and Transfer Flows)
Resume file: None
Next plan: 05-05-PLAN.md (Token Factory)

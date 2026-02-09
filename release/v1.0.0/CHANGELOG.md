# Changelog — Galileo Luxury Standard

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-02-01

### Added

#### Governance (Phase 1)
- Apache 2.0 license with NOTICE and DCO 1.1 sign-off
- CHARTER.md establishing 11-member TSC with anti-dominance rules
- CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- CONTRIBUTING.md with RFC lifecycle (Draft → Proposed → Accepted)
- VERSIONING.md with semver policy and 10-year deprecation sunset
- TSC operational procedures (quorum, voting, escalation)
- Membership tiers (Founding, Contributing, Associate)

#### Architecture (Phase 2)
- HYBRID-ARCHITECTURE.md defining on-chain/off-chain data boundary
- CRAB model (Create-Read-Append-Burn) for GDPR erasure
- CRYPTO-AGILITY.md with ML-DSA-65/87 post-quantum migration path
- Hybrid signature period 2027-2029
- did:galileo DID method specification (W3C DID Core v1.0)
- DID document schema for products and entities

#### Data Models (Phase 3)
- DPP Core Schema (JSON-LD) with ESPR mandatory fields
- Product-specific schemas: textile, leather, watch
- 6 EPCIS 2.0 lifecycle event schemas:
  - ObjectEvent: Creation, Commission, Decommission
  - TransactionEvent: Sale, Resale
  - TransformationEvent: Repair/MRO
- CBV vocabulary alignment (bizStep, disposition, bizLocation)
- Molecular signature extensions (spectral fingerprint, terroir, leather)
- Artisan attribution with pseudonymous DIDs

#### Identity (Phase 4)
- IIdentityRegistry.sol extending ERC-3643
- IIdentityRegistryStorage.sol with federated brand binding
- ITrustedIssuersRegistry.sol with issuer categories and certifications
- IClaimTopicsRegistry.sol with 12 predefined Galileo claim topics:
  - Compliance: KYC_BASIC, KYC_ENHANCED, KYB_VERIFIED
  - Jurisdiction: KYC_EU_MIFID, KYC_US_SEC, KYC_APAC_SG
  - Luxury: AUTHORIZED_RETAILER, SERVICE_CENTER, AUTHENTICATOR, AUCTION_HOUSE
  - Heritage: ORIGIN_CERTIFIED, AUTHENTICITY_VERIFIED
- ONCHAINID specification (ERC-734/735)
- W3C Verifiable Credentials 2.0 integration
- BitstringStatusList for credential revocation

#### Token & Compliance (Phase 5)
- IGalileoToken.sol extending ERC-3643
- Single-supply pattern (1 token = 1 product)
- IModularCompliance.sol with pluggable rules
- 5 compliance modules:
  - IBrandAuthorizationModule (brand-verified transfers)
  - ICPOModule (certified pre-owned)
  - IServiceCenterModule (authorized service verification)
  - ISanctionsModule (Chainalysis oracle integration)
  - IJurisdictionModule (export controls, geo-restrictions)
- 8-step transfer validation sequence
- KYC/AML hooks specification

#### Resolver (Phase 6)
- GS1 Digital Link 1.6.0 URI specification
- GS1-Conformant Resolver 1.2.0 protocol
- 8-step resolution algorithm
- Context-aware routing (consumer, brand, regulator, service_center)
- JWT authentication with JWKS
- Linkset response format (RFC 9264)
- GTIN normalization and Modulo-10 validation

#### Infrastructure (Phase 7)
- RBAC framework with 5 roles and 2-tier verification
- Hash-chain audit trail with daily Merkle anchoring
- Data retention policies:
  - 7-year audit retention (SOX)
  - 5-year AML retention (5AMLD)
  - GDPR deletion rights with CRAB model
- Event sourcing pattern for hybrid sync

#### Compliance Documentation (Phase 8)
- GDPR compliance guide with CRAB erasure workflow
- MiCA compliance guide (July 2026 CASP deadline)
- ESPR readiness checklist (2027 textile DPP)

### Changed

- N/A (initial release)

### Deprecated

- N/A (initial release)

### Removed

- N/A (initial release)

### Fixed

#### Post-Audit (2026-02-01)
- Extended did:galileo entity-types (12 types including facility, technician, supplier, etc.)
- Extended entity-name length from {1,64} to {1,80} for anonymized customer DIDs
- Added explicit GS1→DID AI mapping table (identity vs operational AIs)
- Fixed case-sensitive serial normalization in resolution protocol
- Added controller ONCHAINID → brand DID resolution step
- Documented regulator JWT-only authentication as explicit security design decision
- Harmonized all JSON Schema DID patterns with grammar

### Security

- No PII stored on-chain (GDPR compliance)
- Post-quantum cryptography migration path defined
- Asymmetric JWT algorithms only (RS256, ES256)
- 1-hour maximum JWT lifetime
- ONCHAINID verification for service centers

---

## [Unreleased]

### Planned for v2.0.0

- Account Abstraction (ERC-4337 integration)
- Gasless transactions via Paymaster
- Smart account multi-sig and session keys
- Social recovery
- Passkey authentication (WebAuthn/FIDO2)
- CPO framework enhancements
- Condition scoring standardization
- Multi-chain support
- Cross-consortium bridges (Aura, Arianee)

---

*Galileo Luxury Standard — Protecting Heritage Through Interoperability*

# Phase 4 Plan 2: Trust and Claims Registries Summary

---
phase: 4
plan: 2
subsystem: identity
tags: [erc-3643, trusted-issuers, claim-topics, solidity, registry]
depends_on:
  requires: [04-01]
  provides: [trusted-issuer-interface, claim-topics-registry, claim-topics-spec]
  affects: [04-03, 05-token]
tech-stack:
  added: []
  patterns: [extended-erc-3643, namespace-hashing, topic-classification]
key-files:
  created:
    - specifications/contracts/identity/ITrustedIssuersRegistry.sol
    - specifications/contracts/identity/IClaimTopicsRegistry.sol
    - specifications/identity/claim-topics.md
  modified: []
decisions:
  - keccak256-topic-ids: Topic IDs computed as keccak256 of namespace strings for deterministic derivation
  - compliance-vs-heritage: Two topic classifications - compliance (365-day expiry) vs heritage (permanent)
  - granular-revocation: Issuers can be revoked for specific topics without full removal
  - issuer-suspension: Temporary suspension mechanism for investigation or certification lapse
metrics:
  duration: 6 min
  completed: 2026-01-31
---

## One-Liner

Extended ERC-3643 interfaces for trusted issuer management with categorization, certification tracking, and 12 predefined claim topics covering compliance, jurisdiction, luxury, and heritage domains.

## What Was Built

### 1. ITrustedIssuersRegistry.sol

Extended the ERC-3643 ITrustedIssuersRegistry interface with Galileo-specific features:

**IssuerCategory Enum:**
- `KYC_PROVIDER` - Licensed identity verification services
- `BRAND_ISSUER` - Luxury brands authorized to issue authenticity claims
- `AUTH_LAB` - Independent authentication laboratories
- `REGULATORY_BODY` - Government or industry regulatory authorities

**Certification Struct:**
```solidity
struct Certification {
    string standard;      // e.g., "ISO27001", "SOC2"
    string reference;     // Certificate number
    uint256 validUntil;   // Expiry timestamp (0 = permanent)
    string verificationURI;
}
```

**Key Functions:**
- `addTrustedIssuerWithCategory()` - Register issuer with category and certification
- `revokeIssuerForTopic()` - Granular topic-level revocation
- `suspendIssuer()` / `reactivateIssuer()` - Temporary suspension mechanism
- `isCertificationValid()` - Check certification expiry

### 2. IClaimTopicsRegistry.sol

Extended the ERC-3643 IClaimTopicsRegistry with metadata and lifecycle management:

**TopicMetadata Struct:**
```solidity
struct TopicMetadata {
    string namespace;     // e.g., "galileo.kyc.basic"
    string description;
    uint64 defaultExpiry; // 365 days or 0 (permanent)
    bool isCompliance;
}
```

**GalileoClaimTopics Library:**

12 predefined constants with computed keccak256 topic IDs:

| Namespace | Topic ID | Type |
|-----------|----------|------|
| galileo.kyc.basic | 0xd89b93fa... | Compliance |
| galileo.kyc.enhanced | 0xa1fecd52... | Compliance |
| galileo.kyb.verified | 0x1dd51298... | Compliance |
| galileo.kyc.eu.mifid | 0xdef3dcc6... | Compliance |
| galileo.kyc.us.sec | 0x2a049593... | Compliance |
| galileo.kyc.apac.sg | 0x15a36587... | Compliance |
| galileo.luxury.authorized_retailer | 0xfc1ed254... | Compliance |
| galileo.luxury.service_center | 0x10830870... | Compliance |
| galileo.luxury.authenticator | 0xda684ab8... | Compliance |
| galileo.luxury.auction_house | 0x4c471013... | Compliance |
| galileo.heritage.origin_certified | 0x1e1c32d6... | Heritage |
| galileo.heritage.authenticity_verified | 0x4fc95faf... | Heritage |

### 3. claim-topics.md

Comprehensive specification documenting:

- **Namespace format** - Hierarchical dot-notation (`galileo.category.subcategory`)
- **Topic ID computation** - keccak256 hashing with verification examples
- **Complete topic reference** - All 12 topics with required fields
- **Jurisdiction-specific KYC** - EU MiFID, US SEC, APAC SG regulatory references
- **Luxury-specific topics** - Retailer, service, authenticator, auction house
- **Heritage topics** - Origin and authenticity (permanent validity)
- **Topic lifecycle** - Registration, deprecation, 10-year sunset
- **Extension process** - RFC template per GOV-02

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| **keccak256 for topic IDs** | Deterministic, collision-resistant, EVM-native opcode |
| **IClaimIssuer type (not address)** | Per ERC-3643 standard for proper interface enforcement |
| **Compliance vs heritage classification** | KYC needs renewal; origin/authenticity are permanent facts |
| **Granular topic revocation** | Issuer may lose authority for specific claims without full removal |
| **Issuer suspension mechanism** | Temporary suspension for investigation without permanent action |
| **365-day default expiry** | Annual renewal aligns with regulatory reporting cycles |
| **Permanent heritage topics** | Origin/authenticity are historical facts, not current status |

## Verification Results

All keccak256 hashes computed and verified using Foundry's `cast keccak`:

```bash
cast keccak "galileo.kyc.basic"
# 0xd89b93fafd03b627c912eb1e18654cf100b9b5aad98e9b4f189134ae5581c2f0
```

All 12 topic IDs match between:
- GalileoClaimTopics library constants
- claim-topics.md specification table

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 91192f0 | feat | ITrustedIssuersRegistry interface with category and certification |
| bd51dda | feat | IClaimTopicsRegistry and GalileoClaimTopics library with 12 topics |
| 5ea1a1d | docs | claim-topics.md comprehensive specification |

## Next Phase Readiness

**Ready for 04-03 (ONCHAINID Integration):**

The interfaces defined here provide the foundation for:
- ONCHAINID claim verification using defined topic IDs
- Trusted issuer registration with category classification
- Claim expiry checking for compliance topics
- Granular issuer management

**Dependencies satisfied:**
- [x] Topic ID computation method defined
- [x] Issuer categorization available
- [x] Certification validation interface ready
- [x] Heritage vs compliance topic distinction clear

**Blockers:** None identified.

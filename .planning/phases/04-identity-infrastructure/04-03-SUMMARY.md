---
phase: 04-identity-infrastructure
plan: 04-03
title: ONCHAINID and Verifiable Credentials
subsystem: identity
tags: [onchainid, erc-734, erc-735, verifiable-credentials, w3c-vc-2.0, json-schema]
dependency-graph:
  requires: [04-01, 04-02]
  provides: [onchainid-specification, vc-specification, vc-schema]
  affects: [05-token-infrastructure, 06-resolver-infrastructure]
tech-stack:
  added: []
  patterns: [erc-734-key-management, erc-735-claims, w3c-vc-2.0, bitstring-status-list, rfc-8785-jcs]
key-files:
  created:
    - specifications/identity/onchainid-specification.md
    - specifications/identity/verifiable-credentials.md
    - specifications/schemas/identity/galileo-vc.schema.json
  modified: []
decisions:
  - key: claim-data-encoding
    choice: "abi.encode(keccak256(vcJson), vcURI)"
    rationale: "Hash + URI reference enables integrity verification while keeping PII off-chain"
  - key: canonicalization
    choice: "RFC 8785 JCS"
    rationale: "Industry standard for deterministic JSON serialization before hashing"
  - key: signature-scheme
    choice: "DataIntegrityProof with eddsa-rdfc-2022"
    rationale: "W3C Data Integrity standard, Ed25519 provides strong security and compact signatures"
  - key: status-list-organization
    choice: "Three lists by credential type"
    rationale: "Different caching TTLs and revocation patterns per credential category"
  - key: consent-structure
    choice: "On-chain consent with expiry"
    rationale: "GDPR compliance requires explicit, time-bounded consent for cross-brand sharing"
  - key: participant-type-vs-role
    choice: "Roles via claim topics, not ParticipantType"
    rationale: "Allows entities to have multiple roles without identity type change"
metrics:
  duration: 5 min
  completed: 2026-01-31
---

# Phase 04 Plan 03: ONCHAINID and Verifiable Credentials Summary

ONCHAINID specification with ERC-734/735 compliance plus W3C VC 2.0 integration for privacy-preserving off-chain claims with on-chain hash anchoring.

## What Was Built

### 1. ONCHAINID Specification (`specifications/identity/onchainid-specification.md`)

Complete specification for ONCHAINID usage in Galileo:

**Key Management (ERC-734):**
- Key purposes: MANAGEMENT (1), ACTION (2), CLAIM (3), ENCRYPTION (4)
- Key types: ECDSA now, ML-DSA for PQC (Phase 2)
- Key lifecycle: addKey, removeKey, keyHasPurpose
- Critical: Key rotation does NOT invalidate historical claims

**Claims Management (ERC-735):**
- Claim struct: topic, scheme, issuer, signature, data, uri
- Data encoding: `abi.encode(keccak256(vcJsonString), vcURI)`
- Signature: `keccak256(abi.encode(identityAddress, claimTopic, claimData))`
- Lifecycle: addClaim, removeClaim, getClaim, getClaimIdsByTopic

**Galileo Extensions:**
- IGalileoIdentity interface extending IIdentity
- Consent management: hasConsent, grantConsent, revokeConsent, getConsents
- Consent struct: brand, topic, grantedAt, expiresAt
- ParticipantType enum: INDIVIDUAL, BRAND, RETAILER, ISSUER, VERIFIER
- Service-center/authenticator roles via claim topics (not ParticipantType)

**Factory Deployment:**
- CREATE2 for cross-chain address consistency
- Salt derivation: `keccak256("galileo.identity.v1", userDID)`
- Same factory + same salt = same address on any EVM chain

### 2. Verifiable Credentials Specification (`specifications/identity/verifiable-credentials.md`)

W3C VC 2.0 integration for off-chain claims:

**Context Requirements:**
```json
"@context": [
  "https://www.w3.org/ns/credentials/v2",
  "https://vocab.galileo.luxury/contexts/galileo.jsonld"
]
```

**Credential Types:**
- GalileoKYCCredential: Compliance claims with expiry (365 days)
- GalileoLuxuryCredential: Brand authorizations (retailers, service centers)
- GalileoHeritageCredential: Permanent provenance claims

**Hash Anchoring:**
- On-chain: `abi.encode(keccak256(canonicalVCJson), vcURI)`
- Canonicalization: RFC 8785 JSON Canonicalization Scheme (JCS)
- 7-step verification flow with temporal validity checking

**BitstringStatusList:**
- /credentials/1: KYC (5 min TTL)
- /credentials/2: Luxury authorizations (5 min TTL)
- /credentials/3: Heritage claims (24h TTL, revocation only)

**Proof Types:**
- DataIntegrityProof with eddsa-rdfc-2022 (recommended)
- Future: Hybrid PQC proofs per crypto-agility Phase 2

### 3. JSON Schema (`specifications/schemas/identity/galileo-vc.schema.json`)

JSON Schema 2020-12 for validating all Galileo VC types:

**Definitions:**
- vcBase: Required @context with both W3C and Galileo contexts
- bitstringStatusEntry: BitstringStatusListEntry validation
- dataIntegrityProof: DataIntegrityProof with cryptosuite enum
- kycCredentialSubject: id, galileo:kycLevel, galileo:jurisdiction
- luxuryCredentialSubject: id, galileo:credentialType, galileo:brandAuthorization
- heritageCredentialSubject: id, galileo:methodology, galileo:confidence

**Validation:**
- Issuer pattern: `^did:galileo:` (strict)
- All Galileo properties use `galileo:` prefix
- oneOf: Validates exactly one credential type

## Commits

| Hash | Description |
|------|-------------|
| 0bdac15 | ONCHAINID specification (ERC-734/735 + Galileo extensions) |
| 3398371 | W3C Verifiable Credentials specification |
| 34066ce | Galileo VC JSON Schema |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Claim data encoding | `abi.encode(keccak256(vcJson), vcURI)` | Hash + URI enables integrity verification while keeping PII off-chain |
| Canonicalization | RFC 8785 JCS | Industry standard for deterministic JSON serialization |
| Signature scheme | DataIntegrityProof + eddsa-rdfc-2022 | W3C Data Integrity standard with Ed25519 |
| Status list organization | Three lists by credential type | Different caching TTLs and revocation patterns |
| Consent structure | On-chain with expiry | GDPR requires explicit, time-bounded consent |
| Participant types vs roles | Roles via claim topics | Allows multiple roles without identity type change |

## Deviations from Plan

None - plan executed exactly as written.

## Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| IDENT-05: ONCHAINID specification | Complete | ERC-734/735 + Galileo extensions |
| IDENT-06: W3C VC specification | Complete | VC 2.0 + BitstringStatusList |

## Next Phase Readiness

Phase 4 (Identity Infrastructure) is now complete:
- 04-01: Identity Registry interfaces
- 04-02: Trust and Claims Registries
- 04-03: ONCHAINID and VCs (this plan)

**Ready for Phase 5 (Token Infrastructure):**
- Identity contracts provide claim verification for transfer compliance
- Consent mechanism enables cross-brand data sharing
- VC structure supports product heritage claims

**Integration Points for Phase 5:**
- ERC-3643 token will query IGalileoIdentityRegistry
- Transfer compliance checks identity claims via ONCHAINID
- Product tokens reference heritage VCs via content hash

---

*Plan completed: 2026-01-31*
*Duration: 5 minutes*
*Files created: 3*

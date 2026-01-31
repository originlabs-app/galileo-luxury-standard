---
phase: 04-identity-infrastructure
plan: 04-01
subsystem: identity-registry
tags: [solidity, erc-3643, onchainid, gdpr, consent]
dependency-graph:
  requires: [02-01, 02-03]
  provides: [identity-registry-interfaces, identity-storage-interfaces, identity-events]
  affects: [04-02, 04-03, 05-01]
tech-stack:
  added: []
  patterns: [erc-3643-extension, consent-verification, batch-verification]
key-files:
  created:
    - specifications/contracts/identity/IIdentityRegistry.sol
    - specifications/contracts/identity/IIdentityRegistryStorage.sol
    - specifications/contracts/identity/events/IdentityEvents.sol
  modified: []
decisions:
  - id: IDENT-IF-01
    summary: Extend ERC-3643 interfaces rather than replace
    context: Need Galileo features while maintaining standard compliance
    choice: IGalileoIdentityRegistry extends IIdentityRegistry from @erc3643org
metrics:
  duration: 3 min
  completed: 2026-01-31
---

# Phase 4 Plan 1: Identity Registry Interfaces Summary

**One-liner:** ERC-3643 extended Solidity interfaces with cross-brand consent verification and batch claim checks for GDPR-compliant federated identity.

## What Was Built

### IIdentityRegistry.sol (243 lines)
Extended ERC-3643 IIdentityRegistry with Galileo-specific verification functions:

| Function | Purpose |
|----------|---------|
| `isVerifiedWithConsent(address, uint256, address)` | Cross-brand verification with GDPR Article 6 consent check |
| `batchVerify(address, uint256[])` | Efficient multi-topic verification in single call |
| `batchVerifyWithConsent(address, uint256[], address)` | Batch with consent for complex eligibility |
| `isConsortiumMember()` | Check federated consortium membership |
| `getConsortiumRegistries()` | Get bound TIR/CTR addresses |
| `identityCount()` | Analytics for registered identities |
| `isClaimTopicSupported(uint256)` | Validate claim topics against CTR |

Custom errors defined:
- `UserNotRegistered` - Address not in registry
- `ConsentNotGranted` - Cross-brand consent denied
- `NotConsortiumMember` - Registry not federated
- `EmptyClaimTopicsArray` - Invalid batch input

### IIdentityRegistryStorage.sol (289 lines)
Extended ERC-3643 IIdentityRegistryStorage for consortium architecture:

| Function | Purpose |
|----------|---------|
| `bindBrandRegistry(address, string)` | Bind registry with DID audit trail |
| `isRegistryBound(address)` | Efficient binding status check |
| `getBoundRegistries()` | List all consortium registries |
| `getRegistryBrandDID(address)` | Resolve registry to brand DID |
| `unbindBrandRegistry(address, string)` | Safe unbind with DID confirmation |
| `updateBrandDID(address, string)` | DID rotation without rebind |
| `boundRegistryCount()` | Pagination support |
| `boundRegistryAt(uint256)` | Index-based registry access |
| `getRegistryBindingTime(address)` | Audit timestamp |

Architecture diagram included in NatSpec showing shared storage model.

### IdentityEvents.sol (338 lines)
Comprehensive event library organized by category:

**Registration Events:**
- `IdentityRegistered` - New identity added
- `IdentityRemoved` - Identity deleted (GDPR Art. 17)
- `IdentityUpdated` - Identity contract changed
- `CountryUpdated` - Jurisdiction change

**Consent Events (GDPR-specific):**
- `ConsentGranted` - User grants cross-brand access
- `ConsentRevoked` - User withdraws consent (Art. 7.3)
- `ConsentVerified` - Consent verification audit
- `ConsentUpdated` - Expiry modification

**Registry Binding Events:**
- `RegistryBound` - Brand joins consortium
- `RegistryUnbound` - Brand leaves consortium
- `RegistryDIDUpdated` - Brand DID changed

**Verification Events:**
- `BatchVerificationPerformed` - Aggregate batch stats
- `ClaimVerificationPerformed` - Individual claim audit
- `VerificationFailedExpired` - Claim expiry debugging
- `VerificationFailedRevoked` - Claim revocation tracking

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| IDENT-IF-01 | Extend ERC-3643 via inheritance | Maintains compatibility with T-REX ecosystem while adding Galileo features |
| IDENT-IF-02 | uint256 for claim topics | Keccak256 hash of namespace strings (e.g., `galileo.claim.vip.collector`) |
| IDENT-IF-03 | Consent as view function | Queries ONCHAINID `hasConsent()` - no state modification |
| IDENT-IF-04 | Brand DID in storage binding | Enables off-chain resolution and audit trail |
| IDENT-IF-05 | Library for events | Clean separation, reusable across registry implementations |

## Verification Results

| Check | Result |
|-------|--------|
| All interfaces use `pragma solidity ^0.8.20` | PASS |
| ERC-3643 imports use `@erc3643org/erc-3643` path | PASS |
| All functions have NatSpec documentation | PASS |
| All events have parameter documentation | PASS |
| SPDX-License-Identifier: Apache-2.0 | PASS |
| Custom errors defined for revert conditions | PASS |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `1ed7ddf` | feat | IGalileoIdentityRegistry interface |
| `42a2c0a` | feat | IGalileoIdentityRegistryStorage interface |
| `c33badf` | feat | IdentityEvents library |

## Next Phase Readiness

**Ready for 04-02 (Trusted Issuers Registry):**
- IGalileoIdentityRegistry references TIR via `getConsortiumRegistries()`
- Claim topic validation pattern established
- Event patterns for issuer operations defined

**Ready for 04-03 (ONCHAINID Claims):**
- Consent event structure defined
- Verification events ready for claim operations
- ONCHAINID IIdentity references established

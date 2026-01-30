---
phase: 02-architecture-foundation
plan: 02
subsystem: crypto
tags: [post-quantum, ml-dsa, ml-kem, ecdsa, erc-4337, hybrid-signatures, nist-pqc]

# Dependency graph
requires:
  - phase: 01-governance-foundation
    provides: Versioning policy (10-year deprecation sunset)
provides:
  - Crypto-agile algorithm abstraction interfaces
  - Migration roadmap (2026-2030) from ECDSA to ML-DSA
  - Hybrid signature format specification
  - ERC-4337 integration pattern for custom signatures
affects: [identity, token, resolver, smart-contracts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Algorithm registry pattern for runtime crypto selection"
    - "Hybrid signature envelope with dual-verification"
    - "Key rotation with provenance chain preservation"

key-files:
  created:
    - specifications/crypto/CRYPTO-AGILITY.md
  modified: []

key-decisions:
  - "ML-DSA-65 (NIST Level 3) as target algorithm for standard products"
  - "ML-DSA-87 (NIST Level 5) for high-value items"
  - "2027-2029 hybrid period requires BOTH classical AND PQC signatures valid"
  - "Phase 3 (2030+) accepts PQC-only, rejects classical-only"
  - "Key rotation NEVER invalidates historical signatures"

patterns-established:
  - "ISignatureVerifier: algorithm-agnostic signature verification"
  - "ICryptoRegistry: runtime algorithm selection without code changes"
  - "HybridSignature: envelope format for dual-algorithm signatures"

# Metrics
duration: 3min
completed: 2026-01-30
---

# Phase 02 Plan 02: Crypto-Agility Summary

**Abstract interfaces (ISignatureVerifier, ICryptoRegistry) for algorithm-agnostic crypto, with 3-phase migration roadmap from ECDSA to ML-DSA (NIST FIPS 204) and hybrid dual-signature format for 2027-2030 transition period**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-30T13:05:17Z
- **Completed:** 2026-01-30T13:08:05Z
- **Tasks:** 2
- **Files created:** 1

## Accomplishments

- Algorithm abstraction interfaces enabling runtime crypto selection without hardcoding
- Complete migration roadmap: Classical (2026) -> Hybrid (2027-2029) -> PQC Primary (2030+)
- Hybrid signature wire format with dual-verification procedure
- ERC-4337 account abstraction integration for post-quantum signatures on Ethereum
- Key rotation procedures maintaining provenance chain over 10+ year product lifecycle

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Algorithm Abstraction Interfaces** - `d49ff70` (feat)
2. **Task 2: Add Migration Roadmap and Hybrid Signature Format** - `4e4d77a` (feat)

## Files Created

- `specifications/crypto/CRYPTO-AGILITY.md` - Complete crypto-agility specification (644 lines)
  - ISignatureVerifier, IKeyEncapsulation, ICryptoRegistry interfaces
  - Algorithm identifier tables (ECDSA, Ed25519, ML-DSA-44/65/87, ML-KEM-512/768/1024)
  - 3-phase migration timeline with configuration examples
  - Hybrid signature wire format with encoding specification
  - ERC-4337 validateUserOp integration example
  - Key rotation protocol with on-chain events
  - Implementation notes (libraries, performance, storage)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| ML-DSA-65 as standard target | NIST Level 3 security, good balance of size/performance |
| ML-DSA-87 for high-value items | NIST Level 5 for maximum security on valuable products |
| Hybrid requires BOTH signatures valid | "Belt and suspenders" - hedges against both classical break AND PQC bugs |
| Phase 3 rejects classical-only | Forces PQC adoption, classical becomes optional fallback |
| Never invalidate old signatures | Luxury products have 10+ year lifecycle, provenance must remain verifiable |
| Key rotation archives old keys | Historical verification always possible |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Identity specification (02-03) - will use crypto-agile signatures for DID authentication
- Token specification - attestations will use hybrid signature format
- Smart contract implementation - ICryptoRegistry pattern ready for Solidity implementation

**Dependencies satisfied:**
- FOUND-06: Crypto-agile specification complete
- 10-year product lifecycle addressed through hybrid transition period
- ERC-4337 path documented for custom signature schemes

**No blockers.**

---
*Phase: 02-architecture-foundation*
*Completed: 2026-01-30*

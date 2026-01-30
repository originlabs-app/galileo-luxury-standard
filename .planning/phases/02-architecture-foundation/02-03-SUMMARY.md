---
phase: 02-architecture-foundation
plan: 03
subsystem: identity
tags: [did, w3c, gs1, gtin, decentralized-identity, json-ld, verifiable-credentials]

# Dependency graph
requires:
  - phase: 02-01
    provides: Hybrid on-chain/off-chain architecture, data boundary specification
  - phase: 02-02
    provides: Crypto-agility specification for key types (Ed25519, secp256k1, PQC)
provides:
  - did:galileo method specification with GS1 integration
  - W3C DID Core v1.0 compliant resolution protocol
  - DID document schema with verification methods and service endpoints
  - Product lifecycle state machine (create, update, transfer, deactivate)
  - Galileo JSON-LD context for semantic interoperability
affects: [04-identity, 05-token, 06-resolver, 07-sdk]

# Tech tracking
tech-stack:
  added: []
  patterns: [did-method, json-ld-context, service-endpoint-resolution, lifecycle-state-machine]

key-files:
  created:
    - specifications/identity/DID-METHOD.md
    - specifications/identity/DID-DOCUMENT.md
  modified: []

key-decisions:
  - "W3C DID Core v1.0 targeted (v1.1 experimental, intentionally avoided)"
  - "GS1 Application Identifiers (01, 8006, 8010, 253) for product-to-DID mapping"
  - "Dual-resolution: HTTPS resolver + GS1 Digital Link for interoperability"
  - "Product DIDs are non-revocable (deactivated but never deleted for provenance)"
  - "Off-chain DID documents with on-chain content hash for integrity verification"

patterns-established:
  - "DID syntax: did:galileo:{ai}:{value}:21:{serial} for products"
  - "Service endpoint pattern: resolver.galileo.luxury/{service}/{gtin}/{serial}"
  - "Key ID convention: did#key-N, did#auth-N, did#encrypt-N"
  - "Lifecycle state transitions require controller authorization"

# Metrics
duration: 6min
completed: 2026-01-30
---

# Phase 2 Plan 03: Product Identity Specification Summary

**W3C DID-based product identity with did:galileo method, GS1 identifier integration, and off-chain document storage via service endpoints**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-30T13:11:41Z
- **Completed:** 2026-01-30T13:17:20Z
- **Tasks:** 2/2
- **Files created:** 2

## Accomplishments

- Created `did:galileo` method specification with ABNF grammar for product and entity identifiers
- Integrated GS1 Application Identifiers (GTIN, ITIP, CPID, GDTI) for physical product mapping
- Defined W3C DID Core v1.0 compliant resolution protocol with `DIDResolutionResult` interface
- Established DID document schema with Ed25519 and secp256k1 verification methods
- Defined service endpoint types for DPP, traceability, and authenticity verification
- Created lifecycle state machine covering creation, updates, transfer, and deactivation
- Published Galileo JSON-LD context for semantic interoperability

## Task Commits

Each task was committed atomically:

1. **Task 1: Create did:galileo Method Specification** - `b67a056` (feat)
2. **Task 2: Create DID Document Schema and Lifecycle** - `633c94a` (feat)

## Files Created/Modified

- `specifications/identity/DID-METHOD.md` - Method syntax, CRUD operations, resolution protocol, security considerations (813 lines)
- `specifications/identity/DID-DOCUMENT.md` - Document schema, verification methods, service endpoints, lifecycle states, JSON-LD context (921 lines)

## Decisions Made

1. **W3C DID Core v1.0 only:** Intentionally targeted v1.0 (July 2022 Recommendation) over experimental v1.1 for stability and broad tooling support.

2. **GS1 AI integration:** Supported Application Identifiers:
   - `01` - GTIN-13/GTIN-14 (primary product identifier)
   - `8006` - ITIP (individual piece of trade item)
   - `8010` - CPID (component/part identifier)
   - `253` - GDTI (document type identifier)
   - `21` - Serial number suffix for item-level uniqueness

3. **Dual resolution architecture:** Both HTTPS resolver (`resolver.galileo.luxury`) and GS1 Digital Link (`id.galileo.luxury`) for maximum interoperability with existing supply chain systems.

4. **Non-revocable product identifiers:** Products are deactivated (destroyed, lost, recalled) but never deleted. Historical resolution always works for provenance verification.

5. **Off-chain document storage:** Full DID documents stored off-chain with on-chain content hash. Aligns with hybrid architecture from 02-01.

6. **Service endpoint-to-DPP pattern:** Service endpoints point to off-chain DPP storage via resolver (`https://resolver.galileo.luxury/dpp/{gtin}/{serial}`).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward specification documentation following research and prior phase decisions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Phase 4 (Identity): ONCHAINID integration will reference did:galileo as product identity
- Phase 5 (Token): ERC-3643 token binding to did:galileo product DIDs
- Phase 6 (Resolver): GS1 Resolver CE implementation will use this specification
- Phase 7 (SDK): SDK will implement DID resolution and document creation

**Blockers:**
- None

**Notes:**
- FOUND-02 requirement (W3C DID-based product identity schema) is now satisfied
- Any product can be identified via did:galileo with GS1 identifiers
- DID documents reference off-chain DPP storage via service endpoints
- Resolution protocol is W3C v1.0 compliant
- Lifecycle supports full product journey including decommission

---
*Phase: 02-architecture-foundation*
*Plan: 03*
*Completed: 2026-01-30*

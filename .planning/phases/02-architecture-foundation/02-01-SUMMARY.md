---
phase: 02-architecture-foundation
plan: 01
subsystem: architecture
tags: [blockchain, gdpr, edpb, hybrid-storage, event-sourcing, crab-model, erc-3643, onchainid]

# Dependency graph
requires:
  - phase: 01-governance-foundation
    provides: Governance structure and decision-making processes
provides:
  - Hybrid on-chain/off-chain architecture specification
  - Data classification matrix (on-chain vs off-chain)
  - EDPB 02/2025 compliance checklist
  - CRAB model for right-to-erasure
  - Event sourcing protocol with source-of-truth hierarchy
  - Component interaction diagrams
affects: [03-data-models, 04-identity, 05-token, 06-resolver, 07-sdk]

# Tech tracking
tech-stack:
  added: []
  patterns: [hybrid-storage, crab-erasure, event-sourcing, hash-before-chain]

key-files:
  created:
    - specifications/architecture/HYBRID-ARCHITECTURE.md
  modified: []

key-decisions:
  - "Strict on-chain/off-chain separation: only non-personal references, hashes, booleans on-chain"
  - "Encrypted/hashed PII explicitly prohibited on-chain (EDPB position)"
  - "Off-chain-first pattern: content stored off-chain before on-chain event emission"
  - "Source of truth hierarchy: on-chain for ownership/attestation, off-chain for content/PII"
  - "Hash mismatch handling: flag for manual reconciliation, never auto-resolve"
  - "30-day timeline for erasure requests per GDPR standard"

patterns-established:
  - "Off-chain-first: Always persist off-chain content before emitting on-chain event"
  - "CRAB model: Create-Read-Append-Burn for GDPR-compliant erasure via key destruction"
  - "Canonical JSON: Sorted keys, no whitespace, UTF-8 NFC for consistent hashing"
  - "Algorithm-in-metadata: Always include hash algorithm ID for crypto-agility"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 2 Plan 01: Hybrid Architecture Summary

**GDPR-compliant hybrid architecture with EDPB 02/2025 compliance, CRAB model for erasure, and event sourcing protocol for on-chain/off-chain sync**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T13:05:19Z
- **Completed:** 2026-01-30T13:09:34Z
- **Tasks:** 2
- **Files created:** 1

## Accomplishments

- Created comprehensive hybrid architecture specification (825 lines)
- Defined data classification matrix: exactly what data goes on-chain vs off-chain
- Documented EDPB 02/2025 compliance checklist with key regulatory quotes
- Established CRAB model for right-to-erasure via key destruction
- Designed event sourcing protocol with source-of-truth hierarchy
- Created ASCII diagrams for component interactions, resolution flow, and transfer flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Data Boundary Specification with EDPB Compliance** - `695ccd1` (feat)
2. **Task 2: Add Event Sourcing Protocol and Component Diagrams** - `467ff09` (feat)

## Files Created/Modified

- `specifications/architecture/HYBRID-ARCHITECTURE.md` - Complete hybrid architecture specification with 7 major sections

## Decisions Made

1. **Strict data boundary:** On-chain stores only: product DID, content hash, ownership address, compliance boolean, timestamp, claim topic IDs, event type enum. Everything else off-chain.

2. **Encrypted/hashed PII prohibited on-chain:** Following EDPB position that encrypted or hashed personal data remains personal data under GDPR.

3. **Off-chain-first pattern:** Off-chain write MUST complete before on-chain event emission. If off-chain fails, the event never happened.

4. **Source of truth hierarchy:**
   - Ownership and attestation: On-chain is authoritative
   - Content and PII: Off-chain is authoritative
   - Hash mismatch: Flag for manual reconciliation (never auto-resolve)

5. **CRAB model for erasure:** Key destruction renders on-chain hash orphaned and meaningless, satisfying GDPR Article 17 without modifying blockchain.

6. **Canonical JSON for hashing:** Sorted keys, no whitespace, UTF-8 NFC normalization for consistent hash computation across implementations.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward documentation task following research guidance.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Phase 2 Plan 02: Product Identity Schema (W3C DID) - will reference this architecture
- Phase 2 Plan 03: Crypto-Agile Specification - will build on hash algorithm selection
- Phase 3: Data Models - will implement the on-chain/off-chain pattern
- Phase 4: Identity - ONCHAINID integration follows documented ERC-3643 pattern

**Blockers:**
- None

**Notes:**
- FOUND-01 requirement (Architecture Document) is now satisfied
- Implementers can determine exactly what data goes where
- GDPR compliance path is clear (no personal data on-chain)
- Event sourcing pattern enables hybrid sync

---
*Phase: 02-architecture-foundation*
*Plan: 01*
*Completed: 2026-01-30*

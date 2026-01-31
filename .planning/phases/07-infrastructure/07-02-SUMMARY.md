---
phase: "07"
plan: "02"
name: "Retention & Hybrid Sync"
subsystem: "Infrastructure"
tags: [gdpr, aml, data-retention, event-sourcing, hybrid-storage, crab-model]

requires:
  - "02-01" # HYBRID-ARCHITECTURE.md with CRAB model

provides:
  - "Data retention policies with GDPR/AML conflict resolution"
  - "Hybrid on-chain/off-chain synchronization protocol"
  - "Erasure request workflow with legal hold support"
  - "Consistency state machine for sync verification"

affects:
  - "07-03" # RBAC framework will reference retention for audit
  - "07-04" # Audit trail will use hybrid sync protocol
  - "Phase 8" # Implementation will follow these specifications

tech-stack:
  added: []
  patterns:
    - "Event sourcing (off-chain-first)"
    - "RFC 8785 JSON canonicalization"
    - "CRAB model for GDPR erasure"
    - "Consistency state machine"

key-files:
  created:
    - "specifications/infrastructure/data-retention.md"
    - "specifications/infrastructure/hybrid-sync.md"
  modified: []

decisions:
  - id: "07-02-01"
    decision: "5-year AML retention, 7-year audit trail, GDPR Art. 17(3)(b) for refusal"
    rationale: "Align with 5AMLD Article 40 and SOX requirements"
  - id: "07-02-02"
    decision: "Off-chain write MUST complete before on-chain anchor"
    rationale: "Guarantees on-chain references never point to non-existent content"
  - id: "07-02-03"
    decision: "5 consistency states: VERIFIED, PENDING, MISMATCH, ORPHANED, MISSING"
    rationale: "Distinguish expected erasure (ORPHANED) from data loss (MISSING)"
  - id: "07-02-04"
    decision: "Daily scheduled reconciliation with P1 alerts for any mismatch"
    rationale: "Proactive integrity monitoring with zero-tolerance for data corruption"

metrics:
  duration: "4 min"
  completed: "2026-01-31"
---

# Phase 07 Plan 02: Retention & Hybrid Sync Summary

**Data retention policies and hybrid storage synchronization protocol for GDPR/AML compliance and on-chain/off-chain consistency.**

## What Was Done

### Task 1: Data Retention Policies (GSPEC-INFRA-003)

Created comprehensive data retention specification at `specifications/infrastructure/data-retention.md`:

**Data Classification Matrix (6 categories):**

| Category | Min Retention | Max Retention | Erasure on Request |
|----------|---------------|---------------|-------------------|
| AML/KYC records | 5 years | 7 years | No (Art. 17(3)(b)) |
| Transaction logs | 5 years | 7 years | No (Art. 17(3)(b)) |
| Audit trail | 7 years | 10 years | No (Art. 17(3)(b)) |
| Customer PII | None | Purpose expiry | Yes (with checks) |
| Product data | Indefinite | Indefinite | No (not personal) |
| Encryption keys | Until erasure | Until erasure | On valid request |

**GDPR-AML Conflict Resolution:**
- Erasure requests during AML retention period: REFUSE per GDPR Art. 17(3)(b)
- Legal basis documented: "compliance with a legal obligation"
- Post-retention requests: Honor within 30 days

**Erasure Request Workflow (9 steps):**
1. Receive request, start 30-day timer
2. Validate requester identity
3. Inventory all subject data
4. Check retention obligations and legal holds
5. Decision: full erasure, partial, or refusal
6. Execute erasure (CRAB Burn)
7. Orphan on-chain references
8. Notify data subject
9. Audit trail

**Legal Hold Support:**
- Litigation hold lifecycle (initiation, active, release)
- Scope definition (data types, subjects, date ranges)
- Erasure blocked during active hold
- Audit trail of hold lifecycle

### Task 2: Hybrid Storage Sync Protocol (GSPEC-INFRA-004)

Created hybrid synchronization specification at `specifications/infrastructure/hybrid-sync.md`:

**6-Step Event Sourcing Protocol:**
1. ACTION OCCURS - Event triggered with validation
2. OFF-CHAIN FIRST - Store content, compute hash (CRITICAL)
3. WAIT FOR CONFIRMATION - Retry with exponential backoff
4. ON-CHAIN ANCHOR - Emit event with content hash
5. INDEX UPDATE - Bidirectional linking
6. PERIODIC MERKLE ANCHOR - Optional batch anchoring

**5 Consistency States:**

| State | Definition | Expected? |
|-------|------------|-----------|
| VERIFIED | Off-chain hash matches on-chain | Yes (normal) |
| PENDING | Off-chain exists, not yet anchored | Yes (transient) |
| MISMATCH | Hashes don't match | No (incident) |
| ORPHANED | On-chain exists, off-chain deleted | Yes (after erasure) |
| MISSING | On-chain reference, off-chain not found | No (incident) |

**Write/Read Protocol Interfaces:**
- `writeOffChain()` - Must succeed before on-chain
- `anchorOnChain()` - Emits event with content hash
- `readProduct()` - Primary read with consistency state
- `verifyConsistency()` - Hash comparison

**Failure Handling:**
- Off-chain failure: Retry, event not recorded (safe)
- On-chain failure: Mark PENDING, queue for retry
- Hash mismatch: Quarantine, P1 incident
- Missing content: Attempt recovery from backups

**Reconciliation Protocol:**
- Daily scheduled job at 02:00 UTC
- On-demand reconciliation by product/brand/time range
- P1 alerts for any MISMATCH or unexpected MISSING
- ORPHANED treated as expected (valid erasure)

**CRAB Model Integration:**
- Create: Standard off-chain + on-chain flow
- Read: Query off-chain, optional hash verification
- Append: New event with new hash
- Burn: Delete off-chain, orphan hash, destroy keys

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 07-02-01 | 5-year AML, 7-year audit retention | Align with 5AMLD Article 40 and SOX |
| 07-02-02 | Off-chain write before on-chain anchor | Prevent orphaned on-chain references |
| 07-02-03 | 5 consistency states with ORPHANED vs MISSING | Distinguish expected erasure from data loss |
| 07-02-04 | Daily reconciliation with P1 for any mismatch | Zero-tolerance for data corruption |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| 474fbe7 | feat(07-02): add data retention policies specification | data-retention.md |
| aea3d7b | feat(07-02): add hybrid storage sync protocol specification | hybrid-sync.md |

## Next Phase Readiness

**Ready for 07-03 (RBAC Framework):**
- Retention policies define audit trail requirements
- Hybrid sync protocol available for audit logging
- Consistency states inform access control decisions

**Integration Points:**
- RBAC will use data retention for permission audit trails
- Audit trail spec will implement hybrid sync protocol
- Erasure workflow requires RBAC verification

## Files Created

```
specifications/infrastructure/
  data-retention.md     (873 lines) - GSPEC-INFRA-003
  hybrid-sync.md        (1453 lines) - GSPEC-INFRA-004
```

## Key References

- **HYBRID-ARCHITECTURE.md Section 4**: CRAB model for erasure
- **HYBRID-ARCHITECTURE.md Section 5**: Event sourcing protocol (extended)
- **GDPR Article 17(3)(b)**: Legal obligation exception for erasure
- **5AMLD Article 40**: 5-year AML retention requirement
- **RFC 8785**: JSON Canonicalization Scheme (JCS)

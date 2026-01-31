---
phase: "07"
plan: "01"
title: "Access Control & Audit"
subsystem: "infrastructure"
tags: [rbac, access-control, audit-trail, onchainid, merkle-tree]

dependency-graph:
  requires:
    - "04-02"  # Claim Topics Registry
    - "04-03"  # VC Bridge
    - "06-02"  # Context-Aware Resolution
  provides:
    - "GSPEC-INFRA-001 (RBAC Framework)"
    - "GSPEC-INFRA-002 (Audit Trail)"
    - "IGalileoAccessControl interface"
  affects:
    - "07-02"  # DPP Schema (will use RBAC for access control)
    - "07-03"  # Persistence layer (audit log storage)

tech-stack:
  added:
    - "OpenZeppelin AccessControlEnumerable (v5.x)"
    - "PostgreSQL audit log schema"
    - "Merkle tree anchoring pattern"
  patterns:
    - "Two-tier access control (JWT + ONCHAINID)"
    - "Hash-chain backed audit log"
    - "Daily Merkle anchoring"
    - "CRAB model event logging"

key-files:
  created:
    - "specifications/infrastructure/rbac-framework.md"
    - "specifications/infrastructure/audit-trail.md"
    - "specifications/contracts/infrastructure/IAccessControl.sol"
  modified: []

decisions:
  - id: "07-01-D1"
    title: "Five core roles for Galileo RBAC"
    decision: "Define 5 roles: brand_admin, operator, auditor, regulator, service_center"
    rationale: "Aligned with existing resolver access-control.md patterns; avoids role explosion"
  - id: "07-01-D2"
    title: "Two-tier verification pattern"
    decision: "Layer 1 (off-chain JWT) + Layer 2 (on-chain ONCHAINID) for privileged roles"
    rationale: "Balances performance (cached JWT) with security (on-chain verification for brand_admin, service_center)"
  - id: "07-01-D3"
    title: "5-minute cache TTL for RBAC verification"
    decision: "Cache verification results for maximum 5 minutes"
    rationale: "Balance between performance and security; prevents stale permissions"
  - id: "07-01-D4"
    title: "Daily Merkle anchoring for audit trail"
    decision: "Anchor Merkle root on-chain once per day at 00:00 UTC"
    rationale: "Balance gas cost (~50k/day) vs. proof freshness; hourly for high-volume"
  - id: "07-01-D5"
    title: "7-year audit retention per SOX"
    decision: "Active retention 7 years, archive 3 years, total 10 years"
    rationale: "SOX compliance requirement; matches regulatory expectation"
  - id: "07-01-D6"
    title: "Two-phase role grants for critical roles"
    decision: "Request-confirm pattern with time delay for privileged role grants"
    rationale: "Prevents unauthorized grants; provides window for intervention"

metrics:
  duration: "6 min"
  completed: "2026-01-31"
---

# Phase 7 Plan 01: Access Control & Audit Summary

**One-liner:** RBAC framework with 5 roles, two-tier JWT/ONCHAINID verification, and hash-chain audit trail with daily Merkle anchoring.

## What Was Built

### 1. RBAC Framework Specification (GSPEC-INFRA-001)

Complete role-based access control specification defining:

- **5 Core Roles:**
  - `brand_admin`: Full brand control, requires KYB_VERIFIED claim
  - `operator`: Day-to-day operations, JWT-only
  - `auditor`: Read-only access to all data, JWT-only
  - `regulator`: Compliance access, pre-verified by TSC
  - `service_center`: MRO operations, requires SERVICE_CENTER claim

- **Permission Matrix:** Detailed R/W/RW/- permissions by resource type (DPP, ownership, service history, audit trail, compliance, customer PII)

- **Two-Tier Verification Flow:**
  1. Layer 1: Off-chain JWT validation (fast, cached)
  2. Layer 2: On-chain ONCHAINID claim verification (privileged roles only)

- **Role Hierarchy:** OpenZeppelin AccessControl pattern with DEFAULT_ADMIN_ROLE (TSC) at apex

### 2. Audit Trail Specification (GSPEC-INFRA-002)

Immutable logging infrastructure with:

- **43 Event Types** across 7 categories:
  - Access Control (ROLE_GRANTED, ACCESS_DENIED, etc.)
  - Data Lifecycle (DATA_CREATED, DATA_UPDATED, etc.)
  - Token Operations (TOKEN_TRANSFERRED, COMPLIANCE_CHECK, etc.)
  - CRAB Model (ENCRYPTION_KEY_DESTROYED, CONTENT_ORPHANED, etc.)
  - Compliance (ERASURE_REQUESTED, LEGAL_HOLD_APPLIED, etc.)
  - Identity (CLAIM_ISSUED, CONSENT_GRANTED, etc.)
  - System (MERKLE_ANCHOR_CREATED, RECONCILIATION_RUN, etc.)

- **Hash Chain Protocol:**
  - SHA-256 with RFC 8785 JCS canonicalization
  - Genesis entry: previousHash = 0x0...0 (64 zeros)
  - Tamper-evident linking

- **Merkle Tree Anchoring:**
  - Daily root hash anchored on-chain (~50k gas)
  - O(log n) proof generation for any entry
  - Independent verification possible

- **PostgreSQL Schema:**
  - Append-only table with immutability rules
  - JSONB for flexible metadata
  - Monthly partitioning for retention management

### 3. IGalileoAccessControl Interface

Solidity interface extending OpenZeppelin with:

- **Role Constants:** BRAND_ADMIN_ROLE, OPERATOR_ROLE, AUDITOR_ROLE, REGULATOR_ROLE, SERVICE_CENTER_ADMIN_ROLE

- **Identity-Aware Functions:**
  - `grantRoleWithIdentity()`: Verifies ONCHAINID claim before grant
  - `hasRoleWithIdentity()`: Real-time claim verification
  - `setRoleClaimRequirement()`: Configure claim topics per role

- **Two-Phase Grants:**
  - `requestRoleGrant()`: Initiate time-delayed grant
  - `confirmRoleGrant()`: Complete after delay period
  - `cancelRoleGrantRequest()`: Cancel pending request

- **Suspension Mechanism:**
  - `suspendRole()`: Temporary suspension for investigation
  - `reinstateRole()`: Restore after investigation

- **Emergency Access:**
  - `emergencyGrantRole()`: Time-limited emergency access
  - `emergencyRevokeAll()`: Immediate security response

- **Comprehensive Events:** RoleGrantedWithIdentity, RoleSuspended, EmergencyAccessGranted, etc.

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Role count | 5 roles | Avoid role explosion; use claims for fine-grained permissions |
| Verification model | Two-tier (JWT + ONCHAINID) | Performance (cached) + security (on-chain for privileged) |
| Cache TTL | 5 minutes max | Balance performance vs. stale permission risk |
| Audit anchor frequency | Daily | Balance gas cost vs. proof freshness |
| Retention period | 7 years active + 3 archive | SOX compliance requirement |

## Integration Points

### With Existing Specifications

- **Claim Topics (04-02):** Maps roles to claim topics (KYB_VERIFIED, SERVICE_CENTER)
- **Access Control (resolver):** Aligns JWT role claims with RBAC roles
- **HYBRID-ARCHITECTURE:** Audit trail logs CRAB model events

### For Future Phases

- **DPP Schema (07-02):** Will use RBAC for field-level access control
- **Persistence (07-03):** Audit log storage implementation
- **Key Management (07-04):** Emergency access and key destruction logging

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:**
- 07-02 (DPP Schema): RBAC framework provides access control model
- 07-03 (Persistence): Audit trail schema ready for implementation

**No blockers identified.**

## Artifacts

| File | Purpose | Lines |
|------|---------|-------|
| `specifications/infrastructure/rbac-framework.md` | Complete RBAC specification | 764 |
| `specifications/infrastructure/audit-trail.md` | Immutable audit logging specification | 1480 |
| `specifications/contracts/infrastructure/IAccessControl.sol` | Solidity interface for RBAC | 604 |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| f3575ff | feat | Add RBAC framework specification |
| a6365b0 | feat | Add immutable audit trail specification |
| f2f8f45 | feat | Add IGalileoAccessControl interface |

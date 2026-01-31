# Phase 7: Infrastructure & Security - Research

**Researched:** 2026-01-31
**Domain:** Access Control, Audit Trails, Data Governance, Hybrid Storage Synchronization
**Confidence:** HIGH

## Summary

This research covers the operational infrastructure specifications for the Galileo Luxury Standard: access control (RBAC), immutable audit trails, GDPR/AML-compliant data retention, and hybrid on-chain/off-chain storage synchronization. The existing Galileo architecture (from Phases 2-6) has established solid foundations with the CRAB model, ONCHAINID integration, and JWT-based authentication that this phase builds upon.

The key insight is that Galileo already has role-based access control patterns defined in the resolver access-control.md (consumer, brand, regulator, service_center), claim topics in claim-topics.md (12 initial topics with ONCHAINID integration), and the CRAB (Create-Read-Append-Burn) erasure model in HYBRID-ARCHITECTURE.md. Phase 7 consolidates these into formal specifications for RBAC framework, audit trail, data retention policies, and hybrid storage protocol.

**Primary recommendation:** Build on existing patterns rather than introducing new paradigms. Use OpenZeppelin AccessControl for on-chain RBAC extended with ONCHAINID claims verification. Implement audit trail as hash-chain-backed append-only log with periodic Merkle tree anchoring. Formalize GDPR/AML retention with explicit schedules per data type. Define event sourcing protocol for on-chain/off-chain synchronization with off-chain-first writes.

---

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| OpenZeppelin AccessControl | 5.x | On-chain RBAC | Industry standard, audited, composable |
| ONCHAINID | ERC-734/735 | Claim-based identity verification | Already integrated in Phase 4 |
| PostgreSQL | 16+ | Off-chain audit log storage | Append-only table patterns, JSONB, mature |
| Trillian | 1.6+ | Merkle tree log infrastructure | Production-proven (Certificate Transparency) |
| EventStoreDB | 24.10+ | Event sourcing for off-chain | Native event sourcing, projections |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jose (JS) / PyJWT | 2.8+ | JWT verification | Off-chain access control |
| Redis | 7.x | RBAC permission caching | Performance optimization (5-min TTL) |
| Kafka | 3.6+ | Event streaming | High-throughput audit log ingestion |
| HashiCorp Vault | 1.15+ | Key management for CRAB | Encryption key lifecycle |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OpenZeppelin AccessControl | Custom RBAC contract | OZ is audited, custom requires own audit |
| PostgreSQL | MongoDB | Postgres better for relational audit queries |
| Trillian | Custom Merkle tree | Trillian production-proven for CT logs |
| EventStoreDB | Apache Kafka + custom | EventStoreDB native event sourcing semantics |

**Installation:**
```bash
# Solidity (RBAC)
npm install @openzeppelin/contracts@^5.0.0

# Off-chain audit
pip install eventstore-client psycopg[binary] pyjwt

# Merkle tree anchoring (if using Trillian)
go install github.com/google/trillian/cmd/trillian_log_server@latest
```

---

## Architecture Patterns

### Recommended Project Structure

```
specifications/
  infrastructure/
    rbac-framework.md          # INFRA-02: Access control specification
    audit-trail.md             # INFRA-03: Immutable audit log spec
    data-retention.md          # INFRA-04: GDPR/AML retention policies
    hybrid-storage-sync.md     # INFRA-05: On/off-chain sync protocol
  contracts/
    infrastructure/
      IGalileoAccessControl.sol  # RBAC interface
      IAuditLogger.sol           # On-chain audit event interface
```

### Pattern 1: Layered RBAC (On-Chain + Off-Chain)

**What:** Two-tier access control combining on-chain role verification with off-chain permission resolution
**When to use:** Every privileged operation in the Galileo ecosystem

```
                      Access Request
                            |
                            v
              +----------------------------+
              |  Layer 1: Off-Chain JWT    |
              |  - Token validation        |
              |  - Role extraction         |
              |  - Basic permission check  |
              +----------------------------+
                            |
                       [Privileged?]
                       /         \
                     NO           YES
                      |            |
                      v            v
              +------------+  +----------------------------+
              | Allow      |  | Layer 2: On-Chain Verify   |
              | (Consumer) |  | - ONCHAINID claim check    |
              +------------+  | - identityRegistry.isVerified |
                              | - Role-specific claim topic |
                              +----------------------------+
                                          |
                                     [Verified?]
                                     /         \
                                   NO           YES
                                    |            |
                                    v            v
                              +--------+  +-------------+
                              | Reject |  | Allow with  |
                              | 403    |  | audit log   |
                              +--------+  +-------------+
```

### Pattern 2: Hash-Chain Backed Audit Log

**What:** Immutable append-only log with cryptographic chaining and periodic Merkle anchoring
**When to use:** All privileged operations, data modifications, access grants/revocations

```typescript
// Source: Trillian/Certificate Transparency patterns
interface AuditLogEntry {
  // Entry identification
  entryId: string;           // UUID v7 (time-ordered)
  sequenceNumber: bigint;    // Monotonically increasing
  timestamp: Date;           // ISO 8601 UTC

  // Chaining
  previousHash: string;      // SHA-256 of previous entry
  entryHash: string;         // SHA-256 of this entry (computed)

  // Content
  eventType: AuditEventType;
  actor: ActorInfo;
  action: string;
  resource: ResourceInfo;
  outcome: 'success' | 'failure' | 'partial';
  metadata: Record<string, unknown>;
}

// Merkle tree anchoring (periodic)
interface MerkleAnchor {
  anchorId: string;
  treeSize: bigint;          // Number of entries in tree
  rootHash: string;          // Merkle root
  timestamp: Date;
  transactionHash?: string;  // On-chain anchor (optional)
}
```

### Pattern 3: GDPR-AML Retention Matrix

**What:** Data classification with explicit retention schedules and legal basis
**When to use:** Every data type stored in Galileo ecosystem

```
Data Classification Matrix:

+------------------+------------+----------------+---------------+
|   Data Type      | Retention  | Legal Basis    | Delete After  |
+------------------+------------+----------------+---------------+
| AML/KYC records  | 5 years    | 5AMLD Art. 40  | 5y post-rel   |
| Transaction logs | 5 years    | MiCA/TFR       | 5y post-tx    |
| Audit trail      | 7 years    | SOX/Compliance | 7y post-entry |
| Customer PII     | Purpose    | GDPR Art. 6    | On request*   |
| Product data     | Indefinite | Legitimate int | Never**       |
+------------------+------------+----------------+---------------+

* Right to erasure blocked during AML retention period
** Non-personal product data (materials, provenance) retained
```

### Pattern 4: Event Sourcing for Hybrid Storage

**What:** Off-chain-first event sourcing with on-chain hash anchoring
**When to use:** All product lifecycle events, DPP updates, ownership transfers

```
Event Sourcing Flow (from HYBRID-ARCHITECTURE.md):

1. ACTION OCCURS
   |
   v
2. OFF-CHAIN FIRST
   - Store complete event in EventStoreDB
   - Generate eventId, compute contentHash
   - Apply encryption if CRAB model
   |
   v
3. WAIT FOR CONFIRMATION
   - EventStoreDB confirms persistence
   - Verify hash computation
   |
   v
4. ON-CHAIN ANCHOR
   - Emit event: (productDID, eventType, contentHash, timestamp)
   - Transaction confirmed
   |
   v
5. INDEX UPDATE
   - Link contentHash -> off-chain eventId
   - Enable bidirectional lookup
   |
   v
6. PERIODIC MERKLE ANCHOR
   - Batch events into Merkle tree
   - Anchor root hash on-chain (daily/hourly)
```

### Anti-Patterns to Avoid

- **On-chain role storage for all users:** Store role mappings on-chain only for privileged actors (brands, service centers), not consumers
- **Synchronous on-chain verification for every request:** Cache verification results (5-minute TTL) for performance
- **Storing audit log entries on-chain:** Store only hashes/anchors on-chain; full entries off-chain
- **Deleting data immediately on erasure request:** Check AML retention period first; document refusal if applicable
- **Single-source audit log:** Use separate write and read paths (CQRS) for audit log performance

---

## Galileo Role Definitions

### Role Hierarchy (from existing specifications)

| Role | Description | On-Chain Claim | JWT Role | Permission Scope |
|------|-------------|----------------|----------|------------------|
| **brand_admin** | Brand administrator | KYB_VERIFIED | `brand` | Full access to own brand's products |
| **operator** | Day-to-day operations | - | `operator` | Product lifecycle operations |
| **auditor** | Internal/external audit | - | `auditor` | Read-only all data, audit logs |
| **regulator** | Regulatory authority | - | `regulator` | Compliance data, audit trails |
| **service_center** | Authorized repair | SERVICE_CENTER (0x1083...) | `service_center` | Service records for authorized brands |
| **consumer** | End user/owner | KYC_BASIC (optional) | - | Public product info |

### Permission Matrix by Resource Type

| Resource | brand_admin | operator | auditor | regulator | service_center | consumer |
|----------|-------------|----------|---------|-----------|----------------|----------|
| DPP (full) | RW | R | R | R | - | - |
| DPP (public) | R | R | R | R | R | R |
| Ownership records | RW | R | R | R | - | - |
| Service history | R | R | R | R | RW | - |
| Audit trail | R | - | R | R | - | - |
| Compliance data | R | - | R | R | - | - |
| Customer PII | RW | R | - | - | - | - |

Legend: R=Read, W=Write, RW=Read/Write, -=No Access

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| On-chain RBAC | Custom role mapping | OpenZeppelin AccessControl | Audited, composable, well-documented |
| Role enumeration | Custom iteration | AccessControlEnumerable | Gas-efficient, built-in |
| Admin role security | Simple ownership | AccessControlDefaultAdminRules | 2-step transfer, mitigates risk |
| Merkle tree construction | Custom implementation | Trillian or OpenZeppelin MerkleProof | Production-proven, edge cases handled |
| Hash chaining | Custom chaining | Established patterns (CT logs) | Timing attacks, ordering issues |
| JWT validation | Custom parsing | jose/PyJWT with RS256/ES256 | Signature validation, claims extraction |
| Data retention scheduling | Custom scheduler | PostgreSQL partitioning + pg_cron | Native, reliable, ACID compliant |

**Key insight:** Access control and audit logging are security-critical. Use battle-tested libraries over custom implementations. The complexity is in policy, not code.

---

## Common Pitfalls

### Pitfall 1: Role Explosion

**What goes wrong:** Creating too many granular roles leads to management complexity
**Why it happens:** Trying to encode every permission combination as a role
**How to avoid:** Use RBAC for coarse-grained roles (5-10 max), use claims/attributes for fine-grained permissions
**Warning signs:** Role count exceeding 20; roles with single users; roles differing by single permission

### Pitfall 2: Audit Log Gaps During Failures

**What goes wrong:** Events not logged when on-chain transaction fails after off-chain write
**Why it happens:** Lack of saga/compensation pattern
**How to avoid:** Log "pending" state first, update to "completed" after on-chain confirmation; reconciliation job
**Warning signs:** Missing entries, orphaned off-chain events, inconsistent counts

### Pitfall 3: GDPR Erasure During AML Retention

**What goes wrong:** Deleting data that must be retained for AML compliance
**Why it happens:** Not checking retention obligations before erasure
**How to avoid:** Implement retention check as first step in erasure workflow; document refusal with legal basis
**Warning signs:** Audit findings, regulatory inquiries, incomplete records

### Pitfall 4: Caching Stale RBAC Data

**What goes wrong:** User retains access after role revocation due to cache
**Why it happens:** Long cache TTL, no invalidation on role change
**How to avoid:** Short TTL (5 minutes max), event-driven cache invalidation on role changes
**Warning signs:** Security incidents, delayed access revocation, inconsistent behavior

### Pitfall 5: Audit Log Tampering via Replay

**What goes wrong:** Attacker replays old audit entries to hide malicious actions
**Why it happens:** No sequence enforcement, weak timestamp validation
**How to avoid:** Strict sequence numbers, hash chain verification, reject out-of-order entries
**Warning signs:** Duplicate sequence numbers, hash chain breaks, timestamp anomalies

---

## Code Examples

### Example 1: On-Chain RBAC Interface

```solidity
// Source: OpenZeppelin AccessControl + Galileo extensions
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/**
 * @title IGalileoAccessControl
 * @notice RBAC framework for Galileo ecosystem
 * @dev Extends OpenZeppelin AccessControl with ONCHAINID integration
 */
interface IGalileoAccessControl is IAccessControlEnumerable {
    // ============ Role Constants ============

    /// @notice Brand administrator role
    /// @dev keccak256("BRAND_ADMIN_ROLE")
    function BRAND_ADMIN_ROLE() external pure returns (bytes32);

    /// @notice Operator role for day-to-day operations
    function OPERATOR_ROLE() external pure returns (bytes32);

    /// @notice Auditor role for read-only audit access
    function AUDITOR_ROLE() external pure returns (bytes32);

    /// @notice Regulator role for compliance access
    function REGULATOR_ROLE() external pure returns (bytes32);

    // ============ Role Management ============

    /**
     * @notice Grant role with ONCHAINID verification
     * @param role The role to grant
     * @param account The account to receive the role
     * @param identityAddress The ONCHAINID contract address
     * @param requiredClaimTopic The claim topic that must be verified
     */
    function grantRoleWithIdentity(
        bytes32 role,
        address account,
        address identityAddress,
        uint256 requiredClaimTopic
    ) external;

    /**
     * @notice Check if account has role AND valid identity claim
     * @param role The role to check
     * @param account The account to check
     * @return True if account has role and valid claim
     */
    function hasRoleWithIdentity(
        bytes32 role,
        address account
    ) external view returns (bool);

    // ============ Events ============

    event RoleGrantedWithIdentity(
        bytes32 indexed role,
        address indexed account,
        address indexed identityAddress,
        uint256 claimTopic
    );

    event RoleVerificationFailed(
        bytes32 indexed role,
        address indexed account,
        string reason
    );
}
```

### Example 2: Audit Log Entry Schema

```typescript
// Source: EPCIS 2.0 + Certificate Transparency patterns
import { z } from 'zod';

// Audit event types for Galileo ecosystem
export const AuditEventType = z.enum([
  // Access control events
  'ROLE_GRANTED',
  'ROLE_REVOKED',
  'PERMISSION_CHECKED',
  'ACCESS_DENIED',

  // Data lifecycle events
  'DATA_CREATED',
  'DATA_READ',
  'DATA_UPDATED',
  'DATA_DELETED',

  // CRAB model events
  'ENCRYPTION_KEY_CREATED',
  'ENCRYPTION_KEY_DESTROYED',
  'CONTENT_ORPHANED',

  // Compliance events
  'ERASURE_REQUESTED',
  'ERASURE_COMPLETED',
  'ERASURE_REFUSED',
  'RETENTION_PERIOD_STARTED',
  'RETENTION_PERIOD_EXPIRED',

  // System events
  'MERKLE_ANCHOR_CREATED',
  'HASH_CHAIN_VERIFIED',
  'RECONCILIATION_RUN'
]);

export const AuditLogEntrySchema = z.object({
  // Identification
  entryId: z.string().uuid(),
  sequenceNumber: z.bigint(),
  timestamp: z.string().datetime(),

  // Hash chain
  previousHash: z.string().regex(/^0x[a-f0-9]{64}$/),
  entryHash: z.string().regex(/^0x[a-f0-9]{64}$/),

  // Event content
  eventType: AuditEventType,

  // Actor information
  actor: z.object({
    type: z.enum(['user', 'service', 'system']),
    identifier: z.string(),  // DID, service account, 'system'
    role: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional()
  }),

  // Action details
  action: z.string(),

  // Resource information
  resource: z.object({
    type: z.string(),
    identifier: z.string(),  // DID, ID, etc.
    attributes: z.record(z.unknown()).optional()
  }),

  // Outcome
  outcome: z.enum(['success', 'failure', 'partial']),
  failureReason: z.string().optional(),

  // Additional metadata
  metadata: z.record(z.unknown()).optional(),

  // Merkle anchor reference (if anchored)
  merkleAnchor: z.object({
    anchorId: z.string(),
    leafIndex: z.bigint(),
    proofPath: z.array(z.string())
  }).optional()
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
```

### Example 3: GDPR-AML Retention Policy

```typescript
// Source: GDPR Art. 17, 5AMLD Art. 40, MiCA TFR
interface RetentionPolicy {
  dataCategory: DataCategory;
  minRetentionDays: number;
  maxRetentionDays: number | null;  // null = indefinite
  legalBasis: string;
  deletionTrigger: DeletionTrigger;
  canEraseOnRequest: boolean;
  eraseRefusalBasis?: string;
}

enum DataCategory {
  AML_KYC_RECORDS = 'aml_kyc_records',
  TRANSACTION_LOGS = 'transaction_logs',
  AUDIT_TRAIL = 'audit_trail',
  CUSTOMER_PII = 'customer_pii',
  PRODUCT_DATA = 'product_data',
  ENCRYPTION_KEYS = 'encryption_keys'
}

enum DeletionTrigger {
  RETENTION_EXPIRY = 'retention_expiry',
  ERASURE_REQUEST = 'erasure_request',
  LEGAL_HOLD_RELEASE = 'legal_hold_release',
  ACCOUNT_TERMINATION = 'account_termination'
}

const GALILEO_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataCategory: DataCategory.AML_KYC_RECORDS,
    minRetentionDays: 5 * 365,  // 5 years
    maxRetentionDays: 7 * 365,  // 7 years max
    legalBasis: '5AMLD Article 40, MiCA',
    deletionTrigger: DeletionTrigger.RETENTION_EXPIRY,
    canEraseOnRequest: false,
    eraseRefusalBasis: 'GDPR Art. 17(3)(b) - legal obligation'
  },
  {
    dataCategory: DataCategory.TRANSACTION_LOGS,
    minRetentionDays: 5 * 365,  // 5 years
    maxRetentionDays: 7 * 365,
    legalBasis: 'MiCA TFR 2023/1113',
    deletionTrigger: DeletionTrigger.RETENTION_EXPIRY,
    canEraseOnRequest: false,
    eraseRefusalBasis: 'GDPR Art. 17(3)(b) - legal obligation'
  },
  {
    dataCategory: DataCategory.AUDIT_TRAIL,
    minRetentionDays: 7 * 365,  // 7 years
    maxRetentionDays: 10 * 365,
    legalBasis: 'SOX compliance, regulatory requirement',
    deletionTrigger: DeletionTrigger.RETENTION_EXPIRY,
    canEraseOnRequest: false,
    eraseRefusalBasis: 'GDPR Art. 17(3)(b) - legal obligation'
  },
  {
    dataCategory: DataCategory.CUSTOMER_PII,
    minRetentionDays: 0,  // Can delete immediately if no other obligation
    maxRetentionDays: null,  // Kept until erasure request
    legalBasis: 'GDPR Art. 6(1)(b) - contract performance',
    deletionTrigger: DeletionTrigger.ERASURE_REQUEST,
    canEraseOnRequest: true  // Subject to AML retention check
  },
  {
    dataCategory: DataCategory.PRODUCT_DATA,
    minRetentionDays: 0,
    maxRetentionDays: null,  // Indefinite
    legalBasis: 'GDPR Art. 6(1)(f) - legitimate interest',
    deletionTrigger: DeletionTrigger.ACCOUNT_TERMINATION,
    canEraseOnRequest: false,  // Non-personal product data
    eraseRefusalBasis: 'Not personal data - provenance record'
  }
];
```

### Example 4: On-Chain/Off-Chain Sync Protocol

```typescript
// Source: Galileo HYBRID-ARCHITECTURE.md event sourcing protocol
interface SyncProtocol {
  /**
   * Write event to off-chain store first, then anchor on-chain.
   * Off-chain write MUST complete before on-chain emission.
   */
  writeEvent(event: LifecycleEvent): Promise<SyncResult>;

  /**
   * Verify consistency between on-chain hash and off-chain content.
   */
  verifyConsistency(productDID: string): Promise<ConsistencyResult>;

  /**
   * Reconcile discrepancies between on-chain and off-chain.
   */
  reconcile(productDID: string): Promise<ReconciliationResult>;
}

enum ConsistencyState {
  VERIFIED = 'verified',       // Hash matches
  MISMATCH = 'mismatch',       // Hash doesn't match
  ORPHANED = 'orphaned',       // On-chain hash, no off-chain content
  PENDING = 'pending',         // Off-chain only, not yet anchored
  UNKNOWN = 'unknown'          // Cannot determine
}

async function writeEventWithSync(
  event: LifecycleEvent
): Promise<SyncResult> {
  // 1. Prepare off-chain content
  const content = canonicalizeEvent(event);
  const contentHash = sha256(content);

  // 2. Write to off-chain store FIRST
  const offChainResult = await eventStore.appendToStream(
    event.productDID,
    content
  );

  if (!offChainResult.success) {
    // Off-chain write failed - DO NOT proceed to on-chain
    return {
      state: 'failed',
      stage: 'off_chain_write',
      error: offChainResult.error
    };
  }

  // 3. Emit on-chain event with hash
  try {
    const tx = await productContract.emitLifecycleEvent(
      event.productDID,
      event.eventType,
      contentHash,
      Math.floor(Date.now() / 1000)
    );
    await tx.wait();

    // 4. Update index with link
    await indexer.link(contentHash, offChainResult.eventId);

    return {
      state: 'synced',
      contentHash,
      offChainEventId: offChainResult.eventId,
      onChainTxHash: tx.hash
    };

  } catch (onChainError) {
    // On-chain failed but off-chain succeeded
    // Mark for retry - content is safe
    return {
      state: 'pending_anchor',
      contentHash,
      offChainEventId: offChainResult.eventId,
      retryable: true
    };
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Simple Ownable pattern | OpenZeppelin AccessControl | 2020+ | Composable RBAC, role hierarchy |
| Flat log files | Hash-chain backed logs | 2017+ (CT) | Tamper evidence, Merkle proofs |
| Delete on request | Retention-aware erasure | GDPR 2018, AML 2020 | Legal basis checking required |
| On-chain first | Off-chain first + anchor | 2022+ | GDPR compliance, scalability |
| Roles only | Roles + Claims (hybrid) | 2023+ | Fine-grained, context-aware |

**Deprecated/outdated:**

- **Ownable for complex access:** Use AccessControl for multi-role scenarios
- **Storing full audit logs on-chain:** Store only hashes/anchors; too expensive and privacy risk
- **Immediate deletion on GDPR request:** Must check AML retention period first
- **Single consistency model:** Use eventual consistency for reads, strong for writes

---

## Regulatory Requirements Summary

### GDPR vs AML Conflict Resolution

| Scenario | GDPR Requirement | AML Requirement | Resolution |
|----------|------------------|-----------------|------------|
| Erasure request during AML retention | Delete personal data | Retain 5 years | Refuse erasure per Art. 17(3)(b) |
| Post-retention erasure request | Delete within 30 days | No longer applicable | Honor erasure request |
| Anonymization request | Reduce to non-personal | May need original | Pseudonymize, retain encrypted |

**Key Legal Basis:** GDPR Article 17(3)(b) - Right to erasure does not apply when processing is necessary for compliance with legal obligations (AML/5AMLD).

### MiCA CASP Requirements (from 2025)

| Requirement | Specification | Galileo Implementation |
|-------------|---------------|----------------------|
| Order book records | JSON format per EU 2025/416 | Off-chain storage with hash anchor |
| Transaction records | Per EU 2025/1140 | EPCIS 2.0 event format |
| Audit trail | Version control, complete history | Hash-chain backed log |
| Reporting | Machine-readable, standardized | JSON schema compliance |

---

## Open Questions

Things that couldn't be fully resolved:

1. **On-Chain vs Off-Chain Role Storage Boundary**
   - What we know: Privileged actors (brands, service centers) need on-chain claims
   - What's unclear: Should all role assignments have on-chain record, or only grants?
   - Recommendation: On-chain for grants/revocations of privileged roles; off-chain for consumer roles

2. **Merkle Anchor Frequency**
   - What we know: More frequent = more gas cost; less frequent = larger proof window
   - What's unclear: Optimal frequency for Galileo's transaction volume
   - Recommendation: Start with daily anchoring, adjust based on volume

3. **Cross-Jurisdiction Retention Conflicts**
   - What we know: Different jurisdictions have different retention periods
   - What's unclear: How to handle user with data subject to multiple retention regimes
   - Recommendation: Apply longest applicable retention period; document in specification

---

## Sources

### Primary (HIGH confidence)
- [OpenZeppelin Access Control Docs](https://docs.openzeppelin.com/contracts/5.x/api/access) - RBAC implementation patterns
- [OpenZeppelin AccessControl.sol Source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol) - Contract implementation
- [Trillian - Open Source Append-Only Ledger](https://transparency.dev/) - Merkle tree log infrastructure
- Galileo HYBRID-ARCHITECTURE.md - CRAB model, event sourcing protocol
- Galileo access-control.md - JWT patterns, role definitions
- Galileo claim-topics.md - ONCHAINID claim topics

### Secondary (MEDIUM confidence)
- [GDPR vs AML Compliance Guide](https://gdprlocal.com/gdpr-vs-aml/) - Conflict resolution
- [MiCA CASP Requirements](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica) - Regulatory requirements
- [NIST IR 8403 Blockchain for Access Control](https://nvlpubs.nist.gov/nistpubs/ir/2022/NIST.IR.8403.pdf) - RBAC on blockchain patterns
- [Immutable Audit Log Architecture](https://www.emergentmind.com/topics/immutable-audit-log) - Hash chain patterns
- [EPCIS 2.0 Standard](https://www.gs1.org/standards/epcis) - Event format for traceability

### Tertiary (LOW confidence - needs validation)
- [RBAC vs ABAC 2025](https://www.osohq.com/learn/rbac-vs-abac-vs-pbac) - Access control model evolution
- WebSearch results on MiCA JSON schemas - Specs still being finalized
- EU DPP registry audit requirements - Not yet published

---

## Metadata

**Confidence breakdown:**
- RBAC framework: HIGH - OpenZeppelin well-documented, existing Galileo patterns established
- Audit trail: HIGH - Certificate Transparency provides proven patterns
- Data retention: HIGH - GDPR/AML legal framework well-established
- Hybrid storage sync: HIGH - Already specified in HYBRID-ARCHITECTURE.md

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (monitor for MiCA implementing regulations, ESMA JSON schema updates)

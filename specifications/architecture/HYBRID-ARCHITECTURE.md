# Hybrid On-Chain/Off-Chain Architecture Specification

**Version:** 1.0.0
**Status:** Draft
**Last Updated:** 2026-01-30
**Requirement:** FOUND-01 (Architecture Document)

---

## 1. Overview

### 1.1 Purpose

This specification defines the foundational data boundaries that enable the Galileo Luxury Standard to operate on blockchain while maintaining full GDPR compliance. It establishes a strict separation between immutable on-chain records and erasable off-chain storage, ensuring that the right to erasure (GDPR Article 17) can always be honored.

### 1.2 Regulatory Basis

This architecture is designed to comply with **EDPB Guidelines 02/2025** on the processing of personal data through blockchain technologies. These guidelines represent the authoritative EU regulatory position on GDPR-blockchain compatibility.

Key regulatory requirements addressed:
- GDPR Article 17: Right to erasure ("right to be forgotten")
- GDPR Article 5(1)(e): Storage limitation principle
- GDPR Article 25: Data protection by design and by default
- EDPB Guidelines 02/2025: Blockchain-specific compliance guidance

### 1.3 Core Principle

> **"When in doubt, store off-chain."**

The hybrid architecture follows a conservative approach: any data that could potentially be linked to a natural person MUST be stored off-chain in erasable storage. On-chain storage is reserved exclusively for non-personal references, hashes, and boolean attestation results.

This is not merely a recommendation; it is a mandatory design constraint for GDPR compliance.

---

## 2. Data Classification Matrix

### 2.1 On-Chain Data (Immutable)

The following data types MAY be stored on-chain because they cannot identify a natural person:

| Data Element | Description | Example | Rationale |
|--------------|-------------|---------|-----------|
| Product DID | Hash-based reference only | `did:galileo:01:09506000134352:21:ABC123` | Identifies product, not person |
| Content Hash | SHA-256 of off-chain content | `0x7a3b5c...` | Integrity verification only |
| Ownership Address | Blockchain wallet address | `0x1234...abcd` | Pseudonymous, not personal |
| Compliance Boolean | Attestation result (pass/fail) | `true` / `false` | No personal details |
| Timestamp | Block timestamp | `1738234800` | Event timing only |
| Claim Topic ID | Numeric reference to claim type | `10001` (age verification) | Reference only, not content |
| Event Type Enum | Lifecycle state | `created`, `transferred`, `serviced`, `decommissioned` | Category only |

### 2.2 Off-Chain Data (Erasable)

The following data types MUST be stored off-chain because they contain or could reveal personal information:

| Data Element | Description | Contains PII | Erasure Required |
|--------------|-------------|--------------|------------------|
| Full DPP Content | Materials, sustainability, origin | Potentially (artisan attribution) | Yes |
| Lifecycle Event Details | Repair notes, service records | Yes (customer interactions) | Yes |
| Customer Purchase Data | Name, address, preferences | Yes (direct PII) | Yes |
| Artisan/Creator Information | Craftsperson attribution | Yes (names, photos) | Yes |
| KYC/KYB Documents | Identity verification evidence | Yes (identity documents) | Yes |
| Scanned Certificates | Authenticity certificates | Potentially (signatures) | Yes |
| Claim Content | W3C Verifiable Credentials | Yes (subject information) | Yes |
| Images and Media | Product and person photographs | Potentially (faces) | Yes |

### 2.3 Explicitly Prohibited On-Chain

The following data types are **NEVER permitted on-chain**, regardless of encryption or hashing:

| Prohibited Data | Reason | GDPR Basis |
|-----------------|--------|------------|
| Natural person names | Direct identifier | Art. 4(1) |
| Physical addresses | Direct identifier | Art. 4(1) |
| Email addresses | Direct identifier | Art. 4(1) |
| Phone numbers | Direct identifier | Art. 4(1) |
| Photographs of individuals | Biometric data potential | Art. 9 |
| Government ID numbers | Direct identifier | Art. 4(1) |
| Date of birth | Indirect identifier | Art. 4(1) |
| **Encrypted PII** | Still personal data under GDPR | Recital 26 |
| **Hashed PII** | Still personal data under GDPR | Recital 26 |

**Critical Note on Encryption and Hashing:**

> Encrypted or hashed personal data remains personal data under GDPR. The EDPB explicitly states: "Encrypted or hashed data remains personal data under GDPR." Encryption is a security measure, not an anonymization technique. If the data can be re-linked to a natural person (even theoretically), it is still personal data.

---

## 3. EDPB Guidelines 02/2025 Compliance Checklist

### 3.1 Implementation Checklist

Use this checklist to verify GDPR compliance for any Galileo Luxury Standard implementation:

**Data Storage:**
- [ ] No personal data stored directly on blockchain
- [ ] All PII resides in erasable off-chain storage
- [ ] Hash-to-content mapping enables orphaning for erasure
- [ ] Content hashes do not contain embedded personal data

**Data Subject Rights:**
- [ ] Right to access: Can provide all stored data to subject
- [ ] Right to rectification: Can correct off-chain data
- [ ] Right to erasure: Can delete within 30 days (GDPR standard)
- [ ] Right to portability: Can export in machine-readable format

**Legal Basis:**
- [ ] Legal basis documented for each processing operation
- [ ] Consent obtained where required (not legitimate interest overreach)
- [ ] Purpose limitation respected (no scope creep)

**Accountability:**
- [ ] DPIA completed for blockchain processing
- [ ] Controller/processor relationships defined for node operators
- [ ] Records of processing activities maintained
- [ ] DPO consulted (if applicable)

**Technical Measures:**
- [ ] "Technical impossibility" NOT used as compliance defense
- [ ] Off-chain storage supports deletion within GDPR timelines
- [ ] Audit trail of deletions maintained
- [ ] Encryption keys can be selectively destroyed

### 3.2 Key EDPB Statements

The following direct quotes from EDPB Guidelines 02/2025 govern this architecture:

> "The EDPB recommends not storing personal data directly in a blockchain at all."

This is not optional guidance; implementations MUST follow this recommendation.

> "Technical impossibility is not a justification for disregarding the rights of data subjects."

Claims that blockchain immutability prevents GDPR compliance are invalid. If the architecture cannot comply, it must not store personal data.

> "Encrypted or hashed data remains personal data under GDPR."

Encryption and hashing are security measures, not anonymization. Encrypted PII on-chain is still personal data on-chain.

> "A data protection impact assessment (DPIA) is required for blockchain processing of personal data."

Any implementation processing personal data through blockchain technology requires a DPIA before deployment.

### 3.3 Controller/Processor Considerations

EDPB Guidelines 02/2025 raise important questions about liability:

| Role | Responsibility | Galileo Context |
|------|----------------|-----------------|
| Data Controller | Determines purposes and means | Brand registering products |
| Data Processor | Processes on behalf of controller | Node operators, resolver services |
| Joint Controllers | Jointly determine purposes | Consortium members (potential) |

**Recommendation:** Legal review required for consortium liability model. Node operators in a permissioned network may be considered joint controllers under EDPB interpretation.

---

## 4. CRAB Model (Create-Read-Append-Burn)

### 4.1 Model Overview

The CRAB model enables right-to-erasure compliance while maintaining blockchain integrity:

| Operation | Description | GDPR Relevance |
|-----------|-------------|----------------|
| **C**reate | Store PII off-chain, reference (hash) on-chain | Data minimization |
| **R**ead | Access via hash lookup | Right to access |
| **A**ppend | New events add new hashes (no mutation) | Accurate records |
| **B**urn | Delete off-chain content + destroy encryption key | Right to erasure |

### 4.2 Erasure Request Flow

When a data subject exercises their right to erasure (GDPR Article 17):

```
Erasure Request Flow:

1. RECEIVE REQUEST
   - Data subject submits deletion request
   - Verify identity and right to request
   - Document request receipt timestamp

2. LOCATE DATA
   - Query on-chain hash references for subject
   - Map hashes to off-chain content IDs
   - Identify all affected off-chain records

3. DELETE OFF-CHAIN CONTENT
   - Remove PII from off-chain storage
   - Remove from all backup locations
   - Remove from any caches

4. DESTROY ENCRYPTION KEY (if CRAB encryption used)
   - Locate encryption key in HSM/key store
   - Execute secure key destruction
   - Remove key from all backup locations

5. ORPHAN ON-CHAIN REFERENCES
   - On-chain hash now points to nothing
   - Hash becomes meaningless without content
   - Blockchain integrity preserved

6. AUDIT LOGGING
   - Log key destruction event
   - Log off-chain deletion confirmation
   - Maintain audit trail (non-PII)

7. CONFIRM TO DATA SUBJECT
   - Notify completion within GDPR timeline
   - Document compliance evidence
```

### 4.3 Key Destruction Requirements

When CRAB encryption is used, key destruction is the final guarantor of erasure:

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| Key Storage | HSM-based key management recommended | Secure destruction capability |
| Destruction Method | Cryptographic erasure (overwrite, not just delete) | Prevent recovery |
| Backup Keys | ALL backup copies must be destroyed | Complete erasure |
| Audit Trail | Key destruction must be auditable | Compliance evidence |
| Time Limit | 30 days from valid request | GDPR standard timeline |
| Verification | Independent verification of destruction | Accountability |

### 4.4 Orphaned Hash State

After successful erasure:

```
BEFORE ERASURE:
+------------------+          +------------------+
| On-Chain         |  --ref-> | Off-Chain        |
| Hash: 0x7a3b5c   |          | PII Content      |
+------------------+          +------------------+

AFTER ERASURE:
+------------------+          +------------------+
| On-Chain         |  --ref-> | [DELETED]        |
| Hash: 0x7a3b5c   |          |                  |
+------------------+          +------------------+
       |
       v
  Orphaned: points to nothing
  Blockchain intact
  PII erased
```

The on-chain hash remains (blockchain immutability preserved), but it now references nothing. Without the off-chain content and/or encryption key, the hash is meaningless data.

### 4.5 Limitations and Considerations

| Consideration | Impact | Mitigation |
|---------------|--------|------------|
| Hash cannot be removed | Blockchain immutability | Acceptable - orphaned hash is not personal data |
| Metadata leakage | Timestamps, addresses remain | Design to minimize metadata; addresses are pseudonymous |
| Proof of deletion | Cannot prove negative | Maintain audit trail of deletion actions |
| Third-party copies | Others may have cached content | Erasure obligations extend to processors |

---

*Document continues in subsequent sections (Event Sourcing Protocol, Component Diagrams, Implementation Notes)*

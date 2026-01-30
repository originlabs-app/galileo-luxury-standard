# Phase 2: Architecture Foundation - Research

**Researched:** 2026-01-30
**Domain:** Hybrid blockchain architecture, W3C DID, post-quantum cryptography
**Confidence:** HIGH (EDPB guidelines, NIST standards, W3C specifications verified)

## Summary

This research addresses the three core requirements of Phase 2: hybrid on-chain/off-chain architecture for GDPR compliance (FOUND-01), W3C DID-based product identity schema (FOUND-02), and crypto-agile specification for post-quantum readiness (FOUND-06).

The EDPB Guidelines 02/2025 have definitively established that personal data must NOT be stored on-chain, and that "technical impossibility" is not a justification for non-compliance. This mandates a strict hybrid architecture where blockchain stores only non-personal references, hashes, and attestation results, while all PII resides in erasable off-chain storage. The existing ERC-3643 ONCHAINID pattern already follows this model with claims stored off-chain by Claim Issuers.

For product identity, W3C DID v1.0 is the stable specification (v1.1 is experimental and NOT recommended for implementation). DIDs explicitly support physical products and "things" as subjects. For Galileo, a custom DID method (`did:galileo`) or `did:web` anchored to the resolver domain provides the right balance of decentralization and practical operation.

Post-quantum cryptography requires a crypto-agile architecture NOW, with NIST FIPS 203/204/205 providing the target algorithms (ML-KEM, ML-DSA, SLH-DSA). The recommended approach is hybrid signatures (classical + PQC) with configuration-based algorithm rotation.

**Primary recommendation:** Define strict on-chain/off-chain data boundaries using event sourcing pattern, implement W3C DID for product identity with service endpoints pointing to off-chain DPP data, and abstract all cryptographic operations behind interfaces to enable PQC migration.

## Standard Stack

The established standards and specifications for this domain:

### Core Standards

| Standard | Version | Purpose | Why Standard |
|----------|---------|---------|--------------|
| **W3C DID Core** | v1.0 (July 2022) | Decentralized identifiers for products | W3C Recommendation, explicitly supports "things" |
| **W3C Verifiable Credentials** | v2.0 | Off-chain claims about products/participants | Interoperable credential format |
| **EDPB Guidelines 02/2025** | April 2025 | GDPR-blockchain compliance | Authoritative EU regulatory guidance |
| **ERC-3643** | Latest | Permissioned token with identity layer | Industry standard for regulated assets |
| **NIST FIPS 203** | August 2024 | ML-KEM (post-quantum key encapsulation) | NIST standardized |
| **NIST FIPS 204** | August 2024 | ML-DSA (post-quantum digital signatures) | NIST standardized |
| **NIST FIPS 205** | August 2024 | SLH-DSA (hash-based signatures backup) | NIST standardized |

### DID Methods Comparison

| Method | Decentralization | Cost | Maturity | Recommendation |
|--------|------------------|------|----------|----------------|
| **did:web** | Low (DNS-based) | Low | HIGH | Good for enterprise, self-hosted resolver |
| **did:ethr** | High (Ethereum) | High (gas) | HIGH | Strong verification, ERC-1056 based |
| **did:key** | N/A (ephemeral) | None | HIGH | Testing only, no key rotation |
| **did:ebsi** | Medium (EBSI) | Low | MEDIUM | EU cross-border, limited scope |

**Recommendation for Galileo:** Custom `did:galileo` method that combines:
- Web-based resolution (like did:web) for practical operation
- On-chain anchoring (like did:ethr) for tamper-evident product registry
- Service endpoints pointing to GS1 resolver and off-chain DPP storage

### Reference Architectures

| Architecture | Use Case | Key Pattern |
|--------------|----------|-------------|
| **EBSI** | EU cross-border credentials | W3C DID + VC + Hyperledger Besu |
| **ONCHAINID** | ERC-3643 identity | Off-chain claims, on-chain references |
| **Hyperledger Fabric PDC** | Private data collections | Hash on-chain, data off-chain |

## Architecture Patterns

### Pattern 1: EDPB-Compliant Hybrid Storage

**What:** Strict separation between on-chain immutable records and off-chain erasable storage
**When to use:** Always, for any data that could be linked to a natural person
**Source:** EDPB Guidelines 02/2025

```
ON-CHAIN (Immutable)                    OFF-CHAIN (Erasable)
+---------------------------+           +---------------------------+
| - Product DID (hash)      |           | - Full DPP content        |
| - Content hash (SHA-256)  |  <-ref->  | - Lifecycle event details |
| - Ownership address       |           | - Customer purchase data  |
| - Compliance boolean      |           | - Artisan/creator PII     |
| - Timestamp              |           | - KYC documents           |
| - Claim topic IDs         |           | - Scanned certificates    |
+---------------------------+           +---------------------------+
        |                                        |
        v                                        v
  Cannot be modified                    Can be deleted (GDPR Art.17)
```

**EDPB Key Guidance:**
- "Technical impossibility is not a justification for disregarding the rights of data subjects"
- "The EDPB recommends not storing personal data directly in a blockchain at all"
- Encrypted/hashed data remains personal data under GDPR
- DPIA is mandatory for blockchain processing of personal data

### Pattern 2: CRAB Model for Right to Erasure

**What:** Create-Read-Append-Burn model where encryption keys are destroyed to render on-chain references meaningless
**When to use:** When on-chain references to off-chain personal data cannot be avoided
**Source:** CNIL, EDPB

```
Erasure Request Flow:
1. Data subject requests deletion
2. Delete PII from off-chain store
3. Destroy encryption key (if CRAB)
4. On-chain hash becomes orphaned (points to nothing)
5. Confirm data is inaccessible
```

**Implementation Notes:**
- Key management must support selective key destruction
- Audit trail of key destruction required
- Hash remains on-chain but is now meaningless

### Pattern 3: Event Sourcing for Hybrid Sync

**What:** On-chain events are the authoritative log; off-chain storage is a derived projection
**When to use:** Synchronizing hybrid on-chain/off-chain data
**Source:** ARCHITECTURE.md research

```
Event Flow:
1. Action occurs (product created, transferred, serviced)
2. Off-chain store updated with full details
3. Content hash computed
4. On-chain event emitted with hash + metadata
5. Off-chain indexer listens to on-chain events
6. Sync verified by hash comparison

Source of Truth Hierarchy:
- On-chain: Transfer of ownership, compliance attestations
- Off-chain: Full content, PII, deletable records
- Conflict: On-chain wins for ownership; off-chain wins for content
```

### Pattern 4: W3C DID Document for Products

**What:** DID document structure for physical luxury products
**Source:** W3C DID Core v1.0

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "did:galileo:01:09506000134352:21:ABC123",
  "controller": "did:galileo:brand:hermesparis",
  "verificationMethod": [{
    "id": "did:galileo:01:09506000134352:21:ABC123#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:galileo:brand:hermesparis",
    "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  }],
  "service": [{
    "id": "did:galileo:01:09506000134352:21:ABC123#dpp",
    "type": "DigitalProductPassport",
    "serviceEndpoint": "https://resolver.galileo.luxury/dpp/09506000134352/ABC123"
  }, {
    "id": "did:galileo:01:09506000134352:21:ABC123#trace",
    "type": "TraceabilityService",
    "serviceEndpoint": "https://resolver.galileo.luxury/trace/09506000134352/ABC123"
  }, {
    "id": "did:galileo:01:09506000134352:21:ABC123#verify",
    "type": "AuthenticityVerification",
    "serviceEndpoint": "https://resolver.galileo.luxury/verify/09506000134352/ABC123"
  }]
}
```

**DID Syntax for Galileo Products:**
```
did:galileo:<ai>:<identifier>:<serial>

Examples:
did:galileo:01:09506000134352:21:ABC123    (GTIN + Serial)
did:galileo:brand:hermesparis              (Brand DID)
did:galileo:retailer:24sevres              (Retailer DID)
```

### Pattern 5: Crypto-Agile Signature Architecture

**What:** Abstract signature verification behind interfaces to enable algorithm migration
**When to use:** All cryptographic operations that may need future upgrade
**Source:** NIST guidance, Ethereum roadmap

```typescript
// Abstract interface for crypto-agility
interface ISignatureVerifier {
  verify(hash: bytes32, signature: bytes, publicKey: bytes): boolean;
  algorithmId(): string;  // e.g., "ECDSA-secp256k1", "ML-DSA-65"
}

interface IKeyEncapsulation {
  encapsulate(publicKey: bytes): { ciphertext: bytes, sharedSecret: bytes };
  decapsulate(ciphertext: bytes, privateKey: bytes): bytes;
  algorithmId(): string;  // e.g., "ECDH-X25519", "ML-KEM-768"
}

// Registry pattern for algorithm selection
interface ICryptoRegistry {
  getVerifier(algorithmId: string): ISignatureVerifier;
  getKEM(algorithmId: string): IKeyEncapsulation;
  supportedAlgorithms(): string[];
}
```

**Hybrid Signature Pattern (2026-2030 Transition):**
```
Current (2026):     ECDSA alone
Transition (2027):  ECDSA + ML-DSA (both required)
Target (2030+):     ML-DSA alone (quantum-safe)
```

### Anti-Patterns to Avoid

- **PII on-chain:** Never store names, addresses, or any human-linkable data on blockchain
- **Single-algorithm commitment:** Never hardcode cryptographic algorithms; always use abstraction
- **Hash as anonymization:** Hashed PII is still personal data under GDPR
- **Sync without event sourcing:** Polling-based sync creates race conditions and data loss
- **Encryption without key rotation:** Static encryption keys become liabilities

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Product DID resolution | Custom resolver | W3C DID + GS1 Digital Link | Standards interoperability |
| Identity claims | Custom KYC storage | ONCHAINID + W3C VC | ERC-3643 native, audited |
| Post-quantum signatures | Custom PQC library | liboqs / @noble/post-quantum | NIST-validated algorithms |
| Hybrid sync | Custom event polling | Event sourcing pattern | Proven pattern, handles failures |
| Key destruction for erasure | Custom key mgmt | HSM with revocation | Security-critical operation |
| Compliance rules | Hardcoded logic | ERC-3643 modular compliance | Extensible, audited |

**Key insight:** The architecture phase defines interfaces and patterns, not implementations. Leverage existing standards (W3C DID, ERC-3643, NIST PQC) rather than inventing new ones.

## Common Pitfalls

### Pitfall 1: GDPR "Technical Impossibility" Defense

**What goes wrong:** Assuming blockchain immutability excuses non-compliance with erasure requests
**Why it happens:** Misunderstanding of EDPB position; assumption that hashing/encryption provides compliance
**How to avoid:** Design with EDPB 02/2025 guidance from the start; strict on-chain/off-chain separation
**Warning signs:** Any personal data in blockchain schema; no erasure workflow documented

### Pitfall 2: DID Method Lock-in

**What goes wrong:** Choosing a DID method that doesn't support the product lifecycle needs
**Why it happens:** Selecting based on blockchain preference rather than use case requirements
**How to avoid:** Use DID method rubric evaluation; prioritize: key rotation, service endpoints, controller delegation
**Warning signs:** did:key for production (no rotation); did:ethr only (high gas costs)

### Pitfall 3: Crypto-Agility as Afterthought

**What goes wrong:** Hardcoded cryptographic algorithms that require code changes to upgrade
**Why it happens:** Treating PQC as "future problem"; underestimating migration timeline
**How to avoid:** Abstract crypto from day one; use configuration-based algorithm selection
**Warning signs:** Direct calls to secp256k1/ECDSA without abstraction layer

### Pitfall 4: Hash Collision in Product Identity

**What goes wrong:** Product DID collision when using only content hash without unique identifier
**Why it happens:** Assuming content-addressable IDs are unique; ignoring GS1 standards
**How to avoid:** Use GS1 GTIN + serial as base identifier; content hash for integrity only
**Warning signs:** DID contains only hash; no GS1 Application Identifiers in scheme

### Pitfall 5: On-Chain Storage for "Small" Data

**What goes wrong:** Storing "just a little" data on-chain that turns out to be PII
**Why it happens:** Incremental scope creep; "optimization" by reducing off-chain lookups
**How to avoid:** Hard rule: if in doubt, store off-chain; legal review for any on-chain schema
**Warning signs:** Schema fields beyond: hash, timestamp, address, boolean, enum

## Code Examples

### DID Document Resolution

```typescript
// Source: W3C DID Core v1.0
interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didResolutionMetadata: {
    contentType?: string;
    error?: 'invalidDid' | 'notFound' | 'representationNotSupported';
  };
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
    versionId?: string;
  };
}

// Galileo DID resolver
async function resolveDID(did: string): Promise<DIDResolutionResult> {
  const parsed = parseDID(did);  // did:galileo:01:GTIN:21:SERIAL

  if (parsed.method !== 'galileo') {
    return { didDocument: null, didResolutionMetadata: { error: 'invalidDid' } };
  }

  // Check on-chain registry for product existence
  const onChainRecord = await productRegistry.getProduct(parsed.gtin, parsed.serial);
  if (!onChainRecord) {
    return { didDocument: null, didResolutionMetadata: { error: 'notFound' } };
  }

  // Construct DID document with service endpoints
  return {
    didDocument: buildDIDDocument(parsed, onChainRecord),
    didResolutionMetadata: { contentType: 'application/did+json' },
    didDocumentMetadata: {
      created: onChainRecord.createdAt,
      updated: onChainRecord.lastModified,
      versionId: onChainRecord.contentHash
    }
  };
}
```

### Hybrid Storage Event Sourcing

```typescript
// Source: Event sourcing pattern for hybrid architecture
interface ProductEvent {
  eventType: 'created' | 'transferred' | 'serviced' | 'decommissioned';
  productDID: string;
  contentHash: string;  // SHA-256 of off-chain content
  timestamp: number;
  emitter: string;      // Address that emitted event
}

// On-chain event emission
async function emitProductEvent(
  product: ProductData,
  eventType: string
): Promise<TransactionReceipt> {
  // 1. Store full content off-chain
  const offChainId = await offChainStore.save(product);

  // 2. Compute content hash
  const contentHash = sha256(JSON.stringify(product));

  // 3. Emit on-chain event (only hash, no PII)
  const tx = await productContract.emitEvent(
    product.did,
    eventType,
    contentHash
  );

  // 4. Index for off-chain retrieval
  await offChainIndex.link(contentHash, offChainId);

  return tx;
}
```

### Crypto-Agile Signature Verification

```typescript
// Source: Crypto-agility pattern
class CryptoRegistry implements ICryptoRegistry {
  private verifiers: Map<string, ISignatureVerifier> = new Map();

  register(verifier: ISignatureVerifier): void {
    this.verifiers.set(verifier.algorithmId(), verifier);
  }

  getVerifier(algorithmId: string): ISignatureVerifier {
    const verifier = this.verifiers.get(algorithmId);
    if (!verifier) throw new Error(`Unsupported algorithm: ${algorithmId}`);
    return verifier;
  }
}

// Current ECDSA verifier
class ECDSAVerifier implements ISignatureVerifier {
  algorithmId(): string { return 'ECDSA-secp256k1'; }
  verify(hash: bytes32, sig: bytes, pubKey: bytes): boolean {
    return ecrecover(hash, sig) === pubKey;
  }
}

// Future ML-DSA verifier (drop-in replacement)
class MLDSAVerifier implements ISignatureVerifier {
  algorithmId(): string { return 'ML-DSA-65'; }
  verify(hash: bytes32, sig: bytes, pubKey: bytes): boolean {
    // FIPS 204 ML-DSA verification
    return mldsaVerify(hash, sig, pubKey);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store all data on-chain | Hybrid with off-chain PII | EDPB 02/2025 | Mandatory for GDPR |
| Custom identity systems | W3C DID + Verifiable Credentials | 2022 (W3C Rec) | Interoperability |
| ECDSA-only signatures | Crypto-agile with PQC path | NIST Aug 2024 | 10-15 year migration |
| Content-addressable IDs | GS1 Digital Link + DID | GS1 2024 | ESPR compliance |
| Kyber/Dilithium names | ML-KEM/ML-DSA (FIPS) | Aug 2024 | Use new names |

**Deprecated/outdated:**
- **Kyber/Dilithium algorithm names:** Renamed to ML-KEM/ML-DSA in final FIPS
- **did:ethr as primary method:** Gas costs prohibitive for high-volume product registration
- **DID v1.1:** Experimental, W3C explicitly says "DO NOT implement"
- **Hash as anonymization defense:** EDPB confirms hashed PII is still personal data

## Open Questions

Things that couldn't be fully resolved:

1. **Custom DID Method Registration**
   - What we know: W3C has DID Methods Working Group forming in 2025
   - What's unclear: Timeline for `did:galileo` formal registration
   - Recommendation: Proceed with method design; formal registration can follow

2. **EBSI Integration Path**
   - What we know: EBSI uses W3C DID + VC, 40 nodes across EU
   - What's unclear: How Galileo products could federate with EBSI credentials
   - Recommendation: Design compatible but don't depend on EBSI integration

3. **PQC Timeline for Ethereum**
   - What we know: Ethereum Foundation ZKnox project exploring PQC
   - What's unclear: When native PQC support arrives
   - Recommendation: Use ERC-4337 for custom signature schemes now

4. **Joint Controller Liability**
   - What we know: EDPB suggests node operators could be joint controllers
   - What's unclear: Practical enforcement approach for permissioned networks
   - Recommendation: Legal review of consortium liability model required

5. **HQC Standardization**
   - What we know: Selected as backup KEM in March 2025
   - What's unclear: Final standard expected early 2026
   - Recommendation: Plan for ML-KEM primary, HQC as future alternative

## Sources

### Primary (HIGH confidence)

- **W3C DID Core v1.0** - https://www.w3.org/TR/did-1.0/ - Stable recommendation for DID structure
- **EDPB Guidelines 02/2025** - https://www.edpb.europa.eu/our-work-tools/documents/public-consultations/2025/guidelines-022025-processing-personal-data_en - GDPR-blockchain guidance
- **NIST FIPS 203/204/205** - https://csrc.nist.gov/pubs/fips/203/final - Post-quantum cryptography standards
- **ERC-3643 Official** - https://docs.erc3643.org/ - Identity registry and compliance architecture

### Secondary (MEDIUM confidence)

- **EBSI Architecture** - https://hub.ebsi.eu/arch-req - EU blockchain infrastructure patterns
- **W3C DID Methods Comparison** - https://iiw.idcommons.net/13D/ - IIW evaluation of 7 DID methods
- **IBM Crypto-Agility** - https://www.ibm.com/quantum/blog/crypto-agility - Practical crypto-agility patterns
- **Palo Alto PQC Strategy** - https://hbr.org/sponsored/2026/01/why-your-post-quantum-cryptography-strategy-must-start-now - 2026 playbook

### Tertiary (LOW confidence, needs validation)

- **ZKnox project timeline** - Ethereum Foundation PQC initiative, no firm dates
- **HQC final standard date** - Expected early 2026, draft pending
- **EBSI governance evolution** - EUROPEUM-EDIC forming, production timeline unclear

## Metadata

**Confidence breakdown:**
- Hybrid architecture: HIGH - EDPB 02/2025 provides definitive guidance
- W3C DID patterns: HIGH - W3C Recommendation, EBSI production use
- PQC standards: HIGH - NIST FIPS finalized, algorithms named
- Crypto-agility patterns: MEDIUM - Best practices emerging, no single standard
- DID method selection: MEDIUM - Trade-offs documented, `did:galileo` design pending

**Research date:** 2026-01-30
**Valid until:** 2026-03-30 (60 days - stable domain with EDPB guidelines settled)

---

## Architecture Document Deliverables (for Planner)

Based on this research, Phase 2 should produce:

### FOUND-01: Architecture Document

1. **On-Chain/Off-Chain Data Boundary Specification**
   - Data classification matrix (what goes where)
   - EDPB 02/2025 compliance checklist
   - CRAB model implementation guide

2. **Event Sourcing Protocol**
   - Source of truth hierarchy
   - Sync verification protocol
   - Failure handling procedures

3. **Component Interaction Diagrams**
   - GS1 Resolver <-> DID Resolver
   - Token Contract <-> Identity Registry
   - Off-Chain Store <-> On-Chain Events

### FOUND-02: Product Identity Schema (W3C DID)

1. **`did:galileo` Method Specification**
   - DID syntax with GS1 AI integration
   - Resolution protocol
   - Controller and verification methods

2. **DID Document Schema**
   - Required and optional properties
   - Service endpoint types
   - Verification relationships

3. **Product-to-DID Lifecycle**
   - Creation flow
   - Update/rotation procedures
   - Deactivation (for decommissioned products)

### FOUND-06: Crypto-Agile Specification

1. **Algorithm Abstraction Interfaces**
   - Signature verification interface
   - Key encapsulation interface
   - Algorithm registry pattern

2. **Migration Roadmap**
   - Current state (ECDSA)
   - Transition state (hybrid)
   - Target state (ML-DSA)

3. **Certificate/Key Management**
   - Dual-stack PKI preparation
   - Key rotation procedures
   - Hybrid signature format

---
*Research conducted: 2026-01-30*
*Researcher: gsd-phase-researcher*

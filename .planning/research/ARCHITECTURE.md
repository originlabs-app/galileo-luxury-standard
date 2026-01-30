# Architecture Patterns

**Domain:** Luxury Product Traceability Specification
**Researched:** 2026-01-30
**Overall Confidence:** HIGH (verified against ERC-3643 docs, GS1 specifications, EDPB guidelines)

---

## Executive Summary

This document defines the reference architecture for the Galileo Luxury Standard. The architecture follows a **hybrid on-chain/off-chain model** mandated by GDPR compliance, with clear separation between immutable blockchain attestations and mutable off-chain data stores. The design integrates three foundational standards: ERC-3643 for permissioned tokens with identity/compliance, ERC-4337 for account abstraction enabling gasless UX, and GS1 Digital Link for bridging physical products to digital identities.

---

## Recommended Architecture

```
                                    GALILEO LUXURY STANDARD ARCHITECTURE
                                    ====================================

    +----------------------------------------------------------------------------------+
    |                              PHYSICAL LAYER                                       |
    |  [Product with GS1 QR/NFC] --> GS1 Digital Link URI --> Resolution Request       |
    +----------------------------------------------------------------------------------+
                                           |
                                           v
    +----------------------------------------------------------------------------------+
    |                           RESOLVER LAYER (Off-Chain)                              |
    |  +---------------------------+     +---------------------------+                  |
    |  |  GS1 Digital Link         |     |  Context Router           |                  |
    |  |  Resolver                 |---->|  (context-aware routing)  |                  |
    |  |  (Microservices: Data     |     |  - Consumer view          |                  |
    |  |   Entry + Frontend)       |     |  - Brand view             |                  |
    |  +---------------------------+     |  - Regulatory view        |                  |
    |              |                     +---------------------------+                  |
    +----------------------------------------------------------------------------------+
                   |
                   v
    +----------------------------------------------------------------------------------+
    |                           DATA LAYER (Hybrid)                                     |
    |                                                                                   |
    |  +---------------------------+     +---------------------------+                  |
    |  |  OFF-CHAIN STORE          |     |  ON-CHAIN ATTESTATIONS    |                  |
    |  |  (GDPR-Compliant)         |     |  (Immutable)              |                  |
    |  |                           |     |                           |                  |
    |  |  - PII (encrypted)        |     |  - Content hashes         |                  |
    |  |  - Full DPP content       |     |  - Ownership transfers    |                  |
    |  |  - Lifecycle events       |     |  - Compliance attestations|                  |
    |  |  - Repair records         |     |  - Identity claims refs   |                  |
    |  |  - Certificates           |     |  - Timestamps             |                  |
    |  +---------------------------+     +---------------------------+                  |
    |              |                                 |                                  |
    |              +----------------+----------------+                                  |
    |                               |                                                   |
    +----------------------------------------------------------------------------------+
                                    |
                                    v
    +----------------------------------------------------------------------------------+
    |                           BLOCKCHAIN LAYER (EVM)                                  |
    |                                                                                   |
    |  +-----------------------------------------------------------------------+       |
    |  |                    ERC-3643 TOKEN SYSTEM                              |       |
    |  |                                                                       |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |  | Token Contract    |<-->| Identity Registry      |                  |       |
    |  |  | (IToken)          |    | (IIdentityRegistry)    |                  |       |
    |  |  | - mint/burn       |    | - isVerified()         |                  |       |
    |  |  | - transfer hooks  |    | - identity mapping     |                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |          |                         |                                  |       |
    |  |          v                         v                                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |  | Modular Compliance|    | Identity Registry      |                  |       |
    |  |  | (IModularCompl.)  |    | Storage                |                  |       |
    |  |  | - canTransfer()   |    | (IIdentityRegistryStor)|                  |       |
    |  |  | - compliance mods |    | - upgradeable storage  |                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |          |                         |                                  |       |
    |  |          |                         v                                  |       |
    |  |          |                +------------------------+                  |       |
    |  |          |                | Trusted Issuers        |                  |       |
    |  |          |                | Registry               |                  |       |
    |  |          |                | (ITrustedIssuersReg)   |                  |       |
    |  |          |                +------------------------+                  |       |
    |  |          |                         |                                  |       |
    |  |          |                         v                                  |       |
    |  |          |                +------------------------+                  |       |
    |  |          |                | Claim Topics Registry  |                  |       |
    |  |          +--------------->| (IClaimTopicsRegistry) |                  |       |
    |  |                           +------------------------+                  |       |
    |  +-----------------------------------------------------------------------+       |
    |                                                                                   |
    |  +-----------------------------------------------------------------------+       |
    |  |                    ERC-4337 ACCOUNT ABSTRACTION                       |       |
    |  |                                                                       |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |  | Smart Account     |    | Paymaster              |                  |       |
    |  |  | (Brand Wallet)    |<-->| (Gas Sponsorship)      |                  |       |
    |  |  | - multi-sig       |    | - brand pays gas       |                  |       |
    |  |  | - session keys    |    | - consumer gasless     |                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |          |                         ^                                  |       |
    |  |          v                         |                                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |  | UserOperation     |--->| Bundler                |                  |       |
    |  |  | (Intent)          |    | (Off-chain service)    |                  |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  +-----------------------------------------------------------------------+       |
    |                                                                                   |
    |  +-----------------------------------------------------------------------+       |
    |  |                    IDENTITY LAYER (ONCHAINID)                         |       |
    |  |                                                                       |       |
    |  |  +-------------------+    +------------------------+                  |       |
    |  |  | Identity Contract |    | Claims (Attestations)  |                  |       |
    |  |  | (per participant) |<-->| - KYC verified         |                  |       |
    |  |  | - keys            |    | - KYB verified         |                  |       |
    |  |  | - claims          |    | - Jurisdiction         |                  |       |
    |  |  +-------------------+    | - Accreditation        |                  |       |
    |  |                           +------------------------+                  |       |
    |  +-----------------------------------------------------------------------+       |
    +----------------------------------------------------------------------------------+
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Data Handled |
|-----------|---------------|-------------------|--------------|
| **GS1 Resolver** | Resolves product identifiers (GTIN, SGTIN) to resources | Context Router, Off-Chain Store | Product IDs, link metadata |
| **Context Router** | Routes resolution requests based on context (consumer vs. brand vs. regulator) | GS1 Resolver, Off-Chain Store, Blockchain | Context headers, access policies |
| **Off-Chain Store** | Stores GDPR-sensitive data, full DPP content, lifecycle events | Context Router, Blockchain (via hash anchoring) | PII, certificates, full records |
| **Token Contract** | Represents product ownership, triggers compliance checks | Identity Registry, Modular Compliance | Token state, ownership |
| **Identity Registry** | Maps wallet addresses to verified identities | Token Contract, Identity Storage, ONCHAINID | Address-to-identity mapping |
| **Identity Registry Storage** | Upgradeable storage for identity data | Identity Registry | Identity records |
| **Modular Compliance** | Enforces transfer rules (jurisdiction, limits, eligibility) | Token Contract, Compliance Modules | Transfer parameters |
| **Trusted Issuers Registry** | Lists authorized claim issuers (KYC providers, regulators) | Identity Registry | Issuer addresses, claim types |
| **Claim Topics Registry** | Defines required claim types for this token | Identity Registry, Trusted Issuers | Claim topic IDs |
| **ONCHAINID** | User-deployed identity contracts with keys and claims | Identity Registry, Trusted Issuers | Public keys, claim hashes |
| **Smart Account** | ERC-4337 wallet for brands/consumers (programmable) | Paymaster, Bundler, Token Contract | UserOperations |
| **Paymaster** | Sponsors gas fees for approved operations | Bundler, EntryPoint | Gas sponsorship policies |
| **Bundler** | Aggregates UserOperations, submits to EntryPoint | Paymaster, EntryPoint (on-chain) | UserOperation batches |

---

## Data Flow

### Flow 1: Product Registration (Brand -> Blockchain)

```
Brand System                    Off-Chain Store              Blockchain
    |                               |                            |
    |-- 1. Create DPP content ----->|                            |
    |                               |-- Store full DPP --------->|
    |                               |                            |
    |-- 2. Compute content hash --->|                            |
    |                               |                            |
    |-- 3. Submit via Smart Account --------------------------->|
    |   (UserOp: mint token with                                 |
    |    GS1 ID + content hash)                                  |
    |                               |                            |
    |                               |<--- 4. Bundler submits ----|
    |                               |                            |
    |-- 5. Register in GS1 Resolver |                            |
    |   (link GTIN to DPP endpoint) |                            |
```

**Direction:** Brand -> Off-Chain Store -> Blockchain (write path)

### Flow 2: Consumer Product Verification (Scan -> Data)

```
Consumer Device            GS1 Resolver            Off-Chain Store       Blockchain
    |                          |                        |                    |
    |-- 1. Scan QR code ------>|                        |                    |
    |   (GS1 Digital Link)     |                        |                    |
    |                          |                        |                    |
    |<-- 2. Resolve to DPP ----|                        |                    |
    |   endpoint               |                        |                    |
    |                          |                        |                    |
    |-- 3. Request DPP data ----------------------->|                    |
    |                          |                        |                    |
    |                          |                        |-- 4. Fetch hash ->|
    |                          |                        |<-- hash value -----|
    |                          |                        |                    |
    |<-- 5. DPP + verified -------------------------|                    |
    |   (hash matches on-chain)                        |                    |
```

**Direction:** Consumer -> GS1 Resolver -> Off-Chain Store (read path), with Blockchain verification (integrity check)

### Flow 3: Ownership Transfer (ERC-3643 Compliant)

```
Seller Wallet        Token Contract       Identity Registry       Compliance
    |                     |                      |                    |
    |-- 1. initiate       |                      |                    |
    |   transfer -------->|                      |                    |
    |                     |                      |                    |
    |                     |-- 2. isVerified(buyer) ->|               |
    |                     |<-- identity claims ---|                   |
    |                     |                      |                    |
    |                     |-- 3. canTransfer() ---------------------->|
    |                     |                      |                    |
    |                     |<-- compliance result ----------------------|
    |                     |   (checks: jurisdiction, limits,          |
    |                     |    investor eligibility)                  |
    |                     |                      |                    |
    |<-- 4. transfer      |                      |                    |
    |   executed/rejected |                      |                    |
```

**Direction:** Bidirectional checks before state change

### Flow 4: Gasless Consumer Experience (ERC-4337)

```
Consumer            Smart Account         Bundler           Paymaster        EntryPoint
    |                    |                   |                  |                |
    |-- 1. Request       |                   |                  |                |
    |   transfer ------->|                   |                  |                |
    |                    |                   |                  |                |
    |                    |-- 2. Create       |                  |                |
    |                    |   UserOp -------->|                  |                |
    |                    |                   |                  |                |
    |                    |                   |-- 3. Validate -->|                |
    |                    |                   |   gas policy     |                |
    |                    |                   |<-- approved -----|                |
    |                    |                   |                  |                |
    |                    |                   |-- 4. Bundle & submit ----------->|
    |                    |                   |                  |                |
    |<-- 5. Tx confirmed |                   |                  |                |
    |   (no gas paid)    |                   |                  |                |
```

**Direction:** Consumer -> Smart Account -> Bundler -> Blockchain (abstracted gas)

---

## On-Chain vs Off-Chain Split (GDPR Compliance)

### Guiding Principle

**EDPB Guidance (2025):** Personal data must NOT be stored on-chain. Use off-chain storage with cryptographic anchoring.

### Data Classification

| Data Category | Storage Location | Rationale |
|--------------|------------------|-----------|
| **Product identity** (GTIN, serial) | ON-CHAIN | Non-personal, immutable identifier |
| **Ownership address** | ON-CHAIN | Pseudonymous, necessary for transfer |
| **Content hash (DPP)** | ON-CHAIN | Integrity proof without data exposure |
| **Timestamp** | ON-CHAIN | Non-personal, essential for provenance |
| **Compliance attestation result** | ON-CHAIN | Boolean result only, no PII |
| **Full DPP content** | OFF-CHAIN | May contain personal data (artisan names, customer history) |
| **Lifecycle events (detailed)** | OFF-CHAIN | May reference individuals |
| **Certificates (scanned documents)** | OFF-CHAIN | May contain signatures, addresses |
| **Customer purchase records** | OFF-CHAIN | GDPR personal data |
| **KYC documents** | OFF-CHAIN | Strictly personal, retained only by issuer |

### GDPR Right to Erasure Implementation

```
Erasure Request                Off-Chain Store              Blockchain
    |                               |                            |
    |-- 1. Subject requests ------->|                            |
    |   data deletion               |                            |
    |                               |                            |
    |                               |-- 2. Delete PII ---------->|
    |                               |   and full records         |
    |                               |                            |
    |                               |-- 3. Destroy encryption -->|
    |                               |   key (if CRAB model)      |
    |                               |                            |
    |                               |                            | Hash remains
    |                               |                            | (now orphaned,
    |                               |                            |  points to
    |                               |                            |  nothing)
    |                               |                            |
    |<-- 4. Confirmation -----------|                            |
    |   (data inaccessible)         |                            |
```

**CRAB Model (Create-Read-Append-Burn):** Encryption keys are destroyed to render on-chain references meaningless without modifying blockchain state.

---

## GS1 Digital Link Integration

### Resolver Architecture

The GS1 Resolver follows a microservices architecture with two main components:

1. **Data Entry Service** - REST API for managing GS1 identifiers and link targets
2. **Front-end Web Service** - Resolves identifiers and redirects clients

### Integration Points with Blockchain

```
+------------------+     +-----------------+     +------------------+
| GS1 Digital Link |     | Galileo         |     | Blockchain       |
| Resolver (v3.0)  |---->| Adapter Service |---->| (ERC-3643 Token) |
|                  |     |                 |     |                  |
| MongoDB storage  |     | - Token lookup  |     | - Verify owner   |
| LinkSet format   |     | - Hash fetch    |     | - Check claims   |
| REST API         |     | - DPP assembly  |     | - Read state     |
+------------------+     +-----------------+     +------------------+
```

### Link Resolution Flow

| GS1 Link Type | Link Relation | Target |
|---------------|---------------|--------|
| Product info | `gs1:productInfoPage` | Off-chain DPP endpoint |
| Authenticity | `gs1:verificationService` | Blockchain verification service |
| Sustainability | `gs1:sustainabilityInfo` | Off-chain ESG data endpoint |
| Recall status | `gs1:recallStatus` | Regulatory notification service |
| Instructions | `gs1:instructions` | Off-chain care/maintenance docs |

### URI Structure

```
https://resolver.galileo.luxury/01/03612345678901/21/ABC123?context=consumer

Where:
- 01/ = GTIN Application Identifier
- 03612345678901 = GTIN value
- 21/ = Serial Number AI
- ABC123 = Serial value
- context = Consumer/Brand/Regulator view
```

---

## ERC-3643 Identity/Compliance Layer Interaction

### Contract Hierarchy

```
                          Token Contract (IToken)
                                  |
                    +-------------+-------------+
                    |                           |
            Identity Registry          Modular Compliance
            (IIdentityRegistry)       (IModularCompliance)
                    |                           |
                    |                    +------+------+
                    |                    |             |
            Identity Registry      Compliance     Compliance
            Storage               Module 1       Module 2
            (IIdentityRegistryStorage)  (Country)     (Max Balance)
                    |
         +----------+----------+
         |                     |
    Trusted Issuers      Claim Topics
    Registry             Registry
    (ITrustedIssuersRegistry)  (IClaimTopicsRegistry)
         |
         |
    ONCHAINID Contracts
    (per participant)
```

### Transfer Validation Sequence

1. **Token.transfer()** called
2. Token calls **IdentityRegistry.isVerified(to)**
   - Registry checks if `to` address has valid ONCHAINID
   - Registry verifies claims from Trusted Issuers match required Claim Topics
3. Token calls **Compliance.canTransfer(from, to, amount)**
   - Compliance iterates through all bound Compliance Modules
   - Each module returns true/false based on its rules
4. If both pass, transfer executes
5. Token calls **Compliance.transferred()** to update module state

### Compliance Module Types for Luxury

| Module | Purpose | Parameters |
|--------|---------|------------|
| **CountryRestrictions** | Limit circulation to approved jurisdictions | List of allowed country codes |
| **MaxBalance** | Prevent concentration (anti-hoarding) | Max tokens per identity |
| **ConditionalTransfer** | Require approval for high-value items | Threshold, approver role |
| **TimeBasedLock** | Enforce holding periods (warranty transfers) | Lock duration |
| **OwnershipHistory** | Limit transfer chain length | Max transfers allowed |

### Identity Claim Topics for Luxury

| Topic ID | Claim Type | Issuer Examples |
|----------|-----------|-----------------|
| `1` | KYC Verified | Onfido, Jumio, brand internal |
| `2` | KYB Verified | Dun & Bradstreet, brand vetting |
| `3` | Jurisdiction | Government ID issuers |
| `4` | Accredited Collector | Auction houses, brand certification |
| `5` | Authorized Retailer | Brand partner program |
| `6` | Authorized Service Center | Brand certification |

---

## ERC-4337 Account Abstraction Integration

### Role in Architecture

ERC-4337 enables **gasless consumer experiences** and **programmable brand wallets** without requiring end-users to manage private keys or hold ETH.

### Component Mapping

| ERC-4337 Component | Galileo Usage | Operator |
|--------------------|---------------|----------|
| **Smart Account** | Brand wallet for minting, consumer wallet for receiving | Brand IT / Consumer device |
| **Paymaster** | Sponsors gas for approved product-related operations | Brand treasury |
| **Bundler** | Aggregates operations, submits on-chain | Infrastructure provider (Alchemy, Gelato, self-hosted) |
| **EntryPoint** | Canonical on-chain contract for UserOp validation | Ethereum Foundation standard |

### Paymaster Policy Design

```solidity
// Simplified policy structure (specification only)
interface IGalileoPaymaster {
    // Returns true if operation should be gas-sponsored
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    // Policies to implement:
    // 1. Sponsor minting by authorized brand agents
    // 2. Sponsor transfers of brand-issued tokens
    // 3. Rate-limit per identity to prevent abuse
    // 4. Reject non-Galileo token operations
}
```

### UserOperation Flow for Product Transfer

1. Consumer initiates transfer in brand app (no wallet needed)
2. App creates **UserOperation** with:
   - `sender`: Consumer's Smart Account address
   - `callData`: Encoded Token.transfer() call
   - `paymasterAndData`: Galileo Paymaster address + signature
3. UserOp submitted to Bundler (off-chain)
4. Bundler validates with Paymaster, bundles multiple UserOps
5. Bundler submits to EntryPoint contract
6. EntryPoint executes, Paymaster pays gas
7. Consumer sees confirmed transfer (never touched ETH)

### Smart Account Features for Brands

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Multi-signature** | 2-of-3 key threshold for minting | Security for high-value operations |
| **Session Keys** | Time-limited keys for retail staff | Delegate without full access |
| **Spending Limits** | Per-operation and per-day caps | Prevent unauthorized mass operations |
| **Recovery** | Social recovery or hardware backup | Business continuity |
| **Batching** | Multiple mints in single UserOp | Efficiency for production runs |

---

## Recommended Specification Document Structure

### Overview

The specification should follow W3C-style technical report structure, adapted for industrial blockchain standards.

### Component Hierarchy

```
galileo-luxury-standard/
|
+-- README.md                    # Overview, quick start
+-- LICENSE                      # Apache 2.0
|
+-- specs/
|   +-- ARCHITECTURE.md          # This document (reference architecture)
|   |
|   +-- core/
|   |   +-- DPP-DATA-MODEL.md    # Digital Product Passport schema
|   |   +-- LIFECYCLE-EVENTS.md  # Event types and schemas
|   |   +-- RESOLVER-SPEC.md     # GS1 Digital Link resolver integration
|   |
|   +-- blockchain/
|   |   +-- TOKEN-INTERFACE.md   # IToken (ERC-3643 extension)
|   |   +-- IDENTITY-SPEC.md     # Identity registry interfaces
|   |   +-- COMPLIANCE-SPEC.md   # Compliance module interfaces
|   |   +-- AA-INTEGRATION.md    # ERC-4337 integration patterns
|   |
|   +-- governance/
|   |   +-- CHARTER.md           # Governance structure
|   |   +-- CONTRIBUTION.md      # How to propose changes
|   |   +-- VERSIONING.md        # Semantic versioning policy
|   |
|   +-- compliance/
|       +-- GDPR-PATTERNS.md     # GDPR-by-design patterns
|       +-- MICA-COMPLIANCE.md   # MiCA requirements mapping
|       +-- ESPR-ALIGNMENT.md    # ESPR DPP requirements
|
+-- schemas/
|   +-- dpp/
|   |   +-- dpp.schema.json      # JSON Schema for DPP
|   |   +-- dpp.types.ts         # TypeScript types
|   |
|   +-- events/
|       +-- manufacturing.schema.json
|       +-- sale.schema.json
|       +-- repair.schema.json
|       +-- transfer.schema.json
|
+-- interfaces/
|   +-- solidity/
|       +-- IToken.sol
|       +-- IIdentityRegistry.sol
|       +-- IIdentityRegistryStorage.sol
|       +-- IModularCompliance.sol
|       +-- IComplianceModule.sol
|       +-- ITrustedIssuersRegistry.sol
|       +-- IClaimTopicsRegistry.sol
|       +-- IGalileoPaymaster.sol
|
+-- examples/
    +-- deployment-sequence.md
    +-- integration-patterns.md
```

---

## Suggested Build Order

Based on component dependencies, the specification should be developed in this sequence:

### Phase 1: Foundation (No Dependencies)

| Deliverable | Rationale |
|-------------|-----------|
| **ARCHITECTURE.md** | Reference for all other specs |
| **DPP-DATA-MODEL.md** | Core data structure, no blockchain dependency |
| **CHARTER.md** | Governance before technical decisions |

**Build Order Implication:** These can be developed in parallel.

### Phase 2: Data Layer (Depends on Phase 1)

| Deliverable | Dependencies |
|-------------|--------------|
| **LIFECYCLE-EVENTS.md** | Extends DPP-DATA-MODEL |
| **JSON Schemas** (dpp/, events/) | Implements DPP-DATA-MODEL |
| **TypeScript types** | Derived from JSON Schemas |

**Build Order Implication:** Sequential within phase, but phase can start once Phase 1 architecture is stable.

### Phase 3: Blockchain Interfaces (Depends on Phase 1)

| Deliverable | Dependencies |
|-------------|--------------|
| **IDENTITY-SPEC.md** | Based on ERC-3643 patterns in architecture |
| **IIdentityRegistry.sol** | Implements IDENTITY-SPEC |
| **IIdentityRegistryStorage.sol** | Implements IDENTITY-SPEC |
| **ITrustedIssuersRegistry.sol** | Implements IDENTITY-SPEC |
| **IClaimTopicsRegistry.sol** | Implements IDENTITY-SPEC |

**Build Order Implication:** Spec first, then interfaces. Identity layer MUST be complete before token layer.

### Phase 4: Token & Compliance (Depends on Phase 3)

| Deliverable | Dependencies |
|-------------|--------------|
| **TOKEN-INTERFACE.md** | Requires IDENTITY-SPEC |
| **COMPLIANCE-SPEC.md** | Requires IDENTITY-SPEC |
| **IToken.sol** | Implements TOKEN-INTERFACE, references IIdentityRegistry |
| **IModularCompliance.sol** | Implements COMPLIANCE-SPEC |
| **IComplianceModule.sol** | Implements COMPLIANCE-SPEC |

**Build Order Implication:** Cannot start until identity interfaces are frozen.

### Phase 5: Integration Layer (Depends on Phases 2, 4)

| Deliverable | Dependencies |
|-------------|--------------|
| **RESOLVER-SPEC.md** | References DPP-DATA-MODEL, TOKEN-INTERFACE |
| **AA-INTEGRATION.md** | References TOKEN-INTERFACE |
| **IGalileoPaymaster.sol** | Implements AA-INTEGRATION |

**Build Order Implication:** Last technical layer, integrates all previous work.

### Phase 6: Compliance Documentation (Parallel to Phases 3-5)

| Deliverable | Dependencies |
|-------------|--------------|
| **GDPR-PATTERNS.md** | Architecture on-chain/off-chain split |
| **MICA-COMPLIANCE.md** | TOKEN-INTERFACE, governance |
| **ESPR-ALIGNMENT.md** | DPP-DATA-MODEL, LIFECYCLE-EVENTS |

**Build Order Implication:** Can develop in parallel once Phase 1 is complete, but requires final review after Phase 5.

---

## Dependency Graph

```
                    ARCHITECTURE.md
                          |
         +----------------+----------------+
         |                |                |
    DPP-DATA-MODEL   CHARTER.md      IDENTITY-SPEC
         |                               |
    LIFECYCLE-EVENTS              +------+------+------+------+
         |                        |      |      |      |      |
    JSON Schemas            IReg  IRStore TIReg  CTReg  ONCHAINID
         |                        |      |      |      |
    TypeScript types              +------+------+------+
         |                               |
         |                        TOKEN-INTERFACE
         |                               |
         |                    +----------+----------+
         |                    |                     |
         |              IToken.sol         COMPLIANCE-SPEC
         |                    |                     |
         |                    |          +----------+----------+
         |                    |          |                     |
         |                    |   IModularCompl.sol    IComplianceModule.sol
         |                    |          |
         +--------------------+----------+
                              |
                    +---------+---------+
                    |                   |
              RESOLVER-SPEC      AA-INTEGRATION
                    |                   |
                    |           IGalileoPaymaster.sol
                    |
              (GS1 integration)
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Personal Data On-Chain

**What:** Storing customer names, addresses, or identifiable data directly on blockchain.
**Why bad:** GDPR violation, no right to erasure possible, regulatory sanctions.
**Instead:** Store only hashes and pseudonymous identifiers on-chain. Keep PII in off-chain stores with proper access controls and deletion capabilities.

### Anti-Pattern 2: Monolithic Compliance Contract

**What:** Single compliance contract with all rules hardcoded.
**Why bad:** Cannot adapt to changing regulations without contract replacement.
**Instead:** Use modular compliance architecture where rules are separate, addable/removable modules.

### Anti-Pattern 3: Resolver-Token Coupling

**What:** GS1 resolver directly queries blockchain for every resolution.
**Why bad:** Scalability issues, blockchain latency unacceptable for consumer scans.
**Instead:** Resolver queries off-chain cache, blockchain verification happens asynchronously or on-demand for authenticity checks.

### Anti-Pattern 4: EOA-Based Brand Wallets

**What:** Using externally-owned accounts (private key wallets) for brand operations.
**Why bad:** Single point of failure, no recovery, no programmable policies.
**Instead:** Use ERC-4337 Smart Accounts with multi-sig, session keys, and spending limits.

### Anti-Pattern 5: Token as Full DPP Container

**What:** Storing complete DPP data in token metadata or contract storage.
**Why bad:** Gas costs prohibitive, storage limits, GDPR issues, upgrade impossible.
**Instead:** Token contains minimal data (GS1 ID, content hash, timestamps). Full DPP lives off-chain.

---

## Scalability Considerations

| Concern | At 10K Products | At 1M Products | At 100M Products |
|---------|-----------------|----------------|------------------|
| **Token minting** | Single-threaded OK | Batch minting, multiple issuers | L2 deployment, sharded minting |
| **Resolver load** | Single instance | Replicated, CDN-cached | Federated resolvers per region |
| **Off-chain storage** | Single database | Replicated database | Distributed storage (IPFS + pinning) |
| **Identity verification** | Synchronous | Async with caching | Claim pre-validation at onboarding |
| **Gas costs** | Brand treasury sufficient | Paymaster pooling | L2 with rollup to mainnet |

---

## Sources

### HIGH Confidence (Official Documentation)

- [ERC-3643 Official Documentation](https://docs.erc3643.org/erc-3643) - Smart contract architecture
- [T-REX GitHub Repository](https://github.com/TokenySolutions/T-REX) - Reference implementation
- [ERC-4337 Documentation](https://docs.erc4337.io/) - Account abstraction standard
- [GS1 Digital Link Resolver CE](https://github.com/gs1/GS1_DigitalLink_Resolver_CE) - Resolver architecture
- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link) - URI structure

### MEDIUM Confidence (Authoritative Sources)

- [EDPB Blockchain GDPR Guidelines](https://www.omfif.org/2025/06/european-data-protection-board-puts-blockchain-at-a-gdpr-crossroads/) - GDPR compliance
- [MiCA Regulation Guide 2026](https://www.innreg.com/blog/mica-regulation-guide) - Regulatory requirements
- [Aura Blockchain Consortium](https://auraconsortium.com/) - Luxury industry patterns
- [W3C Traceability Interoperability](https://w3c-ccg.github.io/traceability-interop/draft/) - Credential standards

### LOW Confidence (WebSearch, Require Validation)

- Zero-knowledge proof patterns for supply chain (academic papers, not yet production-proven)
- Specific gas cost estimates (depend on L1/L2 choice and network conditions)

---

## Open Questions for Phase-Specific Research

1. **L1 vs L2 Selection:** Which EVM chain for production deployment? (Ethereum mainnet, Polygon, Arbitrum, Base)
2. **Bundler Infrastructure:** Self-hosted vs. third-party (Alchemy, Gelato, Stackup)?
3. **Off-Chain Storage:** Traditional database vs. decentralized storage (IPFS, Ceramic)?
4. **Claim Issuer Ecosystem:** Which KYC/KYB providers support ONCHAINID claims?
5. **Post-Quantum Preparation:** Timeline and approach for crypto-agility?

---

*Research conducted: 2026-01-30*
*Next review: After Phase 1 specifications are drafted*

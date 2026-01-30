# Technology Stack

**Project:** Galileo Luxury Standard
**Researched:** 2026-01-30
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

This document defines the 2025/2026 technology stack for building an open-source industrial specification for luxury product traceability. The stack must satisfy three regulatory deadlines: ESPR 2027 (Digital Product Passport), MiCA June 2026 (crypto-asset compliance), and GDPR-by-design (no personal data on-chain). The recommendations prioritize production-proven libraries, Apache 2.0-compatible licensing, and crypto-agility for post-quantum preparation.

---

## 1. ERC-3643 Compliant Token Standards

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **@erc3643org/erc-3643** | Latest (check npm) | Official ERC-3643 smart contracts | HIGH |
| **ONCHAINID** | ERC-734/735 compliant | On-chain identity for KYC/KYB claims | HIGH |
| **OpenZeppelin Contracts** | v5.5.0 | Base utilities (AccessControl, Ownable, UUPS) | HIGH |

### Rationale

**Why ERC-3643 (T-REX)?**
- **Industry adoption:** $32B+ already tokenized using this standard as of 2025
- **Compliance-native:** Built-in identity verification via ONCHAINID, enabling KYC/KYB without exposing personal data on-chain
- **Regulatory fit:** Designed for MiCA-compliant permissioned tokens where you must know who holds the asset
- **Audited:** Security audits by Kaspersky and Hacken with no notable vulnerabilities found
- **Ecosystem:** 92+ organizations in the ERC3643 Association as of January 2025

**Why OpenZeppelin v5.5.0?**
- Latest stable release (October 2025) with ERC-7930 interoperable addresses
- WebAuthn signer support (SignerWebAuthn) useful for hardware-wallet-free UX
- ERC-6909 (multi-token) is now final, not draft
- 99% unit test coverage + formal verification

### Key Components Architecture

```
Token Layer (ERC-3643)
   |
   +-- Token Contract (IToken interface)
   |      - transferWithCompliance()
   |      - mint()/burn() with identity checks
   |
   +-- Compliance Contract (ICompliance)
   |      - Modular compliance rules
   |      - Token Listing Restrictions Module (whitelist/blacklist)
   |
   +-- Identity Registry (IIdentityRegistry)
   |      - Links wallet addresses to ONCHAINID
   |      - Trusted Issuers Registry
   |      - Claim Topics Registry
   |
   +-- ONCHAINID (ERC-734/735)
          - Off-chain identity claims verified on-chain
          - Deployed on Polygon (cross-chain compatible)
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| **@tokenysolutions/t-rex** (original) | Repository archived Oct 2025; use @erc3643org/erc-3643 instead |
| **Custom KYC implementations** | ONCHAINID already solves this; reinventing creates compliance risk |
| **ERC-20 with custom compliance hooks** | Not MiCA-ready; lacks the identity infrastructure of ERC-3643 |
| **OpenZeppelin < 5.0** | Missing transient storage, modern access control, EIP-7702 support |

### Installation

```bash
npm install @erc3643org/erc-3643 @openzeppelin/contracts@5.5.0
```

### Sources

- [ERC3643 Official](https://www.erc3643.org/) - HIGH confidence
- [EIP-3643 Specification](https://eips.ethereum.org/EIPS/eip-3643) - HIGH confidence
- [ERC-3643 GitHub Organization](https://github.com/ERC-3643) - HIGH confidence
- [OpenZeppelin v5.5.0 Release](https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v5.5.0) - HIGH confidence

---

## 2. GS1 Digital Link Resolver Implementations

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **GS1 Digital Link Resolver CE** | v3.0+ | Self-hosted resolver for product identifiers | MEDIUM |
| **GS1 URI Syntax** | 1.6.0 (Apr 2025) | Standard URI format for GTINs, SGTINs | HIGH |
| **GS1-Conformant Resolver Standard** | 1.2.0 (Jan 2026) | Compliance requirements for resolvers | HIGH |
| **GS1 Compression Standard** | 1.0.0 (Jul 2025) | EPC binary compression for QR codes | MEDIUM |

### Rationale

**Why GS1 Digital Link?**
- **ESPR compliance:** EU Digital Product Passport requires ISO/IEC 15459 identifiers - GS1 is the only standard that satisfies this
- **Retail interoperability:** Works with existing POS scanners and inventory systems globally
- **Data carrier agnostic:** Same identifier resolves from QR codes, NFC chips, or RFID tags
- **Decentralized by design:** Any organization can operate a resolver; no single point of control

**Why Resolver CE v3.0?**
- Microservices architecture separating data entry from resolution (scalability)
- URL compression support for shorter QR codes
- Compatible with the January 2026 GS1-Conformant Resolver 1.2.0 standard

### Architecture Pattern

```
Physical Product
   |
   +-- QR Code / NFC / RFID
   |      Contains: https://id.example.com/01/09506000134352
   |
   +-- GS1 Digital Link Resolver (self-hosted)
   |      - Parses GS1 AI (01=GTIN, 21=Serial, etc.)
   |      - Redirects to appropriate link type
   |
   +-- Link Types (per GS1 Digital Link standard)
          - productPage (consumer information)
          - digitalProductPassport (ESPR compliance)
          - traceability (blockchain anchors)
          - certificationInfo (authenticity proofs)
```

### Recommended Link Types for DPP

| LinkType | URI | Purpose |
|----------|-----|---------|
| `gs1:digitalProductPassport` | /dpp/{id} | ESPR-compliant DPP endpoint |
| `gs1:traceability` | /trace/{id} | Blockchain transaction history |
| `gs1:certificationInfo` | /cert/{id} | Authenticity certificates |
| `gs1:sustainabilityInfo` | /eco/{id} | Carbon footprint, materials |

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| **Proprietary QR platforms (Scantrust, etc.)** | Lock-in; not GS1 conformant; ESPR requires open standards |
| **Direct blockchain URLs in QR codes** | Not ISO/IEC 15459 compliant; breaks retail scanner compatibility |
| **Resolver CE without customization** | Community version lacks official GS1 support; plan for maintenance |
| **Single-domain resolvers** | Violates decentralization principle; use resolver federation patterns |

### Integration Notes

```
GS1 Digital Link URI: https://id.galileo.luxury/01/09506000134352/21/ABC123
                      |                        |                  |
                      Domain (resolver)        GTIN-13            Serial Number

Resolves to:
- If Accept: text/html -> Product information page
- If Accept: application/ld+json -> Machine-readable DPP
- If linkType=gs1:traceability -> Blockchain anchor
```

### Sources

- [GS1 Digital Link Resolver CE](https://github.com/gs1/GS1_DigitalLink_Resolver_CE) - MEDIUM confidence (community maintained)
- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link) - HIGH confidence
- [GS1 DigitalLinkDocs](https://gs1.github.io/DigitalLinkDocs/) - HIGH confidence
- [URI Syntax 1.6.0](https://www.gs1.org/docs/Digital-Link/GS1_DigitalLink_Imp_Guide_i1.pdf) - HIGH confidence

---

## 3. Zero-Knowledge Proof Libraries for Privacy

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Noir** | 1.0+ (pre-release) | ZKP circuit language (Rust-like DSL) | HIGH |
| **Barretenberg** | Latest | Default proving backend for Noir | HIGH |
| **Circom** | 2.x | Alternative for Groth16 circuits | HIGH |
| **SnarkJS** | Latest (0.7.x+) | JavaScript prover/verifier for Circom | HIGH |

### Rationale

**Why Noir as Primary Choice?**
- **Developer experience:** Rust-like syntax, lower barrier than Circom's DSL
- **Backend agnostic:** Works with Barretenberg (PLONK), can output to Arkworks (Groth16)
- **Production proven:** Powers Aztec Network (launched Nov 2025, 75k+ blocks)
- **NoirJS:** Browser-based proving for client-side privacy
- **Active development:** Core circuits rewritten in Noir; 3 engineers rewrote all Aztec circuits in <1 month

**Why keep Circom + SnarkJS?**
- Mature ecosystem with more audit experience
- Smaller proof sizes (Groth16) for on-chain verification
- More auditors familiar with Circom circuits
- Required for compatibility with existing ZK tooling

### Privacy Use Cases for Luxury Traceability

| Use Case | ZKP Circuit | What's Proven | What's Hidden |
|----------|-------------|---------------|---------------|
| Ownership verification | Noir/Circom | "I own this item" | Identity of owner |
| Authenticity check | Noir/Circom | "Item is in registry" | Full provenance chain |
| Compliance attestation | Noir/Circom | "Holder is KYC'd" | Personal KYC data |
| Age/origin proof | Noir/Circom | "Item is >50 years old" | Exact dates |

### Architecture Pattern

```
Off-chain (Private)                  On-chain (Public)
+-------------------+                +-------------------+
| Witness Data      |                | Verifier Contract |
| - Owner identity  |  ZK Proof      | - verify(proof,   |
| - Full provenance | -------------> |   publicInputs)   |
| - KYC claims      |                | - Returns: valid  |
+-------------------+                +-------------------+
        |                                     |
        v                                     v
   Noir Circuit                        Solidity Verifier
   (Private logic)                   (Auto-generated)
```

### Recommended Development Workflow

```bash
# Noir workflow
nargo new my_circuit
nargo compile
nargo prove
nargo verify

# Generate Solidity verifier
nargo codegen-verifier

# Circom workflow (alternative)
circom my_circuit.circom --r1cs --wasm --sym
snarkjs groth16 setup
snarkjs zkey contribute
snarkjs zkey export verificationkey
snarkjs groth16 prove
snarkjs generatecall  # For on-chain verification
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| **Unaudited ZKP libraries** | "Security minefield" - new proof systems arrive monthly without audits |
| **ZoKrates** | Less active development; Noir has better DX and ecosystem now |
| **Custom proving systems** | Use established backends (Barretenberg, Arkworks); don't roll your own |
| **On-chain proving** | Computationally infeasible; always prove off-chain, verify on-chain |
| **PLONK without Barretenberg** | Barretenberg is the most production-tested PLONK implementation |

### Security Considerations

- **Audit requirement:** All circuits must be audited before production (OpenZeppelin offers ZKP audits)
- **Under-constrained signals:** Most common vulnerability; use formal verification tools
- **Trusted setup:** If using Groth16, participate in trusted setup ceremony or use universal setup (PLONK)
- **Proof freshness:** Include timestamps/nonces to prevent proof replay attacks

### Sources

- [Noir Documentation](https://noir-lang.org/docs/) - HIGH confidence
- [Aztec Noir 1.0 Announcement](https://aztec.network/blog/the-future-of-zk-development-is-here-announcing-the-noir-1-0-pre-release) - HIGH confidence
- [OpenZeppelin ZKP Practice](https://www.openzeppelin.com/zkp) - HIGH confidence
- [Circom Documentation](https://docs.circom.io/) - HIGH confidence
- [SnarkJS GitHub](https://github.com/iden3/snarkjs) - HIGH confidence

---

## 4. Account Abstraction (ERC-4337) Implementations

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **eth-infinitism EntryPoint** | v0.7 | Core ERC-4337 EntryPoint contract | HIGH |
| **Permissionless.js** | Latest | TypeScript SDK for UserOperations | HIGH |
| **Pimlico Alto** | Latest | Bundler service | HIGH |
| **ERC-7579** | Final | Modular smart account standard | HIGH |
| **ERC-6900** | Draft | Alternative modular approach (Alchemy) | MEDIUM |

### Rationale

**Why ERC-4337 + ERC-7579?**
- **UX imperative:** Luxury consumers should not manage private keys
- **Gasless transactions:** Paymasters sponsor gas; users never touch ETH
- **Modular architecture:** ERC-7579 allows adding validators, executors, fallback handlers
- **Industry momentum:** 40M+ smart accounts deployed, 100M+ UserOperations processed as of 2025
- **EIP-7702 compatibility:** Pectra upgrade (May 2025) allows EOAs to temporarily execute smart contract code

**Why EntryPoint v0.7?**
- Required by Pimlico and major bundlers
- More gas efficient than v0.6
- Canonical address: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

**Why ERC-7579 over ERC-6900?**
- Less opinionated, more interoperable
- Supported by Safe, Biconomy, ZeroDev, thirdweb
- OKX co-authored the standard
- Easier to integrate custom compliance modules

### Module Architecture for Luxury Traceability

```
Smart Account (ERC-7579 Core)
   |
   +-- Validator Modules
   |      - ONCHAINID ClaimValidator (verify KYC claims)
   |      - MultiSig for high-value transfers
   |      - WebAuthn for passwordless auth
   |
   +-- Executor Modules
   |      - Batch transfer executor
   |      - Time-locked release executor
   |      - Compliance-gated executor
   |
   +-- Fallback Handlers
   |      - ERC-1271 signature verification
   |      - GS1 resolver integration hooks
   |
   +-- Hooks
          - Pre-execution compliance check
          - Post-execution event emission
```

### Paymaster Strategy

| Paymaster Type | Use Case | Provider |
|----------------|----------|----------|
| **Verifying Paymaster** | Brand-sponsored UX | Pimlico, Alchemy |
| **ERC-20 Paymaster** | User pays in stablecoin | Pimlico (singleton-paymaster) |
| **Reputation-based** | Free for verified collectors | Custom implementation |

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| **EntryPoint v0.6** | Less gas efficient; v0.7 is the standard now |
| **Custom bundler implementations** | Use Pimlico Alto or Stackup; bundlers are complex |
| **EOA-only flows** | Violates UX requirements for luxury consumers |
| **Non-modular smart accounts** | ERC-7579 modularity required for compliance extensibility |
| **EIP-7702 alone** | Complementary to ERC-4337, not a replacement |

### Integration with ERC-3643

```
UserOperation Flow:
   |
   +-- User initiates transfer (no wallet popup)
   |
   +-- Smart Account (ERC-7579)
   |      - Validator: Check WebAuthn signature
   |      - Pre-hook: Verify ONCHAINID claims
   |
   +-- Bundler (Pimlico Alto)
   |      - Bundle multiple UserOps
   |
   +-- Paymaster (Verifying)
   |      - Brand sponsors gas
   |
   +-- EntryPoint v0.7
   |      - Execute UserOperation
   |
   +-- ERC-3643 Token
          - Transfer with compliance check
```

### Installation

```bash
# Contracts
npm install @account-abstraction/contracts

# SDK (built on viem)
npm install permissionless viem
```

### Sources

- [ERC-4337 Documentation](https://docs.erc4337.io/) - HIGH confidence
- [eth-infinitism/account-abstraction](https://github.com/eth-infinitism/account-abstraction) - HIGH confidence
- [ERC-7579 Specification](https://eips.ethereum.org/EIPS/eip-7579) - HIGH confidence
- [Permissionless.js](https://docs.pimlico.io/) - HIGH confidence
- [Pimlico](https://www.pimlico.io/) - HIGH confidence

---

## 5. Post-Quantum Cryptography Preparation

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **liboqs** | 0.13.0+ | Reference PQC implementations | MEDIUM |
| **ML-KEM (FIPS 203)** | Standardized | Key encapsulation (replaces Kyber) | HIGH |
| **ML-DSA (FIPS 204)** | Standardized | Digital signatures (replaces Dilithium) | HIGH |
| **SLH-DSA (FIPS 205)** | Standardized | Hash-based signatures (SPHINCS+) | HIGH |
| **Crypto-agile architecture** | Design pattern | Abstraction layer for algorithm swaps | HIGH |

### Rationale

**Why prepare now?**
- **Threat timeline:** 4-10 years to cryptographically relevant quantum computers
- **Migration timeline:** 10-15 years for decentralized communities to adopt new algorithms
- **NIST mandate:** CNSA 2.0 requires PQC for all NSS acquisitions by January 2027
- **Ethereum exposure:** ECDSA and BLS12-381 are both vulnerable to Shor's algorithm

**Why crypto-agility over immediate PQC adoption?**
- PQC signatures are 30-70x larger than ECDSA (2,420 bytes vs 71 bytes)
- State bloat: EOA accounts would grow from 33 bytes to 1,952 bytes
- 52-57% throughput degradation in testnet implementations
- Industry-wide PQC adoption is only 0.35% of cryptography events in 2025

### Recommended Approach: Hybrid + Crypto-Agility

```
Current State (2026)          Transition State (2027-2030)       Target State (2030+)
+----------------+            +------------------------+         +----------------+
| ECDSA          |            | ECDSA + ML-DSA         |         | ML-DSA only    |
| secp256k1      | -------->  | (Hybrid verification)  | ------> | (Full PQC)     |
+----------------+            +------------------------+         +----------------+
```

### Crypto-Agile Architecture Pattern

```solidity
// Abstract signature verification interface
interface ISignatureVerifier {
    function verify(
        bytes32 hash,
        bytes calldata signature,
        bytes calldata publicKey
    ) external view returns (bool);
}

// Current implementation
contract ECDSAVerifier is ISignatureVerifier {
    function verify(...) external view returns (bool) {
        // ECDSA verification
    }
}

// Future PQC implementation (drop-in replacement)
contract MLDSAVerifier is ISignatureVerifier {
    function verify(...) external view returns (bool) {
        // ML-DSA verification via precompile or ZK proof
    }
}
```

### Migration Strategies for Ethereum

| Strategy | Timeline | Description |
|----------|----------|-------------|
| **Account Abstraction** | Now | ERC-4337 allows custom signature schemes per account |
| **Hybrid signatures** | 2027-2028 | Both ECDSA and ML-DSA required for validity |
| **ZK-wrapped PQC** | 2027+ | Ethereum Foundation's ZKnox project |
| **New transaction type** | TBD | Encapsulate quantum-safe ZK proofs |

### Current NIST Standards (August 2024 + March 2025)

| Standard | Algorithm | Type | Use Case |
|----------|-----------|------|----------|
| **FIPS 203** | ML-KEM | Key Encapsulation | Secure key exchange |
| **FIPS 204** | ML-DSA | Digital Signature | General signing |
| **FIPS 205** | SLH-DSA | Hash-based Signature | Stateless signatures |
| **HQC** (draft 2026) | HQC | Key Encapsulation | Backup for ML-KEM |

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| **Kyber (pre-standardization)** | Deprecated; use ML-KEM (FIPS 203) instead |
| **Dilithium (pre-standardization)** | Deprecated; use ML-DSA (FIPS 204) instead |
| **Immediate full PQC adoption** | Premature; signature sizes break blockchain UX |
| **Single-algorithm commitment** | Crypto-agility required; algorithms may be broken |
| **Custom PQC implementations** | Use liboqs or NIST-vetted implementations only |
| **FN-DSA (Falcon)** | Not yet standardized; timeline uncertain |

### Practical Steps for 2026

1. **Design for crypto-agility:** Abstract signature verification behind interfaces
2. **Use ERC-4337:** Smart accounts can upgrade signature schemes without protocol changes
3. **Monitor ZKnox project:** Ethereum Foundation's post-quantum initiative
4. **Off-chain storage:** Store PQC signatures off-chain, verify proofs on-chain
5. **Hybrid where possible:** Use both ECDSA and ML-DSA for critical operations

### JavaScript/TypeScript Libraries

```bash
# PQC in JavaScript (experimental)
npm install @noble/post-quantum  # Paul Miller's implementation
npm install crystals-kyber       # ML-KEM wrapper
```

Note: Production PQC in JavaScript is immature. Use for prototyping, not production.

### Sources

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography) - HIGH confidence
- [NIST FIPS 203/204/205](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards) - HIGH confidence
- [Ethereum Future-Proofing Roadmap](https://ethereum.org/roadmap/future-proofing/) - HIGH confidence
- [liboqs Releases](https://github.com/open-quantum-safe/liboqs/releases) - HIGH confidence
- [ZKnox Project](https://www.btq.com/blog/ethereums-roadmap-post-quantum-cryptography) - MEDIUM confidence

---

## Development Tooling

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Foundry** | v1.5.1+ | Smart contract development, testing | HIGH |
| **Viem** | Latest | TypeScript Ethereum interface | HIGH |
| **Hardhat** | Latest | Alternative toolchain, wider plugin ecosystem | MEDIUM |
| **TypeScript** | 5.x | Schema definitions, SDK | HIGH |

### Rationale

**Why Foundry over Hardhat?**
- 5.2x faster compilation than alternatives
- 2x faster fuzzing and coverage vs Foundry v0.2
- Tests written in Solidity (same language as contracts)
- EIP-7702 support since October 2024
- Built-in symbolic execution integration

**Why Viem over ethers.js?**
- 35kB bundle size vs larger ethers.js
- Compile-time type safety for contract interactions
- Tree-shakable; only used modules in bundle
- Built by Wagmi team; optimized for modern dApp stacks

### Installation

```bash
# Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# TypeScript SDK
npm install viem typescript@5
```

### Sources

- [Foundry v1.0 Announcement](https://www.paradigm.xyz/2025/02/announcing-foundry-v1-0) - HIGH confidence
- [Viem Documentation](https://viem.sh/) - HIGH confidence

---

## Regulatory Compliance Alignment

### ESPR 2027 (Digital Product Passport)

| Requirement | Stack Solution |
|-------------|----------------|
| ISO/IEC 15459 identifier | GS1 Digital Link (GTIN + Serial) |
| Machine-readable format | JSON-LD via resolver |
| QR code / NFC / RFID | GS1 Digital Link URI syntax |
| Material composition | Off-chain DPP schema |
| Carbon footprint | Off-chain DPP schema |
| Recycled content | Off-chain DPP schema |

### MiCA June 2026

| Requirement | Stack Solution |
|-------------|----------------|
| White paper format | iXBRL (out of scope for spec) |
| Order book records | JSON format (if operating trading) |
| Asset segregation | ERC-3643 compliance module |
| AML/KYC | ONCHAINID claims verification |
| Travel Rule | ERC-3643 identity registry |

### GDPR

| Requirement | Stack Solution |
|-------------|----------------|
| No personal data on-chain | Hybrid architecture (off-chain storage) |
| Right to erasure | Off-chain data with hash anchors on-chain |
| Data minimization | ZKP for privacy-preserving proofs |
| Consent management | Off-chain with on-chain attestations |

---

## Summary: Prescriptive Stack

### Core Contracts

```bash
npm install @erc3643org/erc-3643 @openzeppelin/contracts@5.5.0 @account-abstraction/contracts
```

### Development

```bash
curl -L https://foundry.paradigm.xyz | bash && foundryup
npm install viem permissionless
```

### ZKP

```bash
# Noir (primary)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Circom (alternative)
npm install -g snarkjs
cargo install circom
```

### GS1 Resolver

```bash
git clone https://github.com/gs1/GS1_DigitalLink_Resolver_CE.git
# Follow Docker setup for v3.0
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| ERC-3643 | HIGH | Well-established, $32B+ tokenized, audited |
| GS1 Digital Link | MEDIUM-HIGH | Official standard, but CE resolver is community-maintained |
| ZKP Libraries | HIGH | Noir 1.0 production-proven on Aztec; Circom mature |
| ERC-4337 | HIGH | 40M+ accounts, ERC-7579 modular standard final |
| Post-Quantum | MEDIUM | NIST standards finalized, but blockchain adoption nascent |
| Foundry/Viem | HIGH | Industry-standard tooling |

---

## Open Questions

1. **GS1 Resolver maintenance:** CE is not officially maintained by GS1; budget for custom development or alternative resolver?
2. **PQC timeline:** When does Ethereum Foundation expect ZKnox integration? Impacts hybrid signature timing.
3. **ERC-7579 module registry:** Is there a standard registry for compliance modules, or must we build custom?
4. **ESPR delegated acts:** Final data schema requirements for luxury goods expected 2027-2028; spec may need revision.

---

*This document should be updated when NIST releases the HQC draft standard (expected early 2026) and when ESPR delegated acts for relevant product categories are published.*

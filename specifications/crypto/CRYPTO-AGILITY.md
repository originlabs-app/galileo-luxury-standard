# Crypto-Agility Specification

> Galileo Luxury Standard - Post-Quantum Cryptography Readiness

**Version:** 1.0.0
**Status:** Draft
**Last Updated:** 2026-01-30

---

## 1. Overview

### 1.1 Purpose

This specification defines the crypto-agile architecture for the Galileo Luxury Standard, enabling:

- **Signature scheme migration** without breaking deployed contracts
- **Post-quantum cryptography readiness** (NIST timeline: 2030 recommended full transition)
- **Hybrid signatures** during transition period (2027-2030)
- **10+ year product lifecycle support** - luxury products require crypto-agility from day one

### 1.2 Standards Referenced

| Standard | Name | Date |
|----------|------|------|
| NIST FIPS 203 | ML-KEM (Module-Lattice-Based Key Encapsulation Mechanism) | August 2024 |
| NIST FIPS 204 | ML-DSA (Module-Lattice-Based Digital Signature Algorithm) | August 2024 |
| NIST FIPS 205 | SLH-DSA (Stateless Hash-Based Digital Signature Algorithm) | August 2024 |
| ERC-4337 | Account Abstraction | Ethereum |

### 1.3 Design Principles

| Principle | Description |
|-----------|-------------|
| **Never hardcode algorithms** | All crypto operations go through interfaces |
| **Configuration over code** | Algorithm selection via registry, not conditionals |
| **Graceful degradation** | If PQC unavailable, fall back to classical |
| **Fail-secure** | Unknown algorithm ID rejects signature, does not accept |

---

## 2. Algorithm Abstraction Interfaces

### 2.1 Signature Verification Interface

```typescript
/**
 * Abstract interface for signature verification.
 * Implementations exist for each supported algorithm family.
 */
interface ISignatureVerifier {
  /**
   * Verify a signature against a message hash.
   * @param hash - The message hash (always 32 bytes for interop)
   * @param signature - The signature bytes (format varies by algorithm)
   * @param publicKey - The public key bytes (format varies by algorithm)
   * @returns true if signature is valid, false otherwise
   */
  verify(hash: bytes32, signature: bytes, publicKey: bytes): boolean;

  /**
   * Return the algorithm identifier for this verifier.
   * Must match registry key exactly.
   */
  algorithmId(): string;

  /**
   * Return expected signature length in bytes.
   * Used for format validation before verification.
   */
  signatureLength(): uint256;

  /**
   * Return expected public key length in bytes.
   */
  publicKeyLength(): uint256;
}
```

### 2.2 Key Encapsulation Interface

```typescript
/**
 * Abstract interface for key encapsulation (key exchange).
 * Used for encrypted off-chain communication.
 */
interface IKeyEncapsulation {
  /**
   * Encapsulate a shared secret using recipient's public key.
   * @param publicKey - Recipient's public key
   * @returns ciphertext (to send) and sharedSecret (to use for encryption)
   */
  encapsulate(publicKey: bytes): { ciphertext: bytes, sharedSecret: bytes32 };

  /**
   * Decapsulate to recover shared secret using private key.
   * @param ciphertext - The encapsulated ciphertext
   * @param privateKey - Recipient's private key
   * @returns The shared secret (32 bytes)
   */
  decapsulate(ciphertext: bytes, privateKey: bytes): bytes32;

  /**
   * Return the algorithm identifier.
   */
  algorithmId(): string;

  /**
   * Return expected ciphertext length.
   */
  ciphertextLength(): uint256;
}
```

### 2.3 Crypto Registry Interface

```typescript
/**
 * Central registry for algorithm implementations.
 * Enables runtime algorithm selection without code changes.
 */
interface ICryptoRegistry {
  /**
   * Get verifier for a given algorithm ID.
   * @throws if algorithm not supported
   */
  getVerifier(algorithmId: string): ISignatureVerifier;

  /**
   * Get KEM for a given algorithm ID.
   * @throws if algorithm not supported
   */
  getKEM(algorithmId: string): IKeyEncapsulation;

  /**
   * Check if algorithm is supported.
   */
  isSupported(algorithmId: string): boolean;

  /**
   * List all supported algorithm IDs.
   */
  supportedAlgorithms(): string[];

  /**
   * Get the current default algorithm for new signatures.
   * Changes over time as migration progresses.
   */
  defaultSignatureAlgorithm(): string;

  /**
   * Get the current default algorithm for new key encapsulation.
   */
  defaultKEMAlgorithm(): string;
}
```

---

## 3. Algorithm Identifiers

### 3.1 Signature Algorithms

| Algorithm ID | Standard | Status | Key Size | Sig Size | Notes |
|--------------|----------|--------|----------|----------|-------|
| `ECDSA-secp256k1` | SEC 2 | Current default | 33 bytes | 65 bytes | Native EVM support |
| `ECDSA-P256` | NIST P-256 | Supported | 33 bytes | 64 bytes | Apple/Android hardware |
| `Ed25519` | RFC 8032 | Supported | 32 bytes | 64 bytes | High performance |
| `ML-DSA-44` | FIPS 204 | Future (2027+) | 1312 bytes | 2420 bytes | NIST Level 2 |
| `ML-DSA-65` | FIPS 204 | Future (2027+) | 1952 bytes | 3309 bytes | NIST Level 3 |
| `ML-DSA-87` | FIPS 204 | Future (2027+) | 2592 bytes | 4627 bytes | NIST Level 5 |
| `SLH-DSA-128s` | FIPS 205 | Backup option | 32 bytes | 7856 bytes | Hash-based (conservative) |

### 3.2 Key Encapsulation Algorithms

| Algorithm ID | Standard | Status | Ciphertext | Shared Secret | Notes |
|--------------|----------|--------|------------|---------------|-------|
| `ECDH-X25519` | RFC 7748 | Current default | 32 bytes | 32 bytes | High performance |
| `ECDH-P256` | NIST P-256 | Supported | 65 bytes | 32 bytes | Hardware support |
| `ML-KEM-512` | FIPS 203 | Future (2027+) | 768 bytes | 32 bytes | NIST Level 1 |
| `ML-KEM-768` | FIPS 203 | Future (2027+) | 1088 bytes | 32 bytes | NIST Level 3 |
| `ML-KEM-1024` | FIPS 203 | Future (2027+) | 1568 bytes | 32 bytes | NIST Level 5 |

### 3.3 Recommended Security Levels

| Use Case | Current (2026) | Transition (2027-2029) | Target (2030+) |
|----------|----------------|------------------------|----------------|
| Standard products | ECDSA-secp256k1 | Hybrid (ECDSA + ML-DSA-65) | ML-DSA-65 |
| High-value items | Ed25519 | Hybrid (Ed25519 + ML-DSA-87) | ML-DSA-87 |
| Off-chain encryption | ECDH-X25519 | Hybrid (X25519 + ML-KEM-768) | ML-KEM-768 |

---

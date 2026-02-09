# Galileo Luxury Standard

**Open standard for luxury product traceability on blockchain**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/originlabs-app/galileo-luxury-standard/releases/tag/v1.0.0)

> *Protecting brand heritage and human craftsmanship through a common interoperable language.*

---

## Overview

The Galileo Luxury Standard is an open, interoperable protocol for luxury product traceability. It provides specifications for Digital Product Passports, decentralized identity, compliant token transfers, and regulatory alignment (GDPR, MiCA, ESPR).

### Key Features

- **Privacy-First Architecture** — No personal data on-chain (GDPR compliant)
- **Digital Product Passports** — ESPR 2024/1781 ready schemas
- **Decentralized Identity** — `did:galileo` method (W3C DID Core v1.0)
- **Compliant Transfers** — ERC-3643 token standard with modular compliance
- **GS1 Integration** — Digital Link 1.6.0 resolver

---

## Quick Start

| I want to... | Start here |
|--------------|------------|
| Understand the architecture | [HYBRID-ARCHITECTURE.md](specifications/architecture/HYBRID-ARCHITECTURE.md) |
| Implement product identity | [DID-METHOD.md](specifications/identity/DID-METHOD.md) |
| Create Digital Product Passports | [dpp-core.schema.json](specifications/schemas/dpp/dpp-core.schema.json) |
| Integrate with GS1 | [digital-link-uri.md](specifications/resolver/digital-link-uri.md) |
| Check regulatory compliance | [Compliance Guides](specifications/compliance/guides/) |

---

## Standards Compliance

| Standard | Version | Status |
|----------|---------|--------|
| W3C DID Core | v1.0 | ✓ Conformant |
| W3C Verifiable Credentials | v2.0 | ✓ Conformant |
| ERC-3643 (T-REX) | v4.1.3 | ✓ Extended |
| GS1 Digital Link | 1.6.0 | ✓ Conformant |
| GS1 Conformant Resolver | 1.2.0 | ✓ Conformant |
| EPCIS | 2.0 | ✓ Aligned |

---

## Repository Structure

```
├── LICENSE                    # Apache 2.0
├── CONTRIBUTING.md            # RFC process & DCO sign-off
├── CODE_OF_CONDUCT.md         # Community standards
├── SECURITY.md                # Vulnerability disclosure policy
├── governance/
│   ├── CHARTER.md             # Governance charter
│   ├── DCO.md                 # Developer Certificate of Origin
│   ├── VERSIONING.md          # Semantic versioning policy
│   └── ...                    # TSC, membership, RFCs
├── specifications/
│   ├── architecture/          # Hybrid model, crypto-agility
│   ├── identity/              # DID method, ONCHAINID, VCs
│   ├── contracts/             # Solidity interfaces (17)
│   ├── schemas/               # JSON schemas (17)
│   ├── resolver/              # GS1 resolver specs
│   ├── infrastructure/        # RBAC, audit, retention
│   └── compliance/            # GDPR, MiCA, ESPR guides
├── website/                   # Next.js documentation portal
└── release/v1.0.0/            # Release artifacts
```

---

## Regulatory Readiness

| Regulation | Deadline | Guide |
|------------|----------|-------|
| GDPR | Active | [gdpr-compliance.md](specifications/compliance/guides/gdpr-compliance.md) |
| MiCA | July 2026 | [mica-compliance.md](specifications/compliance/guides/mica-compliance.md) |
| ESPR | 2027 | [espr-readiness.md](specifications/compliance/guides/espr-readiness.md) |

---

## Contributing

We welcome contributions! Please read:

1. [CHARTER.md](governance/CHARTER.md) — Governance structure
2. [CONTRIBUTING.md](CONTRIBUTING.md) — RFC process and DCO sign-off
3. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Community standards
4. [SECURITY.md](SECURITY.md) — Vulnerability disclosure policy

---

## License

```
Copyright 2026 Galileo Luxury Standard Contributors

Licensed under the Apache License, Version 2.0
```

See [LICENSE](LICENSE) for the full text.

---

## Links

- [Release Notes v1.0.0](https://github.com/originlabs-app/galileo-luxury-standard/releases/tag/v1.0.0)
- [Changelog](release/v1.0.0/CHANGELOG.md)
- [Specification Index](release/v1.0.0/PUBLICATION-BUNDLE.md)

---

*Galileo Luxury Standard — Protecting Heritage Through Interoperability*

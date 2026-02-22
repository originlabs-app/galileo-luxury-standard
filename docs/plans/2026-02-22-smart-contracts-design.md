# Galileo Protocol Smart Contracts — Design Document

**Date:** 2026-02-22
**Status:** Approved
**Author:** Dev Lead (autonomous)

---

## 1. Goal

Implement the full Galileo Protocol smart contract suite in Solidity, turning the 17 existing interface specifications into working, tested, deployable contracts. Deliver as a PR-ready Foundry project.

## 2. Framework

**Foundry** (forge, cast, anvil) — pure Solidity toolchain.

- Tests written in Solidity (forge test)
- Built-in fuzz testing
- forge scripts for deployment
- Industry standard for serious Solidity projects in 2026

Dependencies:
- OpenZeppelin Contracts v5.x (access control, upgradeable patterns, utilities)
- ERC-3643 T-REX v4.1.3 interfaces (base token, identity, compliance)

## 3. Architecture

```
contracts/
├── foundry.toml
├── script/
│   └── Deploy.s.sol
├── src/
│   ├── token/
│   │   └── GalileoToken.sol
│   ├── identity/
│   │   ├── GalileoIdentityRegistry.sol
│   │   ├── GalileoIdentityRegistryStorage.sol
│   │   ├── GalileoClaimTopicsRegistry.sol
│   │   └── GalileoTrustedIssuersRegistry.sol
│   ├── compliance/
│   │   ├── GalileoCompliance.sol
│   │   └── modules/
│   │       ├── BrandAuthorizationModule.sol
│   │       ├── CPOCertificationModule.sol
│   │       ├── JurisdictionModule.sol
│   │       ├── SanctionsModule.sol
│   │       └── ServiceCenterModule.sol
│   └── infrastructure/
│       └── GalileoAccessControl.sol
├── test/
│   ├── token/GalileoToken.t.sol
│   ├── identity/GalileoIdentityRegistry.t.sol
│   ├── compliance/GalileoCompliance.t.sol
│   ├── compliance/modules/BrandAuthorizationModule.t.sol
│   ├── compliance/modules/CPOCertificationModule.t.sol
│   ├── compliance/modules/JurisdictionModule.t.sol
│   ├── compliance/modules/SanctionsModule.t.sol
│   ├── compliance/modules/ServiceCenterModule.t.sol
│   ├── infrastructure/GalileoAccessControl.t.sol
│   └── integration/FullLifecycle.t.sol
└── README.md
```

## 4. Contract Summaries

### 4.1 Infrastructure

**GalileoAccessControl.sol** — Implements `IAccessControl` from specs. Multi-role RBAC with:
- PROTOCOL_ADMIN, BRAND_MANAGER, COMPLIANCE_OFFICER, TOKEN_AGENT, CLAIM_ISSUER roles
- Role hierarchy and delegation
- Emergency pause capability

### 4.2 Identity Layer

**GalileoClaimTopicsRegistry.sol** — Implements `IGalileoClaimTopicsRegistry`. Manages the registry of recognized claim topics (AUTHENTICATOR, SERVICE_CENTER, VIP_COLLECTOR, etc.)

**GalileoTrustedIssuersRegistry.sol** — Implements `IGalileoTrustedIssuersRegistry`. Manages trusted claim issuers and which topics they can attest to.

**GalileoIdentityRegistryStorage.sol** — Implements `IGalileoIdentityRegistryStorage`. Persistent storage for identity-to-address mappings, country codes, and ONCHAINID references.

**GalileoIdentityRegistry.sol** — Implements `IGalileoIdentityRegistry`. Core identity verification with:
- Cross-brand consent verification (GDPR Art. 6)
- Batch verification for gas efficiency
- Consortium membership federation

### 4.3 Token

**GalileoToken.sol** — Implements `IGalileoToken` extending ERC-3643 IToken. Single-supply token pattern (totalSupply = 1 per deployment = 1 physical luxury product):
- Product DID metadata storage
- CPO (Certified Pre-Owned) certification management
- Transfer with reason codes for compliance audit trail
- Integration with Identity + Compliance layers

### 4.4 Compliance

**GalileoCompliance.sol** — Implements `IGalileoCompliance`. Modular compliance engine:
- Ordered module execution pipeline
- Detailed failure reasons (canTransferWithReason)
- Batch compliance checks
- Module introspection by type

**5 Compliance Modules:**
- `BrandAuthorizationModule` — Verifies authorized retailers
- `CPOCertificationModule` — Enforces CPO requirements for resale
- `JurisdictionModule` — Country-based transfer restrictions
- `SanctionsModule` — OFAC/EU sanctions screening
- `ServiceCenterModule` — MRO (Maintenance, Repair, Operations) authorization

## 5. Data Flow

```
1. Brand deploys GalileoToken (1 per product)
2. Brand registers in IdentityRegistry via ONCHAINID
3. Brand configures compliance modules on token
4. Buyer gets verified via ClaimTopicsRegistry + TrustedIssuers
5. Transfer request → Compliance pipeline checks all modules
6. If compliant → ownership transferred on-chain
7. CPO certifier can certify token for secondary market
```

## 6. Implementation Order

| Phase | Contract(s) | Depends On |
|-------|-------------|------------|
| 1 | GalileoAccessControl | Nothing |
| 2 | ClaimTopicsRegistry, TrustedIssuersRegistry | AccessControl |
| 3 | IdentityRegistryStorage, IdentityRegistry | Phase 2 |
| 4 | GalileoToken | Identity layer |
| 5 | GalileoCompliance + 5 modules | Identity + Token |
| 6 | Integration tests | All contracts |
| 7 | Deploy scripts | All contracts |

## 7. Testing Strategy

- **Unit tests**: Each contract tested in isolation with mocks
- **Fuzz tests**: Critical functions (transfers, compliance checks) fuzz tested
- **Integration test**: Full lifecycle from deployment to CPO resale
- **Target**: 100% function coverage on all public/external functions

## 8. Deliverable

A single PR to `main` containing:
- Complete `contracts/` directory with Foundry project
- All contracts implementing existing interfaces
- Full test suite passing
- Deployment script
- contracts/README.md with usage instructions
- Updated root CHANGELOG

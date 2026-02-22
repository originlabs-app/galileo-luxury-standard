# Galileo Smart Contracts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the full Galileo Protocol smart contract suite in Foundry, turning 17 interface specifications into working, tested, deployable contracts.

**Architecture:** Foundry project in `contracts/` directory. Contracts implement existing interfaces from `specifications/contracts/`. Dependencies: OpenZeppelin v5.x, ERC-3643 T-REX v4.1.3. Single-supply token pattern (1 token = 1 luxury product).

**Tech Stack:** Solidity ^0.8.20, Foundry (forge/cast/anvil), OpenZeppelin Contracts, ERC-3643

---

### Task 1: Foundry Project Initialization

**Files:**
- Create: `contracts/foundry.toml`
- Create: `contracts/src/.gitkeep`
- Create: `contracts/test/.gitkeep`
- Create: `contracts/script/.gitkeep`
- Create: `contracts/README.md`
- Create: `contracts/.gitignore`
- Modify: `.github/workflows/ci.yml` (add contracts job)

**Steps:**
1. Run `cd contracts && forge init --no-git --no-commit`
2. Configure foundry.toml with remappings for OZ + ERC-3643
3. Install deps: `forge install OpenZeppelin/openzeppelin-contracts@v5.1.0 --no-git`
4. Install ERC-3643: `forge install TokenySolutions/T-REX@v4.1.3 --no-git`
5. Copy interface files from `specifications/contracts/` to `contracts/src/interfaces/`
6. Verify compilation: `forge build`
7. Commit

---

### Task 2: GalileoAccessControl Implementation

**Files:**
- Create: `contracts/src/infrastructure/GalileoAccessControl.sol`
- Create: `contracts/test/infrastructure/GalileoAccessControl.t.sol`

**Implementation:** Extends OpenZeppelin AccessControlEnumerable. Implements IGalileoAccessControl with:
- 5 role constants (BRAND_ADMIN, OPERATOR, AUDITOR, REGULATOR, SERVICE_CENTER_ADMIN)
- Identity-aware role grants (grantRoleWithIdentity)
- Two-phase role grants with time delay
- Suspension mechanism (suspendRole/reinstateRole)
- Emergency access with auto-expiry (max 7 days)
- canExerciseRole combining hasRole + !suspended + emergency check

**Tests:** Role granting, suspension, emergency access, two-phase grants, edge cases.

---

### Task 3: GalileoClaimTopicsRegistry Implementation

**Files:**
- Create: `contracts/src/identity/GalileoClaimTopicsRegistry.sol`
- Create: `contracts/test/identity/GalileoClaimTopicsRegistry.t.sol`

**Implementation:** Extends ERC-3643 IClaimTopicsRegistry. Implements IGalileoClaimTopicsRegistry with:
- TopicMetadata struct storage (namespace, description, defaultExpiry, isCompliance)
- addClaimTopicWithMetadata + standard addClaimTopic
- Topic deprecation with reason
- Namespace-based topic ID computation (keccak256)
- getTopicsByType (compliance vs heritage filtering)
- getTopicsByPrefix (namespace prefix matching)
- GalileoClaimTopics library constants already defined in interface

**Tests:** Add topics, metadata queries, deprecation, prefix filtering, known topic checks.

---

### Task 4: GalileoTrustedIssuersRegistry Implementation

**Files:**
- Create: `contracts/src/identity/GalileoTrustedIssuersRegistry.sol`
- Create: `contracts/test/identity/GalileoTrustedIssuersRegistry.t.sol`

**Implementation:** Extends ERC-3643 ITrustedIssuersRegistry. Implements IGalileoTrustedIssuersRegistry with:
- IssuerCategory enum (KYC_PROVIDER, BRAND_ISSUER, AUTH_LAB, REGULATORY_BODY)
- Certification struct storage (standard, reference, validUntil, verificationURI)
- addTrustedIssuerWithCategory
- Issuer suspension/reactivation
- Topic-level revocation (revokeIssuerForTopic)
- Category-based filtering (getIssuersByCategory)
- Certification validity checking

**Tests:** Add issuers, categorization, suspension, topic revocation, certification expiry.

---

### Task 5: GalileoIdentityRegistryStorage Implementation

**Files:**
- Create: `contracts/src/identity/GalileoIdentityRegistryStorage.sol`
- Create: `contracts/test/identity/GalileoIdentityRegistryStorage.t.sol`

**Implementation:** Extends ERC-3643 IIdentityRegistryStorage. Implements IGalileoIdentityRegistryStorage with:
- Brand registry binding with DID tracking (bindBrandRegistry)
- Registry bound/unbound status checking
- Brand DID association per registry
- Pagination support (boundRegistryAt, boundRegistryCount)
- Binding timestamp tracking
- canBindNewRegistry capacity check

**Tests:** Bind/unbind registries, DID tracking, pagination, access control.

---

### Task 6: GalileoIdentityRegistry Implementation

**Files:**
- Create: `contracts/src/identity/GalileoIdentityRegistry.sol`
- Create: `contracts/test/identity/GalileoIdentityRegistry.t.sol`

**Implementation:** Extends ERC-3643 IIdentityRegistry. Implements IGalileoIdentityRegistry with:
- Cross-brand consent verification (isVerifiedWithConsent)
- Batch verification (batchVerify)
- Batch verification with consent (batchVerifyWithConsent)
- Consortium membership management
- Identity count tracking
- Claim topic support checking

**Depends on:** Tasks 3, 4, 5 (ClaimTopics, TrustedIssuers, Storage)

**Tests:** Registration, verification, consent checks, batch operations, consortium membership.

---

### Task 7: GalileoToken Implementation

**Files:**
- Create: `contracts/src/token/GalileoToken.sol`
- Create: `contracts/test/token/GalileoToken.t.sol`

**Implementation:** Extends ERC-3643 Token. Implements IGalileoToken with:
- Single-supply pattern (totalSupply = 1 always)
- Product metadata (productDID, brandDID, productCategory, productURI, gtin, serialNumber)
- CPO certification lifecycle (certifyCPO, revokeCPO, isCPOCertified)
- Transfer with reason codes (transferWithReason)
- Decommission mechanism
- TokenEvents library integration
- Identity Registry + Compliance binding

**Depends on:** Task 6 (IdentityRegistry)

**Tests:** Minting, CPO certification/revocation, transfer with reason, decommission, metadata queries.

---

### Task 8: GalileoCompliance Implementation

**Files:**
- Create: `contracts/src/compliance/GalileoCompliance.sol`
- Create: `contracts/test/compliance/GalileoCompliance.t.sol`

**Implementation:** Extends ERC-3643 ModularCompliance. Implements IGalileoCompliance with:
- Ordered module execution pipeline
- canTransferWithReason (detailed failure reasons)
- canTransferBatch (gas-efficient batch checks)
- Module introspection by type
- Module ordering support

**Depends on:** Task 6 (IdentityRegistry)

**Tests:** Module add/remove, transfer checks, batch checks, failure reasons, module ordering.

---

### Task 9: Compliance Modules Implementation

**Files:**
- Create: `contracts/src/compliance/modules/BrandAuthorizationModule.sol`
- Create: `contracts/src/compliance/modules/CPOCertificationModule.sol`
- Create: `contracts/src/compliance/modules/JurisdictionModule.sol`
- Create: `contracts/src/compliance/modules/SanctionsModule.sol`
- Create: `contracts/src/compliance/modules/ServiceCenterModule.sol`
- Create: `contracts/test/compliance/modules/BrandAuthorizationModule.t.sol`
- Create: `contracts/test/compliance/modules/CPOCertificationModule.t.sol`
- Create: `contracts/test/compliance/modules/JurisdictionModule.t.sol`
- Create: `contracts/test/compliance/modules/SanctionsModule.t.sol`
- Create: `contracts/test/compliance/modules/ServiceCenterModule.t.sol`

**Implementation:** Each module implements IComplianceModule + its specific interface:
- BrandAuthorizationModule: Checks authorized retailer claims
- CPOCertificationModule: Enforces CPO requirements for resale
- JurisdictionModule: Country-based transfer restrictions
- SanctionsModule: OFAC/EU sanctions screening via oracle
- ServiceCenterModule: MRO authorization validation

**Depends on:** Task 8 (GalileoCompliance)

**Tests:** Each module tested independently with mock data.

---

### Task 10: Integration Test — Full Lifecycle

**Files:**
- Create: `contracts/test/integration/FullLifecycle.t.sol`

**Test scenario:**
1. Deploy full infrastructure (AccessControl, Identity layer, Compliance, Token)
2. Register brand identity with KYB claim
3. Mint product token (1 luxury watch)
4. Register buyer identity with KYC claim
5. Transfer token from brand to buyer (SALE reason)
6. CPO certification by authorized authenticator
7. Secondary sale to new buyer via transferWithReason
8. Decommission token

**Depends on:** All previous tasks

---

### Task 11: Deployment Script

**Files:**
- Create: `contracts/script/Deploy.s.sol`

**Implementation:** Foundry script that deploys the full stack in correct order:
1. GalileoAccessControl
2. GalileoClaimTopicsRegistry (with initial topics)
3. GalileoTrustedIssuersRegistry
4. GalileoIdentityRegistryStorage
5. GalileoIdentityRegistry
6. GalileoCompliance + modules
7. Wire everything together (set registries, bind compliance)

---

### Task 12: Documentation & PR

**Files:**
- Create: `contracts/README.md` (full usage guide)
- Modify: `release/v1.0.0/CHANGELOG.md` (add contracts section)

**Steps:**
1. Write comprehensive contracts/README.md
2. Update CHANGELOG
3. Final `forge build && forge test` verification
4. Create PR to main

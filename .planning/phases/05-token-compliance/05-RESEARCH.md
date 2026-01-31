# Phase 5: Token & Compliance Layer - Research

**Researched:** 2026-01-31
**Domain:** ERC-3643 (T-REX) Token Standard, Modular Compliance, KYC/AML Integration
**Confidence:** HIGH

## Summary

This phase specifies Solidity interfaces for compliant ownership transfer of luxury goods using the ERC-3643 (T-REX) standard. ERC-3643 v4.1.3 is the production-ready security token standard with over $32 billion in tokenized assets, now being considered for ISO standardization. The standard provides a complete framework for permissioned tokens with identity verification, modular compliance rules, and regulatory controls.

The key insight for Galileo is that ERC-3643 was designed for fungible security tokens, but the luxury use case requires **one token = one physical product**. This can be achieved by either using ERC-3643N (the non-fungible variant) or treating each product as a separate token deployment where total supply is always 1. The research recommends adapting ERC-3643 patterns with luxury-specific compliance modules.

**Primary recommendation:** Extend IToken and IModularCompliance interfaces from ERC-3643 v4.1.3 with Galileo-specific luxury compliance modules (brand authorization, CPO certification, service center validation). Integrate with Phase 4 identity infrastructure for pre-transfer verification.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @erc3643org/erc-3643 | 4.1.3 | Token interfaces and base compliance | Official ERC-3643 implementation, audited by Kaspersky and Hacken |
| ONCHAINID | Latest | Identity contracts (ERC-734/735) | Native identity standard proven in T-REX ecosystem |
| OpenZeppelin Contracts | 5.x | Access control, pausable, roles | Industry standard for secure contract patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Chainalysis Oracle | Deployed | OFAC sanctions screening | AML compliance module integration |
| @openzeppelin/contracts-upgradeable | 5.x | Upgradeable compliance modules | When modules need to be upgradeable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ERC-3643 | ERC-1400 | ERC-1400 is older, less active community, fungible only |
| ERC-3643 | Custom ERC-721 | Would need to hand-roll all compliance features |
| Chainalysis Oracle | TRM Labs API | TRM is off-chain only; Chainalysis has on-chain oracle |

**Installation:**
```bash
npm install @erc3643org/erc-3643@4.1.3 @openzeppelin/contracts@5.0.0
```

**Import paths:**
```solidity
import "@erc3643org/erc-3643/contracts/token/IToken.sol";
import "@erc3643org/erc-3643/contracts/compliance/IModularCompliance.sol";
import "@erc3643org/erc-3643/contracts/compliance/modular/IModule.sol";
```

## Architecture Patterns

### Recommended Project Structure
```
specifications/contracts/token/
├── IToken.sol                    # Extended IToken interface
├── IGalileoToken.sol             # Galileo-specific token extensions
├── events/
│   └── TokenEvents.sol           # Token event definitions
specifications/contracts/compliance/
├── IModularCompliance.sol        # Extended compliance interface
├── IGalileoCompliance.sol        # Galileo-specific compliance
├── IComplianceModule.sol         # Module interface
├── modules/                      # Compliance module interfaces
│   ├── IBrandAuthorizationModule.sol
│   ├── ICPOCertificationModule.sol
│   ├── ISanctionsModule.sol
│   ├── IJurisdictionModule.sol
│   └── IBalanceLimitModule.sol
specifications/token/
├── ownership-transfer.md         # Transfer specification
├── compliance-modules.md         # Module specifications
└── hooks-specification.md        # KYC/AML hook specs
```

### Pattern 1: Transfer Validation Flow

**What:** The ERC-3643 transfer validation pattern checks identity and compliance before allowing transfers.

**When to use:** All token transfers (transfer, transferFrom, forcedTransfer)

**Validation Sequence:**
```
1. Check global pause status
   └── If paused, revert

2. Check address freeze status
   └── If sender OR receiver frozen, revert

3. Check partial freeze (sender balance)
   └── If amount > (balance - frozenTokens), revert

4. Identity Registry verification
   └── identityRegistry.isVerified(receiver) must be true
   └── Checks: registered identity + required claims from trusted issuers

5. Compliance check
   └── compliance.canTransfer(from, to, amount) must return true
   └── Evaluates all bound compliance modules

6. Execute transfer (update balances)

7. Post-transfer notification
   └── compliance.transferred(from, to, amount)
   └── Modules update internal state (e.g., daily limits)
```

**Code Example:**
```solidity
// Source: ERC-3643 v4.1.3 IToken specification
function transfer(address _to, uint256 _amount) external returns (bool) {
    require(!paused(), "Token is paused");
    require(!isFrozen(msg.sender), "Sender is frozen");
    require(!isFrozen(_to), "Receiver is frozen");
    require(balanceOf(msg.sender) - getFrozenTokens(msg.sender) >= _amount, "Insufficient unfrozen balance");
    require(identityRegistry().isVerified(_to), "Receiver not verified");
    require(compliance().canTransfer(msg.sender, _to, _amount), "Transfer not compliant");

    // Execute transfer...

    compliance().transferred(msg.sender, _to, _amount);
    return true;
}
```

### Pattern 2: Modular Compliance Architecture

**What:** Compliance rules are implemented as separate modules that can be added/removed from tokens.

**When to use:** All compliance rule enforcement

**Module Lifecycle:**
```solidity
// Source: ERC-3643 v4.1.3 IModularCompliance
interface IModularCompliance {
    // Token binding
    function bindToken(address _token) external;
    function unbindToken(address _token) external;
    function isTokenBound(address _token) external view returns (bool);

    // Module management
    function addModule(address _module) external;
    function removeModule(address _module) external;
    function getModules() external view returns (address[] memory);

    // Compliance checking
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);

    // State updates (called by token after transfer)
    function transferred(address _from, address _to, uint256 _amount) external;
    function created(address _to, uint256 _amount) external;
    function destroyed(address _from, uint256 _amount) external;
}
```

**Module Interface:**
```solidity
// Source: ERC-3643 v4.1.3 IModule
interface IModule {
    function moduleCheck(address _from, address _to, uint256 _value, address _compliance)
        external view returns (bool);
    function moduleMintAction(address _to, uint256 _value, address _compliance) external;
    function moduleBurnAction(address _from, uint256 _value, address _compliance) external;
    function moduleTransferAction(address _from, address _to, uint256 _value, address _compliance) external;
}
```

### Pattern 3: Recovery Mechanism

**What:** Allows recovery of tokens from lost/compromised wallets while preserving identity association.

**When to use:** Investor loses private keys or wallet compromised

**Flow:**
```
1. Investor contacts issuer with identity proof (off-chain)
2. Issuer verifies investor identity matches ONCHAINID
3. Agent calls recoveryAddress(lostWallet, newWallet, investorOnchainID)
4. Token transfers balance from lostWallet to newWallet
5. RecoverySuccess event emitted for audit trail
```

```solidity
// Source: ERC-3643 v4.1.3 IToken
function recoveryAddress(
    address _lostWallet,
    address _newWallet,
    address _investorOnchainID
) external returns (bool);

event RecoverySuccess(
    address indexed _lostWallet,
    address indexed _newWallet,
    address indexed _investorOnchainID
);
```

### Anti-Patterns to Avoid

- **Skipping compliance.transferred():** Always call after successful transfer; modules need state updates
- **Checking canTransfer without isVerified:** Both checks are required; they serve different purposes
- **Inline compliance logic:** Use modular compliance; never hardcode rules in token contract
- **Single-key agent access:** Agent roles must use multi-sig for production deployments

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transfer compliance checking | Custom require() statements | IModularCompliance + modules | Complex state tracking, upgradeable rules |
| Sanctions screening | Manual blocklist | Chainalysis Oracle | Maintained by experts, legally defensible |
| Address freeze | Simple mapping | IToken.setAddressFrozen() + freezePartialTokens() | Supports partial freeze, batch operations |
| Token recovery | Manual burn/mint | IToken.recoveryAddress() | Audit trail, identity verification |
| Batch operations | Loop in application | IToken.batchTransfer(), batchMint(), etc. | Gas optimized, atomic execution |
| Country restrictions | Custom mapping | CountryAllowModule / CountryRestrictModule | Proven, tested, audited |

**Key insight:** ERC-3643 v4.1.3 has 9 compliance modules covering common cases. Build Galileo-specific modules only for luxury domain requirements.

## Common Pitfalls

### Pitfall 1: Treating ERC-3643 as ERC-20

**What goes wrong:** Developers assume standard ERC-20 transfer patterns work, skip compliance checks.
**Why it happens:** ERC-3643 is ERC-20 compatible for read operations but writes have prerequisites.
**How to avoid:** Always check: (1) receiver isVerified, (2) compliance.canTransfer before any transfer.
**Warning signs:** Transfers failing with "not verified" or "not compliant" errors in production.

### Pitfall 2: Forgetting Post-Transfer Hooks

**What goes wrong:** compliance.transferred() not called, modules have stale state, daily limits broken.
**Why it happens:** Focus on pre-transfer checks; post-transfer notification seems optional.
**How to avoid:** transferred() is NOT optional. Every successful transfer must notify compliance.
**Warning signs:** Time-based limits (daily, monthly) not enforcing correctly.

### Pitfall 3: Agent Key Compromise

**What goes wrong:** Single agent key controls freeze, recovery, forced transfers. Key compromise = total control.
**Why it happens:** Simpler deployment without multi-sig.
**How to avoid:** Production deployments MUST use multi-sig (2-of-3 minimum) for agent roles.
**Warning signs:** Single EOA address as agent in mainnet deployment.

### Pitfall 4: Identity Registry Not Synchronized

**What goes wrong:** Token bound to wrong identity registry, verification checks pass/fail unexpectedly.
**Why it happens:** Multiple registries in ecosystem, wrong one configured.
**How to avoid:** Verify identityRegistry() returns expected address before any operation.
**Warning signs:** Users verified in one context fail verification in token transfers.

### Pitfall 5: Chainalysis Oracle Stale Data

**What goes wrong:** Relying solely on Chainalysis oracle; OFAC adds address, oracle not yet updated.
**Why it happens:** Oracle updates are not real-time (can be 60+ days delayed).
**How to avoid:** Use oracle as one layer; implement additional off-chain screening for high-value transfers.
**Warning signs:** Transferring to address that was recently sanctioned but oracle returns false.

### Pitfall 6: Missing Country Code in Identity

**What goes wrong:** Country-based compliance modules fail; user has identity but no country.
**Why it happens:** Country code (uint16 ISO 3166-1) not set during identity registration.
**How to avoid:** Always call registerIdentity(address, IIdentity, uint16 countryCode) with valid country.
**Warning signs:** CountryAllowModule/CountryRestrictModule always failing for certain users.

## Code Examples

Verified patterns from official sources:

### IToken Interface Extension for Galileo

```solidity
// Based on: ERC-3643 v4.1.3 IToken
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@erc3643org/erc-3643/contracts/token/IToken.sol";

/**
 * @title IGalileoToken
 * @notice Extended ERC-3643 token interface for luxury product ownership
 * @dev Extends IToken with luxury-specific ownership representation
 */
interface IGalileoToken is IToken {
    // Luxury product metadata
    function productDID() external view returns (string memory);
    function productCategory() external view returns (string memory);
    function brandDID() external view returns (string memory);

    // CPO (Certified Pre-Owned) status
    function isCPOCertified() external view returns (bool);
    function cpoCertificationDate() external view returns (uint256);
    function cpoCertifier() external view returns (address);

    // Events
    event CPOCertified(address indexed certifier, uint256 timestamp);
    event CPORevoked(address indexed revoker, string reason);
}
```

### Modular Compliance Interface Extension

```solidity
// Based on: ERC-3643 v4.1.3 IModularCompliance
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@erc3643org/erc-3643/contracts/compliance/IModularCompliance.sol";

/**
 * @title IGalileoCompliance
 * @notice Extended modular compliance for luxury goods transfers
 */
interface IGalileoCompliance is IModularCompliance {
    // Pre-check with detailed reason
    function canTransferWithReason(
        address _from,
        address _to,
        uint256 _amount
    ) external view returns (bool allowed, string memory reason);

    // Batch compliance check
    function canTransferBatch(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _amounts
    ) external view returns (bool[] memory results);
}
```

### Brand Authorization Compliance Module

```solidity
// Galileo-specific compliance module
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@erc3643org/erc-3643/contracts/compliance/modular/IModule.sol";

/**
 * @title IBrandAuthorizationModule
 * @notice Compliance module requiring transfers through authorized retailers
 */
interface IBrandAuthorizationModule is IModule {
    // Check if address is authorized retailer for this brand
    function isAuthorizedRetailer(address _address) external view returns (bool);

    // Get the brand DID this module is configured for
    function brandDID() external view returns (string memory);

    // Configure authorized retailer claim topic
    function setAuthorizedRetailerClaimTopic(uint256 _claimTopic) external;

    // Events
    event AuthorizedRetailerAdded(address indexed retailer);
    event AuthorizedRetailerRemoved(address indexed retailer);
}
```

### Sanctions Screening Module

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@erc3643org/erc-3643/contracts/compliance/modular/IModule.sol";

/**
 * @title ISanctionsModule
 * @notice Compliance module integrating Chainalysis oracle for OFAC screening
 */
interface ISanctionsModule is IModule {
    // Chainalysis oracle address (same on most EVM chains)
    // 0x40C57923924B5c5c5455c48D93317139ADDaC8fb
    function sanctionsOracle() external view returns (address);

    // Check if address is sanctioned
    function isSanctioned(address _address) external view returns (bool);

    // Set oracle address (for chain-specific deployments)
    function setSanctionsOracle(address _oracle) external;

    // Events
    event SanctionedTransferBlocked(
        address indexed from,
        address indexed to,
        uint256 amount
    );
}
```

### KYC/KYB Pre-Transfer Hook Pattern

```solidity
// Integration with Phase 4 Identity Infrastructure
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "../identity/IIdentityRegistry.sol";
import "../identity/IClaimTopicsRegistry.sol";

/**
 * @title IKYCComplianceHook
 * @notice Hook interface for KYC/KYB verification before transfers
 */
interface IKYCComplianceHook {
    // Required claim topics for transfer eligibility
    function requiredClaimTopics() external view returns (uint256[] memory);

    // Verify sender has required KYC claims
    function verifySenderEligibility(address _sender) external view returns (bool);

    // Verify receiver has required KYC claims
    function verifyReceiverEligibility(address _receiver) external view returns (bool);

    // Batch verify for both parties (gas efficient)
    function verifyTransferEligibility(
        address _sender,
        address _receiver
    ) external view returns (bool senderOk, bool receiverOk);

    // Events
    event KYCVerificationFailed(address indexed party, uint256 missingClaimTopic);
}
```

### Chainalysis Oracle Integration

```solidity
// Source: Chainalysis Oracle Documentation
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title SanctionsList (Chainalysis Oracle)
 * @notice Interface for Chainalysis sanctions screening oracle
 * @dev Deployed at 0x40C57923924B5c5c5455c48D93317139ADDaC8fb on most EVM chains
 */
interface SanctionsList {
    function isSanctioned(address addr) external view returns (bool);
}

/**
 * @notice Example integration in compliance module
 */
abstract contract SanctionsCompliant {
    SanctionsList public constant SANCTIONS_ORACLE =
        SanctionsList(0x40C57923924B5c5c5455c48D93317139ADDaC8fb);

    modifier notSanctioned(address _from, address _to) {
        require(!SANCTIONS_ORACLE.isSanctioned(_from), "Sender is sanctioned");
        require(!SANCTIONS_ORACLE.isSanctioned(_to), "Receiver is sanctioned");
        _;
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ERC-1400 security tokens | ERC-3643 permissioned tokens | 2021-2023 | Better compliance modularity, active ecosystem |
| Manual blocklists | Chainalysis on-chain oracle | 2022 | Real-time sanctions compliance |
| Token-level compliance | Modular compliance contracts | ERC-3643 v4.0 | Upgradeable rules, reusable modules |
| TokenySolutions/T-REX | ERC-3643/ERC-3643 | Oct 2025 | Repository migrated to official ERC-3643 org |
| Single token for asset class | Per-product tokens | Luxury domain | One token = one physical product |

**Deprecated/outdated:**
- **TokenySolutions/T-REX repo**: Archived October 28, 2025. Use https://github.com/ERC-3643/ERC-3643 instead.
- **@tokenysolutions/t-rex npm**: Deprecated. Use @erc3643org/erc-3643 instead.
- **ERC-1400**: Less active development, fungible only, limited compliance modularity.

## Galileo-Specific Extensions

### One Token = One Physical Product

ERC-3643 was designed for fungible security tokens. For Galileo's luxury goods where each token represents a unique physical product:

**Option A: Single-Supply Token Pattern**
```solidity
// Each product gets its own token deployment
// totalSupply() always returns 1
// Simpler but more deployments
```

**Option B: ERC-3643N Non-Fungible Variant**
```
// Community-developed NFT variant of ERC-3643
// Combines ERC-721 uniqueness with ERC-3643 compliance
// Status: Available but less documented than standard ERC-3643
```

**Recommendation:** Use Option A (single-supply pattern) for v1. It leverages proven ERC-3643 infrastructure while representing unique products.

### Luxury-Specific Compliance Modules Needed

| Module | Purpose | Claim Topic Used |
|--------|---------|------------------|
| BrandAuthorizationModule | Only authorized retailers can initiate sales | AUTHORIZED_RETAILER |
| CPOCertificationModule | Resale requires CPO certification | AUTHENTICITY_VERIFIED |
| ServiceCenterModule | Repairs must go through authorized centers | SERVICE_CENTER |
| AuctionHouseModule | High-value resale via licensed auction houses | AUCTION_HOUSE |

### Integration with Phase 4 Identity

```solidity
// Use batchVerify for efficient multi-claim checks
IGalileoIdentityRegistry registry = IGalileoIdentityRegistry(identityRegistry());

uint256[] memory topics = new uint256[](2);
topics[0] = GalileoClaimTopics.KYC_BASIC;
topics[1] = GalileoClaimTopics.AUTHORIZED_RETAILER;

bool[] memory results = registry.batchVerify(retailerAddress, topics);
require(results[0] && results[1], "Retailer not eligible");
```

## MiCA / Travel Rule Considerations

As of December 30, 2024, MiCA Travel Rule is in effect with **no de minimis threshold** for EU:

| Requirement | Impact on Galileo |
|-------------|-------------------|
| Originator/beneficiary data required | Token transfers must include identity metadata |
| All CASPs must comply | Any CASP handling Galileo tokens needs Travel Rule compliance |
| Self-hosted wallet procedures | Special handling for transfers to/from non-custodial wallets |

**Implementation approach:** Travel Rule compliance is primarily an off-chain concern. On-chain, ensure:
1. All parties have verified identities (Phase 4 infrastructure)
2. Transfer metadata can be retrieved from identity contracts
3. Events include sufficient data for compliance reporting

## Open Questions

Things that couldn't be fully resolved:

1. **ERC-3643N Documentation Gap**
   - What we know: ERC-3643N exists as a non-fungible variant
   - What's unclear: No official documentation found; may be community-maintained
   - Recommendation: Stick with single-supply ERC-3643 tokens for v1

2. **Chainalysis Oracle Update Latency**
   - What we know: Oracle can be 60+ days behind OFAC updates
   - What's unclear: Exact update frequency, SLA commitments
   - Recommendation: Layer oracle with off-chain screening for high-value transfers (>EUR 10,000)

3. **Cross-Chain Compliance State**
   - What we know: ERC-3643 is EVM-only
   - What's unclear: How to handle compliance for bridged tokens
   - Recommendation: Defer cross-chain to future phase; v1 single-chain only

4. **Agent Role Multi-Sig Standard**
   - What we know: Agent roles need multi-sig protection
   - What's unclear: No ERC-3643 standard for multi-sig agent configuration
   - Recommendation: Use Safe multi-sig, document operational procedures

## Sources

### Primary (HIGH confidence)
- [EIP-3643 Specification](https://eips.ethereum.org/EIPS/eip-3643) - Official Ethereum standard
- [ERC-3643 Documentation](https://docs.erc3643.org/erc-3643) - Official protocol documentation
- [ERC-3643 GitHub Repository](https://github.com/ERC-3643/ERC-3643) - v4.1.3 reference implementation
- [Chainalysis Oracle Documentation](https://go.chainalysis.com/chainalysis-oracle-docs.html) - Sanctions screening integration

### Secondary (MEDIUM confidence)
- [QuickNode ERC-3643 Guide](https://www.quicknode.com/guides/real-world-assets/erc-3643) - Transfer validation patterns
- [ERC-3643 Modular Compliance Add-ons](https://docs.erc3643.org/erc-3643/overview-of-the-protocol/built-in-compliance-framework/modular-compliance-add-ons) - Available modules
- [AURA Blockchain Consortium](https://auraconsortium.com/) - Luxury industry precedent

### Tertiary (LOW confidence - needs validation)
- ERC-3643N non-fungible variant - Mentioned in community discussions, limited documentation
- MiCA Travel Rule implementation specifics - Regulatory guidance evolving

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official npm packages, audited implementations
- Architecture: HIGH - EIP specification, production deployments ($32B+ tokenized)
- Pitfalls: MEDIUM - Based on documentation and community feedback
- Luxury extensions: MEDIUM - Galileo-specific adaptations of proven patterns

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (60 days - ERC-3643 ecosystem stable)

---

## Recommended Plan Structure

Based on this research, the following grouping is recommended for planning:

### Task Group 1: Token Interfaces (TOKEN-01)
- IGalileoToken extending IToken
- Product metadata extensions
- CPO certification interface

### Task Group 2: Modular Compliance Interfaces (TOKEN-02)
- IGalileoCompliance extending IModularCompliance
- IComplianceModule base interface
- Module lifecycle methods

### Task Group 3: KYC/KYB Hooks (TOKEN-03, TOKEN-04)
- IKYCComplianceHook interface
- IAMLComplianceHook interface
- Integration with IGalileoIdentityRegistry.batchVerify()

### Task Group 4: Sanctions/Jurisdiction Modules (TOKEN-04, TOKEN-05)
- ISanctionsModule (Chainalysis integration)
- IJurisdictionModule (country restrictions)
- Travel Rule metadata specification

### Task Group 5: Luxury Compliance Modules (TOKEN-02 extension)
- IBrandAuthorizationModule
- ICPOCertificationModule
- IServiceCenterModule

### Task Group 6: Ownership Transfer Specification (TOKEN-06)
- Primary sale flow
- Resale flow with CPO
- Warranty transfer flow
- Service/repair flow

---

*Phase: 05-token-compliance*
*Specification: GSPEC-TOKEN-001*

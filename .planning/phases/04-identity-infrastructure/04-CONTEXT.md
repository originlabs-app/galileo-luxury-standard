# Phase 4: Identity Infrastructure - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Solidity interfaces and specifications for ERC-3643 identity layer — participant verification before token transfers using ONCHAINID pattern, claim registries (Identity Registry, Trusted Issuers Registry, Claim Topics Registry), and W3C Verifiable Credentials integration.

**Requirements:** IDENT-01 through IDENT-06
**Critical dependency:** Phase 5 (Token & Compliance) cannot proceed without this phase complete.

</domain>

<decisions>
## Implementation Decisions

### Claim Topics Design

- **Jurisdiction-aware KYC tiers** — Verification levels vary by regulatory jurisdiction (EU vs US vs APAC) to satisfy TFR and MiCA requirements
- **Luxury-specific claim types:**
  - Authorized Retailer (brand-certified sellers)
  - Service Center Certified (authorized repair/MRO facilities)
  - Authenticator Accredited (third-party authenticators: Entrupy, Real Authentication)
  - Auction House Licensed (Christie's, Sotheby's for high-value resale)
- **Optional expiration model** — Compliance claims expire (KYC valid 1 year), heritage claims are permanent until revoked (origin, authenticity)
- **Hierarchical namespaced topic IDs** — Format: `galileo:kyc:basic`, `galileo:luxury:retailer`, etc. (not numeric ERC-735 style)

### Identity Registry Model

- **Hybrid architecture (consortium + brand):**
  - Consortium registry: Trusted Issuers Registry, Claim Topics Registry (shared infrastructure)
  - Brand registries: Identity Registry per brand for customer eligibility (private, federated)
- **Self-deployed + registered provisioning** — Brands deploy their own ERC-3643 compliant registries, then register with consortium resolver
- **ONCHAINID (ERC-734/735)** — Native identity standard for participant contracts (proven in T-REX ecosystem)
- **Recovery mechanisms deferred** — Reference AA-04 (Social Recovery) in v2 requirements, not specified in v1

### Privacy Architecture

- **Hash-only on-chain** — Only claim hash + issuer signature stored on-chain; full claim content off-chain as W3C Verifiable Credentials
- **ZKP/BBS+ referenced as v2** — Simple VCs in v1, selective disclosure patterns deferred to future enhancement
- **Pseudonymous DID with optional KYC** — `did:galileo:customer:anon-{hash}` by default; KYC claims attached when required by transaction rules
- **Explicit consent for cross-brand sharing** — User controls claim sharing; brands cannot access claims without user authorization

### Issuer Trust Model

- **Tiered approval governance:**
  - TSC approves foundational/top-tier issuers (luxury houses, national authorities)
  - Working groups approve category-specific issuers (gemmology labs, MRO centers)
- **Four issuer categories in v1:**
  - KYC/AML providers (Onfido, Jumio, etc.)
  - Brand identity issuers (luxury houses authorizing retailers/service centers)
  - Authentication labs (Entrupy, gemmology labs)
  - Regulatory bodies (notified bodies for ESPR compliance)
- **Granular revocation** — Revoke issuer for specific claim topics only; historical claims for other topics remain valid (preserves object heritage)
- **Category-specific certification:**
  - Labs: ISO 17025 accreditation required
  - Data handlers: ISO 27001 required
  - Brands: Consortium audit criteria
  - MRO centers: Brand-specific authorization

### Claude's Discretion

- Interface method signatures and event structures
- Storage patterns for registries
- Error codes and revert message design
- Gas optimization considerations

</decisions>

<specifics>
## Specific Ideas

- "Hub-and-spoke" model inspired by GSBN (Global Shipping Business Network) — avoids TradeLens platform trap
- ONCHAINID creates persistent identity not tied to wallet addresses — essential for decade-long provenance
- RFC process (GOV-02) applies to new issuer category proposals
- Graduated sanctions (from Phase 1 governance) apply to issuer misconduct

</specifics>

<deferred>
## Deferred Ideas

- **Social Recovery (AA-04)** — Guardian-based key recovery, deferred to v2 Account Abstraction phase
- **BBS+ selective disclosure** — Zero-knowledge proof patterns for privacy, deferred to v2
- **Passkey Authentication (AA-05)** — WebAuthn/FIDO2 integration, deferred to v2

</deferred>

---

*Phase: 04-identity-infrastructure*
*Context gathered: 2026-01-30*

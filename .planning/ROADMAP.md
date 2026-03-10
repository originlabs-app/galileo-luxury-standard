# Roadmap: Galileo Protocol

## Overview

This roadmap converts the existing simulated brownfield MVP into a live single-brand Base Sepolia pilot. The phases are derived from the actual v1 requirements: first lock the pilot workspace and product identity model, then replace simulated chain behavior with real Base Sepolia issuance, make lifecycle evidence and public verification trustworthy, and finish with hosted demo hardening that a pilot brand can use without engineering support.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions if required later

- [x] **Phase 1: Single-Brand Workspace & Identity Baseline** - Lock pilot access control and persistent product identity prerequisites
- [x] **Phase 2: Pilot Catalog Authoring & Import** - Make passport authoring and batch catalog ingestion usable for the pilot team
- [ ] **Phase 3: Base Sepolia Deployment & Live Minting** - Replace simulated issuance with a canonical live chain environment and real mint evidence
- [ ] **Phase 4: Transfer Compliance & Lifecycle Evidence** - Complete auditable post-mint lifecycle flows for pilot demos
- [ ] **Phase 5: Public Resolver & Verification Experience** - Deliver durable QR resolution and wallet-free public provenance verification
- [ ] **Phase 6: Hosted Demo Security & Operations** - Harden the hosted pilot for customer-facing demonstrations

## Phase Details

### Phase 1: Single-Brand Workspace & Identity Baseline
**Goal**: Lock the single-brand operator workspace, secure session behavior, and persistent item identity rules so every pilot product starts from a stable and scoped foundation before chain work begins.
**Depends on**: Nothing (first phase)
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, PROD-01, PROD-03]
**Success Criteria** (what must be TRUE):
  1. An approved pilot operator can sign in through the Galileo auth flow and reach the correct private workspace.
  2. The operator session survives dashboard refresh and navigation without exposing credentials to client-side scripts.
  3. Unauthorized users or roles cannot access data or actions outside the single pilot brand workspace.
  4. An operator can create a product with validated GTIN and serial data and immediately receive its persistent GS1 Digital Link URL and Galileo DID.
**Plans**: 8 / 8 complete

Plans:
- [x] 01-01: Auth and session foundation
- [x] 01-02: Server-enforced product workspace scoping
- [x] 01-03: Setup-check-first flow and mono-brand shell
- [x] 01-04: Product identity validation
- [x] 01-05: Product identity checkpoint
- [x] 01-06: API verification gap closure
- [x] 01-07: Browser verification gap closure
- [x] 01-08: Dashboard typecheck gap closure

### Phase 2: Pilot Catalog Authoring & Import
**Goal**: Make the pilot catalog operable at demo scale by supporting batch ingestion plus full passport metadata and media authoring for public verification.
**Depends on**: Phase 1
**Requirements**: [PROD-02, PROD-04]
**Success Criteria** (what must be TRUE):
  1. An operator can import a CSV product batch and receive row-level validation feedback before bad records are accepted.
  2. Imported and manually created products share the same required passport fields and validation rules.
  3. An operator can edit the core passport metadata and linked media needed for public verification without breaking existing product identifiers.
**Plans**: 5 / 5 complete

Plans:
- [x] 02-01: Shared authoring contract and typed passport metadata
- [x] 02-02: CSV validation-first import service and API
- [x] 02-03: Dashboard import UX
- [x] 02-04: Product passport authoring UI
- [x] 02-05: Media durability and validation coverage

### Phase 3: Base Sepolia Deployment & Live Minting
**Goal**: Replace simulated blockchain behavior with a canonical Base Sepolia contract environment, live minting, and visible transaction-state evidence.
**Depends on**: Phase 2
**Requirements**: [CHAIN-01, CHAIN-02, CHAIN-03, SECO-03]
**Success Criteria** (what must be TRUE):
  1. The pilot environment exposes one canonical Base Sepolia manifest with chain ID, contract addresses, and explorer references visible to operators.
  2. Minting a passport stores a real transaction hash, contract address, and explorer URL on the corresponding product record.
  3. Operators can distinguish pending, confirmed, and failed blockchain actions in the dashboard or API.
  4. Failed chain actions include actionable recovery guidance instead of silent simulation or ambiguous status.
**Plans**: TBD

Plans:
- [ ] 03-01: Define during phase planning

### Phase 4: Transfer Compliance & Lifecycle Evidence
**Goal**: Complete the auditable lifecycle path after minting by implementing compliant transfers, recall handling, and exportable pilot evidence.
**Depends on**: Phase 3
**Requirements**: [CHAIN-04, LIFE-01, LIFE-02, LIFE-03]
**Success Criteria** (what must be TRUE):
  1. An authorized operator can transfer ownership through the current compliance flow and store the resulting on-chain evidence.
  2. Product history shows created, minted, verified, transferred, and recalled events with auditable timestamps.
  3. Recalling a product updates both the operator-facing record and the public verification state.
  4. An operator can export an audit trail or evidence bundle suitable for a pilot demo or compliance review.
**Plans**: TBD

Plans:
- [ ] 04-01: Define during phase planning

### Phase 5: Public Resolver & Verification Experience
**Goal**: Deliver the public proof surface around durable GS1 Digital Link resolution, mobile scanning, and live provenance display.
**Depends on**: Phase 4
**Requirements**: [VERI-01, VERI-02, VERI-03, VERI-04]
**Success Criteria** (what must be TRUE):
  1. Scanning the physical QR code or opening the GS1 Digital Link resolves to the correct public passport.
  2. A mobile user can verify the public passport without connecting a wallet or authenticating.
  3. The public passport shows current lifecycle state and live on-chain evidence that links back to explorer records.
  4. The resolver returns standards-aligned JSON-LD output suitable for interoperable verification.
**Plans**: TBD

Plans:
- [ ] 05-01: Define during phase planning

### Phase 6: Hosted Demo Security & Operations
**Goal**: Harden the pilot for public demonstration by combining secure hosted deployment, input validation, privacy discipline, and operator-ready demo flow stability.
**Depends on**: Phase 5
**Requirements**: [SECO-01, SECO-02]
**Success Criteria** (what must be TRUE):
  1. Public URLs exist for the dashboard, API, and scanner, and a non-engineer can complete the create, mint, print or scan, verify, and transfer flow.
  2. Operator-facing and public inputs are validated end to end, and no customer PII is written on-chain.
  3. The hosted pilot is stable enough for customer demos, with environment metadata and behavior that operators can inspect and explain.
**Plans**: TBD

Plans:
- [ ] 06-01: Define during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Single-Brand Workspace & Identity Baseline | 8 / 8 | Complete | 2026-03-09 |
| 2. Pilot Catalog Authoring & Import | 5 / 5 | Complete | 2026-03-10 |
| 3. Base Sepolia Deployment & Live Minting | TBD | Not started | - |
| 4. Transfer Compliance & Lifecycle Evidence | TBD | Not started | - |
| 5. Public Resolver & Verification Experience | TBD | Not started | - |
| 6. Hosted Demo Security & Operations | TBD | Not started | - |

---
*Roadmap created: 2026-03-09*
*Next step: plan 03-01 Base Sepolia deployment and live minting foundation*

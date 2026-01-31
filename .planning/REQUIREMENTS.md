# Requirements: Galileo Luxury Standard

**Defined:** 2026-01-30
**Core Value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable

## v1 Requirements

Requirements pour la specification technique publiable. Chaque requirement correspond a un artefact de documentation.

### Foundation (FOUND)

- [x] **FOUND-01**: Architecture document decrivant le modele hybride on-chain/off-chain
- [x] **FOUND-02**: Schema d'identite produit base sur W3C DID
- [ ] **FOUND-03**: Specification d'integration GS1 Digital Link
- [x] **FOUND-04**: Schema DPP Core Data (JSON-LD conforme ESPR)
- [ ] **FOUND-05**: Schema de resolution context-aware (routing dynamique par role)
- [x] **FOUND-06**: Specification crypto-agile (preparation PQC, certificats hybrides)

### Identity (IDENT)

- [x] **IDENT-01**: Interfaces Solidity pour Identity Registry (ERC-3643)
- [x] **IDENT-02**: Interfaces Solidity pour Identity Registry Storage
- [x] **IDENT-03**: Interfaces Solidity pour Trusted Issuers Registry
- [x] **IDENT-04**: Interfaces Solidity pour Claim Topics Registry
- [x] **IDENT-05**: Specification ONCHAINID pour participants (marques, utilisateurs)
- [x] **IDENT-06**: Specification W3C Verifiable Credentials pour claims

### Token & Compliance (TOKEN)

- [ ] **TOKEN-01**: Interfaces Solidity Token ERC-3643 (sans implementation complete)
- [ ] **TOKEN-02**: Interfaces Solidity Modular Compliance
- [ ] **TOKEN-03**: Schema de hooks KYC/KYB (interfaces, pas implementation)
- [ ] **TOKEN-04**: Schema de hooks AML/Sanctions screening
- [ ] **TOKEN-05**: Schema de restrictions juridictionnelles (export controls)
- [ ] **TOKEN-06**: Specification de transfert de propriete (basic ownership transfer)

### Lifecycle Events (EVENT)

- [x] **EVENT-01**: Schema JSON-LD pour Object Event: Creation
- [x] **EVENT-02**: Schema JSON-LD pour Object Event: Commission
- [x] **EVENT-03**: Schema JSON-LD pour Transaction Event: Sale (first sale)
- [x] **EVENT-04**: Schema JSON-LD pour Transformation Event: Repair/MRO
- [x] **EVENT-05**: Schema JSON-LD pour Transaction Event: Resale
- [x] **EVENT-06**: Schema JSON-LD pour Object Event: Decommission
- [x] **EVENT-07**: Alignement EPCIS 2.0 avec vocabulaire CBV
- [x] **EVENT-08**: Extension de schema pour signatures moleculaires/terroir (ultra-luxe)

### Infrastructure (INFRA)

- [ ] **INFRA-01**: Specification GS1 Resolver (resolution protocol)
- [ ] **INFRA-02**: Specification Access Control Framework (RBAC)
- [ ] **INFRA-03**: Specification Audit Trail (journal immutable)
- [ ] **INFRA-04**: Specification Data Retention Policies (GDPR/AML alignment)
- [ ] **INFRA-05**: Specification stockage hybride on/off-chain

### Governance (GOV)

- [x] **GOV-01**: Charte de gouvernance (regles de participation, TSC)
- [x] **GOV-02**: Processus de contribution (RFC process)
- [x] **GOV-03**: Documentation licence Apache 2.0 et IP
- [x] **GOV-04**: Processus de versionnage (semver, release process)

### Compliance Documentation (COMPL)

- [ ] **COMPL-01**: Guide de conformite GDPR (right to erasure, data minimization)
- [ ] **COMPL-02**: Guide de conformite MiCA (CASP requirements, Travel Rule)
- [ ] **COMPL-03**: Guide de preparation ESPR/DPP (readiness checklist)

## v2 Requirements

Differe a une version ulterieure. Tracke mais pas dans le roadmap actuel.

### Account Abstraction (AA)

- **AA-01**: Interfaces Solidity pour ERC-4337 EntryPoint integration
- **AA-02**: Specification Paymaster pour transactions gasless
- **AA-03**: Specification Smart Accounts (multi-sig, session keys)
- **AA-04**: Specification Social Recovery
- **AA-05**: Specification Passkey Authentication (WebAuthn/FIDO2)

### Secondary Market Advanced (MARKET)

- **MARKET-01**: Framework CPO (Certified Pre-Owned) complet
- **MARKET-02**: Specification Condition Scoring standardise
- **MARKET-03**: Specification Warranty Transfer automatise
- **MARKET-04**: API Instant Authentication pour plateformes tierces

### Interoperability (INTEROP)

- **INTEROP-01**: Multi-chain support (chain abstraction layer)
- **INTEROP-02**: Cross-consortium recognition (Aura, Arianee bridge)
- **INTEROP-03**: GS1 Resolver Federation (network participation)

## Out of Scope

Explicitement exclu. Documente pour prevenir le scope creep.

| Feature | Reason |
|---------|--------|
| Implementation complete smart contracts | On livre les interfaces, pas le code de production |
| Interface utilisateur (frontend) | La spec est independante de toute UI |
| Infrastructure d'hebergement | On documente l'architecture, pas le deploiement |
| Connecteurs ERP specifiques (SAP, Oracle) | On definit les patterns, pas les adaptateurs |
| Tokenisation financiere / trading | Rejet explicite de la speculation |
| Mobile app | Hors scope pour la specification technique |
| Custom blockchain | Utiliser les chaines EVM etablies |
| Native token / governance token | Pas d'economie de tokens au-dela de l'utilite |
| Fractional ownership | Complexite securities law (Howey test) |
| Payment processing | Pointer vers les rails de paiement existants |
| Dispute resolution tribunal | Definir les hooks, ne pas construire le tribunal |

## Traceability

Quel phase couvre quel requirement. Mis a jour lors de la creation du roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 2 | Complete |
| FOUND-02 | Phase 2 | Complete |
| FOUND-03 | Phase 6 | Pending |
| FOUND-04 | Phase 3 | Complete |
| FOUND-05 | Phase 6 | Pending |
| FOUND-06 | Phase 2 | Complete |
| IDENT-01 | Phase 4 | Complete |
| IDENT-02 | Phase 4 | Complete |
| IDENT-03 | Phase 4 | Complete |
| IDENT-04 | Phase 4 | Complete |
| IDENT-05 | Phase 4 | Complete |
| IDENT-06 | Phase 4 | Complete |
| TOKEN-01 | Phase 5 | Pending |
| TOKEN-02 | Phase 5 | Pending |
| TOKEN-03 | Phase 5 | Pending |
| TOKEN-04 | Phase 5 | Pending |
| TOKEN-05 | Phase 5 | Pending |
| TOKEN-06 | Phase 5 | Pending |
| EVENT-01 | Phase 3 | Complete |
| EVENT-02 | Phase 3 | Complete |
| EVENT-03 | Phase 3 | Complete |
| EVENT-04 | Phase 3 | Complete |
| EVENT-05 | Phase 3 | Complete |
| EVENT-06 | Phase 3 | Complete |
| EVENT-07 | Phase 3 | Complete |
| EVENT-08 | Phase 3 | Complete |
| INFRA-01 | Phase 6 | Pending |
| INFRA-02 | Phase 7 | Pending |
| INFRA-03 | Phase 7 | Pending |
| INFRA-04 | Phase 7 | Pending |
| INFRA-05 | Phase 7 | Pending |
| GOV-01 | Phase 1 | Complete |
| GOV-02 | Phase 1 | Complete |
| GOV-03 | Phase 1 | Complete |
| GOV-04 | Phase 1 | Complete |
| COMPL-01 | Phase 8 | Pending |
| COMPL-02 | Phase 8 | Pending |
| COMPL-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-31 (Phase 4 requirements complete)*

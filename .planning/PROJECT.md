# Galileo Luxury Standard

## What This Is

Un standard industriel open-source, neutre et durable pour la traçabilité et la provenance des produits de luxe. Le projet livre un corpus de spécifications techniques permettant aux marques de créer une mémoire numérique immuable de leurs objets sur plusieurs décennies, indépendamment des cycles technologiques ou des plateformes propriétaires. Contrairement aux initiatives passées (TradeLens, etc.), ce standard rejette explicitement toute logique spéculative et se concentre sur la valeur industrielle et documentaire de l'information.

## Core Value

**Protéger le patrimoine des marques et le savoir-faire humain** en établissant un langage commun permettant l'interopérabilité entre marques concurrentes sans sacrifice compétitif ni dépendance à une plateforme propriétaire.

## Requirements

### Validated (v1.0.0)

- [x] Architecture document décrivant le modèle hybride on-chain/off-chain
- [x] Data schemas JSON/TypeScript pour le Digital Product Passport (DPP)
- [x] Data schemas pour les événements lifecycle (fabrication, vente, MRO)
- [x] Interfaces Solidity basées sur ERC-3643 (conformité KYC/KYB)
- [x] Interfaces Solidity pour ERC-4337 (account abstraction, gasless tx)
- [x] Spécification du resolver GS1 Digital Link
- [x] Charte de gouvernance avec processus de contribution
- [x] Documentation de conformité GDPR-by-design
- [x] Documentation de conformité MiCA
- [x] Documentation de conformité ESPR (Digital Product Passport)

## Current Milestone: v1.1 Website & Documentation Portal

**Goal:** Create a professional presentation website and documentation portal for the Galileo Luxury Standard, enabling industry adoption and developer onboarding.

**Target features:**
- Landing page with "Obsidian Precision" design system (dark luxury aesthetic)
- Interactive documentation portal (Getting Started, API Reference, Tutorials)
- Specifications viewer with status badges (Standard/Active/Draft)
- Blog for announcements and ecosystem updates
- Production deployment (GitHub Pages or Vercel)

### Active (v1.1)

- [ ] Landing page — Hero, value proposition, architecture overview, CTAs
- [ ] Navigation — Header, mobile menu, footer with links
- [ ] Documentation portal — MDX-powered docs with sidebar navigation
- [ ] Specifications viewer — Browse specs by category with status badges
- [ ] Blog section — Markdown posts with metadata and listing
- [ ] Production deployment — Optimized build, CDN, custom domain

### Out of Scope (v1.1)

- Smart contract implementation code — specification website only
- ERP/backend integrations — documentation and guides only
- User authentication/accounts — static site, no login
- Interactive playground/sandbox — future milestone
- Localization (i18n) — English-first for v1.1
- Mobile app — out of scope

## Context

**Problème industriel :**
- Contrefaçon : $81B de pertes estimées pour l'industrie de la mode d'ici 2026
- Échec des plateformes centralisées "rent-seeking" (TradeLens fermé en 2022)
- Obsolescence des certificats papier, facilement falsifiables ou égarés
- Absence de standard neutre permettant à des marques concurrentes de collaborer

**Paysage réglementaire :**
- ESPR (Ecodesign for Sustainable Products Regulation) : DPP obligatoire dès 2027
- MiCA : en vigueur depuis décembre 2024, conformité complète requise d'ici juin 2026
- TFR (Travel Rule) : identification expéditeur/destinataire pour chaque transfert de tokens
- GDPR : interdiction de stocker des données personnelles sur blockchain

**Standards techniques existants :**
- ERC-3643 : standard pour les security tokens avec conformité native (identité on-chain)
- ERC-4337 : account abstraction pour UX sans gestion de clés privées
- GS1 Digital Link : transformation d'identifiants physiques en URLs résolvables

**Contexte concurrentiel :**
- Aura Blockchain Consortium (LVMH, Prada, Cartier, OTB) — approche consortium privé
- Initiatives propriétaires des marques (Hublot e-garanties depuis 2020)
- Pas de standard ouvert et neutre disponible à ce jour

## Constraints

- **Réglementaire (ESPR)** : Le DPP doit être prêt pour les premières catégories de produits en 2027 — définit le calendrier
- **Réglementaire (MiCA)** : Conformité complète requise d'ici juin 2026 — impacte les interfaces de transfert
- **Réglementaire (GDPR)** : Aucune donnée personnelle on-chain — impose l'architecture hybride
- **Technique (EVM)** : Compatibilité EVM requise pour bénéficier de ERC-3643 et ERC-4337
- **Technique (GS1)** : Adoption du GS1 Digital Link pour l'interopérabilité avec les scanners retail existants
- **Sécurité (PQC)** : Design crypto-agile préparant la transition vers la cryptographie post-quantique
- **Licence** : Apache 2.0 pour garantir que le standard reste un bien commun non capturable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Spec-first, pas code-first | Établir la gouvernance et le consensus industriel avant l'implémentation évite le "platform fallacy" | — Pending |
| ERC-3643 comme base | Standard le plus mature pour les actifs régulés avec conformité native | — Pending |
| Modèle hybride on/off-chain | Seul moyen de concilier immutabilité blockchain et GDPR (droit à l'oubli) | — Pending |
| Pas de tokenisation financière | Rejet explicite de la spéculation pour maintenir la neutralité industrielle | — Pending |

---
*Last updated: 2026-02-01 — Milestone v1.1 started*

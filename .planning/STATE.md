# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable
**Current focus:** v1.1 Website & Documentation Portal

## Current Position

Phase: 10 of 13 (Documentation Portal)
Plan: 04/04 complete
Status: Phase 10 COMPLETE
Last activity: 2026-02-01 — Completed 10-04-PLAN.md (Token & Compliance)

Progress: [████████████████████████████████] 100% of Phase 10 plans (4/4)

## Milestone Context

**v1.1 Goal:** Create professional presentation website and documentation portal

**Stack (already implemented):**
- Next.js 14 (App Router)
- Tailwind CSS v4
- TypeScript
- MDX for documentation
- Shiki for syntax highlighting
- Lucide-react for icons

**Design System:** "Obsidian Precision"
- Background: #050505 (obsidian), #0a0a0a (surface)
- Accent: #D4AF37 (antique gold)
- Text: #E5E5E5 (platinum), #A3A3A3 (dim)
- Technical: #00A3FF (precision blue)
- Typography: Cormorant Garamond (serif), Inter (sans), JetBrains Mono (mono)

**Files created in Phase 9:**
- `website/` — Next.js project initialized
- `website/src/app/globals.css` — Design system CSS
- `website/src/components/layout/Navigation.tsx` — Header component
- `website/src/components/sections/Hero.tsx` — Hero section
- `website/src/components/sections/ValueProposition.tsx` — Value cards
- `website/src/components/sections/Architecture.tsx` — SVG hybrid architecture diagram
- `website/src/components/sections/Features.tsx` — Code examples with shiki highlighting
- `website/src/components/sections/Standards.tsx` — Standards compliance grid (6 standards)
- `website/src/components/sections/Regulatory.tsx` — Regulatory timeline (GDPR, MiCA, ESPR)
- `website/src/components/ui/CodeBlock.tsx` — Async server component for syntax highlighting
- `website/src/components/layout/Footer.tsx` — Footer with 4-column layout
- `website/src/app/page.tsx` — Complete landing page composition with all 7 sections

## Accumulated Context

### Key Decisions (v1.0.0 — preserved)

**Governance:** Apache 2.0, DCO 1.1, TSC 11 members, anti-dominance max 2 seats/org
**Architecture:** Hybrid on/off-chain, CRAB model, ML-DSA-65/87 PQC
**Data Models:** 14-digit GTIN, EPCIS 2.0 alignment, 5 provenance grades
**Identity:** ERC-3643 v4.1.3, 12 claim topics, ONCHAINID CREATE2
**Token:** Single-supply (1:1), 5 compliance modules, 8-step validation
**Resolver:** GS1 Digital Link 1.6.0, 4 stakeholder roles
**Infrastructure:** 5 RBAC roles, 7-year audit retention
**Compliance:** GDPR CRAB, MiCA July 2026, ESPR 2027

### Key Decisions (v1.1)

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 over Docusaurus | Better control over design system, native MDX support | Implemented |
| "Obsidian Precision" design | Luxury aesthetic matching brand positioning | Implemented |
| Static generation | Fast, secure, easy to deploy (no server) | Pending |
| MDX consumes /specifications/ | Single Source of Truth — docs never desync from specs | Pending |
| Unified Docs/Specs navigation | Same sidebar, same design system for fluid UX | Pending |
| Features with real code | Show JSON-LD/Solidity excerpts as proof of standard | Implemented |
| Async Server Component for code | Zero client JS, VS Code-accurate highlighting via shiki | Implemented |
| Fuse.js local search | Lightweight search for specs viewer (no Algolia dependency) | Pending |
| Premium OG images | Core Web Vitals + OpenGraph for luxury LinkedIn/Twitter sharing | Pending |
| Section order: Hero-Value-Arch-Features-Std-Reg-Footer | Logical flow from vision to technical to compliance to action | Implemented |

### Phase 9.1 Complete (Spatial UI Upgrade)

**Delivered enhancements:**
- Swiss-Luxe typography (Outfit titles, Satoshi/Inter body, Cormorant accents)
- Deep Space mesh gradients (#1A0B2E Deep Plum, #020617 Midnight Blue)
- Angle Glow borders (conic-gradient, subtle "éclat" on hover)
- Hero asymmetric layout (60/40, floating architecture visual)
- Bento Grid layout for Features (2:1 / 1:2 asymmetric)
- Liquid Glass mouse-tracking effect
- Micro-haptic button feedback (scale 0.98)
- Full prefers-reduced-motion support

### Phase 10 Progress (Documentation Portal)

**Plan 01 Complete (Docs Infrastructure):**
- Navigation configuration with 5 sections (Getting Started, Architecture, Identity, Token, Compliance)
- DocsSidebar component with collapsible sections, active page highlighting
- Docs layout with sidebar (w-64) + content (max-w-3xl)
- Prose styling for documentation typography
- /docs route with placeholder content

**Files created:**
- `website/src/lib/docs-navigation.ts` — Navigation structure
- `website/src/components/docs/DocsSidebar.tsx` — Sidebar component
- `website/src/app/docs/layout.tsx` — Docs layout
- `website/src/app/docs/page.tsx` — Docs index page
- `website/src/app/globals.css` — Added prose styling (174 lines)

**Plan 02 Complete (Getting Started):**
- Introduction page at /docs with Why/Principles/What/Who/Next sections
- Quick Start guide at /docs/quick-start with 5-minute tutorial
- Core Concepts glossary at /docs/concepts with 15 key terms

**Files created/modified:**
- `website/src/app/docs/page.tsx` — Comprehensive introduction (replaced placeholder)
- `website/src/app/docs/quick-start/page.tsx` — Quick start guide with code examples
- `website/src/app/docs/concepts/page.tsx` — Core concepts glossary

**Plan 03 Complete (Architecture & Identity):**
- Architecture page at /docs/architecture with three-layer model ASCII diagram
- Identity overview at /docs/identity with product/participant identity
- DID Method specification at /docs/identity/did-method
- ONCHAINID integration at /docs/identity/onchainid with claim topics
- Verifiable Credentials at /docs/identity/verifiable-credentials

**Files created:**
- `website/src/app/docs/architecture/page.tsx` — Hybrid architecture overview
- `website/src/app/docs/identity/page.tsx` — Identity system overview
- `website/src/app/docs/identity/did-method/page.tsx` — DID method specification
- `website/src/app/docs/identity/onchainid/page.tsx` — ONCHAINID integration
- `website/src/app/docs/identity/verifiable-credentials/page.tsx` — Verifiable Credentials

**Plan 04 Complete (Token & Compliance):**
- Token overview at /docs/token with single-supply pattern, 5 compliance modules
- Ownership transfer at /docs/token/ownership-transfer with 8-step validation
- Compliance overview at /docs/compliance linking 3 guides
- GDPR guide at /docs/compliance/gdpr with CRAB model
- MiCA guide at /docs/compliance/mica with Travel Rule
- ESPR guide at /docs/compliance/espr with DPP schema

**Files created:**
- `website/src/app/docs/token/page.tsx` — Token architecture
- `website/src/app/docs/token/ownership-transfer/page.tsx` — Transfer specification
- `website/src/app/docs/compliance/page.tsx` — Compliance overview
- `website/src/app/docs/compliance/gdpr/page.tsx` — GDPR guide
- `website/src/app/docs/compliance/mica/page.tsx` — MiCA guide
- `website/src/app/docs/compliance/espr/page.tsx` — ESPR guide

### Pending Todos

- [ ] Shiki: Personnaliser github-dark avec couleurs Platinum/Gold (defer v1.2)
- [ ] A11y: Vérifier contraste #A3A3A3 sur labels < 14px

### Blockers/Concerns

None.

---
*State updated: 2026-02-01T12:34:22Z*
*Milestone: v1.1 Website & Documentation Portal*
*Phase 10 (Documentation Portal) COMPLETE — All 4/4 plans done*

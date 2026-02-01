# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable
**Current focus:** v1.1 Website & Documentation Portal

## Current Position

Phase: 9 of 13 (Landing Page) — In progress
Plan: 01 complete
Status: Completed 09-01-PLAN.md (Dependencies and CodeBlock)
Last activity: 2026-02-01 — Completed plan 09-01 (shiki, lucide-react, CodeBlock)

Progress: [█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 3%

## Milestone Context

**v1.1 Goal:** Create professional presentation website and documentation portal

**Stack (already implemented):**
- Next.js 14 (App Router)
- Tailwind CSS v4
- TypeScript
- MDX for documentation

**Design System:** "Obsidian Precision"
- Background: #050505 (obsidian), #0a0a0a (surface)
- Accent: #D4AF37 (antique gold)
- Text: #E5E5E5 (platinum), #A3A3A3 (dim)
- Technical: #00A3FF (precision blue)
- Typography: Cormorant Garamond (serif), Inter (sans), JetBrains Mono (mono)

**Files already created:**
- `website/` — Next.js project initialized
- `website/src/app/globals.css` — Design system CSS
- `website/src/components/layout/Navigation.tsx` — Header component
- `website/src/components/sections/Hero.tsx` — Hero section
- `website/src/components/sections/ValueProposition.tsx` — Value cards
- `website/src/components/ui/CodeBlock.tsx` — Async server component for syntax highlighting

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
| Features with real code | Show JSON-LD/Solidity excerpts as proof of standard | In progress (CodeBlock ready) |
| Async Server Component for code | Zero client JS, VS Code-accurate highlighting via shiki | Implemented |
| Fuse.js local search | Lightweight search for specs viewer (no Algolia dependency) | Pending |
| Premium OG images | Core Web Vitals + OpenGraph for luxury LinkedIn/Twitter sharing | Pending |

### Pending Todos

- [ ] Shiki: Personnaliser github-dark avec couleurs Platinum/Gold (defer v1.2)
- [ ] A11y: Vérifier contraste #A3A3A3 sur labels < 14px

### Blockers/Concerns

None.

---
*State updated: 2026-02-01T10:43:32Z*
*Milestone: v1.1 Website & Documentation Portal*

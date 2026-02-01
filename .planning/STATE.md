# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable
**Current focus:** v1.1 Website & Documentation Portal

## Current Position

Phase: 9 of 13 (Landing Page) — Complete
Plan: 04/04 complete (all plans in phase 09 done)
Status: Phase 09 complete — Ready for Phase 9.1 (Spatial UI Upgrade)
Last activity: 2026-02-01 — Completed phase verification, all requirements met

Progress: [████████████████████████████████] 100% of Phase 9 plans (4/4)

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

### Phase 9.1 Planned (Spatial UI Upgrade)

User feedback: Current landing page functional but design feels "2023". Upgrade to 2026 spatial standards.

**Planned enhancements:**
- Mesh gradients (CSS conic-gradient, multi-stop radials)
- Bento Grid layout for Value Proposition
- Angle Glow borders (45deg animated pseudo-elements)
- Deep Space & Aurora palette (Blue-Black #0A0E17, Aurora Cyan #00F0FF, Deep Gold #FFB800)
- Subtle micro-animations with reduced-motion support
- Glass-morphism cards with backdrop-blur

### Pending Todos

- [ ] Shiki: Personnaliser github-dark avec couleurs Platinum/Gold (defer v1.2)
- [ ] A11y: Vérifier contraste #A3A3A3 sur labels < 14px

### Blockers/Concerns

None.

---
*State updated: 2026-02-01T12:00:00Z*
*Milestone: v1.1 Website & Documentation Portal*
*Phase 09 (Landing Page) complete — Next: Phase 9.1 (Spatial UI Upgrade) or Phase 10 (Documentation Portal)*

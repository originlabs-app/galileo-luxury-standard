# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Proteger le patrimoine des marques et le savoir-faire humain en etablissant un langage commun interoperable
**Current focus:** v1.1 Website & Documentation Portal

## Current Position

Phase: 13 of 13 (Production Deployment)
Plan: 3/4 complete (13-01, 13-02, 13-03)
Status: Phase 13 IN PROGRESS
Last activity: 2026-02-01 — Completed 13-03-PLAN.md (Domain References & Image Optimization)

Progress: [████████████████████████░░░░░░░░] 75% of Phase 13

## Milestone Context

**v1.1 Goal:** Create professional presentation website and documentation portal

**Stack (already implemented):**
- Next.js 14 (App Router)
- Tailwind CSS v4
- TypeScript
- MDX for documentation
- Shiki for syntax highlighting
- Lucide-react for icons
- next-mdx-remote for blog MDX rendering
- gray-matter for frontmatter parsing

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
| Static generation | Fast, secure, easy to deploy (no server) | Implemented |
| MDX consumes /specifications/ | Single Source of Truth — docs never desync from specs | Pending |
| Unified Docs/Specs navigation | Same sidebar, same design system for fluid UX | Pending |
| Features with real code | Show JSON-LD/Solidity excerpts as proof of standard | Implemented |
| Async Server Component for code | Zero client JS, VS Code-accurate highlighting via shiki | Implemented |
| Fuse.js local search | Lightweight search for specs viewer (no Algolia dependency) | Pending |
| Premium OG images | Core Web Vitals + OpenGraph for luxury LinkedIn/Twitter sharing | Implemented |
| Section order: Hero-Value-Arch-Features-Std-Reg-Footer | Logical flow from vision to technical to compliance to action | Implemented |
| File-based MDX for blog | Simple, git-tracked, no CMS dependency | Implemented |
| next-mdx-remote RSC | Server component MDX rendering, zero client JS | Implemented |
| Bold markdown metadata parsing | Galileo specs use **Status:** format, not YAML frontmatter | Implemented |
| Recursive spec directory reading | Support nested folders like schemas/dpp/, schemas/events/ | Implemented |
| Gold-accent blog styling | Visual distinction from docs: gold markers, serif quotes, gradient HR | Implemented |
| JSX expression escaping for MDX | Escape `{variable}` patterns in spec content for safe rendering | Implemented |
| Custom JSON syntax highlighter | Built-in highlighter vs external library for bundle size | Implemented |
| GitHub Actions CI/CD | TypeScript and ESLint checks on push/PR, Lighthouse on PR | Implemented |
| Lighthouse >90 budget | Enforce performance, accessibility, best-practices, SEO standards | Implemented |
| next/og for OG image | ImageResponse API vs external service for branded social sharing | Implemented |
| ESLint via CLI only | Next.js 16+ no longer supports eslint in next.config.ts | Implemented |
| Node 20 LTS for CI | Current long-term support version for stability | Implemented |
| Desktop Lighthouse for local testing | Mobile throttling on localhost produces artificially low scores | Implemented |
| CSS/SVG-only visuals | No raster images = optimal LCP, no priority prop needed | Implemented |

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

### Phase 10 Complete (Documentation Portal)

**Plan 01-05 Complete:**
- 16 documentation pages across 5 sections
- DocsSidebar with collapsible sections
- Prose styling for documentation typography
- Human verification approved

### Phase 11 Progress (Specifications Viewer)

**Plan 01 Complete (Infrastructure):**
- File system utilities: getSpecCategories, getSpecifications, getSpecification
- Custom metadata parser for bold markdown headers (not YAML frontmatter)
- Dynamic navigation builder: buildSpecsNavigation
- SpecsSidebar component with collapsible sections and status dots
- /specifications layout and landing page with category grid
- Supports 46 specs across 8 categories (contracts excluded)

**Plan 02 Complete (Content Rendering):**
- StatusBadge component with color-coded indicators (Standard/Active/Draft)
- SpecMetadata component showing version, date, spec ID
- JSONSchemaViewer with syntax highlighting and copy-to-clipboard
- Spec detail pages for all 46 specifications with MDX rendering
- Category listing pages for all 8 categories with subcategory grouping
- JSX expression escaping for safe MDX rendering of spec content

**Files created:**
- `website/src/lib/specifications.ts` — File system utilities (244 lines)
- `website/src/lib/specs-navigation.ts` — Navigation builder (94 lines)
- `website/src/components/specifications/SpecsSidebar.tsx` — Sidebar component (138 lines)
- `website/src/components/specifications/StatusBadge.tsx` — Color-coded status badges
- `website/src/components/specifications/SpecMetadata.tsx` — Full metadata display
- `website/src/components/specifications/JSONSchemaViewer.tsx` — JSON schema viewer
- `website/src/app/specifications/layout.tsx` — Layout with sidebar (43 lines)
- `website/src/app/specifications/page.tsx` — Landing page with category grid (163 lines)
- `website/src/app/specifications/[category]/page.tsx` — Category listing pages
- `website/src/app/specifications/[category]/[slug]/page.tsx` — Spec detail pages

### Phase 12 Complete (Blog Section)

**Plan 01 Complete (Blog Infrastructure):**
- Blog utilities: getAllPosts, getPostBySlug, getAllPostSlugs, formatDate
- Blog listing page at /blog with grid layout and glass cards
- Blog post page at /blog/[slug] with static generation
- MDXRemote with custom prose components
- OpenGraph and Twitter metadata generation

**Plan 02 Complete (Blog Content & Styling):**
- v1.0.0 release announcement post (230 lines)
- Blog-specific CSS with gold accents
- MDX components updated with blog styling

**Files created:**
- `website/content/blog/.gitkeep` — Blog content directory
- `website/src/lib/blog.ts` — Blog utilities (158 lines)
- `website/src/app/blog/page.tsx` — Blog listing (115 lines)
- `website/src/app/blog/[slug]/page.tsx` — Blog post page (269 lines)
- `website/content/blog/2026-02-01-v1-release.mdx` — v1.0.0 announcement (230 lines)

### Phase 13 Progress (Production Deployment)

**Plan 01 Complete (SEO & Metadata):**
- metadataBase set to https://galileoprotocol.io
- Title template pattern for consistent page titles
- OpenGraph and Twitter card metadata
- OG image with obsidian design and gold accents (1200x630)
- robots.ts allowing all crawlers
- sitemap.ts with main pages (/, /docs, /specifications, /blog)
- TypeScript enforcement during builds

**Files created:**
- `website/src/app/opengraph-image.tsx` — OG image generation (96 lines)
- `website/src/app/robots.ts` — Crawling rules (11 lines)
- `website/src/app/sitemap.ts` — Dynamic sitemap (36 lines)

**Files modified:**
- `website/src/app/layout.tsx` — Added comprehensive metadata
- `website/next.config.ts` — Added TypeScript enforcement

**Plan 02 Complete (CI/CD Pipeline):**
- CI workflow with TypeScript and ESLint checks on push/PR to main
- Lighthouse CI workflow for PR preview audits (waits for Vercel)
- Performance budget enforcing >90 scores on all 4 categories
- Node 20 LTS, npm caching, website/ subdirectory

**Files created:**
- `.github/workflows/ci.yml` — CI workflow (33 lines)
- `.github/workflows/lighthouse.yml` — Lighthouse CI workflow (30 lines)
- `website/lighthouse-budget.json` — Performance budget (12 lines)

**Plan 03 Complete (Domain References & Image Optimization):**
- Replaced all galileo.luxury references with galileoprotocol.io (47 files)
- Specifications: 39 .md + 16 .json + 4 .jsonld + 1 .sol files
- Governance: 7 .md files
- Website: Features.tsx JSON-LD example
- Verified Lighthouse scores: Performance 94, Accessibility 98, Best Practices 100, SEO 100 (desktop)
- Confirmed website uses CSS/SVG-only visuals (no raster images to optimize)

### Pending Todos

- [ ] Shiki: Personnaliser github-dark avec couleurs Platinum/Gold (defer v1.2)
- [ ] A11y: Vérifier contraste #A3A3A3 sur labels < 14px
- [ ] UX/UI: Améliorer cohérence visuelle specs viewer et blog (v1.2)
- [ ] Sync: Lint CI pour vérifier que /docs cite des specs existantes (v1.2)
- [ ] Sync: Générer certaines docs depuis specs (claim topics table, etc.) (v1.2)

### Blockers/Concerns

None.

---
*State updated: 2026-02-01T16:49:32Z*
*Milestone: v1.1 Website & Documentation Portal*
*Phase 13 (Production Deployment) IN PROGRESS — 3/4 plans complete*
*Next: 13-04 (DNS & Deployment)*

---
phase: 13-production-deployment
plan: 01
subsystem: seo-metadata
tags: [seo, opengraph, sitemap, metadata, next.js]
dependency-graph:
  requires: [phases-9-12]
  provides: [production-seo, social-sharing, search-discoverability]
  affects: [deployment, marketing]
tech-stack:
  added: []
  patterns: [next-metadata-api, og-image-generation, sitemap-generation]
key-files:
  created:
    - website/src/app/opengraph-image.tsx
    - website/src/app/robots.ts
    - website/src/app/sitemap.ts
  modified:
    - website/src/app/layout.tsx
    - website/next.config.ts
decisions:
  - id: D13-01-01
    title: Remove ESLint config from next.config.ts
    rationale: Next.js 16+ no longer supports eslint configuration in next.config.ts
    outcome: Use next lint CLI command instead
metrics:
  duration: ~5 minutes
  completed: 2026-02-01
---

# Phase 13 Plan 01: SEO & Metadata Configuration Summary

**One-liner:** Production SEO with metadataBase, OG image (obsidian/gold design), robots.txt, and sitemap.xml for galileoprotocol.io

## What Was Done

### Task 1: Root Layout Metadata Enhancement

Updated `website/src/app/layout.tsx` with comprehensive SEO metadata:
- `metadataBase`: Points to `https://galileoprotocol.io` for absolute URL resolution
- `title`: Template pattern `{ default: 'Galileo Protocol', template: '%s | Galileo Protocol' }`
- `description`: "Open standard for luxury product authentication and provenance"
- `openGraph`: Full configuration (title, description, url, siteName, locale, type)
- `twitter`: Summary large image card with matching content
- `alternates.canonical`: Root path for canonical URL

Updated `website/next.config.ts`:
- `typescript.ignoreBuildErrors: false` to enforce TypeScript during builds
- Note: ESLint config removed (Next.js 16+ handles via CLI)

### Task 2: OG Image, Robots, and Sitemap

Created `website/src/app/opengraph-image.tsx`:
- Obsidian gradient background (135deg, #0a0a0a to #1a1a1a)
- Gold accent lines (#D4AF37) at top and bottom
- Circular logo placeholder with gold border and "G"
- "Galileo Protocol" title (80px, white, bold)
- "Open standard for luxury authentication" subtitle (32px, dim gray)
- Dimensions: 1200x630 (optimal for social sharing)

Created `website/src/app/robots.ts`:
- Allows all user agents to crawl entire site
- References sitemap at `https://galileoprotocol.io/sitemap.xml`

Created `website/src/app/sitemap.ts`:
- Home page (priority 1, monthly)
- /docs (priority 0.8, monthly)
- /docs/quick-start (priority 0.8, monthly)
- /specifications (priority 0.8, monthly)
- /blog (priority 0.7, weekly)

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4632fc3 | feat | Add metadataBase and SEO metadata to root layout |
| 71276a5 | feat | Add OG image, robots.txt, and sitemap.xml |

## Verification Results

Build output confirms all SEO routes generated:
```
Route (app)
├ ○ /opengraph-image
├ ○ /robots.txt
├ ○ /sitemap.xml
```

- `npm run build`: Completed successfully (78/78 static pages)
- No TypeScript errors
- All files export correct types

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed ESLint config from next.config.ts**
- **Found during:** Task 1 verification
- **Issue:** Next.js 16.1.6 no longer supports `eslint` configuration in next.config.ts
- **Fix:** Removed eslint block, added comment noting CLI usage
- **Files modified:** website/next.config.ts
- **Commit:** 4632fc3

## Files Changed

### Created
- `website/src/app/opengraph-image.tsx` (96 lines) - OG image generation
- `website/src/app/robots.ts` (11 lines) - Crawling rules
- `website/src/app/sitemap.ts` (36 lines) - Dynamic sitemap

### Modified
- `website/src/app/layout.tsx` - Added comprehensive metadata export
- `website/next.config.ts` - Added TypeScript enforcement

## Success Criteria Verification

- [x] metadataBase set to https://galileoprotocol.io in root layout
- [x] OG image uses obsidian design with gold accents
- [x] robots.ts allows all crawlers and references sitemap
- [x] sitemap.ts includes main pages (/, /docs, /specifications, /blog)
- [x] next.config.ts enforces ignoreBuildErrors: false
- [x] `npm run build` passes with no errors

## Next Phase Readiness

**Ready for deployment.** All SEO infrastructure is in place:
- Social sharing will display branded OG images
- Search engines can discover all pages via sitemap
- Canonical URLs prevent duplicate content issues
- TypeScript errors are enforced during builds

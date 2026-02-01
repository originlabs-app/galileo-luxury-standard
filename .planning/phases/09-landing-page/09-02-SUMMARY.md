---
phase: 09-landing-page
plan: 02
subsystem: website/landing
tags: [svg, diagram, code-examples, shiki, json-ld, solidity, erc-3643]

dependency-graph:
  requires: ["09-01"]
  provides: ["Architecture section", "Features section", "hybrid diagram", "code examples"]
  affects: ["09-03", "09-04"]

tech-stack:
  added: []
  patterns: ["async-server-component", "inline-svg-diagram", "spec-badges"]

key-files:
  created:
    - website/src/components/sections/Architecture.tsx
    - website/src/components/sections/Features.tsx
  modified: []

decisions: []

metrics:
  duration: "2 minutes"
  completed: "2026-02-01"
---

# Phase 09 Plan 02: Architecture and Features Sections Summary

**One-liner:** SVG hybrid architecture diagram + JSON-LD/Solidity code examples with shiki highlighting

## What Was Built

### Architecture Section (`Architecture.tsx`)

Created a visually compelling section that explains the hybrid on-chain/off-chain model using:

1. **SVG Diagram (viewBox 800x480):**
   - **Off-Chain Layer** (top): Platinum border, contains JSON-LD DPP, Images, Docs boxes with CRAB badge
   - **Resolution Layer** (middle): Blue (#00A3FF) accented, shows QR/NFC to GS1 Digital Link flow
   - **On-Chain Layer** (bottom): Gold (#D4AF37) accented, shows ERC-3643 Token, ONCHAINID, Compliance Modules

2. **Dashed arrows** connecting layers with labels ("hash reference", "token lookup")

3. **Three explanatory cards** below the diagram matching layer colors

### Features Section (`Features.tsx`)

Created an async Server Component that displays real code examples:

1. **JSON-LD Digital Product Passport:**
   - Shows `@context`, `@type`, `@id`, brand, carbonFootprint
   - Badges: W3C JSON-LD, ESPR 2027

2. **Solidity IGalileoToken Interface:**
   - ERC-3643 extension with `productDID()` and `metadataURI()`
   - Badges: ERC-3643, EIP Final

3. **Key metrics row:** 14-digit GTIN, 5 Modules, 1:1 ratio

## Technical Details

| Aspect | Architecture.tsx | Features.tsx |
|--------|------------------|--------------|
| Component Type | Server Component | Async Server Component |
| Key Element | Inline SVG (18KB) | CodeBlock with shiki |
| Colors | Gold/Blue/Platinum | Design system badges |
| Pattern | section/container | section/container + glass-card |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c3a2ea9 | feat | Create Architecture section with SVG diagram |
| 67468ab | feat | Create Features section with code examples |

## Deviations from Plan

None - plan executed exactly as written.

## Files Created

```
website/src/components/sections/
  Architecture.tsx  (597 lines - includes SVG diagram)
  Features.tsx      (92 lines - async component with CodeBlock)
```

## Next Phase Readiness

**Ready for:** Plan 09-03 (CTA and page composition)

**Available exports:**
- `Architecture` - Hybrid model visualization
- `Features` - Code examples with syntax highlighting

**Integration pattern:**
```tsx
import { Architecture } from '@/components/sections/Architecture'
import { Features } from '@/components/sections/Features'  // async!

// In page.tsx (must be async if using Features)
export default async function Page() {
  return (
    <>
      <Architecture />
      <Features />
    </>
  )
}
```

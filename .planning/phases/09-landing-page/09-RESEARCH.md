# Phase 9: Landing Page - Research

**Researched:** 2026-02-01
**Domain:** Next.js App Router Landing Page with Code Examples
**Confidence:** HIGH

## Summary

This phase completes the Galileo Luxury Standard landing page with remaining sections: Architecture Diagram, Standards Compliance Table, Regulatory Readiness, and Footer. The existing codebase uses Next.js 16.1.6 with React 19.2.3 and Tailwind CSS 4, all of which are current stable versions.

The key technical challenge is displaying real code excerpts (JSON-LD, Solidity) as specified in the project decisions. **Shiki** is the established solution for syntax highlighting in Next.js Server Components, as it renders at build/request time with zero client-side JavaScript.

**Primary recommendation:** Use Shiki for server-side syntax highlighting, Lucide for icons, and leverage existing Tailwind CSS 4 design tokens in globals.css. Build remaining sections as Server Components for optimal performance.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Framework | Current stable, App Router default |
| React | 19.2.3 | UI Library | Latest with View Transitions, React Compiler |
| Tailwind CSS | 4.x | Styling | CSS-first config, 5x faster builds |
| @mdx-js/react | 3.1.1 | MDX rendering | Already configured for docs |

### To Install
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| shiki | ^3.x | Syntax highlighting | VS Code engine, zero client JS, Server Component native |
| lucide-react | ^0.562.0 | Icons | Tree-shakable, 1600+ icons, SVG-based |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shiki | react-syntax-highlighter | Prism-based, requires client JS, larger bundle |
| Shiki | highlight.js | Less accurate than TextMate grammars |
| Lucide | Heroicons | Fewer icons, similar quality |
| Custom diagram | Mermaid | Overkill for static architecture visualization |

**Installation:**
```bash
npm install shiki lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
website/src/
├── app/
│   ├── layout.tsx          # Root layout with Navigation
│   ├── page.tsx            # Landing page composition
│   └── globals.css         # Obsidian Precision design tokens
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx  # EXISTS: Header with hamburger
│   │   └── Footer.tsx      # NEEDED: Site footer
│   ├── sections/
│   │   ├── Hero.tsx              # EXISTS
│   │   ├── ValueProposition.tsx  # EXISTS
│   │   ├── Architecture.tsx      # NEEDED: Hybrid model diagram
│   │   ├── Standards.tsx         # NEEDED: Compliance table
│   │   ├── Regulatory.tsx        # NEEDED: GDPR/MiCA/ESPR
│   │   └── Features.tsx          # NEEDED: Code excerpts section
│   └── ui/
│       └── CodeBlock.tsx         # NEEDED: Shiki wrapper
```

### Pattern 1: Server Component Code Block
**What:** Async component that renders syntax-highlighted code at request time
**When to use:** Any code display on landing page
**Example:**
```typescript
// Source: https://shiki.style/packages/next
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang: 'typescript' | 'solidity' | 'json'
  filename?: string
}

export async function CodeBlock({ code, lang, filename }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark' // or custom theme matching Obsidian Precision
  })

  return (
    <div className="code-block">
      {filename && (
        <div className="text-xs text-[#A3A3A3] mb-2 font-mono">{filename}</div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
```

### Pattern 2: Section Component Structure
**What:** Consistent section layout following existing patterns
**When to use:** All new landing page sections
**Example:**
```typescript
export function SectionName() {
  return (
    <section className="section bg-[#0a0a0a]"> {/* or bg-[#050505] for alternating */}
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Section Title</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Description text
          </p>
        </div>
        {/* Section Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Content here */}
        </div>
      </div>
    </section>
  )
}
```

### Pattern 3: Static Architecture Diagram
**What:** SVG-based diagram, not interactive library
**When to use:** Architecture visualization
**Why:** Static SVG is lighter than Mermaid, perfect for single diagram use
**Example:**
```typescript
export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 800 400" className="w-full max-w-4xl mx-auto">
      {/* Layer boxes, connection lines, labels */}
      {/* Use design system colors from CSS variables */}
    </svg>
  )
}
```

### Anti-Patterns to Avoid
- **Client-side syntax highlighting:** Avoid `'use client'` for code blocks; wastes bundle size
- **Dynamic class construction:** Never `bg-${color}`, always literal classes for Tailwind
- **Inline styles over design tokens:** Use CSS variables from globals.css, not hardcoded colors
- **Heavy diagram libraries for single use:** Mermaid/D3 overkill for one static diagram

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syntax highlighting | Custom regex tokenizer | Shiki | 200+ languages, VS Code accuracy, themes |
| Icons | SVG paths in code | Lucide-react | Tree-shaking, consistent style, accessibility |
| Responsive hamburger | Custom toggle | Keep existing Navigation.tsx | Already accessible, tested |
| Smooth scrolling | Custom JS | `scroll-behavior: smooth` | Already in globals.css |
| Glass effect | Manual blur | `.glass-card` class | Already in globals.css |

**Key insight:** The existing globals.css design system has comprehensive utility classes. Check there before adding new styles.

## Common Pitfalls

### Pitfall 1: Shiki Bundle Size in Client Components
**What goes wrong:** Importing Shiki in client component bundles WASM + grammars to client
**Why it happens:** Misunderstanding Server vs Client Components
**How to avoid:** Only use Shiki in Server Components (no `'use client'` directive)
**Warning signs:** Large JS bundle, slow page load

### Pitfall 2: Tailwind 4 Config Migration Confusion
**What goes wrong:** Creating tailwind.config.js when using v4 CSS-first approach
**Why it happens:** Following v3 tutorials
**How to avoid:** Use `@theme` directive in globals.css (already configured)
**Warning signs:** Duplicate config, styles not applying

### Pitfall 3: Layout Shift from Async Components
**What goes wrong:** Code blocks cause layout shift while loading
**Why it happens:** No placeholder/skeleton
**How to avoid:** Use fixed-height containers or Suspense boundaries
**Warning signs:** CLS (Cumulative Layout Shift) issues

### Pitfall 4: Hamburger Menu Accessibility
**What goes wrong:** Mobile menu not keyboard accessible
**Why it happens:** Missing ARIA attributes, focus management
**How to avoid:** Existing Navigation.tsx already handles this correctly; don't break it
**Warning signs:** Can't tab to menu items, no escape key handling

### Pitfall 5: Hardcoded Colors Breaking Theme
**What goes wrong:** Using `#D4AF37` instead of `var(--antique-gold)` or `text-gold`
**Why it happens:** Copy-paste from other code
**How to avoid:** Always use CSS variables or Tailwind theme classes
**Warning signs:** Colors don't match, inconsistent styling

## Code Examples

Verified patterns from official sources:

### Shiki Code Block (Server Component)
```typescript
// Source: https://shiki.style/packages/next
import { codeToHtml } from 'shiki'

interface Props {
  code: string
  lang: 'json' | 'solidity' | 'typescript'
}

export async function CodeBlock({ code, lang }: Props) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark',
  })

  return (
    <div
      className="code-block overflow-x-auto text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

### Lucide Icon Usage
```typescript
// Source: https://lucide.dev/guide/packages/lucide-react
import { Shield, FileCheck, Network } from 'lucide-react'

export function StandardsIcons() {
  return (
    <div className="flex gap-4">
      <Shield className="w-6 h-6 text-gold" />
      <FileCheck className="w-6 h-6 text-blue" />
      <Network className="w-6 h-6 text-platinum" />
    </div>
  )
}
```

### JSON-LD Code Example for Features Section
```json
{
  "@context": "https://vocab.galileo.luxury/contexts/galileo.jsonld",
  "@type": "IndividualProduct",
  "@id": "did:galileo:01:3614270012345:21:ABC123",
  "name": "Hermès Birkin 25",
  "brand": {
    "@type": "Brand",
    "name": "Hermès",
    "@id": "did:galileo:brand:hermes"
  },
  "carbonFootprint": {
    "value": 12.5,
    "unitCode": "KGM"
  }
}
```

### Solidity Code Example for Features Section
```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import {IToken} from "@erc3643org/erc-3643/contracts/token/IToken.sol";

/// @title Galileo Single-Supply Pattern
/// @notice Each luxury product = 1 token deployment
interface IGalileoToken is IToken {
    function productDID() external view returns (string memory);
    function metadataURI() external view returns (string memory);
}
```

### Footer Component Pattern
```typescript
import Link from 'next/link'
import { Github, FileText, Users, Scale } from 'lucide-react'

const footerLinks = {
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Specifications', href: '/specs' },
    { label: 'GitHub', href: 'https://github.com/originlabs-app/galileo-luxury-standard', external: true },
  ],
  governance: [
    { label: 'Governance', href: '/governance' },
    { label: 'TSC Charter', href: '/governance/tsc' },
    { label: 'Contributing', href: '/docs/contributing' },
  ],
  legal: [
    { label: 'License (Apache 2.0)', href: '/license' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[rgba(229,229,229,0.08)] bg-[#050505]">
      <div className="container py-16">
        {/* Footer grid with logo, links, copyright */}
      </div>
    </footer>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | @theme in CSS | Tailwind v4 (2025) | Simpler setup, no JS config |
| Prism.js | Shiki | 2024-2025 | VS Code accuracy, Server Component native |
| highlight.js | Shiki | 2024-2025 | Better theming, WASM performance |
| Page Router | App Router | Next.js 13+ | Server Components default |
| useEffect data fetch | Server Components | Next.js 13+ | No client JS for static data |

**Deprecated/outdated:**
- `@tailwind base/components/utilities` directives: Use `@import "tailwindcss"` instead
- `getStaticProps`/`getServerSideProps`: Use Server Components with async/await
- Prism.js for React: Shiki has better RSC support and accuracy

## Open Questions

Things that couldn't be fully resolved:

1. **Shiki Theme Customization**
   - What we know: Shiki supports custom themes matching VS Code format
   - What's unclear: Exact colors to match "Obsidian Precision" palette
   - Recommendation: Start with `github-dark`, customize if needed in v1.2

2. **Architecture Diagram Complexity**
   - What we know: Static SVG is recommended for single diagram
   - What's unclear: Exact visual design for hybrid on/off-chain model
   - Recommendation: Create SVG with clear layers (Off-chain/On-chain), use design tokens

3. **Regulatory Deadlines Accuracy**
   - What we know: ESPR effective 2027, MiCA in phases
   - What's unclear: Exact milestone dates may shift
   - Recommendation: Use "2027" generically, link to official sources

## Sources

### Primary (HIGH confidence)
- Next.js 16 Blog Post: https://nextjs.org/blog/next-16
- Shiki Next.js docs: https://shiki.style/packages/next
- Tailwind CSS v4 docs: https://tailwindcss.com/blog/tailwindcss-v4
- Lucide React Guide: https://lucide.dev/guide/packages/lucide-react

### Secondary (MEDIUM confidence)
- Shiki + Next.js tutorial (Nikolai Lehbrink, 2025): https://www.nikolailehbr.ink/blog/syntax-highlighting-shiki-next-js
- Tailwind v4 tips: https://www.nikolailehbr.ink/blog/tailwindcss-v4-tips/

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Current versions verified in package.json, official docs checked
- Architecture: HIGH - Patterns extracted from existing codebase components
- Pitfalls: MEDIUM - Based on known React/Next.js patterns, some project-specific

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable stack, no rapid changes expected)

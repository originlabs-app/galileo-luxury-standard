# Phase 10 Research: Documentation Portal

**Date:** 2026-02-01
**Goal:** MDX-powered documentation with sidebar navigation

---

## 1. Existing Assets

### Specification Files (Source of Truth)

```
specifications/
├── architecture/
│   └── HYBRID-ARCHITECTURE.md
├── compliance/
│   ├── aml-screening.md
│   ├── jurisdiction-rules.md
│   ├── kyc-hooks.md
│   └── guides/
│       ├── gdpr-compliance.md
│       ├── mica-compliance.md
│       └── espr-readiness.md
├── contracts/
│   └── [Solidity interfaces]
├── crypto/
│   └── [Crypto-agility specs]
├── identity/
│   ├── DID-DOCUMENT.md
│   ├── DID-METHOD.md
│   ├── claim-topics.md
│   ├── onchainid-specification.md
│   └── verifiable-credentials.md
├── infrastructure/
│   └── [Access control, audit trail]
├── resolver/
│   └── [GS1 Digital Link]
├── schemas/
│   └── [JSON-LD schemas]
└── token/
    └── ownership-transfer.md
```

### Installed Dependencies

Already in package.json:
- `@mdx-js/loader` ^3.1.1
- `@mdx-js/react` ^3.1.1
- `@next/mdx` ^16.1.6
- `gray-matter` ^4.0.3
- `next-mdx-remote` ^5.0.0
- `shiki` ^3.22.0 (syntax highlighting)

---

## 2. Architecture Decision

### Option A: File-based MDX in /app/docs/

```
website/src/app/docs/
├── layout.tsx          # Docs layout with sidebar
├── page.tsx            # /docs index (Getting Started)
├── architecture/
│   └── page.mdx        # Uses remote MDX to render spec
├── identity/
│   ├── page.mdx        # Identity overview
│   ├── did-method/
│   │   └── page.mdx
│   └── verifiable-credentials/
│       └── page.mdx
├── token/
│   └── page.mdx
└── compliance/
    ├── page.mdx        # Overview
    ├── gdpr/
    │   └── page.mdx
    ├── mica/
    │   └── page.mdx
    └── espr/
        └── page.mdx
```

**Pros:**
- Native Next.js App Router
- Automatic routing
- Server Components for MDX

**Cons:**
- Content duplicated from /specifications/
- Manual sync needed

### Option B: Dynamic MDX from /specifications/ (RECOMMENDED)

```
website/src/app/docs/
├── layout.tsx          # Docs layout with sidebar
├── page.tsx            # /docs index
└── [...slug]/
    └── page.tsx        # Dynamic route renders any spec
```

**Approach:**
1. Read markdown from `/specifications/` at build time
2. Use `next-mdx-remote` to render
3. Generate static paths from file structure
4. Single Source of Truth maintained

**Pros:**
- Specs are the source of truth
- No content duplication
- Automatic updates when specs change

**Cons:**
- More complex routing logic
- Need to map URLs to file paths

### Decision: Hybrid Approach

- **Getting Started:** Custom MDX in `/docs/page.mdx` (unique to website)
- **Specifications:** Dynamic from `/specifications/` via catch-all route
- **Compliance Guides:** Dynamic from `/specifications/compliance/guides/`

---

## 3. Sidebar Navigation Structure

```typescript
const docsNavigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quick-start' },
      { title: 'Core Concepts', href: '/docs/concepts' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { title: 'Hybrid Model', href: '/docs/architecture' },
      { title: 'Data Flow', href: '/docs/architecture/data-flow' },
    ],
  },
  {
    title: 'Identity',
    items: [
      { title: 'DID Method', href: '/docs/identity/did-method' },
      { title: 'DID Document', href: '/docs/identity/did-document' },
      { title: 'ONCHAINID', href: '/docs/identity/onchainid' },
      { title: 'Verifiable Credentials', href: '/docs/identity/verifiable-credentials' },
      { title: 'Claim Topics', href: '/docs/identity/claim-topics' },
    ],
  },
  {
    title: 'Token',
    items: [
      { title: 'ERC-3643 Extension', href: '/docs/token' },
      { title: 'Ownership Transfer', href: '/docs/token/ownership-transfer' },
      { title: 'Compliance Modules', href: '/docs/token/compliance' },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { title: 'Overview', href: '/docs/compliance' },
      { title: 'GDPR Guide', href: '/docs/compliance/gdpr' },
      { title: 'MiCA Guide', href: '/docs/compliance/mica' },
      { title: 'ESPR Readiness', href: '/docs/compliance/espr' },
    ],
  },
];
```

---

## 4. Component Design

### DocsSidebar.tsx

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function DocsSidebar({ navigation }: { navigation: NavSection[] }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(navigation.map(s => s.title));

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--platinum)]/10">
      <nav className="sticky top-20 p-6 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-sm font-medium text-[var(--platinum)] mb-2"
            >
              {section.title}
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded.includes(section.title) ? '' : '-rotate-90'}`} />
            </button>
            {expanded.includes(section.title) && (
              <ul className="space-y-1 pl-3 border-l border-[var(--platinum)]/10">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-1.5 text-sm ${
                        pathname === item.href
                          ? 'text-[var(--antique-gold)] font-medium'
                          : 'text-[var(--platinum-dim)] hover:text-[var(--platinum)]'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

### DocsLayout.tsx

```typescript
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { docsNavigation } from '@/lib/docs-navigation';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex gap-12 py-12">
      <DocsSidebar navigation={docsNavigation} />
      <main className="flex-1 min-w-0 max-w-3xl">
        <article className="prose prose-invert prose-gold">
          {children}
        </article>
      </main>
    </div>
  );
}
```

### MDX Rendering

```typescript
// lib/mdx.ts
import { compileMDX } from 'next-mdx-remote/rsc';
import { readFile } from 'fs/promises';
import path from 'path';

export async function getMDXContent(slug: string[]) {
  const filePath = path.join(process.cwd(), '..', 'specifications', ...slug) + '.md';
  const source = await readFile(filePath, 'utf-8');

  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
    components: {
      // Custom components for MDX
    },
  });

  return { content, frontmatter };
}
```

---

## 5. Styling: Prose Classes

Add to globals.css:

```css
/* Documentation Prose */
.prose {
  max-width: 65ch;
  color: var(--platinum);
}

.prose h1 {
  font-family: var(--font-outfit);
  font-size: 2.5rem;
  color: var(--platinum);
  margin-bottom: 1rem;
}

.prose h2 {
  font-family: var(--font-outfit);
  font-size: 1.75rem;
  color: var(--platinum);
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(229, 229, 229, 0.1);
}

.prose h3 {
  font-family: var(--font-outfit);
  font-size: 1.25rem;
  color: var(--platinum);
  margin-top: 2rem;
}

.prose p {
  margin: 1.25rem 0;
  line-height: 1.75;
}

.prose a {
  color: var(--precision-blue);
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.prose code:not(pre code) {
  background: var(--obsidian-elevated);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  color: var(--precision-blue);
}

.prose pre {
  background: var(--obsidian-elevated);
  border: 1px solid rgba(229, 229, 229, 0.08);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

.prose ul, .prose ol {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.prose li {
  margin: 0.5rem 0;
}

.prose blockquote {
  border-left: 3px solid var(--antique-gold);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--platinum-dim);
  font-style: italic;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.prose th, .prose td {
  padding: 0.75rem;
  border: 1px solid rgba(229, 229, 229, 0.1);
  text-align: left;
}

.prose th {
  background: var(--obsidian-surface);
  font-weight: 600;
}
```

---

## 6. Implementation Plan

### Wave 1: Infrastructure
1. **10-01-PLAN:** Create docs layout, sidebar component, navigation config

### Wave 2: Content (Parallel)
2. **10-02-PLAN:** Getting Started pages (intro, quick-start, concepts)
3. **10-03-PLAN:** Architecture & Identity docs (link to specs)
4. **10-04-PLAN:** Token & Compliance docs (link to specs)

### Wave 3: Polish
5. **10-05-PLAN:** Mobile sidebar, search placeholder, verification

---

## 7. File Structure (Final)

```
website/src/
├── app/
│   └── docs/
│       ├── layout.tsx              # Docs layout with sidebar
│       ├── page.mdx                # Introduction
│       ├── quick-start/
│       │   └── page.mdx
│       ├── concepts/
│       │   └── page.mdx
│       ├── architecture/
│       │   └── page.tsx            # Dynamic from specs
│       ├── identity/
│       │   ├── page.mdx            # Overview
│       │   └── [slug]/
│       │       └── page.tsx        # Dynamic from specs
│       ├── token/
│       │   └── page.tsx
│       └── compliance/
│           ├── page.mdx
│           └── [guide]/
│               └── page.tsx        # GDPR, MiCA, ESPR
├── components/
│   └── docs/
│       ├── DocsSidebar.tsx
│       ├── DocsHeader.tsx
│       ├── TableOfContents.tsx
│       └── MDXComponents.tsx
└── lib/
    ├── docs-navigation.ts
    └── mdx.ts
```

---

*Research compiled: 2026-02-01*
*Dependencies: Already installed (MDX, gray-matter, next-mdx-remote, shiki)*

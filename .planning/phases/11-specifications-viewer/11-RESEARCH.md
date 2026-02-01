# Phase 11: Specifications Viewer - Research

**Researched:** 2026-02-01
**Domain:** Next.js 14 dynamic markdown rendering, specification browsing UX
**Confidence:** HIGH

## Summary

The Galileo project has 42 specification files organized in 9 categories under `/specifications/`. These are highly technical documents in Markdown (.md) and JSON Schema (.json) formats with custom metadata formatting (bold markdown headers, not YAML frontmatter). The specifications follow a consistent structure with status badges (Draft/Active/Standard), version numbers, and detailed technical content.

This research examined how to build a dynamic specification viewer in Next.js 14 that:
1. Reads specification files from the filesystem at build time
2. Parses custom metadata format from markdown headers
3. Renders specifications with proper formatting and syntax highlighting
4. Organizes browsing by category with status filtering
5. Handles both markdown documentation and JSON schemas

The existing `/docs` portal (Phase 10) uses static TSX pages with a sidebar navigation pattern. The specifications viewer should follow similar UX patterns but with dynamic content generation from the `/specifications/` directory.

**Primary recommendation:** Use Next.js 14 App Router with Server Components to read files at build time, parse custom metadata with regex (not standard frontmatter), render with next-mdx-remote, and reuse the sidebar navigation pattern from `/docs`.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-mdx-remote | 5.0.0 | Remote/dynamic MDX rendering | Already in package.json, designed for filesystem content, supports Server Components |
| gray-matter | 4.0.3 | Frontmatter parsing | Already in package.json, battle-tested (used by Gatsby, Netlify, Astro) |
| shiki | 3.22.0 | Syntax highlighting | Already in package.json, modern alternative to Prism.js |
| Next.js 16.1.6 | 16.1.6 | Framework (App Router) | Already in use, latest stable version with Server Components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| remark | latest | Markdown processing | If need to transform markdown AST before rendering |
| rehype | latest | HTML processing | If need to add custom HTML transformations |
| react-json-view | latest | JSON Schema viewer | For rendering .json files interactively |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-mdx-remote | @next/mdx | @next/mdx requires .mdx files as routes; next-mdx-remote allows dynamic content from any location |
| Custom metadata parser | Standard YAML frontmatter | Specs use bold markdown headers, not YAML; would require file migration |
| Build-time generation | Runtime rendering | Build-time is faster, better SEO, but requires rebuild for spec updates |

**Installation:**
No new packages required - all dependencies already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── specifications/
│   │   ├── page.tsx                    # Landing page with category grid
│   │   ├── [category]/
│   │   │   ├── page.tsx                # Category list page
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Individual spec viewer
│   │   └── layout.tsx                  # Shared layout with sidebar
│   └── ...
├── components/
│   ├── specifications/
│   │   ├── SpecsSidebar.tsx           # Category navigation sidebar
│   │   ├── SpecMetadata.tsx           # Status badge, version, date
│   │   ├── SpecRenderer.tsx           # MDX content renderer
│   │   └── JSONSchemaViewer.tsx       # JSON schema visualization
│   └── ...
└── lib/
    ├── specifications.ts               # File reading, parsing utilities
    └── ...
```

### Pattern 1: File System Reading with Server Components
**What:** Use Server Components to read specification files directly from filesystem at build time
**When to use:** For all specification pages
**Example:**
```typescript
// Source: Next.js docs - https://nextjs.org/docs/app/guides/mdx
import { promises as fs } from 'fs';
import path from 'path';

// Server Component - runs at build time
export async function getSpecifications(category: string) {
  const specsDir = path.join(process.cwd(), '../specifications', category);
  const files = await fs.readdir(specsDir);

  const specs = await Promise.all(
    files
      .filter(file => file.endsWith('.md') || file.endsWith('.json'))
      .map(async (file) => {
        const filePath = path.join(specsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = parseSpecMetadata(content); // Custom parser

        return {
          slug: file.replace(/\.(md|json)$/, ''),
          filename: file,
          ...metadata,
        };
      })
  );

  return specs;
}
```

### Pattern 2: Custom Metadata Parsing
**What:** Parse bold markdown metadata headers instead of YAML frontmatter
**When to use:** For extracting Status, Version, Last Updated from spec files
**Example:**
```typescript
// Galileo specs use bold markdown, not YAML frontmatter
interface SpecMetadata {
  title: string;
  status: 'Draft' | 'Active' | 'Standard';
  version: string;
  lastUpdated: string;
  specId?: string;
  requirement?: string;
}

function parseSpecMetadata(content: string): SpecMetadata {
  const lines = content.split('\n').slice(0, 15); // First 15 lines

  // Extract title (first # heading)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract metadata from bold markdown
  const statusMatch = lines.find(l => l.includes('**Status:**'));
  const versionMatch = lines.find(l => l.includes('**Version:**'));
  const dateMatch = lines.find(l => l.includes('**Last Updated:**'));
  const specIdMatch = lines.find(l =>
    l.includes('**Specification ID:**') ||
    l.includes('**Specification Series:**') ||
    l.includes('**Specification:**')
  );

  return {
    title,
    status: extractValue(statusMatch, 'Draft'),
    version: extractValue(versionMatch, '1.0.0'),
    lastUpdated: extractValue(dateMatch, ''),
    specId: extractValue(specIdMatch),
  };
}

function extractValue(line: string | undefined, defaultVal: string = ''): string {
  if (!line) return defaultVal;
  return line.split('**')[2]?.trim() || defaultVal;
}
```

### Pattern 3: Static Generation with Dynamic Routes
**What:** Use generateStaticParams to pre-render all specification pages
**When to use:** For optimal performance and SEO
**Example:**
```typescript
// app/specifications/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  const categories = await getSpecCategories();

  const params = [];
  for (const category of categories) {
    const specs = await getSpecifications(category);
    for (const spec of specs) {
      params.push({
        category,
        slug: spec.slug,
      });
    }
  }

  return params;
}

export default async function SpecPage({
  params
}: {
  params: { category: string; slug: string }
}) {
  const spec = await getSpecification(params.category, params.slug);

  return (
    <>
      <SpecMetadata metadata={spec.metadata} />
      {spec.type === 'markdown' ? (
        <SpecRenderer source={spec.content} />
      ) : (
        <JSONSchemaViewer schema={spec.content} />
      )}
    </>
  );
}
```

### Pattern 4: MDX Rendering with next-mdx-remote
**What:** Render markdown content with React components
**When to use:** For all .md specification files
**Example:**
```typescript
// components/specifications/SpecRenderer.tsx
'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { CodeBlock } from '@/components/ui/CodeBlock'; // Already exists

interface SpecRendererProps {
  mdxSource: MDXRemoteSerializeResult;
}

const components = {
  // Map HTML elements to custom components
  pre: CodeBlock,
  // Add table styling, custom headings, etc.
};

export function SpecRenderer({ mdxSource }: SpecRendererProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
}

// In page.tsx (Server Component):
import { serialize } from 'next-mdx-remote/serialize';

const mdxSource = await serialize(spec.content, {
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
```

### Anti-Patterns to Avoid
- **Runtime file reading:** Don't read files on every request - use build-time generation
- **Client-side markdown parsing:** Keep parsing in Server Components for performance
- **Duplicating spec content:** Don't copy specs to website/public - read from ../specifications
- **Ignoring metadata format:** Don't force YAML frontmatter - parse existing bold markdown format

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom parser | next-mdx-remote | Handles edge cases, MDX support, component injection |
| Syntax highlighting | Manual code blocks | shiki (already installed) | Hundreds of languages, theme support, no runtime JS |
| File system traversal | Recursive directory reading | Node fs.promises + filter | Async/await, cross-platform, error handling |
| JSON Schema visualization | Custom tree renderer | react-json-view or similar | Interactive expand/collapse, type highlighting |
| Metadata extraction | Line-by-line parsing | Regex + slice(0, 15) | Faster, more reliable, easier to maintain |

**Key insight:** Markdown ecosystem is mature; don't reinvent wheels. Focus on the custom metadata format (bold markdown headers) which is project-specific.

## Common Pitfalls

### Pitfall 1: Treating Specs Like Blog Posts
**What goes wrong:** Assuming YAML frontmatter exists, breaking on parsing
**Why it happens:** gray-matter is common for blogs, but Galileo specs use different format
**How to avoid:** Write custom parser for bold markdown metadata format
**Warning signs:** Parser errors on lines like "**Status:** Draft"

### Pitfall 2: Relative Path Issues
**What goes wrong:** Can't find /specifications directory from website/
**Why it happens:** Next.js builds in website/ but specs are in ../specifications/
**How to avoid:** Use path.join(process.cwd(), '../specifications') for absolute paths
**Warning signs:** ENOENT errors during build

### Pitfall 3: Build vs Runtime Confusion
**What goes wrong:** Trying to read files on client or in API routes
**Why it happens:** Not understanding Server Components vs Client Components
**How to avoid:** All file I/O in Server Components (page.tsx without 'use client'), serialize for client
**Warning signs:** "Module not found: Can't resolve 'fs'" errors

### Pitfall 4: Missing Static Params
**What goes wrong:** Dynamic routes return 404 in production
**Why it happens:** Forgetting to implement generateStaticParams for dynamic routes
**How to avoid:** Always implement generateStaticParams for [category] and [slug] routes
**Warning signs:** Works in dev (next dev) but breaks in production (next build)

### Pitfall 5: JSON Schema Display
**What goes wrong:** Rendering raw JSON as text, unreadable
**Why it happens:** Not recognizing .json files need special handling
**How to avoid:** Detect file extension, use JSON viewer component for schemas
**Warning signs:** Users see `{"$schema":"https://..."` wall of text

## Code Examples

Verified patterns from official sources:

### Reading Specifications Directory
```typescript
// Source: Next.js App Router patterns
// lib/specifications.ts
import { promises as fs } from 'fs';
import path from 'path';

const SPECS_ROOT = path.join(process.cwd(), '../specifications');

export async function getSpecCategories(): Promise<string[]> {
  const entries = await fs.readdir(SPECS_ROOT, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export async function getSpecifications(category: string) {
  const categoryPath = path.join(SPECS_ROOT, category);
  const files = await fs.readdir(categoryPath);

  const specs = await Promise.all(
    files
      .filter(file => file.endsWith('.md') || file.endsWith('.json'))
      .map(async (filename) => {
        const filePath = path.join(categoryPath, filename);
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = filename.endsWith('.md')
          ? parseMarkdownMetadata(content)
          : parseJSONMetadata(content);

        return {
          slug: filename.replace(/\.(md|json)$/, ''),
          filename,
          category,
          type: filename.endsWith('.md') ? 'markdown' : 'json',
          ...metadata,
        };
      })
  );

  return specs.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getSpecification(category: string, slug: string) {
  // Try .md first, then .json
  const mdPath = path.join(SPECS_ROOT, category, `${slug}.md`);
  const jsonPath = path.join(SPECS_ROOT, category, `${slug}.json`);

  try {
    const content = await fs.readFile(mdPath, 'utf8');
    return {
      type: 'markdown',
      content,
      metadata: parseMarkdownMetadata(content),
    };
  } catch {
    const content = await fs.readFile(jsonPath, 'utf8');
    return {
      type: 'json',
      content: JSON.parse(content),
      metadata: parseJSONMetadata(content),
    };
  }
}
```

### Status Badge Component
```typescript
// components/specifications/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'Draft' | 'Active' | 'Standard';
}

const statusStyles = {
  Draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Active: 'bg-green-500/10 text-green-500 border-green-500/20',
  Standard: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      border ${statusStyles[status]}
    `}>
      {status}
    </span>
  );
}
```

### Category Landing Page
```typescript
// app/specifications/page.tsx
import Link from 'next/link';
import { getSpecCategories, getSpecifications } from '@/lib/specifications';

export const metadata = {
  title: 'Specifications | Galileo Luxury Standard',
  description: 'Browse technical specifications for the Galileo protocol.',
};

export default async function SpecificationsPage() {
  const categories = await getSpecCategories();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const specs = await getSpecifications(category);
      return {
        name: category,
        count: specs.length,
        specs: specs.slice(0, 3), // Preview
      };
    })
  );

  return (
    <div className="container py-12">
      <h1>Technical Specifications</h1>
      <p className="text-xl text-[var(--platinum)] mt-4">
        Browse 42 specifications across 9 categories
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {categoriesWithCounts.map((category) => (
          <Link
            key={category.name}
            href={`/specifications/${category.name}`}
            className="block p-6 border border-[var(--platinum)]/10 rounded-lg
                       hover:border-[var(--antique-gold)] transition-colors"
          >
            <h2 className="text-xl font-semibold capitalize mb-2">
              {category.name}
            </h2>
            <p className="text-sm text-[var(--platinum-dim)]">
              {category.count} specification{category.count !== 1 ? 's' : ''}
            </p>

            <ul className="mt-4 space-y-2">
              {category.specs.map((spec) => (
                <li key={spec.slug} className="text-sm truncate">
                  {spec.title}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (2022) | Server Components, streaming, nested layouts |
| getStaticProps | Direct async in components | Next.js 13 | Simpler data fetching, less boilerplate |
| @next/mdx | next-mdx-remote | 2020+ | Allows non-.mdx files, dynamic content |
| Prism.js | Shiki | 2023+ | Build-time highlighting, no runtime JS, more themes |
| Manual frontmatter parsing | gray-matter | Standard | Handles edge cases, multiple formats |

**Deprecated/outdated:**
- **getStaticProps/getStaticPaths:** Use Server Components and generateStaticParams
- **\_app.tsx layout pattern:** Use layout.tsx in App Router
- **Client-side markdown rendering:** Use Server Components for better performance

## Open Questions

Things that couldn't be fully resolved:

1. **JSON Schema Interactive Exploration**
   - What we know: Multiple viewer libraries exist (react-json-view, Stoplight)
   - What's unclear: Which one best fits Galileo's visual design?
   - Recommendation: Start with simple `<pre><code>{JSON.stringify(schema, null, 2)}</code></pre>`, upgrade later if needed

2. **Cross-linking Between Specs**
   - What we know: Specs reference each other (e.g., "see DID-DOCUMENT.md")
   - What's unclear: Should we auto-convert these to hyperlinks?
   - Recommendation: Phase 1 - keep as plain text; Phase 2 - add remark plugin to convert

3. **Search Functionality**
   - What we know: 42 specs is manageable to browse, but search would help
   - What's unclear: Full-text search vs metadata-only? Client vs server?
   - Recommendation: Defer to future phase; category browsing sufficient for v1

4. **Version History**
   - What we know: Specs have version numbers but no changelog
   - What's unclear: Should viewer show version history from git?
   - Recommendation: Show current version only for now; git history available in repo

## Sources

### Primary (HIGH confidence)
- Next.js App Router documentation - https://nextjs.org/docs/app/guides/mdx
- next-mdx-remote GitHub - https://github.com/hashicorp/next-mdx-remote
- gray-matter npm package - https://www.npmjs.com/package/gray-matter
- Actual Galileo specification files - Examined 10+ files for metadata format

### Secondary (MEDIUM confidence)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [Building a Markdown Blog With Next.js](https://jfelix.info/blog/how-to-make-a-static-blog-with-next-js)
- [MDX in Next.js 14](https://edwardshturman.com/notes/mdx-nextjs-14)

### Tertiary (LOW confidence)
- [W3C Document Types](https://www.w3.org/standards/types/) - For status badge patterns
- [JSON Schema Viewer Examples](https://github.com/jlblcc/json-schema-viewer) - For visualization patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and verified
- Architecture: HIGH - Next.js App Router patterns well-documented, files examined
- Pitfalls: MEDIUM - Based on common Next.js issues, not Galileo-specific testing

**Research date:** 2026-02-01
**Valid until:** 30 days (Next.js stable, specs format unlikely to change)

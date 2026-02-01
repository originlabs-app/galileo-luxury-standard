# Phase 12: Blog Section - Research

**Researched:** 2026-02-01
**Domain:** Next.js 14 App Router blogging with MDX
**Confidence:** HIGH

## Summary

Research investigated the optimal architecture for implementing a blog section in the Galileo Luxury Standard website using Next.js 14 App Router and MDX. The website already has a robust design system ("Obsidian Precision") and prose styling that can be leveraged for blog content.

**Key findings:**
- Use file-based MDX with gray-matter for frontmatter parsing and next-mdx-remote for rendering
- Store blog posts as `.mdx` files in `/content/blog/` directory (external to `/app`)
- Implement dynamic routing with `/app/blog/[slug]/page.tsx`
- Reuse existing `.prose` class from globals.css for consistent styling with documentation
- v1.0.0 announcement should focus on milestone significance, key features, and ecosystem readiness

**Primary recommendation:** Adopt the file-based MDX pattern with gray-matter + next-mdx-remote, storing posts outside the app directory for clearer separation of content from code.

## Standard Stack

The established libraries/tools for blogging in Next.js 14:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-mdx-remote | 5.0.0 | MDX rendering with RSC support | Official HashiCorp package, supports React Server Components, separates content from code |
| gray-matter | 4.0.3 | Frontmatter parsing | De facto standard for YAML frontmatter extraction, mature and stable |
| @mdx-js/react | 3.1.1 | MDX React integration | Required peer dependency for MDX in React |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/mdx | 16.1.6 | Build-time MDX compilation | Alternative if storing MDX in `/app` directory (not recommended for blog) |
| shiki | 3.22.0 | Syntax highlighting | Already installed, can be used for code blocks in blog posts |
| date-fns | Latest | Date formatting | Optional, for human-readable date displays |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-mdx-remote | @next/mdx | @next/mdx requires MDX files in `/app`, mixes content with code, less flexible |
| File-based | Headless CMS (Contentful, Sanity) | CMS adds complexity, cost, and vendor lock-in; overkill for announcement blog |
| MDX | Plain Markdown + custom parser | Loses ability to embed React components, less powerful |

**Installation:**
```bash
# Already installed in package.json:
# - next-mdx-remote@5.0.0
# - gray-matter@4.0.3
# - @mdx-js/react@3.1.1

# No additional packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
website/
├── content/
│   └── blog/                       # Blog posts storage (outside /app)
│       ├── 2026-02-01-v1-release.mdx
│       ├── 2026-02-15-roadmap.mdx
│       └── ...
├── src/
│   ├── app/
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Individual post page
│   │   └── ...
│   ├── components/
│   │   └── blog/
│   │       ├── BlogCard.tsx        # Post preview card
│   │       ├── BlogHeader.tsx      # Post header with meta
│   │       └── MDXComponents.tsx   # Custom MDX components
│   └── lib/
│       └── blog.ts                 # Blog post utilities (get posts, parse)
└── ...
```

### Pattern 1: File-Based Content Storage

**What:** Store MDX files outside the `/app` directory in a `/content` folder, read them at build time or request time using Node.js `fs` module.

**When to use:** For content-heavy sites where authors should edit Markdown files directly, not TSX components.

**Example:**
```typescript
// Source: Next.js official MDX guide + community patterns
// lib/blog.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  content: string;
}

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(blogDirectory);

  const posts = fileNames
    .filter(name => name.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
        excerpt: data.excerpt,
        tags: data.tags || [],
        content,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1)); // Newest first

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      excerpt: data.excerpt,
      tags: data.tags || [],
      content,
    };
  } catch {
    return null;
  }
}
```

### Pattern 2: Dynamic Route with Static Generation

**What:** Use Next.js `generateStaticParams` to pre-render blog posts at build time for optimal performance.

**When to use:** Always for blogs with MDX files (no dynamic content that changes per request).

**Example:**
```typescript
// Source: Next.js App Router documentation
// app/blog/[slug]/page.tsx

import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { BlogHeader } from '@/components/blog/BlogHeader';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Galileo Blog`,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="prose">
      <BlogHeader
        title={post.title}
        date={post.date}
        author={post.author}
        tags={post.tags}
      />
      <MDXRemote source={post.content} />
    </article>
  );
}
```

### Pattern 3: Reuse Documentation Prose Styling

**What:** Apply the same `.prose` class used in documentation to blog posts for visual consistency.

**When to use:** When you want blog and docs to feel cohesive in typography and spacing.

**Example:**
```tsx
// app/blog/[slug]/page.tsx
<div className="container max-w-3xl py-12">
  <article className="prose">
    {/* Blog content renders with same styling as docs */}
    <MDXRemote source={post.content} />
  </article>
</div>
```

### Anti-Patterns to Avoid

- **Storing MDX in `/app` directory:** Creates coupling between content and code structure, makes it harder for non-developers to contribute posts
- **Using `@next/mdx` for blog:** Better suited for documentation pages; blog posts benefit from external storage
- **Not using generateStaticParams:** Missing this means posts won't be pre-rendered, causing slower page loads
- **Hardcoding post metadata in TSX:** Defeats the purpose of MDX; use frontmatter instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parsing | Custom YAML parser | gray-matter | Handles edge cases (different delimiters, multiple formats), battle-tested |
| MDX compilation | Custom Markdown-to-React | next-mdx-remote | Secure, supports RSC, handles component imports, caching |
| Date formatting | String manipulation | Intl.DateTimeFormat or date-fns | Localization support, timezone handling, relative dates |
| Syntax highlighting | Regex-based highlighter | Shiki (already installed) | 100+ languages, VS Code themes, accurate parsing |
| Slug generation | filename.replace() | Consistent naming convention | Handles special characters, URL encoding, uniqueness |

**Key insight:** MDX compilation is deceptively complex (security, component resolution, caching). next-mdx-remote has solved these problems.

## Common Pitfalls

### Pitfall 1: Mixing Build-Time and Runtime Data Fetching

**What goes wrong:** Using `fs.readFileSync` in Client Components causes errors ("fs module not found").

**Why it happens:** Client Components run in the browser where Node.js APIs don't exist.

**How to avoid:** Keep file system operations in Server Components or server-side utilities only. Mark components with data fetching as async Server Components.

**Warning signs:** Build errors mentioning "Module not found: Can't resolve 'fs'" or "crypto" polyfill warnings.

### Pitfall 2: Forgetting generateStaticParams

**What goes wrong:** Dynamic routes render on-demand instead of at build time, causing slow page loads.

**Why it happens:** Without `generateStaticParams`, Next.js doesn't know which pages to pre-render.

**How to avoid:** Always export `generateStaticParams` for dynamic routes with finite, known paths (like blog posts).

**Warning signs:** Slow initial page load for blog posts, console warnings about missing static params.

### Pitfall 3: Inconsistent Date Formatting

**What goes wrong:** Blog listing shows dates like "2026-02-01" while post headers show "February 1, 2026".

**Why it happens:** No centralized date formatting utility.

**How to avoid:** Create a `formatDate` helper function in `/lib/utils.ts`:

```typescript
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
```

**Warning signs:** User complaints about date readability, dates showing in ISO format.

### Pitfall 4: Not Escaping User-Generated Content

**What goes wrong:** If blog authors can write arbitrary HTML/JS in MDX, it could execute malicious code.

**Why it happens:** MDX allows embedding components and expressions.

**How to avoid:** Only allow trusted authors to write blog posts. If accepting external contributions, sanitize content or restrict MDX features.

**Warning signs:** Security scanner warnings, XSS vulnerability reports.

## Code Examples

Verified patterns from official sources:

### Blog Listing Page
```typescript
// Source: Next.js App Router patterns + community best practices
// app/blog/page.tsx

import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | Galileo Luxury Standard',
  description: 'Announcements and updates from the Galileo ecosystem.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-xl text-[var(--platinum-dim)] mb-12">
        Announcements, updates, and insights from the Galileo ecosystem.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article key={post.slug} className="glass-card p-6 hover:border-[var(--antique-gold)] transition-colors">
            <time className="text-sm text-[var(--platinum-dim)]">
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(new Date(post.date))}
            </time>
            <h2 className="text-2xl font-semibold mt-2 mb-3">
              <Link href={`/blog/${post.slug}`} className="hover:text-[var(--antique-gold)]">
                {post.title}
              </Link>
            </h2>
            <p className="text-[var(--platinum-dim)] mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-[var(--obsidian-elevated)] text-[var(--precision-blue)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### MDX Frontmatter Example
```yaml
---
title: "Galileo v1.0.0: Production Ready for Luxury Blockchain"
date: "2026-02-01"
author: "Galileo Core Team"
excerpt: "After months of development, Galileo v1.0.0 is here. A complete open standard for luxury product authentication, compliance, and provenance."
tags: ["release", "announcement", "v1.0"]
---

# Content goes here in Markdown/MDX
```

### Custom MDX Components
```typescript
// Source: MDX documentation + Next.js patterns
// components/blog/MDXComponents.tsx

import { CodeBlock } from '@/components/ui/CodeBlock';

export const mdxComponents = {
  // Override default components
  code: ({ children, className }: any) => {
    const language = className?.replace('language-', '') || 'text';
    return <CodeBlock code={children} language={language} />;
  },

  // Custom callout component
  Callout: ({ type = 'info', children }: any) => (
    <div className={`callout callout-${type}`}>
      {children}
    </div>
  ),
};

// Usage in next-mdx-remote:
// <MDXRemote source={content} components={mdxComponents} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Contentlayer | next-mdx-remote | 2023-2024 | Contentlayer is unmaintained; next-mdx-remote is actively maintained by HashiCorp |
| @next/mdx for all content | @next/mdx for docs, next-mdx-remote for blog | Next.js 13+ | Clearer separation of concerns, more flexible content storage |
| Client-side MDX rendering | React Server Components (RSC) | Next.js 13+ | Better performance, smaller bundles, SEO-friendly |
| Custom date formatting | Intl.DateTimeFormat | 2020+ | Native browser API, no dependencies, i18n-ready |
| Manual slug generation | File-based naming convention | Ongoing | Simpler, more predictable, less error-prone |

**Deprecated/outdated:**
- **Contentlayer**: Unmaintained as of 2024, use next-mdx-remote instead
- **remark-html**: Replaced by MDX compilation for richer component support
- **getStaticProps/getStaticPaths**: App Router uses `generateStaticParams` instead

## Blog Post Metadata Schema

Based on Schema.org BlogPosting standard and community best practices:

### Required Fields
```typescript
interface BlogPostFrontmatter {
  title: string;        // Post title (60 chars max for SEO)
  date: string;         // ISO 8601 format: "2026-02-01"
  author: string;       // Author name or "Galileo Core Team"
  excerpt: string;      // 1-2 sentence summary (160 chars max for SEO)
}
```

### Optional Fields
```typescript
interface BlogPostFrontmatterExtended extends BlogPostFrontmatter {
  tags?: string[];           // ["release", "announcement"]
  coverImage?: string;       // Path to hero image
  authorEmail?: string;      // For Schema.org markup
  draft?: boolean;           // Hide from listing if true
  lastModified?: string;     // ISO 8601 date
  relatedPosts?: string[];   // Slugs of related posts
}
```

### Example Frontmatter for v1.0.0 Announcement
```yaml
---
title: "Galileo v1.0.0: Production Ready for Luxury Blockchain"
date: "2026-02-01"
author: "Galileo Core Team"
excerpt: "After months of development, Galileo v1.0.0 is here. A complete open standard for luxury product authentication, compliance, and provenance."
tags: ["release", "announcement", "v1.0", "milestone"]
---
```

## v1.0.0 Announcement Post Outline

Based on open source release announcement best practices:

### Structure

```markdown
# Galileo v1.0.0: Production Ready for Luxury Blockchain

[Hero paragraph: Why this matters]
Today marks a major milestone: Galileo Luxury Standard v1.0.0 is production-ready.
After [duration] of development, we're shipping a complete, open standard for luxury
product authentication, regulatory compliance, and provenance tracking.

## The Problem We're Solving

- Counterfeiting costs luxury industry $81B+ annually
- ESPR mandates Digital Product Passports by 2027
- Existing solutions are proprietary silos that don't interoperate
- Brands need regulatory compliance (GDPR, MiCA) without vendor lock-in

## What's Included in v1.0.0

### Governance & Standards (8 specs)
- Technical Steering Committee charter with anti-dominance rules
- RFC process for community-driven evolution
- Apache 2.0 license ensuring it remains open

### Core Data Models (9 specs)
- ESPR-compliant Digital Product Passport schema
- EPCIS 2.0 lifecycle events (manufacture, sale, repair)
- Provenance grades and materiality threshold system

### Identity Infrastructure (7 specs)
- DID method for products and organizations
- ONCHAINID integration for KYC/KYB compliance
- W3C Verifiable Credentials for attestations

### Token & Compliance (8 specs)
- ERC-3643 extension for regulated luxury tokens
- MiCA-compliant transfer validation
- ERC-4337 account abstraction for gasless transactions

### Infrastructure (6 specs)
- GS1 Digital Link resolver specification
- RBAC with 7 role types
- Audit trail and retention policies

**Total: 38 specifications, 17 Solidity interfaces, 17 JSON schemas**

## What You Can Build

- **Luxury Brands**: Implement product certificates with regulatory compliance built-in
- **Tech Providers**: Build solutions on an open standard, not proprietary APIs
- **Integrators**: Connect existing ERP/PLM systems to blockchain provenance
- **Researchers**: Study real-world blockchain applications in luxury

## What's NOT in v1.0 (Yet)

Being transparent about current scope:
- Smart contract reference implementations → Planned for v1.1
- Multi-chain support → Ethereum-first, expanding later
- Consumer mobile apps → Specification only, not implementation
- Localization (i18n) → English-first for v1.0

## Getting Started

### Read the Specifications
Browse all 38 specs at [specs link] with status badges (Standard/Active/Draft).

### Explore the Documentation
- Quick Start Guide: Understand core concepts in 5 minutes
- Architecture Overview: Deep dive into hybrid on/off-chain model
- Compliance Guides: GDPR, MiCA, ESPR implementation patterns

### Join the Community
- GitHub Discussions: Ask questions, share ideas
- RFC Process: Propose improvements to the standard
- Monthly Office Hours: Meet the core team (schedule TBD)

## Roadmap

### v1.1 (Q2 2026)
- Reference smart contract implementations
- Developer SDK for TypeScript/JavaScript
- Integration guides for major ERPs

### v1.2 (Q3 2026)
- Multi-chain support (Polygon, Arbitrum)
- Enhanced GS1 resolver with role-based resolution
- Sustainability metrics expansion

## Thank You

This milestone wouldn't be possible without:
- Early adopters providing feedback on draft specs
- Open source community reviewing PRs and opening issues
- Industry advisors validating compliance approaches

**Ready to build the future of luxury provenance?**
[Get Started →](/docs/quick-start)

---

*Galileo Luxury Standard is an open standard governed by a Technical Steering Committee.
Licensed under Apache 2.0.*
```

### Key Elements to Include

1. **Compelling headline**: Focus on "production ready" milestone
2. **Problem context**: Why this matters to the industry
3. **Comprehensive feature list**: All 38 specs organized by domain
4. **User benefits**: What developers/brands can build
5. **Honest scope**: What's NOT included (builds trust)
6. **Clear CTAs**: Getting Started, Documentation, Community
7. **Roadmap preview**: Next milestones (v1.1, v1.2)
8. **Gratitude**: Thank contributors and early adopters
9. **Social proof**: (Add if available) testimonials, pilot programs
10. **Visual hierarchy**: Use headings, lists, emphasis for scannability

## Styling Approach

### Recommendation: Reuse Prose, Add Blog-Specific Enhancements

**Rationale:**
- Existing `.prose` class (lines 508-676 in globals.css) is comprehensive
- Maintains visual consistency with documentation portal
- Reduces CSS duplication and maintenance burden

**Blog-specific additions:**

```css
/* Add to globals.css after .prose block */

/* ============================================
   BLOG ENHANCEMENTS
   ============================================ */

.blog-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(229, 229, 229, 0.1);
}

.blog-header h1 {
  margin-bottom: 1rem;
}

.blog-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--platinum-dim);
  flex-wrap: wrap;
}

.blog-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.blog-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(0, 163, 255, 0.1);
  color: var(--precision-blue);
  border: 1px solid rgba(0, 163, 255, 0.2);
  text-transform: lowercase;
}
```

**Layout differences from docs:**
- Blog listing: Grid layout (2-3 columns) vs. docs sidebar layout
- Blog posts: Centered column (max-w-3xl) vs. docs with sidebar
- Blog cards: Glass card style with hover effects

## Open Questions

Things that couldn't be fully resolved:

1. **Pagination for blog listing**
   - What we know: For v1.0, likely <10 posts, pagination not needed
   - What's unclear: When to add pagination (threshold: 20 posts?)
   - Recommendation: Ship without pagination, add when needed (YAGNI principle)

2. **RSS feed**
   - What we know: Nice-to-have for blog subscribers
   - What's unclear: Is this a v1.1 requirement or v1.2?
   - Recommendation: Defer to later phase unless explicitly requested

3. **Comments/discussion**
   - What we know: Could integrate GitHub Discussions via utterances/giscus
   - What's unclear: Does Galileo want community comments on blog?
   - Recommendation: Start without comments, add if community requests

4. **Author profiles**
   - What we know: Currently "Galileo Core Team" as single author
   - What's unclear: Future individual author profiles with bios?
   - Recommendation: Simple string author for v1.0, expand if needed

## Sources

### Primary (HIGH confidence)
- [Next.js Official MDX Guide](https://nextjs.org/docs/app/guides/mdx) - Official documentation for MDX in App Router
- [next-mdx-remote GitHub](https://github.com/hashicorp/next-mdx-remote) - Official HashiCorp package
- [Schema.org BlogPosting](https://schema.org/BlogPosting) - Standard blog metadata schema

### Secondary (MEDIUM confidence)
- [Building a blog with Next.js App Router and MDX](https://www.alexchantastic.com/building-a-blog-with-next-and-mdx) - Comprehensive tutorial
- [Complete Guide: Integrating MDX Blog Feature into Next.js 14 App Router](https://www.kishoregunnam.com/blog/implement-blog-feature-nextjs-14-app-router) - Implementation guide
- [How I Built my Blog using MDX, Next.js, and React](https://www.joshwcomeau.com/blog/how-i-built-my-blog/) - Real-world architecture

### Tertiary (LOW confidence)
- [MDXBlog.io](https://www.mdxblog.io/) - Platform with templates, less relevant for custom builds
- [3 types of new feature blog posts](https://www.appcues.com/blog/new-feature-release-blog-posts) - Product announcement patterns
- [11 Inspiring New Feature Announcement Examples](https://userguiding.com/blog/new-feature-announcement-example) - Examples for structure

### Project Context
- `/Users/pierrebeunardeau/GalileoLuxury/.planning/PROJECT.md` - Galileo v1.0.0 requirements
- `/Users/pierrebeunardeau/GalileoLuxury/.planning/MILESTONES.md` - v1.0.0 shipped features
- `/Users/pierrebeunardeau/GalileoLuxury/website/src/app/globals.css` - Existing prose styling (lines 508-676)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-mdx-remote and gray-matter are de facto standards, verified from official docs and community
- Architecture: HIGH - File-based pattern is well-established in Next.js 14 App Router, official documentation confirms
- Pitfalls: MEDIUM - Based on community experience and common issues, not all personally verified
- v1.0.0 announcement outline: HIGH - Based on PROJECT.md contents and open source announcement best practices

**Research date:** 2026-02-01
**Valid until:** ~30 days (stable ecosystem, Next.js updates quarterly but blog patterns are mature)

# Phase 13: Production Deployment - Research

**Researched:** 2026-02-01
**Domain:** Next.js 14 App Router production deployment on Vercel
**Confidence:** HIGH

## Summary

Production deployment for Next.js 14 App Router on Vercel is a well-established pattern with native optimizations. The standard approach leverages Vercel's zero-configuration deployment with Next.js-specific enhancements including automatic ISR, Edge CDN distribution, and built-in image/font optimization. For this project, deployment targets galileoprotocol.io with HTTPS, comprehensive meta tags via Next.js metadata API, and Lighthouse scores >90 across all categories (Performance, Accessibility, Best Practices, SEO).

The deployment pipeline should enforce quality gates: TypeScript strict mode, ESLint checks, and Lighthouse CI verification before merging. Vercel automatically handles preview deployments on PRs, provides instant HTTPS, and requires only DNS configuration (A record or nameservers) for custom domains. The metadata API in Next.js 14 App Router uses file-based conventions (opengraph-image.tsx) or metadata objects for comprehensive SEO/social sharing setup.

Key findings: (1) Vercel is the native Next.js platform with automatic optimizations unavailable when self-hosting, (2) next/image and next/font eliminate external requests and layout shifts, (3) Lighthouse CI GitHub Actions integrate seamlessly with Vercel preview URLs, (4) TypeScript strict + ESLint enforcement requires explicit next.config.ts configuration since Next.js 16 removed built-in linting.

**Primary recommendation:** Use Vercel's native features (automatic ISR, Edge CDN, preview deployments) with CI/CD quality gates (TypeScript, ESLint, Lighthouse CI >90) and Next.js App Router metadata API for OG images and SEO.

## Standard Stack

The established libraries/tools for Next.js 14 production deployment on Vercel:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vercel Platform | N/A | Hosting & deployment | Native Next.js platform with zero-config deployment, automatic ISR, Edge CDN |
| Next.js | 14.x | Framework | App Router with built-in metadata API, next/image, next/font optimizations |
| next/image | Built-in | Image optimization | Automatic format conversion (WebP/AVIF), lazy loading, prevents layout shift |
| next/font | Built-in | Font optimization | Self-hosted Google Fonts, zero layout shift, no external requests |
| next/og | Built-in (App Router) | OG image generation | Dynamic social card images using JSX/CSS, no headless browser needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/analytics | Latest | Web analytics | Track visitor demographics, top pages (optional, not in phase scope) |
| treosh/lighthouse-ci-action | v12 | Lighthouse CI for GitHub | Automated performance testing on PRs with configurable budgets |
| TypeScript | 5.1.3+ | Type safety | Strict mode enforcement for production builds |
| ESLint | 9.x | Code quality | Build-time validation with flat config (Next.js 16+ compatible) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel | Netlify, Cloudflare Pages | Lose Next.js-specific optimizations (ISR, middleware on edge, automatic function generation) |
| next/og | Puppeteer/Playwright | 10x slower, requires headless browser, complex deployment |
| Lighthouse CI Action | LHCI server + custom setup | More complex, requires self-hosted server for result storage |

**Installation:**
```bash
# No additional packages needed for core deployment
# Lighthouse CI GitHub Action (add to .github/workflows/lighthouse.yml)
# Analytics (deferred to v1.2)
# npm install @vercel/analytics
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx                    # Root layout with metadata
├── opengraph-image.tsx          # Static OG image generation
├── robots.txt                    # SEO crawling rules
└── sitemap.ts                    # Dynamic sitemap generation

.github/
└── workflows/
    ├── ci.yml                    # TypeScript + ESLint checks
    └── lighthouse.yml            # Lighthouse CI on preview deployments

next.config.ts                    # TypeScript strict, ignore build errors: false
tsconfig.json                     # strict: true, strictNullChecks: true
.eslintrc.json                    # ESLint 9 flat config (if migrated)
vercel.json                       # Custom headers, redirects (optional)
```

### Pattern 1: Metadata API for SEO/OG Tags
**What:** Use Next.js App Router metadata API with metadataBase and static metadata objects for comprehensive SEO
**When to use:** All pages requiring meta tags, OG images, Twitter cards, canonical URLs
**Example:**
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://galileoprotocol.io'),
  title: {
    default: 'Galileo Protocol',
    template: '%s | Galileo Protocol'
  },
  description: 'Open standard for luxury product authentication and provenance',
  openGraph: {
    title: 'Galileo Protocol',
    description: 'Open standard for luxury product authentication and provenance',
    url: 'https://galileoprotocol.io',
    siteName: 'Galileo Protocol',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galileo Protocol',
    description: 'Open standard for luxury product authentication and provenance',
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Pattern 2: Static OG Image Generation
**What:** Generate OG images at build time using ImageResponse API with custom design
**When to use:** Single static OG image for all pages (can be per-page for dynamic content)
**Example:**
```typescript
// app/opengraph-image.tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from 'next/og'

export const alt = 'Galileo Protocol - Open standard for luxury product authentication'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to bottom right, #1e1e1e, #2d2d2d)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700 }}>
          Galileo Protocol
        </div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 20, opacity: 0.9 }}>
          Open standard for luxury authentication
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
```

### Pattern 3: Lighthouse CI GitHub Action
**What:** Automated Lighthouse audits on preview deployments with score requirements
**When to use:** Every PR to enforce performance/accessibility/SEO standards
**Example:**
```yaml
# .github/workflows/lighthouse.yml
# Source: https://github.com/treosh/lighthouse-ci-action
name: Lighthouse CI
on: pull_request

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: vercel-preview
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300

      - name: Audit URLs with Lighthouse
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            ${{ steps.vercel-preview.outputs.url }}
            ${{ steps.vercel-preview.outputs.url }}/docs
            ${{ steps.vercel-preview.outputs.url }}/blog
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

```json
// lighthouse-budget.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Pattern 4: TypeScript Strict + ESLint Build Checks
**What:** Enforce TypeScript strict mode and ESLint during builds, not just development
**When to use:** Always - prevents type errors from reaching production
**Example:**
```typescript
// next.config.ts
// Source: https://nextjs.org/docs/app/api-reference/config/typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Fail builds on TypeScript errors (DO NOT set ignoreBuildErrors: true)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Fail builds on ESLint errors (DO NOT set ignoreDuringBuilds: true)
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Pattern 5: Vercel Custom Domain Configuration
**What:** Add custom domain via Vercel dashboard with DNS verification (A record or nameservers)
**When to use:** Production deployment to galileoprotocol.io
**Example:**
```bash
# Vercel Dashboard steps:
# 1. Project > Settings > Domains
# 2. Add "galileoprotocol.io"
# 3. Vercel prompts for www redirect (recommend: yes)
# 4. Choose DNS verification method:

# Option A: A Record (recommended for apex domains)
# Add to DNS provider:
#   Type: A
#   Name: @ (or galileoprotocol.io)
#   Value: 76.76.21.21

# Option B: Vercel Nameservers (required for wildcard)
# Update nameservers at registrar:
#   ns1.vercel-dns.com
#   ns2.vercel-dns.com

# CNAME for www subdomain:
#   Type: CNAME
#   Name: www
#   Value: cname.vercel-dns.com

# Vercel automatically provisions SSL (HTTPS) after DNS verification
```

### Anti-Patterns to Avoid
- **Setting `ignoreBuildErrors: true` or `ignoreDuringBuilds: true`:** Defeats build-time validation, allows broken code to production
- **Manual OG image creation with canvas/Puppeteer:** 10x slower than next/og, requires headless browser
- **Loading Google Fonts via CDN `<link>` tags:** External request, causes layout shift, use next/font instead
- **Missing `priority` on above-fold images:** Causes lazy loading delay for hero images, degrades LCP score
- **Not setting `metadataBase`:** Results in relative URLs in OG images, breaks social sharing
- **Using `loading="lazy"` on hero images:** Delays critical images, tanks LCP and Lighthouse performance score

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image generation | Custom canvas/Puppeteer script | next/og ImageResponse API | Built into App Router, 10x faster, no headless browser, cached on Vercel CDN |
| Image optimization | Custom sharp pipeline | next/image component | Automatic format conversion (WebP/AVIF), lazy loading, prevents layout shift, CDN optimization |
| Font optimization | Manual font subsetting/preload | next/font/google or next/font/local | Self-hosted Google Fonts, zero layout shift, no external requests, automatic optimization |
| Lighthouse CI | Custom Lighthouse scripts | treosh/lighthouse-ci-action | GitHub Action with budget assertions, artifact uploads, comment on PR with results |
| Performance budgets | Manual bundle size checks | Lighthouse CI budget.json | Comprehensive: includes performance, accessibility, SEO, best practices scores |
| DNS configuration | Manual SSL setup | Vercel automatic HTTPS | Zero-config SSL/TLS certificates, automatic renewal, Edge network termination |
| Environment variables | Hardcoded configs | Vercel environment variables UI | Per-environment (production/preview/dev), encrypted storage, automatic injection |

**Key insight:** Vercel + Next.js 14 App Router provide production-ready solutions for deployment, performance, and SEO that outperform custom implementations. The metadata API, next/image, and next/font eliminate entire categories of performance problems.

## Common Pitfalls

### Pitfall 1: Missing metadataBase for Absolute URLs
**What goes wrong:** OG images and canonical URLs use relative paths, breaking social sharing
**Why it happens:** metadataBase is optional, defaults to deployment URL but needs explicit production domain
**How to avoid:** Set metadataBase: new URL('https://galileoprotocol.io') in root layout metadata
**Warning signs:** Facebook/Twitter preview shows broken image, OG debuggers show relative URLs

### Pitfall 2: TypeScript Errors Ignored in Production
**What goes wrong:** Type errors reach production because ignoreBuildErrors: true bypasses validation
**Why it happens:** Developers set it during local dev to "fix" errors quickly, forget to remove
**How to avoid:** Keep ignoreBuildErrors: false, fix all TypeScript errors before merging, use tsc --noEmit in CI
**Warning signs:** Runtime errors in production that TypeScript would have caught, any as types proliferating

### Pitfall 3: Lighthouse CI Without Preview URL Wait
**What goes wrong:** Lighthouse runs before Vercel preview deployment is ready, fails with connection errors
**Why it happens:** Vercel preview deployment takes 30-60s, GitHub Action continues immediately
**How to avoid:** Use wait-for-vercel-preview action before Lighthouse CI, or add sleep/retry logic
**Warning signs:** Intermittent CI failures with "Failed to fetch" or "Connection refused"

### Pitfall 4: Missing priority on Hero Images
**What goes wrong:** Above-fold images lazy load, delaying LCP (Largest Contentful Paint), Lighthouse performance score drops
**Why it happens:** next/image defaults to lazy loading, developers forget priority prop
**How to avoid:** Add priority prop to hero images, logos, above-fold content - ONE image per page maximum
**Warning signs:** Lighthouse LCP >2.5s, performance score <90, images pop in after page load

### Pitfall 5: Oversized Images Despite next/image
**What goes wrong:** Images are optimized but wrong sizes prop downloads 2400px image for 400px display
**Why it happens:** sizes prop defaults to 100vw, browser downloads largest image variant
**How to avoid:** Set sizes="(max-width: 768px) 100vw, 50vw" to match actual layout breakpoints
**Warning signs:** Network tab shows 500KB+ images, Lighthouse "Properly size images" warning

### Pitfall 6: ESLint 9 Flat Config Migration Issues
**What goes wrong:** Next.js 16 removed built-in next lint, legacy .eslintrc breaks, "plugin not detected" errors
**Why it happens:** Next.js 16+ requires ESLint 9 flat config, old @next/next plugin config no longer works
**How to avoid:** Migrate to eslint.config.js with flat config format, use @next/eslint-plugin-next with new syntax
**Warning signs:** Build fails with ESLint errors, "The Next.js plugin was not detected" warning

### Pitfall 7: Environment Variables Not Prefixed with NEXT_PUBLIC_
**What goes wrong:** Client-side code can't access environment variables, undefined at runtime
**Why it happens:** Next.js only exposes NEXT_PUBLIC_* variables to browser, server-only variables are undefined
**How to avoid:** Prefix client-side variables with NEXT_PUBLIC_, use plain names for server-only secrets
**Warning signs:** console.log(process.env.VAR_NAME) shows undefined in browser, works in API routes

### Pitfall 8: Vercel Build Time/Memory Limits Exceeded
**What goes wrong:** Builds fail with "Build exceeded maximum time" or "Out of memory" errors
**Why it happens:** Large dependencies, excessive image processing, inefficient build scripts
**How to avoid:** Use incremental builds, optimize dependencies, move heavy processing to runtime, upgrade plan if needed
**Warning signs:** Build logs show warnings about bundle size, builds consistently take >5 minutes

### Pitfall 9: Stale DNS Cache After Domain Configuration
**What goes wrong:** Domain shows "404: Not Found" or old content hours after DNS configuration
**Why it happens:** DNS propagation takes 24-48 hours, local/ISP DNS caches old records
**How to avoid:** Use DNS checker tools (whatsmydns.net), test with Vercel-provided URL first, wait for propagation
**Warning signs:** Domain works from some locations/networks but not others, nslookup shows old IP

## Code Examples

Verified patterns from official sources:

### next/image with Priority and Sizes
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/optimizing/images
import Image from 'next/image'

export default function HeroSection() {
  return (
    <div className="relative h-screen">
      {/* Hero image - above the fold, needs priority */}
      <Image
        src="/hero.jpg"
        alt="Galileo Protocol hero"
        fill
        priority // Load immediately, not lazy
        sizes="100vw" // Full viewport width
        className="object-cover"
      />

      {/* Thumbnail grid - below fold, lazy load OK */}
      <div className="grid grid-cols-3 gap-4">
        <Image
          src="/thumb1.jpg"
          alt="Product 1"
          width={400}
          height={400}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // No priority - will lazy load
        />
      </div>
    </div>
  )
}
```

### Google Fonts with next/font
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
import { Outfit, Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'

// Variable fonts don't need weight specification
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const cormorant = Cormorant_Garamond({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body className="font-outfit">{children}</body>
    </html>
  )
}
```

### Dynamic generateMetadata for Blog Posts
```typescript
// app/blog/[slug]/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata, ResolvingMetadata } from 'next'
import { getPost } from '@/lib/blog'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug
  const post = await getPost(slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      // OG image specific to this post
      images: [{
        url: `/blog/${slug}/opengraph-image`,
        width: 1200,
        height: 630,
      }],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const slug = (await params).slug
  const post = await getPost(slug)
  return <article>{post.content}</article>
}
```

### Vercel Environment Variables Access
```typescript
// Server-side (API routes, Server Components)
// Source: https://vercel.com/docs/environment-variables
const apiKey = process.env.API_KEY // No prefix needed

// Client-side (use sparingly, only for public configs)
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL // Must have NEXT_PUBLIC_ prefix

// In Vercel Dashboard: Project > Settings > Environment Variables
// Add:
//   API_KEY = "secret" (Production only, server-side)
//   NEXT_PUBLIC_API_URL = "https://api.galileoprotocol.io" (All environments, client-side)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router with getServerSideProps | App Router with React Server Components | Next.js 13+ | Better streaming, granular data fetching, built-in metadata API |
| Manual meta tags in <Head> | metadata object / generateMetadata | Next.js 13+ App Router | Type-safe, co-located with pages, automatic deduplication |
| @vercel/og in API routes | next/og in opengraph-image.tsx | Next.js 13+ App Router | File-based convention, static generation, cleaner code |
| Manual ESLint via next lint | ESLint 9 flat config | Next.js 16+ | Removed built-in linting, requires manual eslint.config.js |
| .eslintrc with plugins array | eslint.config.js flat config | ESLint 9 (2024) | Breaking change, all configs need migration |
| Manual Lighthouse CLI | GitHub Actions with treosh/lighthouse-ci-action | 2020+ | Automated, integrates with PR comments, budget assertions |
| Manual SSL certificates | Vercel automatic HTTPS | Always on Vercel | Zero-config, automatic renewal, Edge termination |

**Deprecated/outdated:**
- **getServerSideProps/getStaticProps:** Still supported in Pages Router but App Router Server Components are preferred
- **next/head component:** Replaced by metadata API in App Router
- **Manual meta tag management:** Use generateMetadata instead of manual <meta> tags
- **Custom Webpack config for fonts:** next/font handles optimization automatically
- **Manual image optimization pipelines:** next/image handles format conversion, lazy loading, sizing
- **next lint command:** Removed in Next.js 16, use eslint directly with flat config

## Open Questions

Things that couldn't be fully resolved:

1. **ESLint 9 Flat Config Migration Timeline**
   - What we know: Next.js 16+ removed built-in next lint, ESLint 9 requires flat config migration
   - What's unclear: Whether project already uses ESLint 9 or legacy .eslintrc, migration complexity unknown
   - Recommendation: Check existing ESLint version, if <9 defer migration or use ESLint 8 with manual eslint.config.js, if 9+ verify flat config compatibility

2. **Lighthouse CI Score Variability**
   - What we know: Lighthouse scores can vary ±5 points between runs due to network conditions, CPU throttling
   - What's unclear: Whether to enforce strict >90 or allow ±5 variance buffer (>85 to account for noise)
   - Recommendation: Start with minScore: 0.9 (90), adjust to 0.85 if false positives occur, use averages of 3 runs for stability

3. **Preview Deployment Authentication**
   - What we know: Vercel offers Deployment Protection for preview URLs, bypassed with VERCEL_AUTOMATION_BYPASS_SECRET
   - What's unclear: User hasn't specified if preview deployments should be public or protected
   - Recommendation: Keep preview deployments public (default) for Lighthouse CI to work without auth, add protection later if needed

4. **Domain Registrar for galileoprotocol.io**
   - What we know: Domain is purchased and DNS accessible, need A record or nameserver configuration
   - What's unclear: Which registrar (affects DNS configuration UI), whether DNS management is available
   - Recommendation: Use A record method (76.76.21.21) as primary, fallback to nameservers if registrar doesn't support A records

5. **Existing TypeScript/ESLint Configuration**
   - What we know: Project uses TypeScript, phase requires strict mode enforcement
   - What's unclear: Current tsconfig.json strict setting, existing ESLint configuration compatibility
   - Recommendation: Audit existing configs during implementation, enable strict incrementally if currently false

## Sources

### Primary (HIGH confidence)
- [Next.js Metadata and OG Images Guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Metadata API, file conventions, ImageResponse patterns
- [Next.js opengraph-image File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) - OG image generation, static vs dynamic
- [Next.js TypeScript Configuration](https://nextjs.org/docs/app/api-reference/config/typescript) - ignoreBuildErrors, tsconfigPath, strict mode
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) - next/font/google, next/font/local, self-hosting
- [Next.js Image Optimization](https://nextjs.org/docs/14/app/building-your-application/optimizing/images) - next/image, priority, sizes, lazy loading
- [Vercel Next.js Framework Guide](https://vercel.com/docs/frameworks/full-stack/nextjs) - ISR, SSR, streaming, image/font optimization
- [Vercel Adding Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) - DNS configuration, nameservers, verification
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables) - NEXT_PUBLIC_ prefix, per-environment config
- [Vercel System Environment Variables](https://vercel.com/docs/environment-variables/system-environment-variables) - Auto-populated variables
- [treosh/lighthouse-ci-action GitHub](https://github.com/treosh/lighthouse-ci-action) - GitHub Action usage, configuration options

### Secondary (MEDIUM confidence)
- [Next.js Configuration: ESLint](https://nextjs.org/docs/pages/api-reference/config/eslint) - ESLint configuration, ignoreDuringBuilds (verified with official docs)
- [Vercel Preview Deployments Features](https://vercel.com/docs/deployments/preview-deployments) - Preview deployment behavior, configuration (verified Dec 2025)
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection) - Protection methods, automation bypass (verified Sep 2025)
- [Lighthouse Performance Scoring - Graphite](https://graphite.com/guides/lighthouse-scoring) - Scoring algorithm, log-normal distribution (2025)
- [Chrome for Developers: Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring) - Accessibility audit details (official)

### Tertiary (LOW confidence - WebSearch only)
- Medium article: [Achieving 95+ Lighthouse Scores in Next.js 15](https://medium.com/@sureshdotariya/achieving-95-lighthouse-scores-in-next-js-15-modern-web-application-part1-e2183ba25fc1) - Optimization techniques (Dec 2025, needs validation)
- Medium article: [Lighthouse 100 with Next.js Performance Checklist](https://medium.com/better-dev-nextjs-react/lighthouse-100-with-next-js-the-missing-performance-checklist-e87ee487775f) - Comprehensive checklist (Dec 2025, needs validation)
- Community: [24 things I learned deploying to Vercel](https://nick.af/articles/vercel-the-first-time) - Common pitfalls anecdotal (needs official verification)
- GitHub Discussion: [Vercel deployment bad performance](https://github.com/vercel/next.js/discussions/48136) - Performance issues reports (anecdotal)
- WPDeveloper: [Google Lighthouse: How to Achieve Highest Score 2026](https://wpdeveloper.com/google-lighthouse-how-to-achieve-highest-score/) - General Lighthouse guidance (early 2026)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js and Vercel documentation verified, treosh/lighthouse-ci-action is established (v12)
- Architecture: HIGH - Metadata API, next/image, next/font patterns from official Next.js docs, Vercel deployment patterns native
- Pitfalls: HIGH - TypeScript/ESLint pitfalls verified from official docs, Lighthouse/image pitfalls from official performance guides, DNS/environment variable issues from Vercel docs

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable platform, but Next.js updates quarterly)

**Note on Next.js 16:** Some sources indicate Next.js 16 removed built-in next lint command. If project uses Next.js 14 (as specified), this doesn't apply yet, but plan for migration if upgrading to 16+.

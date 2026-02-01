import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPostSlugs, getPostBySlug, formatDate } from '@/lib/blog';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for each blog post
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Galileo Blog',
    };
  }

  return {
    title: `${post.frontmatter.title} | Galileo Blog`,
    description: post.frontmatter.excerpt,
    authors: [{ name: post.frontmatter.author }],
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
    },
  };
}

/**
 * MDX components for custom rendering
 */
const mdxComponents = {
  // Custom heading styles
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} className="text-3xl font-bold text-[var(--platinum)] mb-6" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-2xl font-semibold text-[var(--platinum)] mt-10 mb-4 pb-2 border-b border-[rgba(229,229,229,0.1)]"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="text-xl font-semibold text-[var(--platinum)] mt-8 mb-3"
    />
  ),
  // Links
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-[var(--precision-blue)] hover:text-[var(--antique-gold)] transition-colors underline"
    />
  ),
  // Code blocks
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="bg-[var(--obsidian-elevated)] border border-[rgba(229,229,229,0.08)] rounded-lg p-4 overflow-x-auto my-6"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    // Inline code vs code blocks
    const isBlock = typeof props.children === 'string' && props.children.includes('\n');
    if (isBlock) {
      return <code {...props} className="text-sm font-mono" />;
    }
    return (
      <code
        {...props}
        className="bg-[var(--obsidian-elevated)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--precision-blue)]"
      />
    );
  },
  // Lists
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-inside my-4 space-y-2 text-[var(--platinum-dim)]" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-inside my-4 space-y-2 text-[var(--platinum-dim)]" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed" />
  ),
  // Blockquote
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-[var(--antique-gold)] pl-4 my-6 italic text-[var(--platinum-dim)]"
    />
  ),
  // Paragraph
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="my-4 leading-relaxed text-[var(--platinum-dim)]" />
  ),
  // Strong
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-[var(--platinum)]" />
  ),
  // Horizontal rule
  hr: () => <hr className="my-8 border-t border-[rgba(229,229,229,0.1)]" />,
};

/**
 * Blog post page component
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;

  return (
    <div className="spatial-background min-h-screen">
      <main className="container py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--platinum-dim)] hover:text-[var(--antique-gold)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            {/* Tags */}
            {frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {frontmatter.tags.map((tag) => (
                  <span key={tag} className="spec-badge spec-badge-active">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--platinum)] mb-6 leading-tight">
              {frontmatter.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--platinum-dim)]">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(frontmatter.date)}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {frontmatter.author}
              </span>
            </div>

            {/* Excerpt */}
            <p className="mt-6 text-xl text-[var(--platinum)] leading-relaxed">
              {frontmatter.excerpt}
            </p>
          </header>

          {/* Divider */}
          <hr className="border-t border-[rgba(229,229,229,0.1)] mb-12" />

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <MDXRemote source={content} components={mdxComponents} />
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-[rgba(229,229,229,0.1)]">
            <div className="glass-card p-6 text-center">
              <p className="text-[var(--platinum-dim)] mb-4">
                Have questions or feedback about this post?
              </p>
              <a
                href="https://github.com/galileo-luxury/standard/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--precision-blue)] hover:text-[var(--antique-gold)] transition-colors"
              >
                Join the discussion on GitHub
              </a>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

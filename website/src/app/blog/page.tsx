import { getAllPosts, formatDate } from '@/lib/blog';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

export const metadata = {
  title: 'Blog | Galileo Luxury Standard',
  description: 'News, announcements, and updates from the Galileo Luxury Standard project.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="spatial-background min-h-screen">
      <main className="container py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-gradient-gold mb-4">Blog</h1>
          <p className="text-xl text-[var(--platinum-dim)] max-w-2xl mx-auto">
            News, announcements, and updates from the Galileo Luxury Standard ecosystem.
          </p>
        </header>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <p className="text-[var(--platinum-dim)] text-lg">
              No blog posts yet. Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="glass-card angle-glow-ambient group transition-all duration-300 hover:scale-[1.02]"
              >
                <Link href={`/blog/${post.slug}`} className="block p-6">
                  {/* Tags */}
                  {post.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.frontmatter.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="spec-badge spec-badge-active text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-[var(--platinum)] mb-3 group-hover:text-[var(--antique-gold)] transition-colors">
                    {post.frontmatter.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[var(--platinum-dim)] text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.frontmatter.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-[var(--platinum-dim)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.frontmatter.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {post.frontmatter.author}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Subscribe CTA */}
        <section className="mt-24 text-center">
          <div className="glass-card p-8 md:p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-[var(--platinum)] mb-4">
              Stay Updated
            </h2>
            <p className="text-[var(--platinum-dim)] mb-6">
              Follow the project on GitHub to receive updates about new releases,
              features, and ecosystem developments.
            </p>
            <a
              href="https://github.com/galileo-luxury/standard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 button-haptic"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Watch on GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

import { getAllPosts, formatDate } from "@/lib/blog";
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";

export const metadata = {
  title: "Changelog",
  description:
    "Release history and updates for Galileo Protocol. Track every version, fix, and new feature shipped.",
};

export default function ChangelogPage() {
  const releases = getAllPosts().filter((post) =>
    post.frontmatter.tags.some((tag) =>
      ["release", "patch", "minor", "major", "deployment"].includes(tag)
    )
  );

  return (
    <div className="ocean-background min-h-screen">
      <main className="container pt-40 pb-16 md:pb-24 max-w-3xl">
        {/* Header */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-cyan-500/50" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-cyan-400/60">
              History
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
          <h1 className="bg-gradient-to-r from-[var(--cyan-primary)] to-[var(--emerald-primary)] bg-clip-text text-transparent mb-4">
            Changelog
          </h1>
          <p className="text-xl text-[var(--platinum-dim)] max-w-2xl">
            All notable changes, releases, and deployments for Galileo Protocol.
          </p>
        </header>

        {releases.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[var(--platinum-dim)] text-lg">
              No releases yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-0 top-2 bottom-2 w-[1px]"
              style={{
                background:
                  "linear-gradient(to bottom, var(--cyan-primary), var(--emerald-primary), transparent)",
                opacity: 0.2,
              }}
            />

            <ol className="space-y-12 pl-8">
              {releases.map((post) => (
                <li key={post.slug} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[33px] top-1.5 w-2 h-2 rounded-full border border-cyan-400/40 bg-[var(--obsidian)] group-hover:border-cyan-400/80 transition-colors duration-300"
                    style={{
                      boxShadow: "0 0 8px rgba(0,255,255,0.1)",
                    }}
                  />

                  <Link href={`/blog/${post.slug}`} className="block group/card">
                    <article
                      className="border border-white/[0.06] p-6 transition-all duration-300 hover:border-cyan-400/20"
                      style={{
                        background:
                          "linear-gradient(145deg, var(--slate) 0%, var(--graphite) 100%)",
                        borderRadius: "12px",
                      }}
                    >
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.frontmatter.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border border-white/10 text-white/50"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-light text-[var(--platinum)] mb-2 group-hover/card:text-[var(--cyan-primary)] transition-colors duration-300">
                        {post.frontmatter.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-[var(--platinum-dim)] leading-relaxed mb-4 line-clamp-2">
                        {post.frontmatter.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.frontmatter.date)}
                        </span>
                        <span className="text-[11px] text-white/30 group-hover/card:text-cyan-400/80 transition-colors duration-300">
                          Read release notes →
                        </span>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer CTA */}
        <section className="mt-20 glass-card p-8 text-center">
          <p className="text-[var(--platinum-dim)] text-sm mb-4">
            All changes are tracked via{" "}
            <code className="text-cyan-400/80 text-xs bg-white/5 px-1.5 py-0.5 rounded">
              @changesets/cli
            </code>{" "}
            and published automatically on merge to{" "}
            <code className="text-cyan-400/80 text-xs bg-white/5 px-1.5 py-0.5 rounded">
              main
            </code>
            .
          </p>
          <Link
            href="/blog"
            className="text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors duration-200"
          >
            ← All blog posts
          </Link>
        </section>
      </main>
    </div>
  );
}

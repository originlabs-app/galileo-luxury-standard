import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial glow - repositioned for asymmetric layout */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#D4AF37] opacity-[0.025] blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00A3FF] opacity-[0.02] blur-[100px] rounded-full" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--antique-gold)]/20 bg-[var(--antique-gold)]/5">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--antique-gold)]">v1.0.0 Released</span>
            </div>

            {/* Title with gradient */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              <span className="block text-[var(--platinum)]">GALILEO</span>
              <span className="block text-gradient-hero">
                LUXURY STANDARD
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-[var(--platinum-dim)] max-w-xl leading-relaxed">
              The open standard for luxury product authenticity,
              <span className="italic-accent text-[var(--platinum)]"> protecting heritage </span>
              through interoperable technology.
            </p>

            {/* Secondary text */}
            <p className="text-base text-[var(--platinum-dim)] max-w-lg">
              Digital Product Passports, decentralized identity, and compliant token transfers.
              GDPR, MiCA, and ESPR ready.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/docs"
                className="button-haptic inline-flex items-center gap-2 px-8 py-4 bg-[var(--antique-gold)] text-[var(--obsidian)] font-semibold rounded-lg hover:bg-[#E5C04A] transition-colors"
              >
                Read Documentation
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="https://github.com/originlabs-app/galileo-luxury-standard"
                target="_blank"
                rel="noopener noreferrer"
                className="button-haptic inline-flex items-center gap-2 px-8 py-4 border border-[var(--platinum)]/20 text-[var(--platinum)] font-semibold rounded-lg hover:bg-[var(--platinum)]/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </Link>
            </div>
          </div>

          {/* Right: Floating Architecture Visual */}
          <div className="hidden lg:block relative">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-[var(--platinum-dim)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Abstract floating layers representing hybrid architecture */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Off-chain layer */}
        <div className="absolute w-64 h-64 rounded-2xl border border-[var(--platinum)]/10 bg-[var(--obsidian-surface)]/80 backdrop-blur-sm animate-float-slow">
          <div className="p-6">
            <div className="text-xs text-[var(--platinum-dim)] uppercase tracking-wider mb-3 font-medium">Off-Chain</div>
            <div className="space-y-2">
              <div className="h-2 w-3/4 bg-[var(--platinum)]/10 rounded" />
              <div className="h-2 w-1/2 bg-[var(--platinum)]/10 rounded" />
              <div className="h-2 w-2/3 bg-[var(--platinum)]/10 rounded" />
            </div>
            <div className="mt-4 text-xs text-[var(--platinum-dim)]/60 font-mono">
              DPP • EPCIS
            </div>
          </div>
        </div>

        {/* Resolver layer */}
        <div className="absolute w-56 h-56 rounded-2xl border border-[var(--precision-blue)]/30 bg-[var(--precision-blue)]/5 backdrop-blur-sm animate-float-medium">
          <div className="p-6">
            <div className="text-xs text-[var(--precision-blue)] uppercase tracking-wider mb-3 font-medium">GS1 Resolver</div>
            <div className="flex gap-2 mt-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--precision-blue)]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[var(--precision-blue)]/40" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--precision-blue)]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[var(--precision-blue)]/40" />
              </div>
            </div>
            <div className="mt-4 text-xs text-[var(--precision-blue)]/60 font-mono">
              did:galileo
            </div>
          </div>
        </div>

        {/* On-chain layer */}
        <div className="absolute w-48 h-48 rounded-2xl border border-[var(--antique-gold)]/30 bg-[var(--antique-gold)]/5 backdrop-blur-sm animate-float-fast">
          <div className="p-6">
            <div className="text-xs text-[var(--antique-gold)] uppercase tracking-wider mb-3 font-medium">On-Chain</div>
            <div className="mt-4 font-mono text-xs text-[var(--antique-gold)]/60">
              ERC-3643
            </div>
            <div className="mt-2 flex gap-1">
              <div className="w-6 h-6 rounded bg-[var(--antique-gold)]/20" />
              <div className="w-6 h-6 rounded bg-[var(--antique-gold)]/20" />
              <div className="w-6 h-6 rounded bg-[var(--antique-gold)]/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

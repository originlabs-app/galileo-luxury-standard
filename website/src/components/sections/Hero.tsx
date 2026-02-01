import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] opacity-[0.03] blur-[150px] rounded-full" />

      <div className="container relative z-10 text-center px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-sm text-[#D4AF37]">v1.0.0 Released — Apache 2.0</span>
        </div>

        {/* Main Title */}
        <h1 className="max-w-4xl mx-auto mb-6">
          <span className="text-[#E5E5E5]">The Open Standard for</span>
          <br />
          <span className="text-gradient-gold">Luxury Interoperability</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#A3A3A3] mb-4 font-serif italic">
          &ldquo;Protégez le patrimoine des marques et le savoir-faire humain
          avec un langage commun, décentralisé et interopérable.&rdquo;
        </p>

        <p className="max-w-2xl mx-auto text-base text-[#A3A3A3] mb-12">
          Digital Product Passports, decentralized identity, and compliant token transfers
          for the luxury industry. GDPR, MiCA, and ESPR ready.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/specs" className="btn-primary">
            Explore Specifications
          </Link>
          <Link href="/governance" className="btn-secondary">
            Join the TSC
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-[#A3A3A3]"
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
      </div>
    </section>
  );
}

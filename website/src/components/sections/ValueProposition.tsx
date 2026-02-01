const values = [
  {
    title: 'Heritage',
    subtitle: 'Digitizing Craftsmanship',
    description:
      'Preserve artisan attribution and provenance with immutable records. From raw materials to finished product, every step is traceable.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        />
      </svg>
    ),
  },
  {
    title: 'Precision',
    subtitle: 'On-Chain Transparency',
    description:
      'ERC-3643 compliant tokens with modular compliance. Verified identity, auditable transfers, and cryptographic proofs.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: 'Compliance',
    subtitle: 'Ready for 2027',
    description:
      'Built-in support for ESPR Digital Product Passports, MiCA CASP requirements, and GDPR right-to-erasure through CRAB model.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export function ValueProposition() {
  return (
    <section className="section bg-[#0a0a0a]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Why Galileo?</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            A neutral, open standard designed for the unique requirements of the luxury industry.
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="glass-card p-8 group hover:border-[rgba(212,175,55,0.3)] transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] mb-6 group-hover:bg-[rgba(212,175,55,0.15)] transition-colors">
                {value.icon}
              </div>

              {/* Content */}
              <h3 className="text-[#E5E5E5] mb-1">{value.title}</h3>
              <p className="text-[#D4AF37] text-sm font-medium mb-4">{value.subtitle}</p>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

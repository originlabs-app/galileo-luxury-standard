const layers = [
  {
    title: 'Off-Chain Layer',
    subtitle: 'Secure Private Storage',
    description:
      'JSON-LD metadata, images, and documents stored with GDPR-compliant right-to-erasure via CRAB model.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
  },
  {
    title: 'Resolution Layer',
    subtitle: 'GS1 Digital Link Resolver',
    description:
      'Bridges physical products to digital identities via standardized URIs and QR codes.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    title: 'On-Chain Layer',
    subtitle: 'EVM Blockchain',
    description:
      'ERC-3643 compliant tokens with identity claims, compliance modules, and ownership transfers.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
];

export function Architecture() {
  return (
    <section className="section bg-[#050505]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Hybrid Architecture</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            GDPR-compliant design separating mutable data from immutable blockchain records.
          </p>
        </div>

        {/* SVG Diagram */}
        <div className="max-w-4xl mx-auto mb-12">
          <svg viewBox="0 0 800 480" className="w-full" aria-labelledby="arch-title arch-desc">
            <title id="arch-title">Galileo Hybrid Architecture Diagram</title>
            <desc id="arch-desc">
              Three-layer architecture showing off-chain storage, GS1 resolver, and on-chain blockchain
            </desc>

            {/* Definitions */}
            <defs>
              {/* Gradient for gold elements */}
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5D77E" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>

              {/* Arrow marker */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#A3A3A3" />
              </marker>

              {/* Glow filter for gold elements */}
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Glow filter for blue elements */}
              <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background subtle grid */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            </pattern>
            <rect width="800" height="480" fill="url(#grid)" opacity="0.5" />

            {/* LAYER 1: Off-Chain (Top) */}
            <g transform="translate(100, 40)">
              {/* Layer box */}
              <rect
                x="0"
                y="0"
                width="600"
                height="100"
                rx="12"
                fill="#121212"
                stroke="#E5E5E5"
                strokeWidth="1"
                opacity="0.8"
              />

              {/* Layer title */}
              <text
                x="30"
                y="40"
                fill="#E5E5E5"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="22"
                fontWeight="500"
              >
                Off-Chain Layer
              </text>
              <text x="30" y="65" fill="#A3A3A3" fontFamily="Inter, sans-serif" fontSize="14">
                Secure Private Storage
              </text>

              {/* Data items */}
              <g transform="translate(280, 25)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="30"
                  fill="#E5E5E5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="11"
                  textAnchor="middle"
                >
                  JSON-LD DPP
                </text>
              </g>

              <g transform="translate(395, 25)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
                <text
                  x="40"
                  y="30"
                  fill="#E5E5E5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="11"
                  textAnchor="middle"
                >
                  Images
                </text>
              </g>

              <g transform="translate(490, 25)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
                <text
                  x="40"
                  y="30"
                  fill="#E5E5E5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="11"
                  textAnchor="middle"
                >
                  Docs
                </text>
              </g>

              {/* GDPR/CRAB Badge */}
              <g transform="translate(540, 75)">
                <rect
                  x="0"
                  y="0"
                  width="55"
                  height="20"
                  rx="10"
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x="27.5"
                  y="14"
                  fill="#10B981"
                  fontFamily="Inter, sans-serif"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  CRAB
                </text>
              </g>
            </g>

            {/* Arrow 1: Off-chain to Resolver */}
            <g>
              <line
                x1="400"
                y1="145"
                x2="400"
                y2="185"
                stroke="#A3A3A3"
                strokeWidth="2"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead)"
              />
              <text
                x="420"
                y="170"
                fill="#A3A3A3"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontStyle="italic"
              >
                hash reference
              </text>
            </g>

            {/* LAYER 2: Resolution (Middle) */}
            <g transform="translate(100, 190)">
              {/* Layer box with blue accent */}
              <rect
                x="0"
                y="0"
                width="600"
                height="100"
                rx="12"
                fill="#121212"
                stroke="#00A3FF"
                strokeWidth="1.5"
                filter="url(#blueGlow)"
              />

              {/* Layer title */}
              <text
                x="30"
                y="40"
                fill="#00A3FF"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="22"
                fontWeight="500"
              >
                Resolution Layer
              </text>
              <text x="30" y="65" fill="#A3A3A3" fontFamily="Inter, sans-serif" fontSize="14">
                GS1 Digital Link Resolver
              </text>

              {/* Resolution flow */}
              <g transform="translate(280, 20)">
                {/* Physical product */}
                <rect
                  x="0"
                  y="10"
                  width="70"
                  height="40"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#00A3FF"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y="35"
                  fill="#00A3FF"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  textAnchor="middle"
                >
                  QR/NFC
                </text>

                {/* Arrow */}
                <line x1="80" y1="30" x2="110" y2="30" stroke="#00A3FF" strokeWidth="1.5" />
                <polygon points="110,26 120,30 110,34" fill="#00A3FF" />

                {/* URI box */}
                <rect
                  x="130"
                  y="10"
                  width="160"
                  height="40"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#00A3FF"
                  strokeWidth="1"
                />
                <text
                  x="210"
                  y="35"
                  fill="#E5E5E5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  textAnchor="middle"
                >
                  id.gs1.org/01/03614270...
                </text>
              </g>

              {/* GS1 Badge */}
              <g transform="translate(540, 75)">
                <rect
                  x="0"
                  y="0"
                  width="55"
                  height="20"
                  rx="10"
                  fill="rgba(0, 163, 255, 0.15)"
                  stroke="rgba(0, 163, 255, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x="27.5"
                  y="14"
                  fill="#00A3FF"
                  fontFamily="Inter, sans-serif"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  GS1
                </text>
              </g>
            </g>

            {/* Arrow 2: Resolver to On-chain */}
            <g>
              <line
                x1="400"
                y1="295"
                x2="400"
                y2="335"
                stroke="#A3A3A3"
                strokeWidth="2"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead)"
              />
              <text
                x="420"
                y="320"
                fill="#A3A3A3"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontStyle="italic"
              >
                token lookup
              </text>
            </g>

            {/* LAYER 3: On-Chain (Bottom) */}
            <g transform="translate(100, 340)">
              {/* Layer box with gold accent */}
              <rect
                x="0"
                y="0"
                width="600"
                height="100"
                rx="12"
                fill="#121212"
                stroke="url(#goldGradient)"
                strokeWidth="1.5"
                filter="url(#goldGlow)"
              />

              {/* Layer title */}
              <text
                x="30"
                y="40"
                fill="#D4AF37"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="22"
                fontWeight="500"
              >
                On-Chain Layer
              </text>
              <text x="30" y="65" fill="#A3A3A3" fontFamily="Inter, sans-serif" fontSize="14">
                EVM Blockchain
              </text>

              {/* On-chain components */}
              <g transform="translate(250, 25)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#D4AF37"
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="22"
                  fill="#D4AF37"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  textAnchor="middle"
                >
                  ERC-3643
                </text>
                <text
                  x="50"
                  y="38"
                  fill="#A3A3A3"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  textAnchor="middle"
                >
                  Token
                </text>
              </g>

              <g transform="translate(365, 25)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#D4AF37"
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="22"
                  fill="#D4AF37"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  textAnchor="middle"
                >
                  ONCHAINID
                </text>
                <text
                  x="50"
                  y="38"
                  fill="#A3A3A3"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  textAnchor="middle"
                >
                  Identity
                </text>
              </g>

              <g transform="translate(480, 25)">
                <rect
                  x="0"
                  y="0"
                  width="90"
                  height="50"
                  rx="6"
                  fill="#0a0a0a"
                  stroke="#D4AF37"
                  strokeWidth="1"
                />
                <text
                  x="45"
                  y="22"
                  fill="#D4AF37"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  textAnchor="middle"
                >
                  Compliance
                </text>
                <text
                  x="45"
                  y="38"
                  fill="#A3A3A3"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  textAnchor="middle"
                >
                  Modules
                </text>
              </g>

              {/* ERC Badge */}
              <g transform="translate(540, 75)">
                <rect
                  x="0"
                  y="0"
                  width="55"
                  height="20"
                  rx="10"
                  fill="rgba(212, 175, 55, 0.15)"
                  stroke="rgba(212, 175, 55, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x="27.5"
                  y="14"
                  fill="#D4AF37"
                  fontFamily="Inter, sans-serif"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  ERC
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Legend / Key points below diagram */}
        <div className="grid md:grid-cols-3 gap-8">
          {layers.map((layer, index) => (
            <div
              key={layer.title}
              className="glass-card p-8 group hover:border-[rgba(212,175,55,0.3)] transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                  index === 0
                    ? 'bg-[rgba(229,229,229,0.1)] text-[#E5E5E5] group-hover:bg-[rgba(229,229,229,0.15)]'
                    : index === 1
                      ? 'bg-[rgba(0,163,255,0.1)] text-[#00A3FF] group-hover:bg-[rgba(0,163,255,0.15)]'
                      : 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] group-hover:bg-[rgba(212,175,55,0.15)]'
                }`}
              >
                {layer.icon}
              </div>

              {/* Content */}
              <h3 className="text-[#E5E5E5] mb-1">{layer.title}</h3>
              <p
                className={`text-sm font-medium mb-4 ${
                  index === 0
                    ? 'text-[#E5E5E5]'
                    : index === 1
                      ? 'text-[#00A3FF]'
                      : 'text-[#D4AF37]'
                }`}
              >
                {layer.subtitle}
              </p>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">{layer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Shield, FileCheck, Network, Link2, Database, Code } from 'lucide-react'

const standards = [
  {
    name: 'W3C DID',
    description: 'Decentralized Identifiers for products and participants',
    icon: Shield,
  },
  {
    name: 'W3C Verifiable Credentials',
    description: 'Privacy-preserving claim issuance and verification',
    icon: FileCheck,
  },
  {
    name: 'ERC-3643',
    description: 'Security token standard with built-in compliance',
    icon: Network,
  },
  {
    name: 'GS1 Digital Link',
    description: 'URI resolution from physical identifiers to digital data',
    icon: Link2,
  },
  {
    name: 'EPCIS 2.0',
    description: 'Event vocabulary for supply chain visibility',
    icon: Database,
  },
  {
    name: 'JSON-LD',
    description: 'Linked data for semantic interoperability',
    icon: Code,
  },
]

export function Standards() {
  return (
    <section className="section bg-[#050505]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Standards Foundation</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Built on proven, open standards. No proprietary dependencies.
          </p>
        </div>

        {/* Standards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((standard) => {
            const Icon = standard.icon
            return (
              <div
                key={standard.name}
                className="glass-card p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,163,255,0.1)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#00A3FF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#E5E5E5] text-base font-sans font-medium">
                      {standard.name}
                    </h4>
                    <span className="spec-badge spec-badge-standard">Standard</span>
                  </div>
                  <p className="text-[#A3A3A3] text-sm">{standard.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { Shield, Clock, FileText } from 'lucide-react'

const regulations = [
  {
    name: 'GDPR',
    status: 'compliant',
    description: 'Right-to-erasure via CRAB model — hash remains, personal data erasable',
    deadline: 'In Effect',
    icon: Shield,
    color: 'green',
  },
  {
    name: 'MiCA',
    status: 'ready',
    description: 'CASP requirements and Travel Rule compliance built into token layer',
    deadline: 'June 2026',
    icon: Clock,
    color: 'gold',
  },
  {
    name: 'ESPR',
    status: 'ready',
    description: 'Digital Product Passport schema with mandatory fields pre-built',
    deadline: '2027',
    icon: FileText,
    color: 'blue',
  },
]

export function Regulatory() {
  return (
    <section className="section bg-[#0a0a0a]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Regulatory Ready</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Designed from day one for European regulatory compliance.
          </p>
        </div>

        {/* Regulations Timeline */}
        <div className="max-w-3xl mx-auto space-y-6">
          {regulations.map((reg) => {
            const Icon = reg.icon
            const bgColor =
              reg.color === 'green'
                ? 'bg-[rgba(16,185,129,0.1)]'
                : reg.color === 'gold'
                  ? 'bg-[rgba(212,175,55,0.1)]'
                  : 'bg-[rgba(0,163,255,0.1)]'
            const textColor =
              reg.color === 'green'
                ? 'text-[#10B981]'
                : reg.color === 'gold'
                  ? 'text-[#D4AF37]'
                  : 'text-[#00A3FF]'
            const borderColor =
              reg.color === 'green'
                ? 'border-[rgba(16,185,129,0.3)]'
                : reg.color === 'gold'
                  ? 'border-[rgba(212,175,55,0.3)]'
                  : 'border-[rgba(0,163,255,0.3)]'

            return (
              <div
                key={reg.name}
                className={`glass-card p-6 border ${borderColor} flex items-start gap-4`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[#E5E5E5] text-lg font-sans font-medium">
                      {reg.name}
                    </h4>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {reg.deadline}
                    </span>
                  </div>
                  <p className="text-[#A3A3A3] text-sm">{reg.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA for compliance guides */}
        <div className="text-center mt-12">
          <a href="/docs/compliance" className="btn-secondary">
            View Compliance Guides
          </a>
        </div>
      </div>
    </section>
  )
}

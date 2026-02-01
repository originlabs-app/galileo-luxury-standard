import { CodeBlock } from '@/components/ui/CodeBlock';
import { BentoCard } from '@/components/ui/BentoCard';
import { Shield, Fingerprint, Scale } from 'lucide-react';

const jsonLdExample = `{
  "@context": ["https://w3.org/ns/credentials/v2", "https://galileo.luxury/v1"],
  "type": ["VerifiableCredential", "DigitalProductPassport"],
  "issuer": "did:galileo:brand:lvmh:louisvuitton",
  "credentialSubject": {
    "gtin": "00614141123452",
    "productName": "Capucines MM",
    "materials": [{"type": "Leather", "origin": "France", "certified": true}],
    "carbonFootprint": {"value": 12.5, "unit": "kgCO2e"}
  }
}`;

const solidityExample = `interface IGalileoToken {
    function registerProduct(
        bytes32 productId,
        address owner,
        bytes32 dppHash
    ) external returns (uint256 tokenId);

    function transferWithCompliance(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata complianceProof
    ) external;
}`;

export async function Features() {
  return (
    <section className="py-24">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--platinum)] mb-4">
            Built on Open Standards
          </h2>
          <p className="text-lg text-[var(--platinum-dim)]">
            Production-ready schemas and interfaces, not theoretical concepts.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: Large code block (2/3) + Small stat (1/3) */}
          <BentoCard size="large" variant="blue" className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--precision-blue)]/10 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-[var(--precision-blue)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--platinum)]">Digital Product Passport</h3>
                  <p className="text-sm text-[var(--platinum-dim)]">JSON-LD + W3C Verifiable Credentials</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden bg-[var(--obsidian)] border border-[var(--platinum)]/5">
                <CodeBlock code={jsonLdExample} lang="json" filename="dpp-credential.jsonld" />
              </div>
            </div>
          </BentoCard>

          <BentoCard size="small" className="md:col-span-1">
            <div className="h-full flex flex-col justify-between min-h-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[var(--antique-gold)]/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-[var(--antique-gold)]" />
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--platinum)] mb-2">38</div>
                <div className="text-sm text-[var(--platinum-dim)]">Requirements shipped in v1.0.0</div>
              </div>
            </div>
          </BentoCard>

          {/* Row 2: Small icon card (1/3) + Large code block (2/3) */}
          <BentoCard size="small" className="md:col-span-1">
            <div className="h-full flex flex-col justify-between min-h-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[var(--precision-blue)]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--precision-blue)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--platinum)] mb-1">Compliance-First</h3>
                <p className="text-sm text-[var(--platinum-dim)]">GDPR, MiCA, and ESPR ready from day one</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard size="large" className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--antique-gold)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--antique-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--platinum)]">ERC-3643 Token Interface</h3>
                  <p className="text-sm text-[var(--platinum-dim)]">Compliant security token standard</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden bg-[var(--obsidian)] border border-[var(--platinum)]/5">
                <CodeBlock code={solidityExample} lang="solidity" filename="IGalileoToken.sol" />
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <BentoCard size="small" className="text-center py-8">
            <div className="text-3xl font-bold text-[var(--antique-gold)] mb-1">14-digit</div>
            <div className="text-sm text-[var(--platinum-dim)]">GTIN Product ID</div>
          </BentoCard>
          <BentoCard size="small" className="text-center py-8">
            <div className="text-3xl font-bold text-[var(--antique-gold)] mb-1">5 Modules</div>
            <div className="text-sm text-[var(--platinum-dim)]">Compliance Stack</div>
          </BentoCard>
          <BentoCard size="small" className="text-center py-8">
            <div className="text-3xl font-bold text-[var(--antique-gold)] mb-1">1:1</div>
            <div className="text-sm text-[var(--platinum-dim)]">Token Ratio</div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

import { CodeBlock } from '@/components/ui/CodeBlock';

const jsonLdExample = `{
  "@context": "https://vocab.galileo.luxury/contexts/galileo.jsonld",
  "@type": "IndividualProduct",
  "@id": "did:galileo:01:3614270012345:21:ABC123",
  "name": "Hermes Birkin 25",
  "brand": {
    "@type": "Brand",
    "name": "Hermes",
    "@id": "did:galileo:brand:hermes"
  },
  "carbonFootprint": {
    "value": 12.5,
    "unitCode": "KGM"
  }
}`;

const solidityExample = `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import {IToken} from "@erc3643org/erc-3643/contracts/token/IToken.sol";

/// @title Galileo Single-Supply Pattern
/// @notice Each luxury product = 1 token deployment
interface IGalileoToken is IToken {
    function productDID() external view returns (string memory);
    function metadataURI() external view returns (string memory);
}`;

export async function Features() {
  return (
    <section className="section bg-[#0a0a0a]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#E5E5E5] mb-4">Built on Real Standards</h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            JSON-LD for interoperability. ERC-3643 for compliance. No proprietary lock-in.
          </p>
        </div>

        {/* Code Examples Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* JSON-LD Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="spec-badge spec-badge-standard">W3C JSON-LD</span>
              <span className="spec-badge spec-badge-draft">ESPR 2027</span>
            </div>
            <h3 className="text-[#E5E5E5] text-lg mb-2">Digital Product Passport</h3>
            <p className="text-[#A3A3A3] text-sm mb-4">
              ESPR-compliant schema with semantic interoperability. Every product attribute is
              machine-readable and verifiable.
            </p>
            <CodeBlock code={jsonLdExample} lang="json" filename="dpp.jsonld" />
          </div>

          {/* Solidity Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="spec-badge spec-badge-active">ERC-3643</span>
              <span className="spec-badge spec-badge-standard">EIP Final</span>
            </div>
            <h3 className="text-[#E5E5E5] text-lg mb-2">Compliant Token Interface</h3>
            <p className="text-[#A3A3A3] text-sm mb-4">
              Single-supply pattern for luxury product ownership. Built-in identity verification and
              compliance modules.
            </p>
            <CodeBlock code={solidityExample} lang="solidity" filename="IGalileoToken.sol" />
          </div>
        </div>

        {/* Key Features below code */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="text-[#D4AF37] text-3xl font-serif mb-2">14-digit</div>
            <div className="text-[#A3A3A3] text-sm">GTIN Product Identifier</div>
          </div>
          <div className="text-center">
            <div className="text-[#D4AF37] text-3xl font-serif mb-2">5 Modules</div>
            <div className="text-[#A3A3A3] text-sm">Compliance Enforcement</div>
          </div>
          <div className="text-center">
            <div className="text-[#D4AF37] text-3xl font-serif mb-2">1:1</div>
            <div className="text-[#A3A3A3] text-sm">Token-to-Product Ratio</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const metadata = {
  title: "Governance Charter",
  description:
    "Full governance charter for the Galileo Protocol. Defines the TSC structure, anti-dominance rules, decision-making processes, and amendment procedures.",
};

export default function GovernanceCharterPage() {
  return (
    <>
      <h1>Governance Charter</h1>

      <p className="text-xl text-[var(--platinum)] leading-relaxed">
        This charter defines the governance structure, decision-making
        processes, and amendment procedures for the Galileo Luxury Standard. It
        establishes a neutral framework enabling competing luxury brands to
        collaborate on shared infrastructure.
      </p>

      <h2>1. Mission Statement</h2>
      <p>
        The Galileo project exists to create and maintain an open, interoperable
        standard for luxury product authentication. Our mission is to protect
        heritage and craftsmanship through blockchain-based product identity
        while ensuring no single organization can dominate the standard&apos;s
        direction.
      </p>
      <p>
        We are committed to building technology that serves the entire luxury
        ecosystem: brands, technology providers, regulators, and consumers
        alike.
      </p>

      <h2>2. Organizational Structure</h2>

      <h3>2.1 Technical Steering Committee (TSC)</h3>
      <p>
        The TSC is the primary governing body with final authority over
        specification changes, RFC approvals, and technical direction. It is
        composed of 11 voting members across three categories:
      </p>
      <ul>
        <li>
          <strong>6 Elected Members</strong> — Chosen by active contributors
          through annual elections. Any contributor with at least 3 merged RFCs
          is eligible to stand.
        </li>
        <li>
          <strong>3 Appointed Industry Experts</strong> — Selected by the TSC to
          represent domain expertise in luxury, supply chain, and regulatory
          affairs.
        </li>
        <li>
          <strong>2 Founding Partners</strong> — Permanent seats held by the
          project&apos;s founding organizations, subject to the anti-dominance
          rules below.
        </li>
      </ul>

      <h3>2.2 Anti-Dominance Rules</h3>
      <p>To ensure neutrality, the following constraints apply:</p>
      <ul>
        <li>
          No single organization may hold more than 2 TSC seats at any time.
        </li>
        <li>
          The TSC Chair and Vice-Chair must represent different organizations.
        </li>
        <li>
          Founding partner seats carry the same voting weight as elected seats —
          no special veto power.
        </li>
        <li>
          Any member with a conflict of interest on a specific vote must recuse
          themselves.
        </li>
      </ul>

      <h3>2.3 Membership Tiers</h3>
      <p>Participation in Galileo follows a progressive recognition model:</p>
      <ul>
        <li>
          <strong>Observer</strong> — Read-only access to specifications and
          public discussions. Open to anyone.
        </li>
        <li>
          <strong>Contributor</strong> — May submit RFCs and participate in
          reviews. Requires signing the Contributor License Agreement (CLA).
        </li>
        <li>
          <strong>Maintainer</strong> — May merge pull requests and manage
          specification repositories. Nominated by existing maintainers,
          approved by TSC.
        </li>
        <li>
          <strong>TSC Member</strong> — Voting rights on specification changes
          and governance decisions. Elected or appointed as described above.
        </li>
      </ul>

      <h2>3. Decision-Making Process</h2>

      <h3>3.1 Standard Decisions</h3>
      <p>
        Day-to-day technical decisions follow a lazy consensus model: proposals
        are accepted unless a maintainer or TSC member raises an objection
        within 7 days.
      </p>

      <h3>3.2 RFC Decisions</h3>
      <p>
        Specification changes require the formal{" "}
        <a href="/docs/rfc-process">RFC process</a>:
      </p>
      <ul>
        <li>14-day public review period</li>
        <li>TSC vote requiring simple majority (6 of 11)</li>
        <li>Breaking changes require supermajority (8 of 11)</li>
      </ul>

      <h3>3.3 Governance Decisions</h3>
      <p>
        Changes to this charter, membership rules, or organizational structure
        require:
      </p>
      <ul>
        <li>30-day public comment period</li>
        <li>TSC supermajority vote (8 of 11)</li>
        <li>Ratification by at least 3 contributing organizations</li>
      </ul>

      <h3>3.4 Transparency</h3>
      <p>
        While TSC deliberations are confidential to enable candid debate between
        competing organizations, all outcomes are public:
      </p>
      <ul>
        <li>Decisions are published within 7 days of the vote.</li>
        <li>Meeting minute summaries are published within 14 days.</li>
        <li>
          All RFCs and specification changes are fully public at all times.
        </li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        All Galileo specifications are released under the{" "}
        <a href="/docs/license">Apache License 2.0</a>. Contributors grant a
        perpetual, irrevocable license to their contributions through the CLA.
        Patent claims related to the standard are licensed royalty-free to all
        implementors.
      </p>

      <h2>5. Amendment Procedures</h2>
      <p>
        This charter may be amended through the governance decision process
        described in section 3.3. Amendments take effect 30 days after
        ratification to allow the community to prepare for changes.
      </p>
      <p>
        Emergency amendments (e.g., to address legal requirements) may be
        fast-tracked with unanimous TSC approval and a 7-day comment period.
      </p>

      <h2>6. Versioning Commitment</h2>
      <p>
        Galileo follows <a href="/docs/versioning">semantic versioning</a> with
        a 10-year backward compatibility guarantee for major versions. This
        ensures that implementations built on the standard remain functional for
        a decade, reflecting the long lifecycle of luxury products.
      </p>

      <h2>Related Documents</h2>
      <ul>
        <li>
          <a href="/docs/contributing">Contributing Guide</a>
        </li>
        <li>
          <a href="/docs/rfc-process">RFC Process</a>
        </li>
        <li>
          <a href="/docs/code-of-conduct">Code of Conduct</a>
        </li>
        <li>
          <a href="/docs/license">License</a>
        </li>
        <li>
          <a href="/governance/tsc">Technical Steering Committee</a>
        </li>
      </ul>
    </>
  );
}

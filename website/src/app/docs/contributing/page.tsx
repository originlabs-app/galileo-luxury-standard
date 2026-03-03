export const metadata = {
  title: "Contributing | Galileo Documentation",
  description: "How to contribute to the Galileo Luxury Standard.",
};

export default function ContributingPage() {
  return (
    <>
      <h1>Contributing to Galileo</h1>

      <p className="text-xl text-[var(--platinum)] leading-relaxed">
        Galileo is an open standard and welcomes contributions from anyone
        committed to improving luxury product authentication. This guide
        explains how to get involved.
      </p>

      <h2>Getting Started</h2>
      <p>Before contributing, please:</p>
      <ul>
        <li>
          Read the <a href="/docs">Introduction</a> to understand the
          standard&apos;s scope.
        </li>
        <li>
          Review the <a href="/docs/code-of-conduct">Code of Conduct</a> — all
          participants must follow it.
        </li>
        <li>
          Sign the Contributor License Agreement (CLA). This grants the project
          a perpetual license to your contributions while you retain copyright.
        </li>
      </ul>

      <h2>Types of Contributions</h2>

      <h3>Bug Reports & Corrections</h3>
      <p>Found an error in the specification? Open an issue on GitHub with:</p>
      <ul>
        <li>The specification section and version affected</li>
        <li>A clear description of the error</li>
        <li>Suggested correction if you have one</li>
      </ul>

      <h3>Specification Changes (RFCs)</h3>
      <p>
        All changes to the Galileo specification go through the formal{" "}
        <a href="/docs/rfc-process">RFC process</a>. This includes:
      </p>
      <ul>
        <li>New specification sections</li>
        <li>Modifications to existing specifications</li>
        <li>Deprecation of existing features</li>
      </ul>

      <h3>Documentation Improvements</h3>
      <p>
        Documentation fixes and clarifications can be submitted as pull requests
        without a full RFC. These are reviewed by maintainers and merged on
        approval.
      </p>

      <h3>Reference Implementations</h3>
      <p>
        Building a reference implementation of a Galileo specification? We
        welcome these contributions. Please coordinate with the maintainers to
        ensure alignment with the standard.
      </p>

      <h2>Code Style & Conventions</h2>

      <h3>Specification Documents</h3>
      <ul>
        <li>
          Use clear, unambiguous language following RFC 2119 keywords (MUST,
          SHOULD, MAY).
        </li>
        <li>Include JSON-LD examples for all data structures.</li>
        <li>Reference W3C, GS1, and ERC standards where applicable.</li>
        <li>
          Every specification must include a &quot;Conformance&quot; section
          defining compliance criteria.
        </li>
      </ul>

      <h3>Reference Code</h3>
      <ul>
        <li>
          Solidity: Follow the Solidity Style Guide and target Solidity 0.8.x.
        </li>
        <li>TypeScript: Use strict mode with ESLint and Prettier.</li>
        <li>Include comprehensive test suites for all implementations.</li>
      </ul>

      <h2>Submitting a Pull Request</h2>
      <ol>
        <li>
          <strong>Fork the repository</strong> and create a feature branch from{" "}
          <code>main</code>.
        </li>
        <li>
          <strong>Make your changes</strong> following the conventions above.
        </li>
        <li>
          <strong>Write or update tests</strong> to cover your changes.
        </li>
        <li>
          <strong>Submit the PR</strong> with a clear description of what
          changed and why.
        </li>
        <li>
          <strong>Respond to review feedback</strong> — maintainers may request
          changes.
        </li>
      </ol>

      <h2>Code Review Expectations</h2>
      <p>
        All contributions are reviewed by at least one maintainer. For
        specification changes, expect a thorough review process:
      </p>
      <ul>
        <li>
          Reviews typically take 3-7 business days for documentation fixes.
        </li>
        <li>RFCs follow the formal 14-day review period plus TSC vote.</li>
        <li>
          Reviewers focus on correctness, completeness, and consistency with
          existing specs.
        </li>
        <li>
          Be patient — reviewers are volunteers from across the luxury and
          technology industries.
        </li>
      </ul>

      <h2>Recognition</h2>
      <p>
        Contributors are recognized through the project&apos;s membership tiers:
      </p>
      <ul>
        <li>
          <strong>Contributor</strong> — Earned after your first merged
          contribution.
        </li>
        <li>
          <strong>Maintainer</strong> — Nominated after sustained, high-quality
          contributions.
        </li>
        <li>
          <strong>TSC Member</strong> — Eligible for election after 3 merged
          RFCs.
        </li>
      </ul>
      <p>
        See the <a href="/docs/governance/charter">Governance Charter</a> for
        full details on membership tiers and the path to TSC membership.
      </p>

      <h2>Questions?</h2>
      <p>
        If you&apos;re unsure about anything, open a discussion on GitHub or
        reach out to the maintainers. We&apos;re happy to help guide your
        contribution.
      </p>
    </>
  );
}

export const metadata = {
  title: "Versioning | Galileo Documentation",
  description: "Semantic versioning policy for the Galileo Luxury Standard.",
};

export default function VersioningPage() {
  return (
    <>
      <h1>Versioning Policy</h1>

      <p className="text-xl text-[var(--platinum)] leading-relaxed">
        Galileo follows Semantic Versioning (SemVer) to communicate the nature
        of changes clearly and protect implementors from unexpected breaking
        changes.
      </p>

      <h2>Version Format</h2>
      <p>Every Galileo specification release uses the format:</p>
      <pre>
        <code>MAJOR.MINOR.PATCH</code>
      </pre>
      <ul>
        <li>
          <strong>MAJOR</strong> — Incremented for incompatible changes that may
          require implementors to update their systems. Examples: removing a
          required field, changing a data structure&apos;s schema, altering
          on-chain contract interfaces.
        </li>
        <li>
          <strong>MINOR</strong> — Incremented for backward-compatible
          additions. Examples: new optional fields in a DPP schema, new
          compliance modules, additional lifecycle event types.
        </li>
        <li>
          <strong>PATCH</strong> — Incremented for backward-compatible bug fixes
          and clarifications. Examples: correcting a typo in a specification,
          clarifying ambiguous language, fixing a JSON-LD context error.
        </li>
      </ul>

      <h2>Current Version</h2>
      <p>
        The current release of the Galileo specification is{" "}
        <strong>v1.0.0</strong>, comprising 38 specifications across identity,
        token, data, infrastructure, and compliance domains.
      </p>

      <h2>Breaking Change Policy</h2>
      <p>
        Breaking changes are taken seriously because they affect every
        implementor in the ecosystem. Before a breaking change is accepted:
      </p>
      <ul>
        <li>
          An RFC must clearly justify why the change cannot be made in a
          backward-compatible way.
        </li>
        <li>
          The RFC must include a migration guide for existing implementations.
        </li>
        <li>The TSC must approve by supermajority vote (8 of 11 members).</li>
        <li>
          A deprecation period must be observed before the breaking change takes
          effect (see below).
        </li>
      </ul>

      <h2>Deprecation Timeline</h2>
      <p>
        Galileo is designed for the luxury industry, where products have
        lifecycles measured in decades. To match this reality:
      </p>
      <ul>
        <li>
          <strong>10-Year Backward Compatibility</strong> — Major versions are
          supported for a minimum of 10 years from their release date. This
          means implementations built on Galileo v1.0.0 will continue to
          function until at least 2035.
        </li>
        <li>
          <strong>Deprecation Notice</strong> — Features slated for removal in
          the next major version are marked as deprecated at least 2 years
          before the major version release.
        </li>
        <li>
          <strong>Migration Support</strong> — The project provides migration
          guides and, where feasible, automated tooling for transitioning
          between major versions.
        </li>
      </ul>

      <h2>Release Cadence</h2>
      <ul>
        <li>
          <strong>Patch releases</strong> — As needed, typically monthly, for
          bug fixes and clarifications.
        </li>
        <li>
          <strong>Minor releases</strong> — Quarterly, bundling new features and
          backward-compatible additions.
        </li>
        <li>
          <strong>Major releases</strong> — No fixed schedule. Driven by the
          needs of the ecosystem, with extensive community input and the 10-year
          support commitment.
        </li>
      </ul>

      <h2>Pre-Release Versions</h2>
      <p>Specifications in development use pre-release identifiers:</p>
      <pre>
        <code>2.0.0-draft.1, 2.0.0-rc.1</code>
      </pre>
      <ul>
        <li>
          <strong>draft</strong> — Early proposal, subject to significant
          changes. Not suitable for production use.
        </li>
        <li>
          <strong>rc (Release Candidate)</strong> — Feature-complete and
          undergoing final review. Suitable for early adopter testing.
        </li>
      </ul>

      <h2>Version Resolution</h2>
      <p>
        When resolving a Galileo DID or DPP, the version of the specification
        used is embedded in the data:
      </p>
      <pre>
        <code>{`{
  "@context": "https://vocab.galileoprotocol.io/contexts/galileo-v1.jsonld",
  "specVersion": "1.0.0",
  ...
}`}</code>
      </pre>
      <p>
        Resolvers must support all non-deprecated specification versions to
        ensure backward compatibility across the ecosystem.
      </p>

      <h2>Related Documents</h2>
      <ul>
        <li>
          <a href="/docs/governance/charter">Governance Charter</a> — 10-year
          commitment details
        </li>
        <li>
          <a href="/docs/rfc-process">RFC Process</a> — How changes are proposed
          and approved
        </li>
      </ul>
    </>
  );
}

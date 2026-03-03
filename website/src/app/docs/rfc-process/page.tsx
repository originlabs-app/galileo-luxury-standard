export const metadata = {
  title: "RFC Process | Galileo Documentation",
  description:
    "How to propose specification changes to the Galileo Luxury Standard.",
};

export default function RFCProcessPage() {
  return (
    <>
      <h1>RFC Process</h1>

      <p className="text-xl text-[var(--platinum)] leading-relaxed">
        All changes to the Galileo specification go through the Request for
        Comments (RFC) process. This ensures that every modification is
        thoroughly reviewed, debated, and approved by the community and the
        Technical Steering Committee.
      </p>

      <h2>When Do You Need an RFC?</h2>
      <p>An RFC is required for:</p>
      <ul>
        <li>Adding a new specification or specification section</li>
        <li>
          Modifying the behavior or structure of an existing specification
        </li>
        <li>Deprecating or removing a feature</li>
        <li>Changes that affect interoperability between implementations</li>
      </ul>
      <p>
        An RFC is <strong>not</strong> required for:
      </p>
      <ul>
        <li>Fixing typos or clarifying existing language</li>
        <li>
          Documentation improvements that don&apos;t change the specification
        </li>
        <li>Tooling and reference implementation changes</li>
      </ul>

      <h2>RFC Stages</h2>

      <h3>Stage 1: Draft</h3>
      <p>
        The author submits an RFC as a pull request to the specifications
        repository. The RFC must follow the template (see below) and clearly
        describe the proposed change, its motivation, and its impact.
      </p>
      <ul>
        <li>
          A maintainer triages the RFC and assigns it a number (e.g., RFC-0042).
        </li>
        <li>
          The RFC enters the &quot;Draft&quot; stage and is open for informal
          feedback.
        </li>
        <li>The author may revise the RFC based on early feedback.</li>
      </ul>

      <h3>Stage 2: Review</h3>
      <p>
        When the author and a sponsoring maintainer agree the RFC is ready, it
        enters formal review:
      </p>
      <ul>
        <li>
          A <strong>14-day public review period</strong> begins. All community
          members may comment.
        </li>
        <li>
          The review period is announced on the mailing list and project
          discussion channels.
        </li>
        <li>
          The author must respond to all substantive feedback during the review
          period.
        </li>
        <li>
          The review period may be extended by 7 days if significant new issues
          arise in the final 3 days.
        </li>
      </ul>

      <h3>Stage 3: Vote</h3>
      <p>After the review period closes, the TSC votes on the RFC:</p>
      <ul>
        <li>
          <strong>Standard changes</strong> require a simple majority (6 of 11
          TSC members).
        </li>
        <li>
          <strong>Breaking changes</strong> require a supermajority (8 of 11 TSC
          members).
        </li>
        <li>
          TSC members with a conflict of interest must recuse themselves. The
          threshold is adjusted proportionally.
        </li>
        <li>
          The vote is conducted asynchronously over 7 days. Members who do not
          vote are counted as abstentions.
        </li>
      </ul>

      <h3>Stage 4: Accept or Reject</h3>
      <ul>
        <li>
          <strong>Accepted</strong> — The RFC is merged into the specification.
          The change is included in the next appropriate release per the{" "}
          <a href="/docs/versioning">versioning policy</a>.
        </li>
        <li>
          <strong>Rejected</strong> — The RFC is closed with a written
          explanation. The author may revise and resubmit after addressing the
          TSC&apos;s concerns.
        </li>
        <li>
          <strong>Deferred</strong> — The TSC may defer an RFC if the timing is
          not right. Deferred RFCs remain open and can be reactivated.
        </li>
      </ul>

      <h2>RFC Template</h2>
      <p>Every RFC must include the following sections:</p>
      <pre>
        <code>{`# RFC-XXXX: [Title]

## Summary
One-paragraph explanation of the proposed change.

## Motivation
Why is this change needed? What problem does it solve?

## Specification
Detailed technical specification of the change.

## Backward Compatibility
How does this change affect existing implementations?
Is it a breaking change? If so, what is the migration path?

## Security Considerations
What security implications does this change have?

## References
Links to related specifications, standards, and discussions.`}</code>
      </pre>

      <h2>Timeline Summary</h2>
      <ul>
        <li>
          <strong>Draft</strong> — No fixed duration. Author iterates until
          ready.
        </li>
        <li>
          <strong>Review</strong> — 14 days minimum (extendable to 21 days).
        </li>
        <li>
          <strong>Vote</strong> — 7 days.
        </li>
        <li>
          <strong>Total minimum</strong> — 21 days from entering review to
          decision.
        </li>
      </ul>

      <h2>Emergency Process</h2>
      <p>
        For critical security vulnerabilities or urgent regulatory compliance
        issues, the TSC may invoke an expedited process:
      </p>
      <ul>
        <li>3-day review period instead of 14 days</li>
        <li>Requires unanimous TSC approval (all non-recused members)</li>
        <li>Must be followed by a retroactive full review within 30 days</li>
      </ul>

      <h2>Related Documents</h2>
      <ul>
        <li>
          <a href="/docs/governance/charter">Governance Charter</a> — TSC
          structure and voting rules
        </li>
        <li>
          <a href="/docs/contributing">Contributing Guide</a> — How to get
          started
        </li>
        <li>
          <a href="/docs/versioning">Versioning Policy</a> — How accepted RFCs
          are released
        </li>
      </ul>
    </>
  );
}

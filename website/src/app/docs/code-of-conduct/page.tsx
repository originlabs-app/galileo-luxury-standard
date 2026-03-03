export const metadata = {
  title: "Code of Conduct",
  description:
    "Community standards and expected behavior for Galileo Protocol participants. Based on the Contributor Covenant, adapted for luxury industry collaboration.",
};

export default function CodeOfConductPage() {
  return (
    <>
      <h1>Code of Conduct</h1>

      <p className="text-xl text-[var(--platinum)] leading-relaxed">
        The Galileo project is committed to providing a welcoming, inclusive,
        and professional environment for all participants. This Code of Conduct
        applies to all project spaces, including GitHub repositories, mailing
        lists, meetings, and events.
      </p>

      <h2>Our Pledge</h2>
      <p>
        We as members, contributors, and leaders pledge to make participation in
        the Galileo community a harassment-free experience for everyone,
        regardless of age, body size, visible or invisible disability,
        ethnicity, sex characteristics, gender identity and expression, level of
        experience, education, socio-economic status, nationality, personal
        appearance, race, caste, color, religion, or sexual identity and
        orientation.
      </p>
      <p>
        We pledge to act and interact in ways that contribute to an open,
        welcoming, diverse, inclusive, and healthy community.
      </p>

      <h2>Expected Behavior</h2>
      <ul>
        <li>
          <strong>Be respectful</strong> — Treat all participants with dignity.
          The luxury industry brings together diverse stakeholders with
          different perspectives.
        </li>
        <li>
          <strong>Be constructive</strong> — Provide feedback that is specific,
          actionable, and kind. Focus on improving the standard, not criticizing
          individuals.
        </li>
        <li>
          <strong>Be collaborative</strong> — Work together toward shared goals.
          Remember that competing brands are cooperating here for the common
          good.
        </li>
        <li>
          <strong>Be professional</strong> — This is a standards body. Maintain
          the level of discourse expected in professional settings.
        </li>
        <li>
          <strong>Accept responsibility</strong> — If you make a mistake,
          acknowledge it and learn from it. Everyone makes mistakes in complex
          technical work.
        </li>
      </ul>

      <h2>Unacceptable Behavior</h2>
      <p>The following behaviors are not tolerated:</p>
      <ul>
        <li>Harassment, intimidation, or discrimination in any form.</li>
        <li>Personal attacks, insults, or derogatory comments.</li>
        <li>
          Publishing others&apos; private information (including confidential
          business information shared during TSC deliberations) without explicit
          permission.
        </li>
        <li>
          Using the project&apos;s communication channels for commercial
          solicitation or competitive intelligence gathering.
        </li>
        <li>
          Sustained disruption of discussions, meetings, or other project
          activities.
        </li>
        <li>
          Any conduct that would be considered inappropriate in a professional
          setting.
        </li>
      </ul>

      <h2>Scope</h2>
      <p>
        This Code of Conduct applies in all project spaces and when an
        individual is representing the project or its community in public
        spaces. Examples include:
      </p>
      <ul>
        <li>GitHub repositories, issues, pull requests, and discussions</li>
        <li>Project mailing lists and chat channels</li>
        <li>TSC meetings and working group sessions</li>
        <li>Conferences and events where you represent Galileo</li>
        <li>Social media when speaking on behalf of the project</li>
      </ul>

      <h2>Reporting</h2>
      <p>
        If you experience or witness unacceptable behavior, please report it by
        emailing <code>conduct@galileoprotocol.io</code>. All reports will be
        reviewed and investigated promptly and fairly.
      </p>
      <p>
        Reports are handled confidentially. The review team will not disclose
        the identity of the reporter without their explicit consent.
      </p>

      <h2>Enforcement</h2>
      <p>
        The TSC is responsible for enforcing this Code of Conduct. Consequences
        for violations follow a graduated response:
      </p>
      <ul>
        <li>
          <strong>Warning</strong> — A private written warning clarifying the
          nature of the violation and why the behavior was inappropriate.
        </li>
        <li>
          <strong>Temporary Suspension</strong> — Temporary removal from project
          spaces for a specified period. Repeat violations or serious first
          offenses may warrant this.
        </li>
        <li>
          <strong>Permanent Ban</strong> — Permanent removal from all project
          spaces. Reserved for severe or repeated violations after prior
          warnings.
        </li>
      </ul>

      <h2>Confidentiality Clause</h2>
      <p>
        Given the unique nature of Galileo as a collaboration between competing
        luxury houses, participants must respect the confidentiality of TSC
        deliberations. While all decisions and outcomes are public, the internal
        discussions that lead to those decisions are protected. Leaking
        deliberation content is a serious violation of this Code of Conduct.
      </p>

      <h2>Attribution</h2>
      <p>
        This Code of Conduct is adapted from the{" "}
        <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct/">
          Contributor Covenant, version 2.1
        </a>
        , with additions specific to the Galileo project&apos;s context as a
        luxury industry standards body.
      </p>

      <h2>Related Documents</h2>
      <ul>
        <li>
          <a href="/docs/governance/charter">Governance Charter</a>
        </li>
        <li>
          <a href="/docs/contributing">Contributing Guide</a>
        </li>
      </ul>
    </>
  );
}

# Phase 1: Governance Foundation - Research

**Researched:** 2026-01-30
**Domain:** Open source foundation governance, specification standards, industrial consortia
**Confidence:** HIGH

## Summary

This research investigates best practices for establishing neutral, independent governance for an industrial specification standard in the luxury goods sector. The focus areas are: governance charter structure (based on Linux Foundation/Hyperledger/CNCF models), RFC process design (based on Rust/Apache patterns), Apache 2.0 licensing for specifications, and semantic versioning for long-lived standards.

The research reveals that successful foundation governance requires: (1) clear separation between strategic (Governing Board) and technical (TSC) decision-making, (2) meritocratic contributor advancement with transparent criteria, (3) explicit veto mechanisms for breaking changes, and (4) robust conflict resolution. The TradeLens failure analysis confirms that single-organization dominance and opaque governance destroy consortium trust.

**Primary recommendation:** Model the charter structure on Hyperledger Foundation (11-member TOC, 2/3 quorum, hybrid election), use the Rust RFC template format (motivation/guide-level/reference-level/alternatives/prior-art), implement Apache 2.0 + DCO for contributions, and adapt SemVer with a 10-year deprecation window for luxury industry timelines.

---

## Standard Stack

For governance documentation, there is no "software stack" per se. Instead, the deliverables are document templates and process definitions.

### Core Documents

| Document | Purpose | Based On |
|----------|---------|----------|
| Governance Charter | Constitutional document defining structure, roles, powers | Hyperledger Foundation Charter |
| RFC Template | Structured proposal format for specification changes | Rust RFC 0000-template.md |
| LICENSE file | Apache 2.0 license text | Apache Software Foundation standard |
| NOTICE file | Copyright notices, attribution | ASF standard |
| DCO (Developer Certificate of Origin) | Contribution certification | Linux Foundation DCO 1.1 |
| VERSIONING.md | Semver policy, deprecation timeline, release schedule | OpenAPI Specification model |
| CODE_OF_CONDUCT.md | Behavioral expectations | Contributor Covenant or LF Code of Conduct |
| CONTRIBUTING.md | How to contribute, RFC process summary | CNCF project template |

### Supporting Documents

| Document | Purpose | When to Create |
|----------|---------|----------------|
| TSC_CHARTER.md | Detailed TSC operating procedures | If charter needs appendix |
| ELECTION_PROCESS.md | Detailed election mechanics | If elections need separate doc |
| MEMBERSHIP_AGREEMENT.md | Legal membership terms | For paid membership tiers |
| TRADEMARK_POLICY.md | Logo and name usage guidelines | When trademark is registered |

### Alternatives Considered

| Standard Choice | Alternative | Tradeoff |
|-----------------|-------------|----------|
| Apache 2.0 | MIT | MIT lacks explicit patent grant; Apache 2.0 provides defensive termination |
| Apache 2.0 | GPL v3 | GPL copyleft incompatible with luxury brands' proprietary implementations |
| DCO | CLA (Contributor License Agreement) | CLA seen as anti-pattern; DCO simpler, less friction |
| Rust-style RFC | IETF-style RFC | IETF format more formal; Rust format more accessible for industry participants |

---

## Architecture Patterns

### Recommended Document Structure

```
governance/
├── CHARTER.md                # Constitutional document
├── LICENSE                   # Apache 2.0 full text
├── NOTICE                    # Copyright notices
├── CODE_OF_CONDUCT.md        # Behavioral standards
├── CONTRIBUTING.md           # How to participate
├── VERSIONING.md             # Semver policy + sunset
├── DCO.md                    # Developer Certificate of Origin
├── rfcs/
│   ├── 0000-template.md      # RFC template
│   ├── 0001-example.md       # First actual RFC
│   └── README.md             # RFC process description
├── membership/
│   ├── MEMBERSHIP_LEVELS.md  # Observer/Member/Founding Partner
│   └── AGREEMENT.md          # Legal membership terms
└── tsc/
    ├── MEMBERS.md            # Current TSC composition
    ├── ELECTIONS.md          # Election procedures
    └── MEETINGS.md           # Meeting cadence, minutes location
```

### Pattern 1: Hyperledger Foundation Charter Structure

**What:** A multi-section charter covering mission, membership, governance bodies, voting, and IP policy.
**When to use:** For any multi-stakeholder foundation requiring formal governance.
**Source:** [Hyperledger Foundation Charter](https://hyperledger.github.io/governance/charter.html)

Charter sections typically include:
1. **Mission** - Purpose and scope of the foundation
2. **Membership Categories** - Tiers, rights, obligations, fees
3. **Governing Board** - Composition, responsibilities, elections
4. **Technical Oversight Committee (TOC/TSC)** - Technical governance body
5. **Voting Procedures** - Quorum (2/3), majorities, electronic voting
6. **Intellectual Property Policy** - Licensing, contributions, trademarks
7. **Antitrust Compliance** - Safe harbor language
8. **Code of Conduct** - Reference to behavioral standards
9. **Amendments** - Process for charter changes (typically 2/3 vote)

### Pattern 2: Rust RFC Template Format

**What:** A structured template with 9 sections covering the full proposal lifecycle.
**When to use:** For any RFC/proposal process requiring consistent, comprehensive documentation.
**Source:** [rust-lang/rfcs 0000-template.md](https://github.com/rust-lang/rfcs/blob/master/0000-template.md)

RFC sections:
1. **Summary** - One-paragraph executive summary
2. **Motivation** - Problem statement, use cases, why this matters
3. **Guide-level explanation** - Explain as if teaching to an adopter
4. **Reference-level explanation** - Technical details, corner cases
5. **Drawbacks** - Why should we NOT do this?
6. **Rationale and alternatives** - Why this approach over others?
7. **Prior art** - What do other standards/systems do?
8. **Unresolved questions** - What needs resolution during RFC review?
9. **Future possibilities** - What extensions might follow?

### Pattern 3: Tiered Membership with Closing Window

**What:** Three-tier membership (Observer/Member/Founding Partner) with a time-limited founding window.
**When to use:** When launching a new foundation and wanting to incentivize early commitment.
**Source:** Linux Foundation projects (PyTorch, CNCF, Confidential Computing Consortium)

Typical structure:
- **Founding Partners/Premier Members** - Highest tier, board seats, time-limited enrollment window
- **General Members** - Voting rights, governance participation, annual fee (scaled by revenue)
- **Observer/Associate Members** - Free access, participation in RFC process, no voting rights

### Anti-Patterns to Avoid

- **Single-organization dominance:** TradeLens failed because Maersk controlled both platform and governance. The charter MUST prevent any single organization from controlling the TSC or board.

- **BDFL (Benevolent Dictator for Life):** "Mostly considered an anti-pattern at this point" (Red Hat). Use elected/meritocratic leadership instead.

- **Self-reinforcing leadership:** When member-selection spawns "self-reinforcing leadership cultures" (opensource.com). Mitigate with term limits, transparent nomination, and diverse representation requirements.

- **CLA (Contributor License Agreement):** Seen as potential anti-pattern due to friction and IP concerns. Use DCO (Developer Certificate of Origin) instead.

- **Opaque decision-making:** TradeLens suffered from "a sense of opacity." Publish all decisions and rationale, even if deliberations are private.

---

## Don't Hand-Roll

Problems that look simple but have established solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| License text | Custom license | Apache 2.0 standard text | Legal certainty, ecosystem compatibility |
| Patent clause | Custom patent language | Apache 2.0 Section 3 | Tested defensive termination mechanism |
| Contribution certification | Custom contributor agreement | DCO 1.1 | Industry standard, minimal friction |
| Code of conduct | Custom behavioral rules | Contributor Covenant 2.1 or LF Code of Conduct | Well-tested, community-accepted |
| RFC numbering | Custom scheme | Sequential integers (0001, 0002...) | Simple, proven (Rust, Python PEP) |
| Version format | Custom versioning | SemVer 2.0.0 | Universal understanding, tooling support |
| Charter structure | From scratch | Adapt Hyperledger/CNCF template | Tested governance patterns |

**Key insight:** Governance documents benefit from familiarity. Industry participants recognize Apache 2.0, DCO, and SemVer. Novel approaches create cognitive overhead and legal uncertainty.

---

## Common Pitfalls

### Pitfall 1: The TradeLens Syndrome

**What goes wrong:** A single organization (Maersk) controlled both the platform AND the governance, leading competitors to distrust the initiative and refuse to participate at scale.

**Why it happens:** Founders want to move fast and retain control during early development. They underestimate how much competitors fear data/advantage leakage.

**How to avoid:**
- Charter must explicitly prevent single-organization control (max TSC seats per org, veto thresholds)
- Neutral trademark ownership (held by foundation, not a company)
- Independent infrastructure (not hosted on one member's cloud)
- Transparent decision logs published publicly

**Warning signs:**
- One organization provides all TSC members
- Meetings held on one company's premises
- Documentation on one company's domain
- "We'll open it up later" justifications

### Pitfall 2: Governance Without Assets

**What goes wrong:** Governance documents exist but critical assets (domain, trademark, repository) remain with one organization.

**Why it happens:** Asset transfer is legally complex and often deferred.

**How to avoid:**
- Transfer trademark and domain to foundation at charter ratification
- Use neutral repository hosting (GitHub org owned by foundation)
- Document asset ownership in charter

**Warning signs:**
- Domain registered to a person/company, not foundation
- GitHub org controlled by individual accounts
- Trademark registered to founding company

### Pitfall 3: Insufficient Deprecation Timeline

**What goes wrong:** Standard adopters face breaking changes before they can migrate, destroying trust and adoption.

**Why it happens:** Software industry norms (12-24 month deprecation) applied to long-lived industry assets.

**How to avoid:**
- 10-year sunset period (as specified in user decisions) appropriate for luxury goods lifecycle
- Multiple deprecation notices (at announcement, -5 years, -2 years, -1 year)
- HTTP Sunset header (RFC 8594) and Deprecation header (RFC 9745) for API endpoints
- Maintain documentation for deprecated versions

**Warning signs:**
- Breaking changes proposed without migration path
- Deprecation notices with <2 year timeline
- Historical documentation deleted

### Pitfall 4: RFC Process Without Clear Ownership

**What goes wrong:** RFCs languish without decision. Authors frustrated, contributors disengaged.

**Why it happens:** No one is responsible for shepherding RFCs through the process.

**How to avoid:**
- Assign TSC member as "champion" for each RFC
- Fixed review periods with explicit deadline (2 weeks/30 days/60 days as specified)
- "Lazy consensus" default: if no objections by deadline, RFC proceeds

**Warning signs:**
- RFCs open for months without resolution
- No single person responsible for moving RFC forward
- Unclear when review period ends

### Pitfall 5: Founding Partner Lock-in

**What goes wrong:** Founding partners have permanent privileges that later members cannot attain, creating two-class system.

**Why it happens:** Need to incentivize early commitment with exclusive benefits.

**How to avoid:**
- Founding Partner window is CLOSED (as specified in user decisions)
- Benefits time-limited (e.g., bonus board seats for first 2-3 years only)
- Path for General Members to reach equivalent status through contribution
- Document sunset of founding privileges in charter

**Warning signs:**
- Permanent board seats for founders
- No merit path to top tier
- Founding privileges never expire

---

## Code Examples

Since this phase produces governance documents rather than code, examples are document excerpts.

### Example 1: TSC Composition Clause (Hyperledger-style)

```markdown
## Technical Steering Committee

### Composition
The TSC shall consist of eleven (11) voting members:
- Six (6) members elected by Active Contributors
- Three (3) members appointed by the Governing Board for expertise and diversity
- Two (2) members from Founding Partner organizations (transitional, expires [date])

### Active Contributor Definition
An Active Contributor is defined as any individual who has had a contribution
(specification text, RFC, tooling, documentation) accepted during the prior
twelve (12) months.

### Term Limits
TSC members serve two (2) year terms, renewable once. After serving two
consecutive terms, a member must wait one (1) year before seeking re-election.

### Quorum and Voting
- Quorum: Two-thirds (2/3) of voting members
- Standard decisions: Majority of members present
- Breaking changes: Unanimous consent of members present, with veto rights
- Electronic votes: Majority of all members (not just those voting)
```

### Example 2: RFC Header (Rust-style)

```markdown
# RFC-0042: Multi-Language Product Description Schema

- **RFC Number:** 0042
- **Title:** Multi-Language Product Description Schema
- **Author:** Marie Dubois (maison-xyz), Jean Martin (atelier-abc)
- **Champion:** [TSC Member Name]
- **Status:** Draft | Under Review | Accepted | Implemented | Rejected | Withdrawn
- **Created:** 2026-03-15
- **Review Deadline:** 2026-04-15 (Minor change: 30-day review)
- **Spec Version Target:** 1.3.0

## Summary

One-paragraph summary of the proposal.

## Motivation

Why is this change needed? What problem does it solve?

...
```

### Example 3: Veto Mechanism Clause

```markdown
## Breaking Change Veto

### Definition
A "breaking change" is any modification to the specification that would cause
a previously-conformant implementation to become non-conformant, or that
removes or modifies semantics of existing features.

### Veto Rights
Any TSC member may exercise a veto on breaking changes. A veto must:
1. Be declared in writing within the RFC review period
2. Include a specific technical justification
3. Propose an alternative approach or conditions for lifting the veto

### Veto Resolution
A veto may be overridden by:
- Unanimous consent of other TSC members, OR
- Two-thirds (2/3) vote of the full Governing Board

Vetoed RFCs enter a 90-day resolution period for negotiation.
```

### Example 4: Apache 2.0 + DCO Contribution Clause

```markdown
## Intellectual Property

### License
All specification text, schemas, and documentation are licensed under the
Apache License, Version 2.0. A copy is provided in the LICENSE file.

### Contributions
All contributions must be submitted with a Developer Certificate of Origin
(DCO) sign-off. By signing off, the contributor certifies that they have
the right to submit the contribution and agree to the Apache 2.0 license.

To sign off, add the following to commit messages:
    Signed-off-by: Your Name <your.email@example.com>

### Patent Grant
Per Apache 2.0 Section 3, contributors grant a perpetual, worldwide,
non-exclusive, royalty-free patent license for their contributions.
This grant terminates automatically for any party that initiates patent
litigation against the project.
```

### Example 5: Versioning Policy

```markdown
## Versioning Policy

### Format
The specification uses Semantic Versioning 2.0.0 (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes (requires veto-free TSC approval)
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, clarifications, typo corrections

### Release Schedule
- **Minor releases**: Semestriel (March, September)
- **Patch releases**: As needed, typically monthly
- **Major releases**: Only when necessary, with minimum 60-day RFC review

### Deprecation Policy
- **Announcement**: Deprecated features marked in next minor release
- **Sunset period**: 10 years from deprecation announcement
- **Notifications**: At announcement, 5 years, 2 years, 1 year, 6 months
- **Documentation**: Deprecated feature documentation maintained until sunset

### Security Hotfixes
Critical security issues receive expedited 72-hour coordinated disclosure:
1. Private notification to known adopters
2. Patch release after 72-hour window
3. Public advisory published
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BDFL governance | Elected/meritocratic TSC | 2015+ | More sustainable, scalable |
| CLA for contributions | DCO sign-off | 2016+ | Less friction, same legal protection |
| Paper-based bylaws | Git-versioned GOVERNANCE.md | 2018+ | Transparent, auditable changes |
| Proprietary specs | Open specification + Apache 2.0 | Ongoing | Broader adoption, ecosystem |
| Software-paced deprecation (2 years) | Industry-appropriate (10 years for luxury) | Emerging | Better adopter trust |

**Deprecated/outdated:**
- **BDFL model:** Considered anti-pattern for multi-stakeholder projects
- **CLA agreements:** DCO preferred for lower friction
- **Informal governance:** GOVERNANCE.md expected by mature projects

---

## Ostrom's Principles Applied

Elinor Ostrom's 8 principles for commons governance, adapted for this specification standard:

| Principle | Application to Galileo Standard |
|-----------|--------------------------------|
| 1. **Clear boundaries** | Membership tiers (Observer/Member/Founding Partner) with explicit rights. Specification scope defined in charter. |
| 2. **Appropriate rules** | RFC review periods scaled to change impact (2 weeks/30 days/60 days). Revenue-based dues for accessibility. |
| 3. **Participatory decision-making** | Open RFC submission. TSC elected by active contributors. |
| 4. **Monitoring** | Published decision logs. Public meeting minutes. Contribution tracking for merit. |
| 5. **Graduated sanctions** | Code of Conduct with escalating responses. TSC removal for persistent absence. |
| 6. **Conflict resolution** | TSC as first-level arbiter. Governing Board as escalation. 90-day veto resolution period. |
| 7. **Right to self-governance** | Charter amendments by 2/3 vote. TSC autonomy on technical decisions. |
| 8. **Nested enterprises** | TSC for technical, Board for strategic. Working groups for specific domains. |

---

## Open Questions

Things that couldn't be fully resolved and need planning-phase decisions:

1. **Initial TSC appointment mechanism**
   - What we know: Transition from founders to meritocratic election needed
   - What's unclear: Exact process for initial 3-5 founding brand appointments
   - Recommendation: Charter specifies transitional clause with expiration date

2. **Founding Partner window duration**
   - What we know: Window should be closed after launch
   - What's unclear: Exact close date (at charter signing? After 6 months? 1 year?)
   - Recommendation: Close at charter ratification, specify in founding documents

3. **Revenue-based dues calculation**
   - What we know: Dues should be scaled by company size (CA/revenue)
   - What's unclear: Exact thresholds and amounts
   - Recommendation: Three bands (SME <10M, Mid 10-100M, Enterprise >100M) with multipliers

4. **Observer commercial rights scope**
   - What we know: Observers can use spec commercially under Apache 2.0
   - What's unclear: Whether "use" includes building commercial certification tools
   - Recommendation: Apache 2.0 permits all commercial use; no additional restrictions

---

## Sources

### Primary (HIGH confidence)
- [Hyperledger Foundation Charter](https://hyperledger.github.io/governance/charter.html) - Full charter structure, TOC composition, voting requirements
- [CNCF Foundation Charter](https://github.com/cncf/foundation/blob/main/charter.md) - TOC powers, project governance requirements
- [OpenAPI Specification GOVERNANCE.md](https://github.com/OAI/OpenAPI-Specification/blob/main/GOVERNANCE.md) - TSC structure, decision-making, roles
- [Rust RFC 0000-template.md](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) - Complete RFC template structure
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) - Official license text, patent grant (Section 3)
- [SemVer 2.0.0](https://semver.org/) - Semantic versioning specification

### Secondary (MEDIUM confidence)
- [Apache Geode RFC Template](https://cwiki.apache.org/confluence/display/GEODE/RFC+Template) - Lightweight RFC format with Problem/Solution/Prior Art
- [Apache Hudi RFC Process](https://cwiki.apache.org/confluence/display/HUDI/RFC+Process) - When RFCs are required, approval process
- [Linux Foundation Bylaws](https://www.linuxfoundation.org/legal/bylaws) - Membership structure, board composition
- [RFC 8594 Sunset Header](https://datatracker.ietf.org/doc/html/rfc8594) - HTTP header for deprecation dates
- [RFC 7322 Style Guide](https://datatracker.ietf.org/doc/html/rfc7322) - IETF RFC structure reference

### Tertiary (LOW confidence - verify)
- TradeLens failure analysis: [Frontiers in Blockchain research paper](https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2025.1503595/full) - Ostrom framework applied to consortium failure
- [SemVerDoc](https://semverdoc.org/) - Semantic versioning adapted for documents (less established)
- [Mozilla Ostrom Principles Framework](https://www.mozillafoundation.org/en/blog/a-practical-framework-for-applying-ostroms-principles-to-data-commons-governance/) - Digital commons adaptation

---

## Metadata

**Confidence breakdown:**
- Governance charter structure: HIGH - Multiple authoritative sources (Hyperledger, CNCF, OpenAPI) with consistent patterns
- RFC template design: HIGH - Rust and Apache templates widely used and well-documented
- Apache 2.0 licensing: HIGH - Official ASF documentation, extensive legal analysis available
- Semver for specifications: MEDIUM - SemVer designed for software; adaptation for specs less documented
- TradeLens anti-patterns: MEDIUM - Academic research plus industry analysis, but post-hoc

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (60 days - governance patterns stable, but verify any specific foundation references)

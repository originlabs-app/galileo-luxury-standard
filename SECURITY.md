# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability in the Galileo Luxury Standard specifications, website, or reference implementations, please report it responsibly.

### How to Report

Send an email to **security@galileoprotocol.io** with:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested mitigation or fix

### What to Expect

| Step | Timeline |
|------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 7 days |
| Resolution target | Within 90 days |

We will keep you informed of progress and may ask for additional information.

### Scope

This security policy covers:

- **Specification vulnerabilities** — Cryptographic weaknesses, privacy leaks, compliance gaps
- **Smart contract interfaces** — Solidity interface design flaws
- **Website** — XSS, injection, authentication bypass
- **Infrastructure** — CI/CD pipeline, dependency vulnerabilities

### Out of Scope

- Third-party implementations of the standard
- Social engineering attacks
- Denial of service attacks
- Issues already publicly disclosed

## Responsible Disclosure

We follow a 90-day responsible disclosure policy:

1. Reporter submits vulnerability privately
2. We acknowledge and begin investigation
3. We develop and test a fix
4. We release the fix and publish an advisory
5. Reporter may publish details after the fix is released

We credit reporters in security advisories unless they prefer to remain anonymous.

## Security Best Practices for Implementers

If you are implementing the Galileo Luxury Standard:

- Keep dependencies up to date
- Follow the [GDPR compliance guide](specifications/compliance/guides/gdpr-compliance.md) for data handling
- Use the recommended cryptographic algorithms from the [hybrid architecture specification](specifications/architecture/HYBRID-ARCHITECTURE.md)
- Enable GitHub Dependabot and secret scanning on your repositories

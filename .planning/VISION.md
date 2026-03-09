# Vision — Galileo Protocol

> Written by humans. Read by the autonomous agent to align all work.
> Update this when the product direction changes.

## What

Galileo Protocol is the open standard for luxury product traceability on blockchain — a B2B SaaS for luxury brand authentication via Digital Product Passports (DPP). It targets all luxury brands, from independent maisons to global groups.

## Why

- **Regulatory pressure**: ESPR 2027 mandates DPPs for textiles/footwear, then leather, then watches
- **Anti-counterfeiting**: Luxury loses ~$50B/year to counterfeiting (OECD 2024)
- **Interoperability**: CPO products changing brands need a common standard
- **Neutrality**: Unlike Aura (LVMH-led), Galileo has anti-dominance governance
- **Cost**: Open source = no SaaS license, only infrastructure cost

## North Star

Become the **neutral, interoperable standard** combining GS1 Digital Link + W3C DID + ERC-3643 + ESPR 2024/1781 compliance in a single stack — adopted by luxury brands worldwide.

## Principles

- Privacy-first: zero personal data on-chain (GDPR compliant)
- Open standard: interoperable, vendor-neutral
- Security by design: no shortcuts on auth, validation, concurrency
- Mobile-first scanner experience
- Simplicity over features — ship the MVP, iterate

## V1 Scope

### In
- Product CRUD with GTIN validation and DID generation
- Mock minting with optimistic concurrency (real chain deploy pending RPC key)
- GS1 Digital Link resolver (JSON-LD, ESPR-compliant)
- B2B dashboard with auth, product management, wallet connection
- Scanner PWA with QR scanning and provenance display
- Product lifecycle: DRAFT → ACTIVE → RECALLED, transfers, verification
- Security hardening: rate limiting, helmet, CSRF, input validation

### Out
- T1 token integration (deferred to V2, Sprint 5-6)
- SDK / Docker / sandbox for third-party adoption (V2)
- Real chain deployment (blocked on RPC key)
- Smart Wallet (started, not complete)
- Dashboard UI for file upload (API endpoint complete, Sprint #1 9600650)

## Long-Term Vision

**6-12 months**: Integrate T1 as ecosystem utility token. Prepare for open source adoption with SDK, Docker, sandbox, and documentation. Position as the only open standard for luxury DPP.

**V2/V3**: Multi-chain support, third-party brand onboarding, compliance automation for ESPR reporting, marketplace integration for CPO luxury goods.

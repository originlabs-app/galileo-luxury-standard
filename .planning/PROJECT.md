# Galileo Protocol

## What This Is

Galileo Protocol is an open blockchain traceability standard for luxury goods, delivered as a B2B SaaS platform for luxury brands. It lets a brand create Digital Product Passports, anchor them to blockchain infrastructure, and expose verifiable provenance through GS1 Digital Link, W3C DID, and ERC-3643-aligned flows. The current cycle is focused on turning an already feature-complete simulated MVP into a real Base Sepolia pilot for one luxury brand.

## Core Value

Luxury brands can prove a product's authenticity and lifecycle through a neutral, interoperable, regulation-ready Digital Product Passport that is actually verifiable end to end.

## Requirements

### Validated

- ✓ Dashboard operators can authenticate and manage luxury products from a private B2B interface — existing
- ✓ The platform can create, list, update, and batch import product records with shared validation rules — existing
- ✓ The API can expose GS1 Digital Link / JSON-LD resolver responses for public product verification — existing
- ✓ The scanner PWA can scan QR codes and display provenance information, including offline support — existing
- ✓ The system models regulated product lifecycle actions such as mint, recall, transfer, and verification workflows — existing
- ✓ Security foundations exist across the stack, including Zod validation, rate limiting, CSRF protections, httpOnly cookies, audit logging, and PII-aware handling — existing
- ✓ A Solidity contract suite and compliance module architecture exist for ERC-3643-oriented tokenization flows — existing

### Active

- [ ] One pilot luxury brand can mint real DPPs on Base Sepolia with real transaction hashes and Basescan-verifiable records
- [ ] Galileo operators can run the full pilot workflow end to end: create product, mint on-chain, print/scan QR, verify provenance, and transfer ownership
- [ ] A pilot brand operator can use the dashboard and API in a publicly hosted demo environment suitable for customer demonstrations
- [ ] On-chain transfer flows can pass the current compliance checks against the deployed Base Sepolia contract stack
- [ ] The pilot can be shown credibly to other luxury brands as proof that Galileo is a viable neutral alternative to Aura

### Out of Scope

- Multi-brand production onboarding — deferred until pilot succeeds and tenant isolation / RLS is approved
- CPO-specific lifecycle expansion — deferred until post-pilot event types such as repaired and CPO-certified are approved
- T1 utility token launch — gated behind pilot success and legal / audit readiness
- Open source packaging, SDK, CLI, and sandbox distribution — gated behind pilot success
- Base mainnet rollout — deferred until smart contract audit and testnet pilot validation complete

## Context

Galileo exists because ESPR-driven Digital Product Passport regulation is approaching, luxury counterfeiting remains economically large, and existing market options are not neutral. The platform is positioned as an open, anti-dominance alternative to Aura, with interoperability across GS1 Digital Link, W3C DID, ERC-3643, GDPR-oriented zero-PII on-chain design, and ESPR/MiCA readiness.

The repository already contains a substantial brownfield implementation: a Fastify API in `apps/api`, a private Next.js dashboard in `apps/dashboard`, a public scanner PWA in `apps/scanner`, shared validation/types in `packages/shared`, and a Solidity/Foundry contract project in `contracts`. The MVP has been developed across 11 sprints and reportedly carries 372 passing tests, but blockchain writes are still effectively simulated in the application path, so the product does not yet have persuasive demo value for a pilot brand.

The current cycle is intentionally narrow. The priority users are the internal Galileo team first, then one pilot luxury brand. Multi-tenant expansion, broader third-party onboarding, and open source distribution come only after a real on-chain pilot is proven.

## Constraints

- **Network**: Base Sepolia first — real minting and transfers must be demonstrated on testnet before any mainnet or token expansion
- **Infrastructure**: Public demo hosting is required — the pilot is not done until the dashboard, API, and scanner can be shown from public URLs
- **Access**: Single pilot brand only — multi-brand rollout is blocked until row-level security and related tenancy work are approved
- **Database**: No locked migrations without approval — MFA, RLS, and new protected event types remain blocked by explicit DB approval gates
- **Compliance**: Zero PII on-chain must hold — GDPR-oriented design is a product constraint, not an optimization
- **Governance**: Neutral anti-dominance positioning must remain intact — no single brand should control the standard

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Focus this cycle on one Base Sepolia pilot brand | The platform is already broad enough; the missing proof is real on-chain demonstration, not more surface area | — Pending |
| Treat the existing product as a brownfield MVP, not a greenfield concept | Significant dashboard, API, scanner, and contract work already exists and should be preserved as validated capability | ✓ Good |
| Gate open source release and T1 tokenization behind pilot success | These expand scope materially and do not help if the pilot remains simulated | — Pending |
| Prioritize hosted demo readiness alongside real minting | A prospect brand needs a credible, end-to-end live demonstration, not just local success | — Pending |
| Keep multi-tenant and CPO expansion out of the current cycle | The necessary RLS and event-type approvals are not yet available, and they are not required to prove pilot value | ✓ Good |

---
*Last updated: 2026-03-09 after initialization*

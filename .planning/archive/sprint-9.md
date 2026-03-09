# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #9 — Smart Wallet & Observability

**Goal**: Add ERC-1271 Smart Wallet support for Coinbase Smart Wallet users (both SIWE login and wallet-link), integrate Vercel Analytics for frontend observability, and cover the new auth flows with E2E tests. MFA (🔒) deferred — requires DB migration for TOTP secret storage.
**Started**: 2026-03-09
**Status**: archived (4/4 validated)

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T9.1 | ERC-1271 Smart Wallet verification (API) | EPIC-005 | validated | Smart Wallet (contract) signatures verified in SIWE login and wallet-link. EOA signatures still work. | 081ee0e |
| T9.2 | Coinbase Smart Wallet connector (dashboard) | EPIC-005 | validated | Dashboard wagmi config includes Coinbase Smart Wallet connector. Users can connect with Coinbase Smart Wallet, sign SIWE messages, and link wallet. | ce70f02 |
| T9.3 | Vercel Analytics integration | EPIC-007 | validated | `@vercel/analytics` active in dashboard and scanner. Page views tracked. No impact on performance or bundle size > 5KB. | 178035d |
| T9.4 | E2E Playwright: Smart Wallet + wallet auth flows | EPIC-007 | validated | Playwright specs cover wallet-link with nonce, SIWE login with EOA, and Smart Wallet connector presence. All pass. | 80b630a |

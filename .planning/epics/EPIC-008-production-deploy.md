# EPIC-008: Production Deployment

**Status**: not-started
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Deploy the full stack to production: frontend on Vercel, API on dedicated host, contracts on Base mainnet. Includes Swagger publication and JSON-LD context hosting.

## Tasks

- [ ] Deploy frontend: Vercel (dashboard + scanner + website)
- [ ] Deploy API: dedicated host (Railway, Render, or VPS)
- [ ] 🔒 Deploy contracts: Base mainnet (chainId 8453) — only after testnet E2E passes
- [ ] Use dedicated RPC provider (Alchemy/QuickNode)
- [ ] 🔒 Transfer contract ownership to multisig (Safe)
- [ ] Create contracts/deployments/base-mainnet.json
- [ ] Host Galileo JSON-LD context at https://vocab.galileoprotocol.io/contexts/galileo.jsonld
- [ ] Publish Swagger at /docs in production

## Acceptance Criteria

- MVP live and accessible
- First brand can onboard
- Contracts verified on mainnet with multisig ownership

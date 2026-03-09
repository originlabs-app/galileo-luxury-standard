# EPIC-008: Production Deployment

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Deploy the full stack to production: frontend on Vercel, API on dedicated host, contracts on Base mainnet. Includes Swagger publication and JSON-LD context hosting.

## Tasks

- [x] Vercel deployment config for dashboard + scanner (Sprint #10, cddf83a)
- [ ] Deploy frontend: Vercel (dashboard + scanner + website) — configs ready, needs Vercel project setup
- [x] API Dockerfile for containerized deployment (Sprint #10, d239545)
- [ ] Deploy API: dedicated host (Railway, Render, or VPS) — Dockerfile ready, needs hosting provider
- [ ] 🔒 Deploy contracts: Base mainnet (chainId 8453) — only after testnet E2E passes
- [ ] Use dedicated RPC provider (Alchemy/QuickNode)
- [ ] 🔒 Transfer contract ownership to multisig (Safe)
- [ ] Create contracts/deployments/base-mainnet.json
- [ ] Host Galileo JSON-LD context at https://vocab.galileoprotocol.io/contexts/galileo.jsonld
- [x] Publish Swagger at /docs in production (Sprint #3, 1ddbea6)

## Acceptance Criteria

- MVP live and accessible
- First brand can onboard
- Contracts verified on mainnet with multisig ownership

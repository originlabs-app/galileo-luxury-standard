# EPIC-010: Open Source & Developer Experience

**Status**: gated
**Owner**: Researcher
**Created**: 2026-03-08
**Gate**: POST-PILOT — requires Sprint 4 exit validated + at least 1 brand pilot active

## Description

Make Galileo Protocol adoptable by any brand without Origin Labs support. SDK, Docker, documentation, community, and design partner program.

## Tasks

- [ ] Docker Compose for local dev (PostgreSQL + API + Dashboard + Scanner)
- [ ] SDK TypeScript (@galileo/sdk): typed API client, DPP helpers, GTIN validation
- [ ] CLI tool: npx @galileo/cli create-product
- [ ] Sandbox hosted at sandbox.galileoprotocol.io
- [ ] Architecture Decision Records (ADRs)
- [ ] Integration Guide: step-by-step ERP connection
- [ ] Smart Contract Deployment Guide: runbook
- [ ] API Reference: auto-generated + examples
- [ ] Publish npm packages: @galileo/shared, @galileo/sdk, @galileo/contracts
- [ ] Docker images on GitHub Container Registry
- [ ] Helm chart for Kubernetes
- [ ] Recruit 3-5 TSC members
- [ ] Create Discord server + mailing list
- [ ] Bug bounty program
- [ ] Identify 2-3 design partners (mid-market brands)

## Acceptance Criteria

- `docker compose up` -> create DPP -> mint -> scan QR in < 15 minutes
- npm packages published
- Documentation complete
- 2+ design partners active

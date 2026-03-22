# Plans

## Now

- [ ] Live minting on Base Sepolia — task 2/2: deploy contracts + mint real token (requires `BASE_SEPOLIA_RPC` key, paused per commit `9f4a8fc`)

## Later

- [ ] Webhook delivery monitoring — dashboard view for subscription health and delivery status
- [ ] Scanner PWA offline support — service worker + cached verification
- [ ] T1 token ecosystem — paymaster, KYC integration, price feed (Phase 6 per roadmap)

## Clarifications

- [ ] Live minting task 2/2: confirm Base Sepolia RPC key availability (Alchemy/Infura)

## Done

- [x] Phase 01: Foundation — auth (JWT + SIWE), products CRUD, shared package, 372 unit tests
- [x] Phase 02: Security hardening — CSRF, input validation, GDPR endpoints, audit trail, webhooks, batch ops
- [x] Phase 03-01: Base Sepolia deployment metadata — chain config, health diagnostics, live minting task 1/2
- [x] Harness alignment — AGENTS.md, ARCHITECTURE.md, docs/ reference layer
- [x] Production deployment — API on Railway (Docker), Dashboard + Scanner on Vercel, managed PostgreSQL migrated
- [x] Fix Prisma ESM imports — postbuild script patches `.js` extensions for ESM compatibility in production
- [x] Fix contracts path in Docker — `deployments/` artifacts correctly copied to `/app` in multi-stage build
- [x] R2 storage configured — Cloudflare R2 bucket live, product image upload working in production
- [x] Basescan API key — contract verification enabled on Base Sepolia block explorer
- [x] Changesets + GitHub Actions release pipeline — automated versioning, changelog generation, release notes
- [x] Website /changelog and /roadmap pages — public-facing pages live with Base ecosystem section
- [x] CHANGELOG.md and ROADMAP.md rewritten for external audience
- [x] Fix .vercelignore — `/governance` and `/docs` directories excluded from website deployment
- [x] Git hygiene — 61 stale branches + 46+14 worktrees cleaned up

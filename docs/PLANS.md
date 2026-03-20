# Plans

## Now

- [ ] Live minting on Base Sepolia — task 2/2: deploy contracts + mint real token (requires `BASE_SEPOLIA_RPC` key, paused per commit `9f4a8fc`)

## Later

- [ ] Production deployment — Railway (API) + Vercel (dashboard + scanner) + managed PostgreSQL
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

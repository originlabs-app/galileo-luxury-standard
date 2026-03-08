# EPIC-001: Core Platform

**Status**: mostly-complete
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Foundation of the Galileo Protocol platform: monorepo setup, authentication, RBAC, database schema, Fastify API server, CI pipeline, and dashboard shell.

## Tasks

- [x] Monorepo setup (Turborepo): apps/api, apps/dashboard, apps/scanner, packages/shared
- [x] Auth: email/password + JWT, RBAC (admin, brand-admin, operator, viewer)
- [x] DB schema (Prisma 7): Brand, Product, ProductPassport, ProductEvent, User
- [x] Fastify 5 API: auth endpoints (register/login/refresh/me/logout), health check
- [x] CI pipeline (GitHub Actions): 3 independent jobs
- [x] Dashboard: ABYSSE theme, login/register/dashboard/products pages, sidebar, auth guard
- [x] Scanner shell: Coming Soon page with ABYSSE theme
- [x] Smart contract CI: forge build && forge test
- [x] @galileo/shared: GTIN-13/14 validation, DID generation, Zod auth schemas, TypeScript types
- [x] Security hardening: SHA-256 hashed refresh tokens, timing-safe login, CSRF header
- [x] httpOnly cookie auth, SameSite=Lax
- [x] AuthProvider Context (single /auth/me fetch), SSR-safe AuthGuard
- [ ] Cookie hardening: `__Host-` prefix for production, cookie signing, dev-mode log warning

## Acceptance Criteria

- `pnpm dev` starts all apps
- Auth flow works end-to-end
- CI green
- 186+ unit tests + 2 e2e tests passing

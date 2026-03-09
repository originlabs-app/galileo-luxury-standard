---
phase: 1
slug: single-brand-workspace-identity-baseline
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright |
| **Config file** | `apps/api/vitest.config.ts`, `apps/dashboard/playwright.config.ts` |
| **Quick run command** | `pnpm --filter @galileo/api exec vitest run test/auth.test.ts -t "returns new cookies for valid refresh token cookie" && pnpm --filter @galileo/api exec vitest run test/security-hardening.test.ts -t "returns 403 on POST /products when non-ADMIN user has null brandId" && pnpm --filter @galileo/shared exec vitest run test/did.test.ts` |
| **Full suite command** | `pnpm typecheck && pnpm lint && pnpm --filter @galileo/shared exec vitest run test/did.test.ts && pnpm --filter @galileo/api exec vitest run test/auth.test.ts test/products.test.ts test/security-hardening.test.ts test/siwe.test.ts test/link-wallet.test.ts && pnpm --filter @galileo/dashboard exec playwright test e2e/auth.setup.ts e2e/dashboard-home.spec.ts e2e/wallet-auth.spec.ts e2e/product-lifecycle.spec.ts` |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @galileo/api exec vitest run test/auth.test.ts -t "returns new cookies for valid refresh token cookie" && pnpm --filter @galileo/api exec vitest run test/security-hardening.test.ts -t "returns 403 on POST /products when non-ADMIN user has null brandId" && pnpm --filter @galileo/shared exec vitest run test/did.test.ts`
- **After every plan wave:** Run `pnpm typecheck && pnpm lint && pnpm --filter @galileo/shared exec vitest run test/did.test.ts && pnpm --filter @galileo/api exec vitest run test/auth.test.ts test/products.test.ts test/security-hardening.test.ts test/siwe.test.ts test/link-wallet.test.ts && pnpm --filter @galileo/dashboard exec playwright test e2e/auth.setup.ts e2e/dashboard-home.spec.ts e2e/wallet-auth.spec.ts e2e/product-lifecycle.spec.ts`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01 | api | `pnpm --filter @galileo/api exec vitest run test/auth.test.ts -t "creates user and returns 201 with cookies \\(no tokens in body\\)|returns 409 for duplicate email"` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | api + dashboard typecheck | `pnpm --filter @galileo/api exec vitest run test/auth.test.ts -t "returns new cookies for valid refresh token cookie|invalidates old refresh token after rotation" && pnpm --filter @galileo/dashboard exec tsc --noEmit` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | AUTH-03 | api | `pnpm --filter @galileo/api exec vitest run test/security-hardening.test.ts -t "returns 403 on GET /products when non-ADMIN user has null brandId"` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | AUTH-03 | api | `pnpm --filter @galileo/api exec vitest run test/products.test.ts -t "creates product with valid GTIN and returns 201 with auto-generated DID and Digital Link|non-ADMIN without brandId gets 403"` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 2 | AUTH-01 | e2e | `pnpm --filter @galileo/dashboard exec playwright test e2e/auth.setup.ts` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 2 | AUTH-03 | e2e | `pnpm --filter @galileo/dashboard exec playwright test e2e/dashboard-home.spec.ts` | ✅ | ⬜ pending |
| 01-04-01 | 04 | 1 | PROD-03 | shared | `pnpm --filter @galileo/shared exec vitest run test/did.test.ts` | ✅ | ⬜ pending |
| 01-04-02 | 04 | 1 | PROD-01 | api | `pnpm --filter @galileo/api exec vitest run test/products.test.ts -t "creates product with valid GTIN and returns 201 with auto-generated DID and Digital Link|returns 400 for invalid GTIN check digit"` | ✅ | ⬜ pending |
| 01-05-01 | 05 | 3 | PROD-03 | e2e | `pnpm --filter @galileo/dashboard exec playwright test e2e/product-lifecycle.spec.ts` | ✅ | ⬜ pending |
| 01-05-02 | 05 | 3 | PROD-01 | e2e | `pnpm --filter @galileo/dashboard exec playwright test e2e/product-lifecycle.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Setup-check clarity for blocked vs informational states | AUTH-01, AUTH-03 | UX emphasis and operator comprehension are not fully captured by route assertions alone | Sign in as an approved pilot user and as an unassigned or blocked user. Confirm every successful sign-in lands on `/dashboard/setup` first, and confirm the page clearly distinguishes blocking access issues from informational readiness hints before the user continues. |
| Identity summary usefulness after create | PROD-01, PROD-03 | The key outcome is operator understanding of permanent identity, not only DOM presence | Create a product and confirm the first post-create view makes GTIN, serial, DID, and GS1 Digital Link immediately visible, easy to copy, and clearly framed as the permanent identity baseline before broader editing. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

## Execution Tracking

- 2026-03-09: Plan `01-03` now renders separate "Blocking access issues" and "Operational hints" sections on `/dashboard/setup`; manual UX review remains pending against the checklist above.

**Approval:** pending

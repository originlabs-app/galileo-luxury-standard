---
phase: 2
slug: pilot-catalog-authoring-import
status: gaps_found
verified_at: 2026-03-10
requirements:
  - PROD-02
  - PROD-04
source_plans:
  - 02-01
  - 02-02
  - 02-03
  - 02-04
  - 02-05
---

# Phase 2 Verification

## Status: gaps_found

Phase 2 is largely implemented, but it does not currently satisfy its goal at a clean, demonstrable verification bar.

The codebase does contain the intended authoring and import surface:

- `PROD-04` is materially implemented through the shared authoring contract in `packages/shared/src/validation/product-authoring.ts`, API reuse in `apps/api/src/routes/products/create.ts` and `apps/api/src/routes/products/update.ts`, public resolver reads in `apps/api/src/routes/resolver/resolve.ts`, the DRAFT passport workspace in `apps/dashboard/src/app/dashboard/products/[id]/page.tsx`, and linked-media upload plus local serving in `apps/api/src/routes/products/upload.ts` and `apps/api/src/server.ts`.
- `PROD-02` is materially implemented through validation-first import services in `apps/api/src/services/products/import-csv.ts`, the dry-run plus commit route in `apps/api/src/routes/products/batch-import.ts`, the visible dashboard entrypoint in `apps/dashboard/src/app/dashboard/products/page.tsx`, and the review-first dialog in `apps/dashboard/src/components/batch-import-dialog.tsx`.

Those behaviors line up with the plans' must-haves:

- 02-01 must-haves: satisfied in code. Create, patch, and resolver all use the shared authoring envelope, and immutable identity remains outside the mutable authoring schema.
- 02-02 must-haves: satisfied in code shape. Import defaults to dry-run, returns row-level feedback, reuses the shared authoring contract, and explicitly allows `OPERATOR`.
- 02-03 must-haves: satisfied in code shape. The products page exposes `Import CSV`, and the dialog blocks commit until zero-error validation.
- 02-04 must-haves: satisfied in code shape. The product detail view keeps identity read-only, limits authoring to DRAFT, and exposes shared materials plus linked-media controls.
- 02-05 must-haves: satisfied in code shape. Upload replacement semantics, local `/uploads/*` serving, and typed media descriptors are present.

## Requirement Cross-Reference

- `PROD-02` appears in plan frontmatter for `02-02`, `02-03`, and `02-05`, which matches the requirement definition in `.planning/REQUIREMENTS.md`.
- `PROD-04` appears in plan frontmatter for `02-01`, `02-02`, `02-04`, and `02-05`, which also matches `.planning/REQUIREMENTS.md`.

## Verification Evidence

Commands run against the current tree:

- `pnpm --filter @galileo/api build` -> failed
- `pnpm --filter @galileo/dashboard exec tsc --noEmit` -> passed
- `pnpm --filter @galileo/api exec vitest run test/batch-import.test.ts --reporter=verbose` -> failed
- `pnpm --filter @galileo/api exec vitest run test/products.test.ts --reporter=verbose` -> failed
- `pnpm --filter @galileo/api exec vitest run test/upload.test.ts --reporter=verbose` -> failed
- `pnpm --filter @galileo/api exec vitest run test/resolver-qr.test.ts --reporter=verbose` -> failed
- `pnpm --filter @galileo/dashboard exec playwright test e2e/batch-import.spec.ts e2e/product-upload.spec.ts e2e/product-lifecycle.spec.ts` -> failed during `webServer` startup

## Remaining Gaps

1. The API does not build cleanly, which blocks the standard dashboard verification path and weakens demo operability.
   Evidence: `apps/api/src/routes/products/batch-import.ts:122` reads `result.created` from a union that can still be `CatalogImportPreview`. `pnpm --filter @galileo/api build` fails with `TS2339: Property 'created' does not exist on type 'CatalogImportPreview'.`

2. Phase-owned automated verification is currently red across the API suites touched by the phase.
   Evidence: `test/products.test.ts`, `test/batch-import.test.ts`, and `test/upload.test.ts` fail during user setup with `User_brandId_fkey` violations, and `test/resolver-qr.test.ts` additionally shows setup instability with unique brand slug collisions and missing seeded users. That means the current codebase does not have working automated proof for the core Phase 2 flows.

3. Phase-owned dashboard verification is internally inconsistent.
   Evidence: `apps/dashboard/src/app/dashboard/products/page.tsx:181-183` always renders the import dialog entrypoint, but `apps/dashboard/e2e/product-lifecycle.spec.ts:109-115` still expects the products page not to show batch import. Even after the API build issue is fixed, this spec contradicts the intended Phase 2 behavior.

## Conclusion

The phase implementation is close: the main product, import, and media paths are present and mostly aligned with `PROD-02` and `PROD-04`. However, Phase 2 cannot be marked achieved in the current codebase because the API build is broken and the phase-owned verification suites are not presently runnable and green.

# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #8 -- Batch Operations & Wallet Auth

**Goal**: Add batch CSV import/mint for brand onboarding at scale, and implement SIWE (Sign-In With Ethereum) wallet login. These are the highest-priority non-blocked P1 tasks. Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. RLS (🔒) skipped — needs operator approval.
**Started**: 2026-03-09
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| T8.1 | Batch CSV import endpoint | EPIC-006 | todo | Upload CSV with 100 products, all created with correct GTIN validation. Errors reported per row. | |
| T8.2 | Batch mint endpoint | EPIC-006 | todo | POST /products/batch-mint with array of product IDs, all minted. Partial failure handled gracefully. | |
| T8.3 | Dashboard: CSV import UI | EPIC-006 | todo | Upload button, file picker, progress feedback, error summary displayed. Works on desktop and mobile. | |
| T8.4 | SIWE wallet login (EIP-4361) | EPIC-005 | todo | User can login with wallet signature. Nonce endpoint, SIWE message format, session created on success. | |
| T8.5 | E2E Playwright: batch import, batch mint, SIWE login | EPIC-007 | todo | Automated Playwright specs covering Sprint #8 features. Run with `pnpm --filter dashboard exec playwright test`. | |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated or explicitly deferred
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### Brief T8.1: Batch CSV Import Endpoint

**Type**: backend
**Priority**: P1
**Epic**: EPIC-006-data-compliance
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/routes/products/batch-import.ts` -- NEW: CSV import route handler
- `apps/api/src/routes/products/index.ts` -- register batch-import route
- `packages/shared/src/validation/gtin.ts` -- reuse existing GTIN validation
- `apps/api/test/batch-import.test.ts` -- NEW: batch import tests

**Approach**:

Add a `POST /products/batch-import` endpoint that accepts a CSV file (multipart/form-data) and creates products in bulk. Each row is validated independently — invalid rows are skipped and reported in the response.

**Step 1: Define CSV format**

Expected CSV columns: `name,gtin,serialNumber,category,description,materials`. First row is header. GTIN is validated using existing `validateGtin` from @galileo/shared. Category must match existing enum values.

**Step 2: Create `apps/api/src/routes/products/batch-import.ts`**

- Accept multipart file upload (reuse existing @fastify/multipart setup from file upload)
- Parse CSV content (use a lightweight CSV parser — split by newlines and commas with quote handling, or use `csv-parse/sync` if already available)
- For each row: validate GTIN, validate required fields, create product via Prisma
- Wrap in a transaction: all-or-nothing by default, with `?partial=true` query param for partial success mode
- Return summary: `{ created: number, errors: Array<{ row: number, field: string, message: string }> }`

**Step 3: Auth and scoping**

- Requires ADMIN or BRAND_ADMIN role
- BRAND_ADMIN: all products created under their brand
- ADMIN: must specify brandId in CSV or query param

**Step 4: Limits**

- Max 500 rows per upload (safety limit)
- Max file size: 1MB
- Duplicate GTIN+serial within the CSV: reject the duplicate row

**Patterns to follow**:
- requireRole middleware for ADMIN + BRAND_ADMIN (existing pattern)
- CSRF header on mutation (R01)
- Brand scoping (R31)
- Zod validation per row
- Multipart file upload (existing pattern from image upload)
- Transaction for atomicity (default) or partial mode

**Edge cases**:
- Empty CSV (header only): return `{ created: 0, errors: [] }`
- All rows invalid: return 0 created with all errors
- Duplicate GTIN+serial in CSV: report error on duplicate row
- Duplicate GTIN+serial vs existing DB: report conflict error per row
- Malformed CSV (missing columns, extra columns): report parse error
- BOM (byte order mark) in UTF-8 CSV: strip BOM before parsing
- BRAND_ADMIN uploading for another brand: 403

**Tests** (~12 tests):
- Upload valid CSV with 5 products — all created (201)
- Upload CSV with invalid GTIN — row error reported, others created (partial mode)
- Upload CSV with duplicate GTIN+serial — error on duplicate
- Empty CSV returns 0 created
- Exceeding 500 rows returns 400
- BRAND_ADMIN can import for own brand
- BRAND_ADMIN cannot import for other brand (403)
- VIEWER role returns 403
- Unauthenticated returns 401
- Malformed CSV returns 400 with parse error
- Transaction mode: one invalid row rolls back all (default)
- Partial mode: valid rows created, invalid rows reported

**Verify**: Upload a CSV with 10 valid products — all created. Upload CSV with 2 invalid rows — errors reported per row. Check products exist in DB. Verify BRAND_ADMIN scoping.

---

### Brief T8.2: Batch Mint Endpoint

**Type**: backend
**Priority**: P1
**Epic**: EPIC-006-data-compliance
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/routes/products/batch-mint.ts` -- NEW: batch mint route handler
- `apps/api/src/routes/products/index.ts` -- register batch-mint route
- `apps/api/test/batch-mint.test.ts` -- NEW: batch mint tests

**Approach**:

Add a `POST /products/batch-mint` endpoint that accepts an array of product IDs and mints them all. Uses the existing mint logic (mock mint for now) applied to each product.

**Step 1: Create `apps/api/src/routes/products/batch-mint.ts`**

```typescript
const batchMintBodySchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(100),
});
```

- Validate all product IDs exist and are in DRAFT status
- For each product: run the existing mint flow (DID generation, mock on-chain data, status update to ACTIVE)
- Wrap in a transaction for atomicity
- Return summary: `{ minted: number, errors: Array<{ productId: string, message: string }> }`

**Step 2: Auth and scoping**

- Requires ADMIN or BRAND_ADMIN
- BRAND_ADMIN: can only mint products belonging to their brand
- Pre-check: verify all products belong to user's brand before starting

**Step 3: Concurrency**

- Use optimistic concurrency (existing pattern from single mint) per product
- If a product was already minted between validation and execution, report it in errors

**Patterns to follow**:
- Reuse existing mint logic from `apps/api/src/routes/products/mint.ts`
- requireRole middleware
- CSRF header
- Brand scoping (R31)
- Optimistic concurrency (existing mint pattern)
- Webhook outbox enqueue for each minted product (T7.2 integration)

**Edge cases**:
- Empty array: rejected by `.min(1)` validation
- Mix of valid and invalid products: report per-product errors
- Product already ACTIVE: skip with error "already minted"
- Product in RECALLED status: skip with error "cannot mint recalled product"
- Cross-brand products for BRAND_ADMIN: 403
- Concurrent batch mints: optimistic concurrency handles race conditions
- Very large batch: capped at 100 products per request

**Tests** (~10 tests):
- Batch mint 3 DRAFT products — all become ACTIVE (200)
- Batch mint with non-existent product ID — error reported
- Batch mint product already ACTIVE — error "already minted"
- Batch mint RECALLED product — error reported
- BRAND_ADMIN can only mint own brand's products
- Cross-brand product in batch — 403
- Empty productIds array — 400 validation error
- Over 100 products — 400 validation error
- Webhook events fired for each minted product
- Unauthenticated returns 401

**Verify**: Create 5 products via CSV import (T8.1). Batch mint all 5 — all become ACTIVE. Verify DID and mock on-chain data generated for each. Verify webhook events fired.

---

### Brief T8.3: Dashboard CSV Import UI

**Type**: UI
**Priority**: P1
**Epic**: EPIC-006-data-compliance
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/src/components/batch-import-dialog.tsx` -- NEW: CSV import dialog component
- `apps/dashboard/src/app/products/page.tsx` -- add import button to product list page
- `apps/dashboard/src/lib/api.ts` -- add batch import API call

**Approach**:

Add a "Import CSV" button to the product list page that opens a dialog with file upload, preview, and progress feedback.

**Step 1: Create `batch-import-dialog.tsx`**

Dialog component with:
- File input accepting `.csv` files only
- Preview of first 5 rows after file selection (parsed client-side)
- "Import" button to submit to `POST /products/batch-import`
- Progress state: idle → uploading → success/error
- Error summary: table showing row number, field, and error message
- Success summary: "X products created successfully"

**Step 2: Integrate in product list page**

Add an "Import CSV" button next to the existing "Add Product" button. Only visible for ADMIN and BRAND_ADMIN roles.

**Step 3: API integration**

Add `batchImport(file: File)` function to `api.ts` that sends the file as multipart/form-data with CSRF header.

**Patterns to follow**:
- shadcn/ui Dialog, Button, Table components
- TanStack Query for mutation (useMutation)
- CSRF header on mutation (X-Galileo-Client)
- Role-based UI visibility (existing pattern)
- File upload pattern from existing image upload component
- Toast notifications for success/error (existing pattern)

**Edge cases**:
- Large file: show loading spinner during upload
- Network error: show retry option
- All rows failed: show full error table
- User cancels dialog mid-upload: mutation cancelled
- Non-CSV file selected: validate file extension client-side
- Empty file: show "No data found" message

**Tests**: Covered by T8.5 E2E specs.

**Verify**: Click "Import CSV" on product list. Select a valid CSV. Preview shows first rows. Click Import. Products appear in list. Select CSV with errors. Error summary displayed. Works on desktop and mobile.

---

### Brief T8.4: SIWE Wallet Login (EIP-4361)

**Type**: security
**Priority**: P1
**Epic**: EPIC-005-security-hardening
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/routes/auth/siwe.ts` -- NEW: SIWE login route (nonce + verify)
- `apps/api/src/routes/auth/index.ts` -- register SIWE routes
- `apps/api/src/services/siwe.ts` -- NEW: SIWE message builder and verifier
- `packages/shared/src/validation/wallet.ts` -- add SIWE message types
- `apps/dashboard/src/components/siwe-login.tsx` -- NEW: SIWE login button component
- `apps/dashboard/src/app/login/page.tsx` -- add SIWE login option
- `apps/api/test/siwe.test.ts` -- NEW: SIWE tests

**Approach**:

Implement Sign-In With Ethereum (EIP-4361) as an alternative login method. Users with a linked wallet can authenticate by signing a SIWE message instead of using email/password.

**Step 1: Install siwe dependency**

```bash
pnpm --filter api add siwe
```

The `siwe` package handles message creation and verification per EIP-4361 spec.

**Step 2: Create SIWE service (`apps/api/src/services/siwe.ts`)**

```typescript
import { SiweMessage } from "siwe";

export function createSiweMessage(params: {
  address: string;
  nonce: string;
  chainId: number;
  domain: string;
  uri: string;
  statement?: string;
}): string {
  const message = new SiweMessage({
    domain: params.domain,
    address: params.address,
    statement: params.statement ?? "Sign in to Galileo Protocol",
    uri: params.uri,
    version: "1",
    chainId: params.chainId,
    nonce: params.nonce,
  });
  return message.prepareMessage();
}

export async function verifySiweMessage(
  message: string,
  signature: string,
  nonce: string,
): Promise<{ address: string; chainId: number } | null> {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature, nonce });
    if (!result.success) return null;
    return {
      address: result.data.address,
      chainId: result.data.chainId,
    };
  } catch {
    return null;
  }
}
```

**Step 3: Create SIWE routes (`apps/api/src/routes/auth/siwe.ts`)**

Two endpoints:

1. `GET /auth/siwe/nonce` — Generate a nonce for SIWE signing (reuse nonce pattern from T7.4, but without requiring auth — this is for login). Store nonce in memory with TTL.

2. `POST /auth/siwe/verify` — Accept `{ message, signature }`. Verify SIWE message against nonce. Look up user by wallet address (`walletAddress` field on User). If found, issue session cookie (same as existing login flow). If no user linked to that wallet, return 404 with clear message.

```typescript
// POST /auth/siwe/verify
const body = siweVerifySchema.parse(request.body);
const verified = await verifySiweMessage(body.message, body.signature, expectedNonce);
if (!verified) {
  return reply.status(401).send({ success: false, error: { code: "INVALID_SIGNATURE", message: "SIWE verification failed" } });
}

const user = await fastify.prisma.user.findFirst({
  where: { walletAddress: getAddress(verified.address) },
});
if (!user) {
  return reply.status(404).send({ success: false, error: { code: "WALLET_NOT_LINKED", message: "No account linked to this wallet. Login with email first and link your wallet." } });
}

// Issue session cookie (reuse existing session creation logic)
const token = signJwt({ sub: user.id, role: user.role, brandId: user.brandId });
setCookie(reply, token);
return reply.send({ success: true, data: { user: { id: user.id, email: user.email, role: user.role } } });
```

**Step 4: Dashboard SIWE login component**

Create `siwe-login.tsx`:
- "Sign in with Wallet" button on login page
- Connect wallet via wagmi (existing setup)
- Fetch nonce from `GET /auth/siwe/nonce`
- Build SIWE message and request signature via wagmi `signMessage`
- Submit to `POST /auth/siwe/verify`
- On success: redirect to dashboard
- On 404 (wallet not linked): show message directing user to email login + wallet link

**Step 5: Add to login page**

Add SIWE login button below the existing email/password form with a divider ("or").

**Patterns to follow**:
- Nonce pattern from T7.4 (in-memory store, TTL, one-time use)
- Session cookie creation (reuse from existing login route)
- wagmi for wallet interactions (existing in dashboard)
- Checksum address comparison with `getAddress` from viem
- No body/response JSON schema (R01)
- CSRF header not needed on login (no session yet)

**Edge cases**:
- Wallet not linked to any account: 404 with clear guidance
- Expired nonce: 401 with "nonce expired"
- Replayed signature: nonce consumed on first use
- Wrong chain: SIWE message includes chainId, mismatch rejected
- User with multiple wallets: findFirst by walletAddress (currently one wallet per user)
- User account disabled/deleted: check user status before issuing session
- ERC-1271 smart wallet: the `siwe` package supports ERC-1271 verification (Smart Wallet Coinbase compatibility for free)

**Tests** (~12 tests):
- GET /auth/siwe/nonce returns 200 with nonce string
- POST /auth/siwe/verify with valid signature — 200 with session cookie
- POST /auth/siwe/verify with invalid signature — 401
- POST /auth/siwe/verify with expired nonce — 401
- POST /auth/siwe/verify with replayed nonce — 401
- POST /auth/siwe/verify with wallet not linked — 404
- Session cookie set correctly after SIWE login
- User can access protected routes after SIWE login
- SIWE message includes correct domain and chainId
- Nonce is consumed after use (one-time)
- Wrong chainId in message — rejected
- Checksum address comparison works

**Verify**: Connect wallet in dashboard. Click "Sign in with Wallet". Sign the SIWE message. Session created, redirected to dashboard. Try with unlinked wallet — shows "link wallet first" message. Try replaying signature — rejected.

---

### Brief T8.5: E2E Playwright -- Batch Import, Batch Mint, SIWE Login

**Type**: testing
**Priority**: P2
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/e2e/batch-import.spec.ts` -- NEW: E2E tests for CSV import + batch mint
- `apps/dashboard/e2e/siwe-login.spec.ts` -- NEW: E2E tests for SIWE wallet login
- `apps/api/test/batch-import.test.ts` -- covered in T8.1 (Vitest)
- `apps/api/test/batch-mint.test.ts` -- covered in T8.2 (Vitest)
- `apps/api/test/siwe.test.ts` -- covered in T8.4 (Vitest)

**Approach**:

Write Playwright E2E specs for Sprint #8 dashboard features.

**Spec 1: `batch-import.spec.ts`**

```
describe("Batch CSV Import & Mint")
  - navigate to product list → click "Import CSV" → upload valid CSV → products created
  - upload CSV with invalid rows → error summary shown
  - select imported products → batch mint → all become ACTIVE
  - verify minted products show DID and status ACTIVE in list
```

Setup: create a test CSV file with known valid and invalid rows. Use auth state for BRAND_ADMIN.

**Spec 2: `siwe-login.spec.ts`**

```
describe("SIWE Wallet Login")
  - login page shows "Sign in with Wallet" button
  - SIWE login flow: connect wallet → sign message → redirected to dashboard
  - unlinked wallet shows error message
```

Note: SIWE E2E requires mocking wallet interactions. Use Playwright's route interception to mock the wallet provider, or test the API flow directly via `request` context with pre-signed messages.

**Patterns to follow**:
- Auth: use `storageState` for authenticated tests
- File upload: use Playwright's `setInputFiles` for CSV upload
- Selectors: prefer `getByRole`, `getByText`, `getByLabel`
- Waits: use `expect(locator).toBeVisible({ timeout })` not sleeps
- API testing: use `request.newContext()` for direct API calls

**Edge cases**:
- CSV upload dialog may vary by browser — use Playwright's file chooser API
- SIWE wallet mock: may need custom page.evaluate to inject mock provider
- Batch mint button state: disabled when no products selected

**Verify**: `pnpm --filter dashboard exec playwright test` runs all specs including new ones. All pass.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. Sprint #8 pulls forward non-blocked P1 tasks: batch operations (EPIC-006) and SIWE wallet login (EPIC-005).

🔒 PostgreSQL RLS is NOT included — requires operator approval. Smart Wallet Coinbase (ERC-1271) gets partial coverage through the `siwe` package in T8.4, which supports ERC-1271 verification natively.

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

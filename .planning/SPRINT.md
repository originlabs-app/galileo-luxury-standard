# Sprint — Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #9 — Smart Wallet & Observability

**Goal**: Add ERC-1271 Smart Wallet support for Coinbase Smart Wallet users (both SIWE login and wallet-link), integrate Vercel Analytics for frontend observability, and cover the new auth flows with E2E tests. MFA (🔒) deferred — requires DB migration for TOTP secret storage.
**Started**: 2026-03-09
**Status**: active

## Tasks

| ID | Task | Epic | Status | Verify | Commit |
|------|------|------|--------|--------|--------|
| T9.1 | ERC-1271 Smart Wallet verification (API) | EPIC-005 | todo | Smart Wallet (contract) signatures verified in SIWE login and wallet-link. EOA signatures still work. | |
| T9.2 | Coinbase Smart Wallet connector (dashboard) | EPIC-005 | todo | Dashboard wagmi config includes Coinbase Smart Wallet connector. Users can connect with Coinbase Smart Wallet, sign SIWE messages, and link wallet. | |
| T9.3 | Vercel Analytics integration | EPIC-007 | todo | `@vercel/analytics` active in dashboard and scanner. Page views tracked. No impact on performance or bundle size > 5KB. | |
| T9.4 | E2E Playwright: Smart Wallet + wallet auth flows | EPIC-007 | todo | Playwright specs cover wallet-link with nonce, SIWE login with EOA, and Smart Wallet connector presence. All pass. | |

### Status values
- `todo` — Not started
- `in_progress` — Developer is working on it
- `done` — Developer committed, awaiting validation
- `validated` — Tester confirmed it meets verification criteria
- `blocked` — Cannot proceed, reason in Notes
- `deferred` — Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated, explicitly deferred, or blocked with reason
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### T9.1 — ERC-1271 Smart Wallet Verification (API)

**Type**: security
**Priority**: P1
**Epic**: EPIC-005-security-hardening
**Operator approval**: not required

**Files to modify**:
- `apps/api/src/plugins/chain.ts` — always create publicClient (even without DEPLOYER_PRIVATE_KEY)
- `apps/api/src/routes/auth/siwe.ts` — use publicClient.verifyMessage for ERC-1271 support
- `apps/api/src/routes/auth/link-wallet.ts` — use publicClient.verifyMessage for ERC-1271 support
- `apps/api/test/siwe.test.ts` — add ERC-1271 test cases
- `apps/api/test/link-wallet.test.ts` — add ERC-1271 test cases

**Approach**:

The current SIWE and wallet-link routes use `viem.verifyMessage()` (standalone import) which only does `ecrecover` — EOA verification. Smart Wallets (Coinbase Smart Wallet, Safe, etc.) use ERC-1271: their signatures are verified by calling `isValidSignature(bytes32, bytes)` on the wallet contract. viem's `publicClient.verifyMessage()` automatically handles both: it tries ecrecover first, then falls back to ERC-1271 on-chain verification.

**Step 1: Modify chain plugin to always provide publicClient**

Currently, `chain.ts` only creates `publicClient` when `DEPLOYER_PRIVATE_KEY` is set. For ERC-1271 verification, we only need a publicClient (read-only RPC access, no private key). Restructure so that:
- `publicClient` is ALWAYS created (Base Sepolia with default public RPC)
- `walletClient` is only created when DEPLOYER_PRIVATE_KEY is present
- `chainEnabled` reflects whether the walletClient is available (for minting)

```typescript
// Always create a publicClient for read-only operations (ERC-1271 verification)
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

fastify.decorate("chain", {
  chainEnabled: !!deployerKey,
  publicClient, // Always available
  walletClient, // Only when DEPLOYER_PRIVATE_KEY is set
});
```

**Step 2: Update SIWE verify route**

In `siwe.ts`, replace standalone `verifyMessage` import with `fastify.chain.publicClient.verifyMessage()`:

```typescript
// Before (EOA only):
const { verifyMessage } = await import("viem");
isValid = await verifyMessage({ address, message, signature });

// After (EOA + ERC-1271):
isValid = await fastify.chain.publicClient.verifyMessage({
  address: checksumAddress,
  message,
  signature: signature as `0x${string}`,
});
```

The `publicClient.verifyMessage()` from viem:
1. First tries `ecrecover` (EOA) — no RPC call
2. If that fails, checks if address is a contract via `eth_getCode`
3. If contract, calls `isValidSignature(hash, signature)` via `eth_call`
4. Returns true only if the contract returns the ERC-1271 magic value (`0x1626ba7e`)

**Step 3: Update link-wallet route**

Same change in `link-wallet.ts` — replace standalone `verifyMessage` with `fastify.chain.publicClient.verifyMessage()`.

**Step 4: Update type declarations**

Update the `FastifyInstance` augmentation in `chain.ts` to make `publicClient` non-optional:

```typescript
declare module "fastify" {
  interface FastifyInstance {
    chain: {
      chainEnabled: boolean;
      publicClient: PublicClient; // Always available
      walletClient?: WalletClient; // Only with deployer key
    };
  }
}
```

**Step 5: Handle test environment**

In tests, `chain` plugin is sometimes mocked. Ensure the mock includes a `publicClient` with a `verifyMessage` method. For SIWE and link-wallet tests that mock viem:
- Update the mock to provide `publicClient.verifyMessage` instead of standalone `verifyMessage`
- Keep the same test patterns (vi.mock before imports)

**Patterns to follow**:
- Plugin architecture: fp() plugins decorate fastify instance (chain.ts)
- viem publicClient for read-only chain operations
- Mock decorators pattern for isolated route tests (R17)
- vi.mock() before imports (R06)
- No body/response schema changes (R01)

**Edge cases**:
- Smart Wallet on a chain not supported by our RPC: publicClient is configured for Base Sepolia only. Smart Wallets on other chains will fail ERC-1271 verification (expected — we only support Base Sepolia)
- EOA fallback: ecrecover is tried first, so existing EOA flows are unaffected. No RPC call needed for EOA signatures.
- RPC unavailable: if the public RPC is down, ERC-1271 verification fails (ecrecover still works for EOA). The error is caught and returns 401.
- publicClient in test env: tests can mock `fastify.chain.publicClient.verifyMessage` to control verification results
- Smart Wallet not deployed yet: if the contract doesn't exist at the address, `eth_getCode` returns empty, verification fails — correct behavior

**Tests** (~8 tests across siwe.test.ts and link-wallet.test.ts):
- SIWE verify with EOA signature still works (regression)
- SIWE verify with Smart Wallet signature (mock publicClient returns true)
- SIWE verify with invalid Smart Wallet signature (mock returns false) — 401
- Link-wallet with EOA signature still works (regression)
- Link-wallet with Smart Wallet signature (mock publicClient returns true)
- Link-wallet with Smart Wallet signature invalid (mock returns false) — 400
- publicClient.verifyMessage called with correct params
- RPC error during ERC-1271 check — returns 401 gracefully

**Verify**: Deploy a test with mocked publicClient. EOA signatures work as before. Smart Wallet signatures verified via publicClient.verifyMessage. Invalid signatures rejected. RPC errors handled gracefully.

---

### T9.2 — Coinbase Smart Wallet Connector (Dashboard)

**Type**: UI
**Priority**: P1
**Epic**: EPIC-005-security-hardening
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/src/lib/wallet.ts` — add Coinbase Smart Wallet connector to wagmi config
- `apps/dashboard/src/components/siwe-login.tsx` — support Smart Wallet connector selection
- `apps/dashboard/src/components/wallet-connection.tsx` — support Smart Wallet connector for wallet-link

**Approach**:

Add Coinbase Smart Wallet as a connector option in the wagmi configuration. Coinbase Smart Wallet uses the `coinbaseWallet` connector from wagmi with `preference: 'smartWalletOnly'` for smart wallet, or `preference: 'all'` to support both EOA and Smart Wallet.

**Step 1: Add Coinbase Wallet connector**

In `apps/dashboard/src/lib/wallet.ts`:

```typescript
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const walletConfig = createConfig({
  chains: [walletChain],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: "Galileo Protocol",
      preference: "all", // Support both EOA (Coinbase Wallet) and Smart Wallet
    }),
  ],
  ssr: true,
  transports: {
    [walletChain.id]: http(),
  },
});
```

The `coinbaseWallet` connector from wagmi v3 natively supports:
- **EOA**: Traditional Coinbase Wallet (browser extension, mobile)
- **Smart Wallet**: Coinbase Smart Wallet (passkey-based, gasless)

When `preference: "all"`, the user chooses between EOA and Smart Wallet in the Coinbase Wallet UI. The signature mechanism adapts automatically — Smart Wallet signs via ERC-1271, EOA signs via ecrecover. No code changes needed in the signing flow.

**Step 2: Update SIWE login component**

In `siwe-login.tsx`, update to allow connector selection when multiple connectors are available:

```typescript
// Instead of always using injected(), let the user choose:
const { connectors } = useConnect();

// Try Coinbase Wallet first (if available), then injected
const connector = connectors.find(c => c.id === "coinbaseWalletSDK") ?? connectors[0];
const result = await connectAsync({ connector });
```

Alternatively, keep it simple: add a second "Sign in with Coinbase Wallet" button that uses the `coinbaseWallet` connector explicitly.

Recommended approach: **Two buttons** — "Sign in with Wallet" (injected/MetaMask) and "Sign in with Coinbase" (coinbaseWallet). This is clearer UX than a single button with a connector picker.

**Step 3: Update wallet-connection component**

Same pattern for wallet-link: add Coinbase Wallet as a connector option. If the user is already connected via Coinbase Smart Wallet, the link-wallet flow uses the same connector for signing.

**Patterns to follow**:
- wagmi v3 connectors pattern (existing in wallet.ts)
- shadcn Button component for UI
- Lucide icons for wallet brand indicators
- Keep SSR compatibility (ssr: true in wagmi config)
- No breaking changes to existing MetaMask/injected flow

**Edge cases**:
- User has both MetaMask and Coinbase Wallet installed: both buttons visible, user chooses
- Coinbase Wallet not installed: button still works — Coinbase SDK opens a popup/redirect for wallet creation
- Smart Wallet passkey: signing uses WebAuthn — transparent to our code (wagmi handles it)
- Mobile: Coinbase Wallet mobile app opens for signing via WalletConnect or deep link
- SSR: connector initialization deferred to client (wagmi handles with ssr: true)

**Tests**: Covered by T9.4 E2E specs.

**Verify**: Open login page — two wallet buttons visible (injected + Coinbase). Click "Sign in with Coinbase" — Coinbase Wallet SDK initiates connection. Sign SIWE message via Smart Wallet — session created. Navigate to wallet-link — Coinbase connector available for linking.

---

### T9.3 — Vercel Analytics Integration

**Type**: observability
**Priority**: P2
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/src/app/layout.tsx` — add Analytics component
- `apps/dashboard/package.json` — add @vercel/analytics dependency
- `apps/scanner/src/app/layout.tsx` — add Analytics component
- `apps/scanner/package.json` — add @vercel/analytics dependency

**Approach**:

Add Vercel Analytics to both dashboard and scanner apps. Vercel Analytics is a lightweight (~1KB) client-side analytics library that tracks page views automatically. It works on any hosting provider (not just Vercel) in development mode, and provides full analytics on Vercel-hosted apps.

**Step 1: Install @vercel/analytics**

```bash
pnpm --filter dashboard add @vercel/analytics
pnpm --filter scanner add @vercel/analytics
```

**Step 2: Add Analytics component to dashboard layout**

In `apps/dashboard/src/app/layout.tsx`:

```typescript
import { Analytics } from "@vercel/analytics/next";

// In the return, after {children}:
<Analytics />
```

The `Analytics` component:
- Auto-tracks page views (route changes via Next.js router)
- No configuration needed for basic page view tracking
- No-op in development (unless `VERCEL_ANALYTICS_ID` is set)
- ~1KB bundle size impact
- Respects Do Not Track browser setting

**Step 3: Add Analytics component to scanner layout**

Same pattern in `apps/scanner/src/app/layout.tsx`:

```typescript
import { Analytics } from "@vercel/analytics/next";

// After {children} and <RegisterSW />:
<Analytics />
```

**Step 4: Verify no impact on tests**

The Analytics component renders nothing in non-Vercel environments. It should not affect existing E2E tests or unit tests. Verify by running the full test suite.

**Patterns to follow**:
- Next.js App Router: component goes in root layout.tsx
- Import from `@vercel/analytics/next` (not `@vercel/analytics/react`) for App Router
- No environment variable configuration needed for basic setup
- Graceful no-op when not deployed on Vercel (R30 pattern — optional integration)

**Edge cases**:
- Not deployed on Vercel yet: Analytics is a no-op, zero impact
- PWA scanner: Analytics works in PWA mode (it's a standard script)
- CSP headers: if helmet is configured in production, may need to allow Vercel Analytics script domain (`vitals.vercel-insights.com`). Currently helmet is disabled in test, and production CSP is not yet configured.
- Ad blockers: some ad blockers block Vercel Analytics. This is expected behavior — analytics should never block the app.

**Tests**: No specific tests needed — verify existing tests still pass after adding the component. Analytics is a passive observer, not testable in unit/E2E without Vercel deployment.

**Verify**: Add Analytics component. Run `pnpm turbo typecheck` — passes. Run `pnpm test` — all 369 tests pass. Run `pnpm turbo build` — builds successfully. In dev mode, Analytics component renders without errors in browser console.

---

### T9.4 — E2E Playwright: Smart Wallet + Wallet Auth Flows

**Type**: testing
**Priority**: P2
**Epic**: EPIC-007-observability-quality
**Operator approval**: not required

**Files to modify**:
- `apps/dashboard/e2e/wallet-auth.spec.ts` — NEW: comprehensive wallet auth E2E tests
- `apps/dashboard/e2e/siwe-login.spec.ts` — extend with Smart Wallet connector test

**Approach**:

Write Playwright E2E specs covering the wallet authentication flows: wallet-link with nonce, SIWE login, and Coinbase Smart Wallet connector availability. Smart Wallet signing cannot be fully E2E tested (requires real wallet interaction), but we can verify the connector is present and the UI flow works up to the signing step.

**Spec 1: `wallet-auth.spec.ts`**

```
describe("Wallet Auth Flows")
  - login page shows "Sign in with Wallet" button (injected)
  - login page shows "Sign in with Coinbase" button (Smart Wallet)
  - wallet-link page: nonce fetched before signing
  - API: GET /auth/siwe/nonce returns valid nonce
  - API: POST /auth/siwe/verify with valid signature returns session
  - API: POST /auth/siwe/verify with invalid signature returns 401
  - API: POST /auth/link-wallet with valid nonce + signature succeeds
  - API: POST /auth/link-wallet with replayed nonce returns 400
```

Testing approach:
- **UI presence**: verify buttons render with correct labels
- **API flow**: use Playwright `request` context for direct API calls with pre-signed messages
- **Nonce lifecycle**: test create → consume → reject-replay via API
- **Smart Wallet**: verify the Coinbase connector is listed in wagmi config (check for button in UI)

**Spec 2: Extend `siwe-login.spec.ts`**

Add test for Coinbase Smart Wallet button presence:

```
- "Sign in with Coinbase" button is visible on login page
- clicking it opens Coinbase Wallet SDK (mock/intercept the SDK call)
```

**Patterns to follow**:
- Auth: use `storageState` for authenticated tests (wallet-link requires auth)
- API testing: use `request.newContext()` for direct API calls
- Selectors: prefer `getByRole`, `getByText`
- Waits: use `expect(locator).toBeVisible({ timeout })` not sleeps
- Do not test actual wallet signing (requires real wallet extension) — test up to the signing step, mock the rest

**Edge cases**:
- Coinbase Wallet SDK popup: cannot test real popup in Playwright — verify button exists and click triggers
- Wallet extensions: Playwright headless mode doesn't have wallet extensions — use API-level tests for signature verification
- SIWE message format: test the API contract, not the browser signing

**Tests**: ~8 Playwright specs across the two files.

**Verify**: `pnpm --filter dashboard exec playwright test` runs all specs including new ones. All pass. Login page shows both wallet buttons. API-level wallet auth flows tested comprehensively.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
<!-- Operator approvals: "Approved: T{N}.{M} — {reason}" -->
<!-- Blocked reasons: "Blocked: T{N}.{M} — {reason}" -->

Sprint #6 (Real Chain Unblock) remains BLOCKED on RPC key. Sprint #9 focuses on Smart Wallet support and observability.

🔒 MFA (TOTP + passkey) is NOT included — requires DB migration to add `totpSecret`, `totpEnabled` fields to User model. Deferred to a future sprint after operator approval.

🔒 PostgreSQL RLS is NOT included — requires operator approval (unchanged from Sprint #8).

## Archive

<!-- When this sprint is complete, the Researcher:
     1. Moves deferred tasks back to BACKLOG.md (original priority)
     2. Moves blocked tasks back to BACKLOG.md (P1 + blocking reason)
     3. Archives this file to .planning/archive/sprint-{N}.md (IDs preserved)
     4. Syncs EPICs: checks off validated tasks in epics/EPIC-{NNN}-{slug}.md
-->

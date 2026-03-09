# Integrations

## Snapshot

The implemented integration surface is centered on PostgreSQL, wallet-based auth on Base Sepolia tooling, optional Cloudflare R2 object storage, optional Sentry, outbound HTTPS webhooks, Vercel deployment metadata, and GitHub Actions CI. Several future-facing services are mentioned in env examples or contract comments, but are not wired into the running app code.

## Database And Persistence

- PostgreSQL is the only application database actually configured.
- Prisma models and the datasource live in `apps/api/prisma/schema.prisma`.
- Runtime DB connections are created from `DATABASE_URL` in `apps/api/src/plugins/prisma.ts`.
- CI provisions PostgreSQL 16 as a service container in `.github/workflows/ci.yml`.
- There is no implemented MySQL, SQLite, MongoDB, Redis, or external hosted DB SDK in the application code.

## Auth And Identity

### First-party auth

- Email/password auth is first-party and API-local, not outsourced to an auth SaaS.
- JWT access and refresh cookies are issued by Fastify JWT in `apps/api/src/plugins/auth.ts`.
- Cookie handling is configured in `apps/api/src/plugins/cookie.ts`.
- Password hashing lives in `apps/api/src/utils/password.ts`.

### Wallet auth and wallet linking

- Wallet linking uses signed EIP-191 messages through `apps/api/src/routes/auth/link-wallet.ts` and helpers in `packages/shared/src/validation/wallet.ts`.
- SIWE login is implemented in `apps/api/src/routes/auth/siwe.ts`.
- Nonce storage for both SIWE and link-wallet flows is in-memory:
  - `apps/api/src/services/siwe.ts`
  - `apps/api/src/routes/auth/nonce.ts`
- Because nonce state is in-memory, it is not durable across API restarts and is not shared across multiple API instances.
- There is no Redis-backed nonce store, OAuth provider, SAML integration, or passkey/WebAuthn implementation in the current repo.

## Blockchain, Wallet, And Smart Contract Integrations

### Application-side chain access

- The API creates a `viem` `publicClient` against `baseSepolia` in `apps/api/src/plugins/chain.ts`.
- If `DEPLOYER_PRIVATE_KEY` is present, the same plugin also creates a `walletClient`; otherwise chain write features remain disabled.
- Current live API chain usage is read/verification oriented:
  - ERC-1271/EOA message verification for wallet linking in `apps/api/src/routes/auth/link-wallet.ts`
  - ERC-1271/EOA SIWE signature verification in `apps/api/src/routes/auth/siwe.ts`
  - RPC health probing in `apps/api/src/routes/health.ts`
- Product mint routes are not yet backed by real chain writes. Both `apps/api/src/routes/products/mint.ts` and `apps/api/src/routes/products/batch-mint.ts` return `503 NOT_IMPLEMENTED` when chain mode is enabled and otherwise generate synthetic `txHash`/`tokenAddress` values.

### Dashboard wallet connectors

- The dashboard uses `wagmi` with `baseSepolia` in `apps/dashboard/src/lib/wallet.ts`.
- Implemented wallet connectors are:
  - injected browser wallets
  - Coinbase Wallet / Coinbase Smart Wallet via `coinbaseWallet`
- The dashboard calls the API for auth and product actions through `apps/dashboard/src/lib/api.ts`; it does not write directly to contracts.

### Contract deployment and verification

- Foundry deployment env examples in `contracts/.env.example` define:
  - `BASE_SEPOLIA_RPC`
  - `BASE_MAINNET_RPC`
  - `DEPLOYER_PRIVATE_KEY`
  - `BASESCAN_API_KEY`
- The deployment script is `contracts/script/Deploy.s.sol`.
- Contract remappings show direct dependency on vendored ONCHAINID / ERC-3643-era code in `contracts/foundry.toml`.

### Future/placeholder chain integrations that are not wired

- `contracts/script/Deploy.s.sol` contains a comment/TODO for a sanctions oracle, but no external oracle client is implemented in the application code.
- Root `.env.testnet.example` mentions KYC provider credentials and a price-feed address, but those values are not consumed by `apps/api/src/config.ts` or the frontend runtime code.

## Storage And Content Addressing

- Product image uploads go through `apps/api/src/routes/products/upload.ts`.
- Storage abstraction is implemented in `apps/api/src/plugins/storage.ts`.
- When `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` are present, the API uses Cloudflare R2 through the S3-compatible AWS SDK endpoint `https://<account>.r2.cloudflarestorage.com`.
- Public asset URLs come from `R2_PUBLIC_URL` when set, otherwise the code falls back to the R2 `r2.dev` URL shape in `apps/api/src/plugins/storage.ts`.
- Without R2 credentials, uploads fall back to the local filesystem under an `uploads/` directory resolved from the API process working directory.
- Image payloads are content-addressed with CIDv1 generation in `apps/api/src/utils/cid.ts`; this is local hashing logic, not an IPFS pinning integration.
- There is no implemented external IPFS pinning service, CDN invalidation hook, or media processing pipeline.

## Outbound HTTP And Webhooks

- The API supports outbound brand webhook subscriptions through `apps/api/src/routes/webhooks/index.ts`.
- Deliveries are signed with HMAC-SHA256 in `apps/api/src/services/webhooks/delivery.ts` and sent with `fetch()` to subscriber URLs.
- Webhook-triggering product events are enqueued from routes such as:
  - `apps/api/src/routes/products/mint.ts`
  - `apps/api/src/routes/products/batch-mint.ts`
  - `apps/api/src/routes/products/transfer.ts`
  - `apps/api/src/routes/products/verify.ts`
- Queueing and retries are implemented by an in-memory outbox in `apps/api/src/services/webhooks/outbox.ts`.
- Background processing starts on API boot in `apps/api/src/server.ts` via `startWorker()`.
- Because the outbox is in-memory, queued deliveries and subscriptions are lost on process restart and are not shared across replicas.
- No inbound third-party webhooks were found; the `/webhooks` routes manage outbound subscription state only.

## Observability, Analytics, And Browser Platform Integrations

- Optional backend error reporting uses Sentry via `SENTRY_DSN` in `apps/api/src/plugins/sentry.ts`.
- Vercel Analytics is included in:
  - `apps/dashboard/src/app/layout.tsx`
  - `apps/scanner/src/app/layout.tsx`
  - `website/src/app/layout.tsx`
- The scanner integrates with browser platform features rather than external services:
  - `navigator.mediaDevices.getUserMedia()` in `apps/scanner/src/app/scan/page.tsx`
  - Service worker registration in `apps/scanner/src/app/register-sw.tsx`
  - Offline caching logic in `apps/scanner/public/sw.js`
- No Datadog, New Relic, Segment, Mixpanel, or OpenTelemetry integration was found.

## Hosting, Deployment, And CI/CD

- GitHub Actions is the implemented CI surface:
  - `.github/workflows/ci.yml` runs lint, typecheck, Vitest, Playwright, Foundry tests, and website build.
  - `.github/workflows/lighthouse.yml` waits for a Vercel preview deployment and audits the resulting website URLs.
- Vercel-specific deployment metadata exists for:
  - `apps/dashboard/vercel.json`
  - `apps/scanner/vercel.json`
  - `website/vercel.json`
- The website workflow clearly expects Vercel preview URLs because Lighthouse waits on `patrickedqvist/wait-for-vercel-preview`.
- The API has a Docker deployment surface in `apps/api/Dockerfile`.
- No Railway, Render, Fly.io, ECS, Kubernetes, or Terraform deployment definitions were found.

## Env-Driven Dependency Map

| Env/config | Used by | Effect |
| --- | --- | --- |
| `DATABASE_URL` | `apps/api/src/config.ts`, `apps/api/src/plugins/prisma.ts` | PostgreSQL connection for the API |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | `apps/api/src/config.ts`, `apps/api/src/plugins/auth.ts` | Cookie-backed JWT auth |
| `COOKIE_SECRET` | `apps/api/src/config.ts`, `apps/api/src/plugins/cookie.ts` | Cookie signing |
| `CORS_ORIGIN` | `apps/api/src/config.ts`, `apps/api/src/plugins/cors.ts` | Allowed frontend origin for API cookies/requests |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | `apps/api/src/config.ts`, `apps/api/src/plugins/storage.ts` | Switches image storage from local disk to Cloudflare R2 |
| `SENTRY_DSN` | `apps/api/src/config.ts`, `apps/api/src/plugins/sentry.ts` | Enables backend exception reporting |
| `DEPLOYER_PRIVATE_KEY` | `apps/api/src/plugins/chain.ts` | Enables API-side `walletClient` creation |
| `NEXT_PUBLIC_API_URL` | `apps/dashboard/src/lib/constants.ts` | Points dashboard requests at the API base URL |
| `BASE_SEPOLIA_RPC`, `BASE_MAINNET_RPC`, `BASESCAN_API_KEY` | `contracts/.env.example`, `contracts/script/Deploy.s.sol` usage docs | Contract deployment and verification inputs |
| `.github/workflows/ci.yml` env block | CI jobs | Provides local test DB/auth/API wiring for automated runs |

## Explicit Absences

- No external KYC provider is wired into runtime code, even though `.env.testnet.example` has placeholders.
- No external price-feed/oracle client is wired into runtime code.
- No payment gateway, billing system, or fiat checkout integration was found.
- No external email, SMS, push notification, or CRM integration was found.
- No Redis, SQS, Kafka, RabbitMQ, or durable workflow engine is currently used for background work.

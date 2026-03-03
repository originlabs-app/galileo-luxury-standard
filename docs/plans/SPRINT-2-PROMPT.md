# Sprint 2 — Product & Passport Creation

## Goal

A brand-admin creates a product (with GTIN validation), mints its ERC-3643 token on Base Sepolia, and anyone can resolve the Digital Product Passport via a GS1 Digital Link URL. Security debt from Sprint 1 review is cleared.

---

## Prerequisites (from Sprint 1)

- Monorepo: Turborepo + pnpm, `@galileo/shared` with GTIN validation and DID generation
- API: Fastify 5 on port 4000, Prisma 7, JWT auth (register/login/refresh/me), RBAC middleware
- Dashboard: Next.js on port 3000, ABYSSE theme, shadcn/ui, auth flow working
- DB schema: User, Brand, Product, ProductPassport, ProductEvent models already exist
- Contracts: ERC-3643 GalileoToken with Deploy.s.sol, 722 Foundry tests passing
- Smart contracts on `contracts/` directory (NOT in pnpm workspace — Foundry only)

---

## Milestone 1: security-debt

Clear security findings deferred from Sprint 1 code review.

### Feature: httponly-cookie-auth (C3)

Migrate token storage from localStorage to httpOnly cookies.

**Backend changes (apps/api):**
- Register/login/refresh endpoints set `Set-Cookie` headers instead of returning tokens in JSON body
- Access token: `httpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=900` (15 min)
- Refresh token: `httpOnly`, `Secure`, `SameSite=Strict`, `Path=/auth/refresh`, `Max-Age=604800` (7 days)
- Add `POST /auth/logout` endpoint that clears both cookies and nullifies refresh token in DB
- `authenticate` hook reads token from `Cookie` header instead of `Authorization` header
- Swagger/docs endpoints bypass cookie auth (dev only, already guarded by NODE_ENV)
- CORS: ensure `credentials: true` is set

**Frontend changes (apps/dashboard):**
- Remove all `localStorage.getItem/setItem` for tokens in `src/lib/auth.ts`
- `src/lib/api.ts`: add `credentials: 'include'` to all fetch calls
- Remove `Authorization: Bearer` header injection — cookies are sent automatically
- `isAuthenticated()` check: call a lightweight `/auth/me` or `/auth/check` endpoint instead of checking localStorage
- Refresh logic: on 401, call `/auth/refresh` (cookie sent automatically), retry original request
- Logout: call `POST /auth/logout`, redirect to `/login`

**Test updates:**
- `test/auth.test.ts`: update to check `Set-Cookie` headers in responses instead of JSON tokens
- Add test for cookie attributes (httpOnly, Secure, SameSite)
- Add test for `/auth/logout`

### Feature: pin-dependencies (I11)

Pin all `"latest"` dependencies to exact semver versions across the monorepo.

- Run `pnpm ls --depth=0` in each workspace package to get resolved versions
- Replace `"latest"` with exact versions (e.g., `"fastify": "5.2.1"`) in:
  - `package.json` (root)
  - `apps/api/package.json`
  - `apps/dashboard/package.json`
  - `apps/scanner/package.json`
  - `packages/shared/package.json`
- Run `pnpm install` to verify lockfile is consistent
- Run `pnpm build && pnpm test && pnpm typecheck && pnpm lint` to confirm nothing breaks

### Feature: test-db-isolation (I10)

Isolate test database from development database.

- Create `galileo_test` database: `psql -c "CREATE DATABASE galileo_test" postgres`
- In `apps/api/vitest.config.ts`, set `env.DATABASE_URL` to `postgresql://localhost:5432/galileo_test`
- In `.github/workflows/ci.yml`, the CI already uses `galileo_test` — verify consistency
- Add `test:setup` script to `apps/api/package.json`: `prisma db push --force-reset` against test DB
- Run `test:setup` in `beforeAll` or as a pre-test script

### Feature: shared-type-split (I2)

Split `User` interface into backend-only and shared variants.

- In `packages/shared/src/types/user.ts`:
  - Rename current `User` to `UserInternal` and mark with `@internal` JSDoc
  - Export `UserPublic` (without `passwordHash`, `refreshToken`) as the primary `User` type
  - Keep `UserInternal` exported for backend use but document it as backend-only
- Update `packages/shared/src/index.ts` exports accordingly
- Update API code to use `UserInternal` where needed (internal routes)
- Dashboard should only ever import `User` (the public variant)

### Feature: shared-validation-fixes (I3, I4)

Fix URL encoding and DID validation in shared package.

- `packages/shared/src/validation/did.ts`:
  - `generateDigitalLinkUrl()`: URL-encode both `gtin` and `serial` with `encodeURIComponent()`
  - `generateDid()`: no change needed (DIDs don't need URL encoding)
  - `validateDid()`: after regex match, call `validateGtin()` on the extracted GTIN segment
- Add tests for special characters in serial (e.g., `SN/001`, `SN 002`, `SN#003`)
- Add tests for invalid GTIN check digits in DID strings

### Feature: seed-env-password (I9)

Read seed password from environment variable.

- In `apps/api/prisma/seed.ts`:
  - Read `SEED_PASSWORD` from `process.env`
  - If not set and `NODE_ENV === 'production'`, throw an error
  - If not set and `NODE_ENV !== 'production'`, use a default (e.g., `"dev-seed-changeme123"`)
- Update `apps/api/.env.example` to include `SEED_PASSWORD=`

### Feature: api-url-production-guard (I15)

Fail fast if `NEXT_PUBLIC_API_URL` is missing in production.

- In `apps/dashboard/src/lib/constants.ts`:
  - Add a runtime check: if `process.env.NODE_ENV === 'production'` and `NEXT_PUBLIC_API_URL` is not set, throw an error
  - Keep `http://localhost:4000` fallback for development only

---

## Milestone 2: product-crud

Product CRUD API endpoints with GTIN validation, DID generation, and RBAC.

### Feature: product-endpoints

**New files:**
- `apps/api/src/routes/products/index.ts` — route registration
- `apps/api/src/routes/products/create.ts` — POST /products
- `apps/api/src/routes/products/list.ts` — GET /products
- `apps/api/src/routes/products/get.ts` — GET /products/:id
- `apps/api/src/routes/products/update.ts` — PATCH /products/:id

**POST /products** (authenticated, BRAND_ADMIN or OPERATOR):
```
Body: { name, gtin, serialNumber, category, description? }

Validation:
- gtin: validate with validateGtin() from @galileo/shared (GS1 check digit)
- serialNumber: non-empty string, max 128 chars
- name: non-empty, max 256 chars
- category: one of the PRODUCT_CATEGORIES from @galileo/shared
- @@unique(gtin, serialNumber) — return 409 on collision

Logic:
1. Validate GTIN check digit
2. Generate DID: did:galileo:01:{gtin}:21:{serialNumber}
3. Generate Digital Link URL: https://id.galileoprotocol.io/01/{gtin}/21/{serialNumber}
4. Create Product row (status: DRAFT)
5. Create ProductPassport row with digitalLink
6. Create ProductEvent (type: CREATED, performedBy: user.id)
7. Return product with passport and DID

Response 201:
{
  success: true,
  data: {
    product: { id, gtin, serialNumber, did, name, description, category, status, brandId, createdAt, updatedAt },
    passport: { id, productId, digitalLink, metadata, createdAt },
    did: "did:galileo:01:...:21:..."
  }
}
```

**GET /products** (authenticated, BRAND_ADMIN or OPERATOR):
```
Query params: ?status=DRAFT&page=1&limit=20
- Filter by brand (from JWT brandId) — users only see their own brand's products
- Filter by status (optional)
- Paginated response with total count
- Include passport digitalLink

Response 200:
{
  success: true,
  data: { products: [...], pagination: { page, limit, total, totalPages } }
}
```

**GET /products/:id** (authenticated):
```
- Fetch product with passport and recent events
- RBAC: BRAND_ADMIN/OPERATOR can only see their brand's products; ADMIN can see all
- 404 if not found or not authorized

Response 200:
{
  success: true,
  data: { product, passport, events: [...] }
}
```

**PATCH /products/:id** (authenticated, BRAND_ADMIN or OPERATOR):
```
Body: { name?, description?, category? }
- Only DRAFT products can be updated
- Cannot change gtin, serialNumber, or did after creation
- Create ProductEvent (type: UPDATED)
- 403 if product belongs to different brand
- 400 if product is not DRAFT

Response 200: { success: true, data: { product } }
```

**Tests (apps/api/test/products.test.ts):**
- Create product with valid GTIN → 201, DID generated correctly
- Create product with invalid GTIN check digit → 400
- Create product with duplicate GTIN+serial → 409
- List products filtered by brand → only own brand's products
- Get product by ID → 200 with passport and events
- Get product from different brand → 404
- Update DRAFT product → 200
- Update ACTIVE product → 400
- Unauthenticated request → 401
- VIEWER role → 403 on create/update

**Register routes in server.ts:**
```ts
import productRoutes from "./routes/products/index.js";
await fastify.register(productRoutes);
```

---

## Milestone 3: mint-flow

Mint ERC-3643 tokens on Base Sepolia with server-side signing.

### Feature: contract-deployment-sepolia

Deploy the full Galileo contract stack on Base Sepolia.

**Steps:**
1. Set up a dedicated testnet deployer wallet (NEVER use mainnet keys)
2. Fund with Base Sepolia ETH via faucets
3. Create `contracts/.env` from `contracts/.env.example`:
   ```
   DEPLOYER_PRIVATE_KEY=0x...
   BASE_SEPOLIA_RPC=https://sepolia.base.org
   BASESCAN_API_KEY=...
   ```
4. Deploy:
   ```bash
   cd contracts
   forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify --etherscan-api-key $BASESCAN_API_KEY
   ```
5. Record deployed addresses in `contracts/deployments/base-sepolia.json` (committed, no secrets)
6. Post-deploy: grant AGENT_ROLE to the API's operational wallet

### Feature: viem-chain-client

Add viem client for Base Sepolia chain interaction in the API.

**New dependencies (apps/api):**
- `viem` — chain interaction

**New files:**
- `apps/api/src/chain/client.ts` — viem public + wallet client setup
- `apps/api/src/chain/contracts.ts` — contract ABIs and addresses
- `apps/api/src/chain/abi/GalileoToken.json` — ABI extracted from `contracts/out/GalileoToken.sol/GalileoToken.json`

**Config additions (apps/api/src/config.ts):**
```
BASE_SEPOLIA_RPC: z.string().url().optional()
DEPLOYER_PRIVATE_KEY: z.string().optional()
CONTRACT_ADDRESSES_PATH: z.string().optional()
```
All optional — API works without chain features if not configured.

**client.ts:**
```ts
import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Public client for reads
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(config.BASE_SEPOLIA_RPC),
});

// Wallet client for writes (server-side signing with deployer key)
export const walletClient = createWalletClient({
  account: privateKeyToAccount(config.DEPLOYER_PRIVATE_KEY as `0x${string}`),
  chain: baseSepolia,
  transport: http(config.BASE_SEPOLIA_RPC),
});
```

**contracts.ts:**
Load contract addresses from `contracts/deployments/base-sepolia.json` and export typed references.

### Feature: mint-endpoint

Add `POST /products/:id/mint` endpoint.

**Schema changes (prisma/schema.prisma):**
Add to `ProductPassport`:
```prisma
txHash      String?   // Mint transaction hash
tokenAddress String?  // Deployed GalileoToken contract address
chainId     Int?      // Chain ID (84532 for Base Sepolia)
mintedAt    DateTime? // When the token was minted on-chain
```

Add to `Product`:
```prisma
walletAddress String? // Owner wallet address on-chain
```

**POST /products/:id/mint** (authenticated, BRAND_ADMIN):
```
Preconditions:
- Product exists and belongs to user's brand
- Product status is DRAFT
- Chain config is set (BASE_SEPOLIA_RPC, DEPLOYER_PRIVATE_KEY)
- Product passport exists

Flow:
1. Validate preconditions
2. Prepare GalileoToken constructor args from product data:
   - tokenName: product.name
   - tokenSymbol: `GLP-${product.id.slice(0, 6)}`
   - productDID: product.did
   - productCategory: product.category
   - brandDID: product.brand.did
   - productURI: product.passport.digitalLink
   - gtin: product.gtin
   - serialNumber: product.serialNumber
3. Deploy new GalileoToken contract via walletClient
4. Wait for transaction receipt
5. Grant AGENT_ROLE to deployer on the new token
6. Mint the single token to deployer wallet (token.mint(deployer, 1))
7. Update ProductPassport: txHash, tokenAddress, chainId, mintedAt
8. Update Product: status = ACTIVE, walletAddress = deployer
9. Create ProductEvent (type: CREATED with on-chain data)

Response 200:
{
  success: true,
  data: {
    product: { ...product, status: "ACTIVE" },
    passport: { ...passport, txHash, tokenAddress, chainId, mintedAt },
    transaction: { hash, blockNumber, gasUsed }
  }
}

Error cases:
- 400: product not DRAFT, or chain not configured
- 404: product not found
- 500: chain interaction failed (with error details logged, not exposed)
```

**Important: server-side signing.** In Sprint 2 we use the deployer wallet for all mints (simplified). Sprint 3+ will add wallet linking for brand-admin signing via wagmi/RainbowKit.

**Tests:**
- Mock viem clients in tests (no real chain calls in unit tests)
- Test precondition validation (wrong status, wrong brand, missing config)
- Test happy path with mocked chain response

---

## Milestone 4: resolver-qr

GS1 Digital Link resolver and QR code generation.

### Feature: gs1-resolver

Add public resolver endpoint that returns DPP data from a GS1 Digital Link URL.

**New files:**
- `apps/api/src/routes/resolver.ts`

**GET /01/:gtin/21/:serial** (public, no auth):
```
Flow:
1. Validate GTIN format (13 or 14 digits, valid check digit)
2. Look up Product by gtin + serialNumber
3. If not found → 404
4. Fetch ProductPassport and recent ProductEvents
5. If product is ACTIVE and has on-chain data, optionally verify on-chain (read tokenAddress)
6. Return DPP response

Response 200 (application/json):
{
  "@context": "https://schema.org",
  "@type": "Product",
  "identifier": {
    "did": "did:galileo:01:{gtin}:21:{serial}",
    "gtin": "{gtin}",
    "serialNumber": "{serial}"
  },
  "name": "...",
  "brand": { "name": "...", "did": "did:galileo:brand:..." },
  "category": "...",
  "description": "...",
  "status": "ACTIVE",
  "digitalLink": "https://id.galileoprotocol.io/01/{gtin}/21/{serial}",
  "onChain": {
    "tokenAddress": "0x...",
    "chainId": 84532,
    "txHash": "0x...",
    "mintedAt": "..."
  },
  "events": [
    { "type": "CREATED", "timestamp": "...", "actor": "..." }
  ]
}

404: { success: false, error: { code: "NOT_FOUND", message: "Product not found" } }
```

**Content negotiation (stretch goal):**
- `Accept: application/json` → JSON DPP (default)
- `Accept: text/html` → redirect to dashboard product page or a public DPP viewer
- `Accept: application/linkset+json` → GS1 linkset format

**Register in server.ts.**

**Tests:**
- Valid GTIN+serial → 200 with correct DPP structure
- Invalid GTIN (bad check digit) → 400
- Non-existent product → 404
- DRAFT product (not minted) → 200 but `onChain: null`

### Feature: qr-generation

Add QR code generation endpoint and dashboard integration.

**New dependency (apps/api):**
- `qrcode` (or `qr-image`) — QR code generation

**GET /products/:id/qr** (authenticated):
```
Flow:
1. Fetch product and passport
2. Generate QR code from passport.digitalLink URL
3. Return PNG image

Response 200 (image/png): QR code image
Query params: ?size=300 (default 300px)
```

**Dashboard integration (apps/dashboard):**
- Product detail page: show QR code image from `/products/:id/qr`
- Download button: download QR as PNG file
- Display Digital Link URL below QR code

---

## Milestone 5: dashboard-products

Dashboard pages for product management.

### Feature: product-list-page

Update `apps/dashboard/src/app/dashboard/products/page.tsx`:
- Replace empty state with actual product list
- Fetch `GET /products` from API
- Display table: Name, GTIN, Serial, Status badge, Created date
- Status badges: DRAFT (gray), ACTIVE (green/cyan), TRANSFERRED (blue), RECALLED (red)
- "Create Product" button → navigates to `/dashboard/products/new`
- Empty state when no products: "No products yet. Create your first product."
- Pagination controls

### Feature: product-create-page

New page `apps/dashboard/src/app/dashboard/products/new/page.tsx`:
- Form fields: Name, GTIN (with check digit validation client-side), Serial Number, Category (dropdown from PRODUCT_CATEGORIES), Description (optional)
- Client-side GTIN validation using `validateGtin()` from `@galileo/shared` — show error before submit
- On submit: POST /products → redirect to product detail page
- Error handling: 409 (duplicate) shows inline error, 400 shows validation errors

### Feature: product-detail-page

New page `apps/dashboard/src/app/dashboard/products/[id]/page.tsx`:
- Product info card: name, GTIN, serial, category, status, DID, created date
- Passport card: Digital Link URL (clickable), QR code image, on-chain data (txHash, tokenAddress, chain)
- Event timeline: chronological list of ProductEvents
- "Mint" button (only for DRAFT products): calls POST /products/:id/mint, shows loading state, updates on success
- "Download QR" button (only for ACTIVE products)
- Link back to product list

---

## Environment Setup

### New environment variables

**apps/api/.env** (add to existing):
```
# Chain (optional — API works without these, chain features disabled)
BASE_SEPOLIA_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0x...
# Path to deployed contract addresses
CONTRACT_ADDRESSES_PATH=../../contracts/deployments/base-sepolia.json
```

**apps/api/.env.example** (update):
```
BASE_SEPOLIA_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=
CONTRACT_ADDRESSES_PATH=../../contracts/deployments/base-sepolia.json
SEED_PASSWORD=
```

### Ports (unchanged)
- API: 4000
- Dashboard: 3000
- Scanner: 3001
- PostgreSQL: 5432

### Off-limits (unchanged)
- `website/` — do not modify
- `contracts/src/` — do not modify Solidity source (only use Deploy.s.sol and read ABIs)
- `specifications/` — do not modify
- `governance/` — do not modify

---

## Testing Strategy

### Unit tests
- Product CRUD endpoints: Vitest with Fastify inject (same pattern as auth tests)
- Resolver endpoint: Vitest
- QR generation: Vitest
- Shared package validation fixes: Vitest

### Chain integration tests
- Mock viem clients in unit tests
- Manual validation: deploy on Sepolia, mint via curl, resolve via curl
- Gas benchmarks: document in `docs/gas-benchmarks.md`

### User testing (validation)
- API: curl flow — create product → mint → resolve via Digital Link
- Dashboard: create product form → product list → product detail → mint → QR download
- Resolver: `curl https://localhost:4000/01/{gtin}/21/{serial}` returns valid DPP JSON

---

## Implementation Order

```
1. security-debt       (no deps — can run in parallel with milestone 2 prep)
   ├── httponly-cookie-auth
   ├── pin-dependencies
   ├── test-db-isolation
   ├── shared-type-split
   ├── shared-validation-fixes
   ├── seed-env-password
   └── api-url-production-guard

2. product-crud        (depends on: security-debt for clean baseline)
   └── product-endpoints

3. mint-flow           (depends on: product-crud)
   ├── contract-deployment-sepolia  (manual step)
   ├── viem-chain-client
   └── mint-endpoint

4. resolver-qr         (depends on: product-crud, can start in parallel with mint-flow)
   ├── gs1-resolver
   └── qr-generation

5. dashboard-products  (depends on: product-crud, resolver-qr)
   ├── product-list-page
   ├── product-create-page
   └── product-detail-page
```

---

## Non-Functional Requirements

- GDPR: no PII in logs, minimal JWT payload, product data is NOT personal data
- Security: all Sprint 1 security debt cleared, httpOnly cookies, pinned deps
- Performance: no specific targets, but QR generation should be < 500ms
- Chain: Base Sepolia only (chainId 84532), no mainnet interaction
- GTIN validation: GS1 mod-10 check digit enforced at API boundary

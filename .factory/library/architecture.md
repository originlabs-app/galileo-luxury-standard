# Architecture

Architectural decisions, patterns, and conventions.

---

## Monorepo Structure
- Turborepo with pnpm workspaces
- Only apps/* and packages/* in workspace
- website/ (Next.js 16, independent, Vercel deploy) — NOT in workspace
- contracts/ (Foundry, Solidity) — NOT in workspace

## Design Language: ABYSSE
- Dark ocean theme
- Background: #020204 (obsidian)
- Card: #0a0a0f (graphite)
- Primary: #00FFFF (cyan)
- Success: #00FF88 (emerald)
- Text: #e8e6e3 (platinum)
- Muted: #9a9a9a (silver)
- Heading font: Cormorant Garamond (serif)
- Body font: Outfit (sans-serif)

## Identifiers
- Products use GS1-native DIDs: did:galileo:01:{gtin}:21:{serial}
- Brands use DIDs: did:galileo:brand:{slug}
- GS1 Digital Link: https://id.galileoprotocol.io/01/{gtin}/21/{serial} (serial URL-encoded)
- No UUIDs as primary product identifiers

## API Response Format
- All API endpoints wrap responses in a standard envelope:
  - Success: `{ success: true, data: { ... } }`
  - Error: `{ success: false, error: { code: string, message: string } }`
- Frontend consumers must unwrap the envelope to access actual data

## Auth: httpOnly Cookies (Sprint 2)
- Access token: `galileo_at` cookie (httpOnly, Secure, SameSite=Lax, Path=/, 15min)
- Refresh token: `galileo_rt` cookie (httpOnly, Secure, SameSite=Lax, Path=/auth/refresh, 7d)
- No tokens in response body or localStorage
- CORS: credentials=true with explicit origin

## Blockchain: Chain Disabled Mode (Sprint 2)
- viem installed but no real chain calls
- If DEPLOYER_PRIVATE_KEY absent → mock mode
- Mock mint: synthetic txHash (0x + 64 hex), tokenAddress (0x + 40 hex), chainId=84532
- Future: when key is provided, real Base Sepolia integration activates

## Product Lifecycle
- DRAFT → (mint) → ACTIVE → TRANSFERRED / RECALLED
- Only DRAFT products can be edited (PATCH)
- Only DRAFT products can be minted
- Only ACTIVE+ products are publicly resolvable via GS1 Digital Link
- MINTING is an intermediate status (reserved for future async flow)

## JWT Token Generation
- JWT tokens include a `jti` (JWT ID) claim with `crypto.randomUUID()` to prevent duplicate tokens when generated in the same second with identical payloads
- This is critical for refresh token rotation where concurrent requests could otherwise produce identical tokens

## GDPR Compliance
- Passwords: bcrypt 12 rounds, max 128 chars
- JWT: minimal payload (sub, role, brandId only)
- Logs: no PII (user IDs only, never emails/names)
- CORS: strict origin validation with credentials
- Refresh tokens: SHA-256 hashed before DB storage

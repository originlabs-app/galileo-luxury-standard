# Research: ERC-3643 Integration and Cookie-Based Auth Compliance

**Date:** 2026-03-04
**Researcher:** Claude Opus 4.6
**Feature:** Verify that the Galileo Protocol's ERC-3643 integration and cookie-based authentication comply with standards and best practices.

---

## 1. ERC-3643 / T-REX Token Integration

### 1.1 Single-Supply Token per Product -- Alignment with ERC-3643

**Finding: The pattern is architecturally valid but non-standard usage of ERC-3643.**

ERC-3643 (T-REX) was designed for **fungible security tokens** (it extends ERC-20, not ERC-721). The standard's typical use case is tokenizing securities where many investors hold portions of the same asset (real estate shares, bonds, equity).

The Galileo specification (in `specifications/contracts/token/IGalileoToken.sol` and `specifications/contracts/token/IToken.sol`) deliberately adapts this pattern:

- **One contract deployment per physical product** with `totalSupply() = 1`
- Each token has its own Identity Registry, Compliance, Claim Topics Registry, and Trusted Issuers Registry
- The `IGalileoToken` interface extends `IToken` (ERC-3643's core interface) with luxury-specific additions (CPO certification, product DIDs, transfer reason codes)

This is a **valid but unusual** application of ERC-3643. Key considerations:

| Aspect | Assessment |
|--------|-----------|
| **Spec compliance** | Technically compliant -- ERC-3643 does not prohibit single-supply tokens. The `decimals` can be 0 and `totalSupply` can be 1. |
| **Gas cost** | SIGNIFICANT concern. Each product requires deploying 6+ contracts (Token, IdentityRegistry, IdentityRegistryStorage, ClaimTopicsRegistry, TrustedIssuersRegistry, ModularCompliance). The `TREXFactory.deployTREXSuite()` deploys all of these. At scale (thousands of luxury products), this is expensive even on Base Sepolia / Base mainnet. |
| **Alternative considered** | ERC-1155 (multi-token) or a single ERC-3643 contract with internal tracking. These would reduce gas costs but lose the 1:1 contract-product mapping that enables per-product compliance rules. |
| **Identity Registry reuse** | The `ITREXFactory` allows sharing `IdentityRegistryStorage` across deployments (set `irs` to an existing address). This is the correct optimization for the single-supply pattern -- all products from a brand should share identity infrastructure. |

**Verdict:** The pattern is defensible for luxury goods where per-product compliance, pause/freeze, and recovery are genuinely needed. The Galileo spec documents this choice well. However, the gas cost must be addressed in the production architecture (gas relay / meta-transactions / batch deployments via factory).

### 1.2 Current Mint Flow -- Compliance Gaps

The current mint route (`apps/api/src/routes/products/mint.ts`) has several issues:

| Issue | Severity | Details |
|-------|----------|---------|
| **Mock-only mode** | Expected (sprint-gated) | Real chain minting returns 503. The mock generates random `txHash` and `tokenAddress` values. This is appropriate for early development. |
| **No Identity Registry verification** | HIGH (when real chain is implemented) | ERC-3643 requires the receiver to be `isVerified()` in the Identity Registry before `mint()`. The current flow does not check this. |
| **No ONCHAINID** | HIGH (when real chain is implemented) | The deployer wallet needs an ONCHAINID with agent role. The current `chain.ts` plugin only sets up raw viem clients without any ERC-3643 contract interaction. |
| **Missing companion contract deployment** | HIGH (when real chain is implemented) | The `deployTREXSuite()` from `TREXFactory` should be used to deploy the full suite (Token + IR + IRS + CTR + TIR + MC). The current architecture does not reference or plan for this. |
| **No event indexing** | MEDIUM | The `ProductPassport` stores `txHash` and `tokenAddress` but there is no event listener to track on-chain events (transfers, freezes, compliance checks). |

### 1.3 Viem Client Setup for Base Sepolia

The chain plugin (`apps/api/src/plugins/chain.ts`) setup:

```typescript
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});
```

| Issue | Severity | Details |
|-------|----------|---------|
| **No RPC URL specified** | HIGH | `http()` without a URL falls back to viem's default public RPC for Base Sepolia. Public RPCs are rate-limited and unreliable for production. An authenticated RPC URL (Alchemy, QuickNode, Infura) should be configured. |
| **No retry/fallback logic** | MEDIUM | No transport fallback or retry configuration. Should use `fallback([http(primaryUrl), http(fallbackUrl)])` for reliability. |
| **Private key from env** | ACCEPTABLE | `DEPLOYER_PRIVATE_KEY` from environment is standard for server-side deployers. In production, a KMS-backed signer or hardware wallet is preferred. |
| **Chain selection hardcoded** | LOW | `baseSepolia` is imported directly. Should be configurable (env var) for mainnet vs testnet deployment. |

---

## 2. Cookie-Based Authentication

### 2.1 Cookie Configuration Analysis

Current configuration (`apps/api/src/utils/cookies.ts`):

```typescript
// Access token cookie
{
  httpOnly: true,
  secure: isProduction,        // Only HTTPS in production
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60,             // 15 minutes
}

// Refresh token cookie
{
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/auth/refresh",       // Scoped to refresh endpoint
  maxAge: 7 * 24 * 60 * 60,   // 7 days
}
```

#### 2.1.1 What is done well

- **httpOnly: true** -- prevents JavaScript access, mitigates XSS cookie theft. OWASP-compliant.
- **secure: isProduction** -- enforces HTTPS in production. OWASP requires this.
- **Refresh token path scoping** -- `/auth/refresh` path restriction on the refresh cookie is excellent. It prevents the refresh token from being sent with every API request, reducing the attack surface.
- **Separate JWT secrets** -- access and refresh tokens use different secrets (`JWT_SECRET` and `JWT_REFRESH_SECRET`), both requiring 32+ characters (validated in config.ts).
- **Refresh token rotation** -- the refresh endpoint generates new tokens and invalidates old ones (stored as hashed values in DB). This is a best practice.
- **Timing-safe login** -- bcrypt comparison with a dummy hash when user is not found prevents user enumeration.

#### 2.1.2 Compliance Gaps

| Issue | Severity | OWASP Reference |
|-------|----------|----------------|
| **SameSite=Lax instead of Strict** | MEDIUM | See Section 2.2 below |
| **No CSRF token** | HIGH | See Section 2.3 below |
| **No `__Host-` cookie prefix** | LOW | OWASP Session Management Cheat Sheet recommends `__Host-` prefix for session cookies. This ensures `Secure`, no `Domain`, and `path=/`. |
| **`secure: false` in development** | LOW | Acceptable for local dev but should log a warning. Currently no warning is emitted. |
| **No cookie signing** | MEDIUM | `@fastify/cookie` is registered without a `secret` option, and `signed: false` is used in the JWT cookie config. Signed cookies add integrity verification. However, since the cookie content is a JWT (which has its own signature), this is partially mitigated. |

### 2.2 SameSite=Lax vs SameSite=Strict

**Current setting: `sameSite: "lax"`**

The architecture is: Frontend (Next.js, port 3000) communicating with API (Fastify, port 4000). CORS is configured with `origin: config.CORS_ORIGIN` (defaults to `http://localhost:3000`) and `credentials: true`.

**Key distinction: same-site vs same-origin.**

- In development: `localhost:3000` and `localhost:4000` are **different origins** but the **same site** (both `localhost`).
- In production: if both are on `*.galileoprotocol.io`, they are same-site but cross-origin.

**SameSite=Lax behavior:**
- Cookies ARE sent on top-level navigation (clicking links) cross-site.
- Cookies are NOT sent on cross-site `<form>` POST, `<img>`, `<iframe>`, or `fetch()` requests... UNLESS the request is same-site.
- Since the SPA and API are likely same-site, `credentials: include` fetch requests WILL send the cookie.

**SameSite=Strict behavior:**
- Cookies are NEVER sent on cross-site requests, even top-level navigation.
- This can break OAuth redirects, deep links from emails, and other flows where the user arrives from an external site.

**Recommendation:** `SameSite=Lax` is the correct choice for this architecture. `Strict` would break legitimate flows (e.g., clicking a link from an email that deep-links into the app). However, `Lax` alone is NOT sufficient CSRF protection -- see 2.3.

**Explicit `SameSite=Lax` avoids the Chrome 2-minute POST grace period** that applies only when SameSite is omitted (defaulted to Lax by the browser). Since Galileo explicitly sets `sameSite: "lax"`, this bypass does not apply.

### 2.3 CSRF Protection -- CRITICAL GAP

**Finding: No CSRF mitigation exists beyond SameSite=Lax. This is a compliance gap per OWASP.**

OWASP CSRF Prevention Cheat Sheet states:

> "SameSite should be implemented as an additional layer (defense in depth concept). This attribute should not replace a CSRF Token."

**Why SameSite=Lax is insufficient for this architecture:**

1. **Same-site, cross-origin requests bypass SameSite:** If the frontend (`app.galileo.io`) and API (`api.galileo.io`) are on the same registerable domain, SameSite cookies ARE sent on all same-site requests, including from attacker-controlled subdomains.
2. **Subdomain takeover risk:** If any sibling subdomain (e.g., `marketing.galileo.io`) has an XSS vulnerability, it can make requests to `api.galileo.io` that will include the cookies because they are same-site.
3. **Method override attacks:** If any middleware interprets `_method=POST` parameters, Lax cookies sent on GET requests could be exploited.

**Recommended CSRF mitigations (pick at least one):**

| Mitigation | Implementation | Effort |
|------------|---------------|--------|
| **Double Submit Cookie** | Set a non-httpOnly CSRF token cookie; SPA reads it and sends as `X-CSRF-TOKEN` header; server validates match. | MEDIUM |
| **Custom Request Header** | Require a custom header (e.g., `X-Galileo-Client: 1`) on all state-changing requests. Cross-origin requests cannot set custom headers without CORS preflight. Since CORS is already restricted to `config.CORS_ORIGIN`, this is effective. | LOW |
| **Origin Header Validation** | Verify `Origin` header matches expected value on all state-changing requests. Already partially enforced by CORS but should be checked server-side too. | LOW |
| **Sec-Fetch-Site header check** | Check `Sec-Fetch-Site: same-origin` or `same-site` on state-changing requests. Modern browsers always send this header. | LOW |

**Simplest effective fix:** Add a custom required header check. Since the API already restricts CORS to a single origin, requiring `X-Galileo-Client: 1` (or any custom header) on POST/PUT/PATCH/DELETE is sufficient because:
- Browsers will not include custom headers in simple requests (forms, img tags)
- CORS preflight blocks custom headers from non-allowed origins
- Combined with `SameSite=Lax`, this provides defense in depth

**Note:** The current CORS `allowedHeaders` only permits `["Content-Type"]`. Any custom header approach requires adding it to `allowedHeaders`.

### 2.4 Fastify @fastify/jwt Cookie Mode

The auth plugin (`apps/api/src/plugins/auth.ts`) configuration:

```typescript
await fastify.register(fastifyJwt, {
  secret: config.JWT_SECRET,
  cookie: {
    cookieName: "galileo_at",
    signed: false,
  },
});
```

**Assessment:** This is the documented and recommended approach for `@fastify/jwt` cookie mode. The `cookieName` matches the cookie set during login. `request.jwtVerify()` automatically extracts the JWT from the cookie.

| Aspect | Status |
|--------|--------|
| Cookie extraction | Correct -- uses `@fastify/jwt` built-in cookie mode |
| Signed cookies | `signed: false` is acceptable since JWT has its own HMAC signature |
| Separate refresh namespace | Correct -- uses `namespace: "refresh"` for refresh tokens |
| Token structure | Correct -- `sub`, `role`, `brandId` in payload. No PII. |

---

## 3. Summary of Compliance Gaps

### Critical (must fix before production)

1. **No CSRF protection beyond SameSite=Lax.** Add at minimum a custom header requirement or double-submit cookie pattern.
2. **No authenticated RPC URL** for viem transport. Public RPCs will rate-limit or fail under load.

### High (must fix before real chain minting)

3. **Real chain mint flow does not implement ERC-3643 requirements:** Identity Registry verification, TREXFactory suite deployment, ONCHAINID agent roles.
4. **No on-chain event indexing** for tracking token lifecycle events.

### Medium (should fix before production)

5. **No cookie signing** -- while JWT has its own signature, signing cookies adds an extra integrity layer.
6. **No `__Host-` cookie prefix** -- adds additional browser-enforced security constraints.
7. **Chain configuration not env-switchable** -- `baseSepolia` is hardcoded in the import; should support mainnet.

### Low (nice to have)

8. **No warning logged when `secure: false`** in development mode.
9. **CORS `allowedHeaders` is restrictive** -- only `Content-Type` is allowed. This will need updating when CSRF custom headers or other headers are added.

---

## 4. Recommendations

### Architecture Suggestions

1. **For CSRF:** Implement the custom-header approach. Add `X-Galileo-Client` to CORS `allowedHeaders`, require it on all state-changing endpoints, and add a Fastify `onRequest` hook to validate it.

2. **For ERC-3643 minting:** When implementing real chain mode, use `TREXFactory.deployTREXSuite()` to deploy the full contract suite per product. Share `IdentityRegistryStorage` across all tokens within a brand. Set `decimals: 0` for the single-supply pattern.

3. **For viem:** Add `RPC_URL` to `config.ts` env schema. Pass it to `http(config.RPC_URL)`. Add a fallback transport for reliability.

4. **For cookies in production:** Consider using `__Host-galileo_at` as the cookie name with `secure: true`, `path: /`, and no `domain` attribute.

### Risks and Pitfalls

| Risk | Mitigation |
|------|-----------|
| Gas costs for per-product deployment | Use gas relay (account abstraction) or batch deployments. Pre-deploy shared infrastructure (IRS, TIR, CTR) once per brand. |
| CSRF via subdomain takeover | Implement custom header check. Monitor DNS for unauthorized subdomains. |
| Public RPC rate limiting | Configure authenticated RPC before testnet testing at scale. |
| Refresh token theft via XSS | httpOnly already mitigates this. Add Content Security Policy (CSP) headers for defense in depth. |

### Open Questions

1. **Production domain architecture:** Will the frontend and API share a registerable domain (e.g., `app.galileo.io` / `api.galileo.io`)? This determines whether SameSite=Lax provides same-site protection or not.
2. **Gas sponsorship strategy:** Will Galileo use ERC-4337 account abstraction or a gas relay for product token deployments?
3. **ONCHAINID provider:** Will Galileo use Tokeny's ONCHAINID infrastructure or deploy custom identity contracts?
4. **KMS integration:** For production deployer key management, will the team use AWS KMS, HashiCorp Vault, or similar?
5. **Content Security Policy:** Is there a plan to add CSP headers to the API responses?

---

## 5. External Sources

- [ERC-3643 Official Specification (EIP)](https://eips.ethereum.org/EIPS/eip-3643)
- [ERC-3643 Association Website](https://www.erc3643.org/)
- [T-REX Suite Documentation](https://erc-3643.github.io/documentation/docs/suite/)
- [T-REX GitHub Repository](https://github.com/TokenySolutions/T-REX)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Cookie Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/02-Testing_for_Cookies_Attributes)
- [PortSwigger: Bypassing SameSite Cookie Restrictions](https://portswigger.net/web-security/csrf/bypassing-samesite-restrictions)
- [Viem Documentation: Public Client](https://viem.sh/docs/clients/public)
- [Viem Documentation: HTTP Transport](https://viem.sh/docs/clients/transports/http.html)
- [Base Documentation: Viem Setup](https://docs.base.org/learn/onchain-app-development/frontend-setup/viem)
- [@fastify/jwt GitHub](https://github.com/fastify/fastify-jwt)

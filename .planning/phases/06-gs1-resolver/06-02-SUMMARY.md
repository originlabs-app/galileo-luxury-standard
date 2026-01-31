# Phase 6 Plan 02: Context-Aware Resolution Summary

**Completed:** 2026-01-31
**Duration:** 8 minutes
**Tasks:** 3/3

---

## One-Liner

GS1-conformant resolution protocol with 8-step algorithm, role-based context routing (consumer/brand/regulator/service_center), and JWT/ONCHAINID authentication for privileged DPP access.

---

## What Was Built

### Resolution Protocol (`specifications/resolver/resolution-protocol.md`)

Complete GS1-Conformant Resolver 1.2.0 specification:

- **8-Step Resolution Algorithm:**
  1. Parse GS1 Digital Link URI
  2. Validate GTIN check digit and serial format
  3. Detect requester context (JWT, linkType, Accept header)
  4. Build Galileo DID from GS1 identifiers
  5. Query on-chain registry for ProductRecord
  6. Fetch off-chain DID document by contentHash
  7. Select links based on context and linkType
  8. Return 307 redirect or linkset response

- **HTTP Interface:**
  - Primary: `GET /01/{gtin}/21/{serial}`
  - Linkset: `GET /01/{gtin}/21/{serial}?linkType=linkset`
  - Well-known: `GET /.well-known/gs1resolver`

- **Response Types:**
  - 307 Temporary Redirect (single link match)
  - 200 OK with application/linkset+json
  - 400/401/403/404/410 errors

- **Deactivated Product Handling:**
  - Returns 410 Gone (not 404)
  - Includes deactivation reason and provenance link
  - History remains accessible for verification

### Context-Aware Routing (`specifications/resolver/context-routing.md`)

Role-based view selection with ESPR compliance:

- **4 Requester Roles:**
  - `consumer`: Public view, no auth required
  - `brand`: Full DPP access, JWT + brand_did match
  - `regulator`: ESPR compliance view, JWT + jurisdiction
  - `service_center`: Technical view, JWT + ONCHAINID claim

- **Context Detection Priority (5 levels):**
  1. JWT role claim (highest)
  2. linkType parameter
  3. context query parameter
  4. Accept header
  5. Default: consumer

- **Link Type Access Matrix (18 types):**
  - GS1 standard: pip, sustainabilityInfo, instructions, traceability, etc.
  - Galileo custom: authenticity, internalDPP, auditTrail, serviceInfo, etc.
  - Public vs privileged access clearly defined

- **ESPR Stakeholder Mapping:**
  - Consumer -> Public DPP view
  - Economic operator -> Full DPP (brand role)
  - Market surveillance -> Compliance + audit (regulator role)
  - Repair services -> Technical + parts (service_center role)

### Access Control (`specifications/resolver/access-control.md`)

JWT-based authentication with ONCHAINID verification:

- **JWT Token Structure:**
  - Required: iss, sub, aud, iat, exp, role
  - Brand-specific: brand_did
  - Regulator-specific: jurisdiction
  - Service center: identity_address for ONCHAINID

- **Authorization Flow (9 steps):**
  1. Extract Bearer token
  2. Validate JWT signature via JWKS
  3. Check expiration
  4. Verify audience
  5. Extract role
  6. Brand: verify brand_did matches controller
  7. Service center: verify ONCHAINID claim
  8. Regulator: pre-verified at issuance
  9. Return authorized context

- **Rate Limiting Tiers:**
  - Anonymous: 100 req/min (IP-based)
  - API Key: 1,000 req/min
  - Authenticated: 10,000 req/min
  - Brand Admin: 50,000 req/min

- **ONCHAINID Integration:**
  - SERVICE_CENTER claim topic verification
  - Topic ID: `0x10830870ec631edcb6878ba73b73764c94401f5fd6d4b09e57afb7b1ac948ff2`
  - Brand-scoped or wildcard authorization

---

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `specifications/resolver/resolution-protocol.md` | GS1-conformant resolution algorithm | 1085 |
| `specifications/resolver/context-routing.md` | Role-based view selection | 1054 |
| `specifications/resolver/access-control.md` | JWT authentication and authorization | 1115 |

---

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| 8-step resolution algorithm | Matches GS1-Conformant Resolver 1.2.0 standard | Simplified 5-step flow |
| 307 Temporary Redirect for single link | Preserves HTTP method (POST stays POST) | 302 Found, 303 See Other |
| 410 Gone for deactivated products | Distinguishes from never-existed (404), preserves provenance | 404 with metadata |
| 5-level context detection priority | JWT overrides all hints for security | Equal weight to all sources |
| SERVICE_CENTER via ONCHAINID | On-chain verification of service authorization | JWT claims only |
| 1-hour max token lifetime | Security best practice, reduces token theft window | 24-hour tokens |
| Rate limiting by tier | Balances access for different use cases | Flat rate for all |

---

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `1bcab01` | feat | Resolution protocol specification with 8-step algorithm |
| `c934852` | feat | Context-aware routing with role-based access matrix |
| `bd12d05` | feat | Access control with JWT and ONCHAINID integration |

---

## Integration Points

### With Phase 4 (Identity)

- **DID-METHOD.md:** Resolution builds `did:galileo` from GS1 identifiers
- **claim-topics.md:** SERVICE_CENTER topic for service center verification
- **ONCHAINID:** On-chain claim verification for privileged access

### With Phase 5 (Token)

- **ProductRecord:** On-chain registry stores controller, contentHash, active status
- **IGalileoToken:** Product ownership verification

### With Plan 06-01

- **digital-link-uri.md:** URI parsing and validation rules
- **linkset-schema.json:** Linkset response format

---

## Verification Results

**Resolution Protocol:**
- [x] 8-step resolution algorithm (14 step references found)
- [x] HTTP response codes (307, 200, 400, 401, 404, 410)
- [x] Deactivated product handling (410 Gone)
- [x] Caching strategy documented
- [x] References digital-link-uri.md and DID-METHOD.md

**Context Routing:**
- [x] All 4 roles defined with descriptions
- [x] Link type access matrix (22 YES/NO entries)
- [x] Context detection priority (19 references)
- [x] ESPR compliance notes (16 references)

**Access Control:**
- [x] JWT token structure documented (27 JWT references)
- [x] Authorization flow (9 steps)
- [x] JWKS endpoint specified (15 references)
- [x] Rate limiting tiers (24 references)
- [x] ONCHAINID integration (26 references)

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Next Phase Readiness

**Phase 6 Complete.** Both plans executed:
- 06-01: GS1 Digital Link URI + Linkset Schema
- 06-02: Resolution Protocol + Context Routing + Access Control

**Ready for Phase 7 (DPP Schema):**
- Resolution protocol defines how DPP data is accessed
- Context routing defines what data each role sees
- Access control gates privileged DPP fields
- Link types reference DPP endpoints that Phase 7 will define

---

## Notes

- GS1-Conformant Resolver Standard 1.2.0 (January 2026) used as reference
- ESPR 2024/1781 stakeholder access requirements fully mapped
- Service center verification requires ONCHAINID - no JWT-only path
- Deactivated products remain resolvable for provenance (never truly deleted)
- Rate limiting designed for production scale (50K req/min for brand bulk ops)

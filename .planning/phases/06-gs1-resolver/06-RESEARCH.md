# Phase 6: GS1 Resolver Integration - Research

**Researched:** 2026-01-31
**Domain:** GS1 Digital Link Resolution, ESPR Digital Product Passport Access
**Confidence:** HIGH

## Summary

This research covers the GS1 Digital Link standard and resolver architecture needed to bridge physical products to digital identities for Galileo Luxury. The GS1 Digital Link URI Syntax is now at version 1.6.0 (April 2025) with the GS1-Conformant Resolver at version 1.2.0 (January 2026). The key integration point is that ESPR 2024/1781 mandates Digital Product Passports accessible via QR codes/NFC, with tiered access for different stakeholders (consumers, regulators, service centers).

Galileo already has strong foundations from Phase 3 (gs1-integration.md) and Phase 4 (DID-METHOD.md) which define the bidirectional mapping between `did:galileo:01:{GTIN}:21:{Serial}` and GS1 Digital Link URIs. Phase 6 implements the resolver service that performs this resolution with context-aware routing.

**Primary recommendation:** Deploy a custom GS1-conformant resolver at `id.galileo.luxury` using the GS1 Resolver Community Edition v3.0 architecture pattern (microservices with MongoDB linkset storage), extended with JWT-based authentication for privileged access and integration with the Galileo DID registry for on-chain verification.

---

## Standard Stack

The established libraries/tools for GS1 resolver implementation:

### Core

| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| GS1 Resolver CE | 3.0 | Reference resolver implementation | Official GS1 open source, microservices architecture |
| Python | 3.10+ | Resolver CE runtime | Native CE language, async support |
| MongoDB | 6.0+ | Linkset document storage | Native IETF linkset format support |
| FastAPI | 0.100+ | REST API framework | High-performance async, OpenAPI auto-gen |
| PyJWT | 2.8+ | JWT authentication | Role-based access for privileged views |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uvicorn | 0.24+ | ASGI server | Production deployment |
| httpx | 0.25+ | Async HTTP client | Upstream DID resolution |
| pydantic | 2.0+ | Data validation | Linkset schema validation |
| python-multipart | 0.0.6+ | Form data | QR code image upload |
| gs1-digitallink | 1.0+ | URI parsing library | Parse/validate GS1 Digital Link URIs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Python/FastAPI | Node.js/Express | Node better if team has JS expertise; Python matches CE reference |
| MongoDB | PostgreSQL + JSONB | Postgres if already in stack; Mongo native linkset is simpler |
| Custom resolver | Deploy CE directly | CE simpler for basic use; custom needed for Galileo-specific auth |

**Installation (custom resolver approach):**
```bash
# Core dependencies
pip install fastapi uvicorn pymongo pyjwt httpx pydantic

# GS1 parsing
pip install gs1-python  # or gs1-digitallink

# Production
pip install gunicorn
```

---

## Architecture Patterns

### Recommended Project Structure

```
galileo-resolver/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── resolve.py       # GET /{ai}/{value} resolution
│   │   │   ├── linkset.py       # GET /linkset endpoint
│   │   │   └── well_known.py    # /.well-known/gs1resolver
│   │   ├── middleware/
│   │   │   ├── auth.py          # JWT authentication
│   │   │   ├── context.py       # Context detection
│   │   │   └── content_neg.py   # Accept header negotiation
│   │   └── main.py              # FastAPI app
│   ├── core/
│   │   ├── resolver.py          # Resolution algorithm
│   │   ├── linkset.py           # Linkset builder
│   │   └── gs1_parser.py        # GS1 URI parsing
│   ├── services/
│   │   ├── did_registry.py      # On-chain DID lookup
│   │   ├── dpp_store.py         # Off-chain DPP retrieval
│   │   └── identity_service.py  # Role/claim verification
│   ├── models/
│   │   ├── linkset.py           # IETF Linkset models
│   │   ├── resolution.py        # Resolution response models
│   │   └── context.py           # Requester context models
│   └── config/
│       ├── link_types.py        # GS1 + Galileo link types
│       └── settings.py          # Environment config
├── tests/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── specs/
    └── openapi.yaml             # API specification
```

### Pattern 1: Resolution Algorithm with Context Detection

**What:** Multi-factor context detection and link selection
**When to use:** Every incoming resolution request

```python
# Source: GS1-Conformant Resolver Standard 1.2.0
async def resolve(
    gs1_uri: str,
    accept_header: str | None,
    accept_language: str | None,
    link_type: str | None,
    context_param: str | None,
    auth_token: str | None
) -> ResolutionResult:
    """
    GS1-Conformant resolution algorithm with Galileo extensions.

    Priority order for context detection:
    1. Authenticated role (JWT claim) - highest priority
    2. linkType query parameter
    3. context query parameter
    4. Accept header (content negotiation)
    5. Default: consumer public view
    """
    # 1. Parse GS1 Digital Link URI
    parsed = parse_gs1_digital_link(gs1_uri)
    if not parsed:
        return ResolutionResult(error="invalidIdentifier", status=400)

    # 2. Determine requester context
    requester_context = await detect_context(
        auth_token=auth_token,
        link_type=link_type,
        context_param=context_param,
        accept_header=accept_header
    )

    # 3. Build Galileo DID from GS1 identifiers
    galileo_did = f"did:galileo:{parsed.ai}:{parsed.value}"
    if parsed.serial:
        galileo_did += f":21:{parsed.serial}"

    # 4. Resolve DID to get service endpoints
    did_doc = await resolve_galileo_did(galileo_did)
    if not did_doc:
        return ResolutionResult(error="notFound", status=404)

    # 5. Select appropriate link(s) based on context
    links = await select_links(
        did_doc=did_doc,
        requester_context=requester_context,
        preferred_languages=parse_accept_language(accept_language)
    )

    # 6. Return linkset or redirect
    if link_type == "linkset" or accept_header == "application/linkset+json":
        return build_linkset_response(links)
    else:
        return build_redirect_response(links[0], status=307)
```

### Pattern 2: Linkset Response Format

**What:** IETF RFC 9264 linkset with GS1 extensions
**When to use:** When client requests linkset or all available links

```json
{
  "@context": {
    "@vocab": "http://www.iana.org/assignments/relation/",
    "anchor": "@id",
    "href": "@id",
    "linkset": "@graph",
    "gs1": "https://gs1.org/voc/",
    "galileo": "https://vocab.galileo.luxury/"
  },
  "linkset": [
    {
      "anchor": "https://id.galileo.luxury/01/09506000134352/21/ABC123",
      "itemDescription": "Birkin 25 Togo Gold",
      "https://gs1.org/voc/defaultLink": [
        {
          "href": "https://resolver.galileo.luxury/dpp/09506000134352/ABC123",
          "title": "Digital Product Passport"
        }
      ],
      "https://gs1.org/voc/pip": [
        {
          "href": "https://resolver.galileo.luxury/pip/09506000134352/ABC123",
          "hreflang": ["en", "fr", "zh"],
          "title": "Product Information"
        }
      ],
      "https://gs1.org/voc/sustainabilityInfo": [
        {
          "href": "https://resolver.galileo.luxury/sustainability/09506000134352/ABC123",
          "title": "Sustainability Data"
        }
      ],
      "https://vocab.galileo.luxury/authenticity": [
        {
          "href": "https://resolver.galileo.luxury/verify/09506000134352/ABC123",
          "title": "Authenticity Verification"
        }
      ],
      "https://vocab.galileo.luxury/traceability": [
        {
          "href": "https://resolver.galileo.luxury/events/09506000134352/ABC123",
          "title": "Lifecycle Events",
          "context": ["brand", "regulator"]
        }
      ]
    }
  ]
}
```

### Pattern 3: Context-Aware Access Control

**What:** Role-based view selection
**When to use:** Determining what data to return

```python
# Source: Galileo gs1-integration.md specification
class RequesterRole(str, Enum):
    CONSUMER = "consumer"      # Public view - default
    BRAND = "brand"            # Full DPP access
    REGULATOR = "regulator"    # ESPR compliance view
    SERVICE_CENTER = "service_center"  # Repair/MRO view

ROLE_LINK_TYPES: dict[RequesterRole, list[str]] = {
    RequesterRole.CONSUMER: [
        "gs1:pip",
        "gs1:sustainabilityInfo",
        "gs1:instructions",
        "galileo:authenticity"
    ],
    RequesterRole.BRAND: [
        "gs1:pip",
        "gs1:traceability",
        "galileo:internalDPP",
        "galileo:auditTrail",
        "galileo:analytics"
    ],
    RequesterRole.REGULATOR: [
        "gs1:regulatoryInfo",
        "galileo:complianceDPP",
        "galileo:auditTrail",
        "galileo:espr"
    ],
    RequesterRole.SERVICE_CENTER: [
        "galileo:serviceInfo",
        "galileo:technicalSpec",
        "galileo:repairHistory"
    ]
}

async def detect_context(
    auth_token: str | None,
    link_type: str | None,
    context_param: str | None,
    accept_header: str | None
) -> RequesterContext:
    """Detect requester context from request parameters."""

    # Priority 1: Authenticated role
    if auth_token:
        claims = verify_jwt(auth_token)
        if claims and "role" in claims:
            return RequesterContext(
                role=RequesterRole(claims["role"]),
                authenticated=True,
                identity=claims.get("sub")
            )

    # Priority 2: Explicit linkType (may require auth)
    if link_type:
        required_role = get_required_role_for_link_type(link_type)
        if required_role == RequesterRole.CONSUMER:
            return RequesterContext(role=RequesterRole.CONSUMER)
        # If privileged link type requested without auth, return 401
        raise AuthenticationRequired(link_type)

    # Priority 3: Context parameter
    if context_param and context_param in RequesterRole.__members__:
        # Context param just hints; still needs auth for non-consumer
        return RequesterContext(role=RequesterRole.CONSUMER)

    # Default: Consumer
    return RequesterContext(role=RequesterRole.CONSUMER)
```

### Anti-Patterns to Avoid

- **Hard-coding link URLs:** Use service endpoint discovery from DID document, not hardcoded URLs
- **Caching authenticated responses:** Never cache privileged views; only cache public consumer views
- **Ignoring Accept-Language:** ESPR requires multi-language support; always respect language preferences
- **Returning 404 for deactivated products:** Deactivated products should return 410 Gone with reason metadata
- **Synchronous DID resolution:** Use async resolution; on-chain lookups can be slow

---

## GS1 Link Types Reference

### Standard GS1 Vocabulary Link Types

| Link Type URI | Short Form | Description | ESPR Relevance |
|---------------|------------|-------------|----------------|
| `https://gs1.org/voc/pip` | gs1:pip | Product Information Page | Consumer DPP view |
| `https://gs1.org/voc/sustainabilityInfo` | gs1:sustainabilityInfo | Environmental/sustainability data | Carbon footprint, materials |
| `https://gs1.org/voc/instructions` | gs1:instructions | Care/usage instructions | Repairability info |
| `https://gs1.org/voc/regulatoryInfo` | gs1:regulatoryInfo | Regulatory compliance | ESPR compliance declaration |
| `https://gs1.org/voc/traceability` | gs1:traceability | Supply chain events | Origin/provenance |
| `https://gs1.org/voc/certificationInfo` | gs1:certificationInfo | Product certifications | Third-party certs |
| `https://gs1.org/voc/recipeInfo` | gs1:recipeInfo | Product recipes/usage | Care instructions |
| `https://gs1.org/voc/hasRetailers` | gs1:hasRetailers | Where to buy | Authorized sellers |
| `https://gs1.org/voc/defaultLink` | gs1:defaultLink | Default target | Fallback resolution |
| `https://gs1.org/voc/smartLabel` | gs1:smartLabel | SmartLabel content | US-specific |

### Custom Galileo Link Types

| Link Type URI | Short Form | Description | Access Level |
|---------------|------------|-------------|--------------|
| `https://vocab.galileo.luxury/authenticity` | galileo:authenticity | Verification proof | Public |
| `https://vocab.galileo.luxury/internalDPP` | galileo:internalDPP | Complete DPP (all fields) | Brand only |
| `https://vocab.galileo.luxury/auditTrail` | galileo:auditTrail | Full event history | Brand/Regulator |
| `https://vocab.galileo.luxury/serviceInfo` | galileo:serviceInfo | Service/repair access | Service Center |
| `https://vocab.galileo.luxury/technicalSpec` | galileo:technicalSpec | Technical specifications | Service Center |
| `https://vocab.galileo.luxury/complianceDPP` | galileo:complianceDPP | ESPR mandatory fields only | Regulator |
| `https://vocab.galileo.luxury/espr` | galileo:espr | ESPR compliance bundle | Regulator |

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GS1 Digital Link parsing | Regex parser | `gs1-python` or `gs1-digitallink` library | Check digit validation, AI parsing, compression support |
| GTIN validation | Custom validator | GS1 library check digit | Modulo-10 weight-3 algorithm has edge cases |
| Linkset serialization | Manual JSON | IETF linkset library or validated schema | RFC 9264 compliance, proper @context |
| JWT validation | Manual decode | PyJWT with RS256/ES256 | Signature validation, expiry, claims extraction |
| Content negotiation | Manual Accept parsing | `parse-accept` or framework built-in | Quality values, wildcards, proper precedence |
| URI compression | Custom encoding | GS1 Digital Link compression standard | Binary encoding for short QR codes |

**Key insight:** GS1 parsing is deceptively complex. Application Identifiers have variable-length values, check digits, and compression formats. Use a validated library rather than regex.

---

## Common Pitfalls

### Pitfall 1: GTIN Format Inconsistency

**What goes wrong:** Storing/comparing GTINs with inconsistent digit counts (8, 12, 13, 14 digits)
**Why it happens:** Historical GTIN formats vary; input data may not be normalized
**How to avoid:** Always normalize to 14 digits with leading zeros per GS1 Digital Link 1.4.0+
**Warning signs:** Resolution failures on valid products; duplicate entries for same product

```python
def normalize_gtin(gtin: str) -> str:
    """Normalize GTIN to 14 digits per GS1 Digital Link 1.4.0+"""
    gtin = gtin.strip().lstrip("0")  # Remove leading zeros first
    if len(gtin) > 14:
        raise ValueError(f"Invalid GTIN length: {len(gtin)}")
    return gtin.zfill(14)  # Pad to 14 digits
```

### Pitfall 2: Missing Linkset Fallback

**What goes wrong:** Resolver returns 404 when no matching link type found
**Why it happens:** Not providing default link for unrecognized link types
**How to avoid:** Always define `gs1:defaultLink` in every linkset; return linkset on no match
**Warning signs:** Mobile apps failing on specific products; some QR codes not working

### Pitfall 3: Ignoring HTTP 307 vs 303

**What goes wrong:** Using 302 redirect, causing POST requests to change to GET
**Why it happens:** Not understanding redirect semantics
**How to avoid:** Use 307 for link type matches (preserves method); 303 for "see other" informational
**Warning signs:** API integrations failing on POST/PUT operations

### Pitfall 4: Caching Authenticated Responses

**What goes wrong:** Privileged data leaked to unauthorized users via cache
**Why it happens:** Caching layer doesn't distinguish by auth state
**How to avoid:** Set `Cache-Control: private, no-store` for authenticated responses
**Warning signs:** Users seeing data they shouldn't; compliance violations

### Pitfall 5: Not Handling Deactivated Products

**What goes wrong:** Returning 404 for decommissioned products
**Why it happens:** Treating deactivated as deleted
**How to avoid:** Return 410 Gone with `deactivated: true` metadata; product history still accessible
**Warning signs:** Provenance gaps; inability to verify authenticity of older items

---

## ESPR/DPP Requirements Summary

### ESPR 2024/1781 Key Requirements for Resolver

| Requirement | Specification | Implementation |
|-------------|---------------|----------------|
| **Data carrier** | QR code, NFC, RFID | Resolver must handle any carrier that produces valid URI |
| **Machine-readable** | Interoperable data formats | Return JSON-LD per DPP schema |
| **Multi-stakeholder access** | Consumers, regulators, recyclers | Role-based resolution |
| **Digital registry** | Central EU registry by July 2026 | Integrate with EU registry when available |
| **Accessibility** | Throughout product lifecycle | Deactivated products remain resolvable |

### Access Levels per ESPR

| Stakeholder | Access Pattern | Data Visibility |
|-------------|----------------|-----------------|
| **Consumer** | Public, no auth | Product info, sustainability, care |
| **Market Surveillance** | Verified authority | Compliance tests, declarations |
| **Customs** | Verified authority | Authenticity, origin, compliance |
| **Recycler** | Potentially verified | Material composition, disassembly |
| **Repair Service** | Brand-authorized | Technical specs, repair history |

### Timeline

| Date | Milestone | Resolver Impact |
|------|-----------|-----------------|
| July 2025 | First implementing act | Watch for specific requirements |
| July 2026 | EU digital registry live | Integration requirement |
| 2026-2027 | Textiles/batteries mandatory | Priority product categories |
| 2027+ | Additional categories | Scalability planning |

---

## Code Examples

### Example 1: FastAPI Resolver Route

```python
# Source: GS1 Resolver CE v3.0 pattern + Galileo extensions
from fastapi import APIRouter, Request, Response, Header, Query, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse

router = APIRouter()

@router.get("/01/{gtin}/21/{serial}")
async def resolve_product(
    request: Request,
    gtin: str,
    serial: str,
    linkType: str | None = Query(None, alias="linkType"),
    context: str | None = Query(None),
    accept: str | None = Header(None),
    accept_language: str | None = Header(None, alias="accept-language"),
    authorization: str | None = Header(None)
):
    """
    Resolve GS1 Digital Link to appropriate resource.

    Implements GS1-Conformant Resolver Standard 1.2.0 with Galileo extensions.
    """
    # Normalize GTIN to 14 digits
    try:
        normalized_gtin = normalize_gtin(gtin)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid GTIN format")

    # Validate serial
    if not is_valid_serial(serial):
        raise HTTPException(status_code=400, detail="Invalid serial number")

    # Build Galileo DID
    galileo_did = f"did:galileo:01:{normalized_gtin}:21:{serial}"

    # Resolve DID to get product record
    product_record = await did_registry.resolve(galileo_did)
    if not product_record:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check deactivation
    if not product_record.active:
        return JSONResponse(
            status_code=410,
            content={
                "error": "deactivated",
                "reason": product_record.deactivation_reason,
                "did": galileo_did
            }
        )

    # Detect requester context
    auth_token = extract_bearer_token(authorization)
    requester = await detect_context(auth_token, linkType, context, accept)

    # Get linkset for this product
    linkset = await build_linkset(product_record, requester)

    # Return linkset if requested
    if linkType == "linkset" or accept == "application/linkset+json":
        return JSONResponse(
            content=linkset,
            media_type="application/linkset+json",
            headers={"Cache-Control": "public, max-age=300"}
        )

    # Select best link for redirect
    target_link = select_best_link(linkset, linkType, accept_language)
    if not target_link:
        # Fallback to default
        target_link = linkset.get_default_link()

    # Redirect with 307
    return RedirectResponse(
        url=target_link.href,
        status_code=307,
        headers={
            "Link": f'<{request.url}?linkType=linkset>; rel="linkset"',
            "Cache-Control": "public, max-age=300" if not requester.authenticated else "private, no-store"
        }
    )
```

### Example 2: DID Registry Integration

```python
# Source: Galileo DID-METHOD.md resolution protocol
from web3 import Web3

class GalileoDIDRegistry:
    """
    Interface to on-chain Galileo product registry.
    Resolves did:galileo to product records.
    """

    def __init__(self, rpc_url: str, contract_address: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract = self.w3.eth.contract(
            address=contract_address,
            abi=PRODUCT_REGISTRY_ABI
        )

    async def resolve(self, did: str) -> ProductRecord | None:
        """
        Resolve did:galileo to ProductRecord.

        Returns:
            ProductRecord with controller, contentHash, active status
            None if DID not registered
        """
        # Compute DID hash for registry lookup
        did_hash = Web3.keccak(text=did.lower())

        # Query on-chain registry
        record = await self._call_contract("getRecord", did_hash)

        if record.createdAt == 0:
            return None

        return ProductRecord(
            did=did,
            controller=record.controller,
            content_hash=record.contentHash.hex(),
            created_at=record.createdAt,
            updated_at=record.updatedAt,
            active=record.active,
            deactivation_reason=record.deactivationReason if not record.active else None
        )

    async def get_did_document(self, did: str) -> dict | None:
        """
        Get full DID document by resolving content hash.

        1. Get on-chain record for content hash
        2. Fetch off-chain document from storage
        3. Verify hash matches
        """
        record = await self.resolve(did)
        if not record:
            return None

        # Fetch from off-chain storage
        document = await off_chain_store.get(record.content_hash)

        # Verify integrity
        computed_hash = sha256_canonical_json(document)
        if computed_hash != record.content_hash:
            logger.warning(f"Hash mismatch for {did}")
            # Still return, but flag for investigation

        return document
```

### Example 3: Linkset Builder

```python
# Source: IETF RFC 9264 + GS1 extensions
from pydantic import BaseModel

class Link(BaseModel):
    href: str
    title: str
    hreflang: list[str] | None = None
    type: str | None = None  # MIME type
    context: list[str] | None = None  # Access context

class Linkset(BaseModel):
    anchor: str
    item_description: str | None = None
    links: dict[str, list[Link]]

    def to_json_ld(self) -> dict:
        return {
            "@context": {
                "@vocab": "http://www.iana.org/assignments/relation/",
                "anchor": "@id",
                "href": "@id",
                "linkset": "@graph",
                "gs1": "https://gs1.org/voc/",
                "galileo": "https://vocab.galileo.luxury/"
            },
            "linkset": [{
                "anchor": self.anchor,
                "itemDescription": self.item_description,
                **{k: [l.dict(exclude_none=True) for l in v] for k, v in self.links.items()}
            }]
        }

async def build_linkset(
    product_record: ProductRecord,
    requester: RequesterContext
) -> Linkset:
    """
    Build linkset for product based on requester context.
    """
    did_doc = await get_did_document(product_record.did)
    gtin = extract_gtin(product_record.did)
    serial = extract_serial(product_record.did)

    # Base anchor URL
    anchor = f"https://id.galileo.luxury/01/{gtin}/21/{serial}"

    # Start with default link (always present)
    links = {
        "https://gs1.org/voc/defaultLink": [
            Link(
                href=f"https://resolver.galileo.luxury/dpp/{gtin}/{serial}",
                title="Digital Product Passport"
            )
        ]
    }

    # Add links based on role access
    allowed_link_types = ROLE_LINK_TYPES.get(requester.role, [])

    for service in did_doc.get("service", []):
        link_type = map_service_to_link_type(service["type"])
        if link_type and link_type in allowed_link_types:
            if link_type not in links:
                links[link_type] = []
            links[link_type].append(Link(
                href=service["serviceEndpoint"],
                title=service.get("description", service["type"])
            ))

    return Linkset(
        anchor=anchor,
        item_description=did_doc.get("galileo:productName"),
        links=links
    )
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 1D barcodes only | 2D barcodes with Digital Link | 2020-2027 (Sunrise 2027) | QR codes become standard |
| GTIN-8/12/13 in URIs | GTIN-14 only | GS1 DL 1.4.0 (2023) | Always pad to 14 digits |
| `?linkType=all` | `?linkType=linkset` | GS1 Resolver 1.2.0 (2026) | 'all' deprecated but supported |
| Redirect-only resolver | Linkset + redirect modes | GS1 Resolver 1.0 (2021) | Must support linkset responses |
| Simple product pages | Structured DPP | ESPR 2024/1781 | Machine-readable required |

**Deprecated/outdated:**

- **GS1 Resolver CE v2.x** - Use v3.0 with microservices architecture
- **`linkType=all`** - Use `linkType=linkset` per 1.2.0 standard
- **Non-14-digit GTINs in URIs** - Always normalize to 14 digits
- **Single-link per product** - Linkset supports multiple links per type

---

## Integration with Galileo Architecture

### Resolution Flow

```
1. Physical Product (QR/NFC)
   Contains: https://id.galileo.luxury/01/{GTIN}/21/{Serial}

2. GS1 Resolver (id.galileo.luxury)
   - Parse GS1 Digital Link URI
   - Build did:galileo:01:{GTIN}:21:{Serial}
   - Query on-chain registry for contentHash
   - Fetch DID document from off-chain
   - Build linkset based on requester context

3. Service Endpoints (resolver.galileo.luxury)
   - /dpp/{gtin}/{serial}     -> DPP data
   - /events/{gtin}/{serial}  -> EPCIS events
   - /verify/{gtin}/{serial}  -> Authenticity check

4. Data Sources
   - On-chain: Token ownership, compliance status
   - Off-chain: DPP content, event details, media
```

### Galileo-Specific Extensions

| Extension | Purpose | Implementation |
|-----------|---------|----------------|
| `did:galileo` resolution | Product DID lookup | Integrate with Phase 4 registry |
| Token verification | On-chain ownership | Query ERC-3643 token contract |
| Claim verification | Role-based access | Check ONCHAINID claims |
| Event sourcing | Traceability | Query EPCIS event store |

---

## Open Questions

Things that couldn't be fully resolved:

1. **EU DPP Registry Integration (July 2026)**
   - What we know: Registry will store unique identifiers, enable search/compare
   - What's unclear: Exact API specification, authentication requirements
   - Recommendation: Design for registry integration; implement adapter layer

2. **prEN 18239 Access Rights Vocabulary (Late 2025)**
   - What we know: Will standardize access control terms
   - What's unclear: Final vocabulary, exact role definitions
   - Recommendation: Use Galileo role names now; map to standard when published

3. **Multi-Resolver Federation**
   - What we know: GS1 standard supports federation via `gs1:handledBy`
   - What's unclear: How Galileo resolver interoperates with brand resolvers
   - Recommendation: Support `gs1:handledBy` for brands running own resolvers

---

## Recommended Plan Structure

Based on this research, Phase 6 should be structured as:

### Task Group 1: GS1 Resolver Core (2-3 tasks)
- GS1 Digital Link URI parser with validation
- Resolution algorithm implementation
- Linkset builder with GS1 vocabulary

### Task Group 2: Galileo Integration (2-3 tasks)
- DID registry client (on-chain resolution)
- Off-chain content fetcher
- Service endpoint mapping

### Task Group 3: Context-Aware Routing (2-3 tasks)
- Role detection and authentication
- Link type access control matrix
- Response filtering by role

### Task Group 4: API and Deployment (2-3 tasks)
- FastAPI routes for /01/{gtin}/21/{serial}
- /.well-known/gs1resolver metadata
- Docker deployment with MongoDB

### Task Group 5: Specification Updates (1-2 tasks)
- GS1-RESOLVER.md specification document
- Update gs1-integration.md with implementation details

---

## Sources

### Primary (HIGH confidence)
- [GS1 Digital Link Standard](https://ref.gs1.org/standards/digital-link/) - URI syntax 1.6.0
- [GS1-Conformant Resolver Standard](https://ref.gs1.org/standards/resolver/) - Version 1.2.0
- [GS1 Resolver CE GitHub](https://github.com/gs1/GS1_DigitalLink_Resolver_CE) - v3.0 architecture
- [GS1 Linkset Repository](https://github.com/gs1/linkset) - Schema and examples
- Galileo DID-METHOD.md - Product DID format
- Galileo gs1-integration.md - Existing integration specification
- Galileo HYBRID-ARCHITECTURE.md - On-chain/off-chain patterns

### Secondary (MEDIUM confidence)
- [ESPR 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng) - EU regulation text
- [GS1 Web Vocabulary](https://www.gs1.org/voc/) - Link type definitions
- [Digital Product Passport Guide](https://fluxy.one/post/digital-product-passport-dpp-eu-guide-2025-2030) - ESPR timeline

### Tertiary (LOW confidence - needs validation)
- WebSearch results on prEN 18239 access vocabulary - standard still in development
- EU DPP registry implementation details - not yet published

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - GS1 standards well-documented, CE v3.0 stable
- Architecture: HIGH - GS1 resolver patterns well-established, Galileo specs exist
- ESPR requirements: MEDIUM - Regulation published, implementing acts pending
- EU registry integration: LOW - Specifications not yet published

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (monitor for ESPR implementing acts, prEN 18239)

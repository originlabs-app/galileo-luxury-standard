# Research: W3C Standards Compliance of Galileo DID Method and JSON-LD DPP Response

**Date:** 2026-03-04
**Researcher:** Claude (Opus 4.6)
**Feature:** Verify compliance of `did:galileo` method syntax, JSON-LD resolver response, and DPP data model with W3C DID Core, W3C Verifiable Credentials, Schema.org, and EU ESPR regulations.

---

## 1. DID Format Compliance: `did:galileo:01:{gtin}:21:{serial}`

### 1.1 W3C DID Core v1.0 ABNF Reference

The W3C DID Core v1.0 specification defines the following ABNF:

```
did                = "did:" method-name ":" method-specific-id
method-name        = 1*method-char
method-char        = %x61-7A / DIGIT
method-specific-id = *( *idchar ":" ) 1*idchar
idchar             = ALPHA / DIGIT / "." / "-" / "_" / pct-encoded
pct-encoded        = "%" HEXDIG HEXDIG
```

Source: [W3C DID Core v1.0 -- Section 3.1 DID Syntax](https://www.w3.org/TR/did-core/#did-syntax)

### 1.2 Galileo DID Analysis

The Galileo DID format `did:galileo:01:09506000134352:21:ABC123` breaks down as:

| Component | Value | DID Core Rule |
|-----------|-------|---------------|
| Scheme | `did` | Fixed literal -- COMPLIANT |
| Method name | `galileo` | 1*method-char (lowercase alpha) -- COMPLIANT |
| Method-specific-id | `01:09506000134352:21:ABC123` | `*( *idchar ":" ) 1*idchar` -- COMPLIANT |

**Detailed `method-specific-id` parsing:**

The pattern `*( *idchar ":" ) 1*idchar` allows colon-separated segments where each segment consists of idchar characters. Breaking `01:09506000134352:21:ABC123` into segments:

1. `01` (digits -- valid idchar) followed by `:`
2. `09506000134352` (digits -- valid idchar) followed by `:`
3. `21` (digits -- valid idchar) followed by `:`
4. `ABC123` (alpha + digits -- valid idchar, terminal segment ends with 1+ idchar)

All characters used (A-Z, a-z, 0-9) are within the `idchar` definition. No prohibited characters are used.

**VERDICT: COMPLIANT.** The DID format `did:galileo:01:{gtin}:21:{serial}` is fully valid per W3C DID Core v1.0 ABNF.

### 1.3 Entity DIDs Also Compliant

Entity DIDs like `did:galileo:brand:hermesparis` are also valid:
- `brand` (alpha -- valid idchar) followed by `:`
- `hermesparis` (alpha -- valid idchar, terminal)

Hyphens in entity names (e.g., `did:galileo:brand:resolver-test-brand`) are also valid since `-` is in the `idchar` definition.

### 1.4 Potential Issues in Code

**File:** `/Users/pierrebeunardeau/GalileoLuxury/packages/shared/src/validation/did.ts`

```typescript
const DID_REGEX = /^did:galileo:01:(\d{13,14}):21:(.+)$/;
```

| Issue | Severity | Detail |
|-------|----------|--------|
| Serial regex too permissive | MEDIUM | `.+` allows any characters including colons, which could cause ambiguity in parsing. The specification at `DID-METHOD.md` restricts serials to `1*20(ALPHA / DIGIT / "-" / ".")` -- the regex should match this. Currently the test file at `apps/api/test/resolver-qr.test.ts` uses serials with `/`, `#`, `?`, and spaces (`SN/TEST#123?A B`), which are NOT valid per the DID-METHOD.md ABNF. |
| Only validates AI `01` | LOW | The DID method spec at `specifications/identity/DID-METHOD.md` supports AIs `01`, `8006`, `8010`, `253`. The validation function only handles `01`. Acceptable for Sprint 2 scope but should be extended later. |
| GTIN accepts 13-digit | NOTE | The regex accepts 13-digit GTINs, but GS1 Digital Link 1.6.0 requires normalization to 14 digits. The DID spec ABNF allows `8*14DIGIT` for `ai-value`, but GS1 conformance requires 14-digit normalization before creating the DID. |

**Recommendation:** Tighten the serial regex to `/^did:galileo:01:(\d{13,14}):21:([A-Za-z0-9\-\.]{1,20})$/` to match the ABNF in `DID-METHOD.md`.

---

## 2. JSON-LD Resolver Response Compliance

### 2.1 Current Implementation

**File:** `/Users/pierrebeunardeau/GalileoLuxury/apps/api/src/routes/resolver/resolve.ts`

The resolver currently returns:

```json
{
  "@context": ["https://schema.org", "https://gs1.org/voc"],
  "@type": "Product",
  "name": "...",
  "description": "...",
  "gtin": "...",
  "category": "...",
  "status": "...",
  "passport": {
    "digitalLink": "...",
    "txHash": "...",
    "tokenAddress": "...",
    "chainId": 84532,
    "mintedAt": "..."
  },
  "brand": {
    "name": "...",
    "did": "..."
  }
}
```

### 2.2 Compliance Findings

#### A. `@context` Array -- PARTIALLY COMPLIANT

| Check | Status | Detail |
|-------|--------|--------|
| Array syntax valid | COMPLIANT | JSON-LD 1.1 supports arrays of context URIs |
| `https://schema.org` exists and is dereferenceable | COMPLIANT | Valid Schema.org context |
| `https://gs1.org/voc` dereferenceable | ISSUE | The canonical GS1 Web Vocabulary context URL is `https://ref.gs1.org/voc/` (different domain and trailing slash). The JSON-LD context document is at `https://ref.gs1.org/voc/data/gs1Voc.jsonld`. The URL `https://gs1.org/voc` may redirect but is not the canonical form for JSON-LD context resolution. |
| Galileo context missing | GAP | The codebase defines `galileo.jsonld` at `/Users/pierrebeunardeau/GalileoLuxury/specifications/schemas/contexts/galileo.jsonld` and the DPP core schema requires `https://vocab.galileoprotocol.io/contexts/galileo.jsonld`, but the resolver does not include it. Properties like `passport`, `status`, `txHash`, `tokenAddress`, `chainId` are not defined in either Schema.org or GS1 vocabularies, meaning they will be silently dropped by any JSON-LD processor. |

**Recommendation:** Change the `@context` to:
```json
["https://schema.org", "https://ref.gs1.org/voc/", "https://vocab.galileoprotocol.io/contexts/galileo.jsonld"]
```

#### B. `@type: "Product"` -- PARTIALLY COMPLIANT, SHOULD BE `IndividualProduct`

| Check | Status | Detail |
|-------|--------|--------|
| `Product` is valid Schema.org type | COMPLIANT | `schema:Product` exists |
| `IndividualProduct` more appropriate | RECOMMENDED | Schema.org defines `IndividualProduct` as "A single, identifiable product instance (e.g. a laptop with a particular serial number)". Since each DPP represents a unique product item with a serial number, `IndividualProduct` is semantically more accurate. It inherits from `Product` and maps to `unece:SpecifiedTradeProduct`. |
| DPP core schema uses `IndividualProduct` | INCONSISTENCY | `dpp-core.schema.json` (line 46) requires `"@type": "IndividualProduct"` as a const, but the resolver returns `"Product"`. These are inconsistent. |

Source: [Schema.org IndividualProduct](https://schema.org/IndividualProduct)

**Recommendation:** Change `@type` to `"IndividualProduct"` to align with the DPP core schema and Schema.org semantics.

#### C. Property Names -- MIXED COMPLIANCE

| Property | Schema.org Valid | GS1 Vocab Valid | Issue |
|----------|-----------------|-----------------|-------|
| `name` | YES (`schema:name`) | -- | COMPLIANT |
| `description` | YES (`schema:description`) | -- | COMPLIANT |
| `gtin` | YES (`schema:gtin`) | YES (`gs1:gtin`) | COMPLIANT |
| `category` | YES (`schema:category`) | -- | COMPLIANT |
| `status` | NO | NO | Not defined in either vocabulary. Must be in Galileo context or will be dropped. |
| `passport` | NO | NO | Not defined in either vocabulary. Custom Galileo property -- needs Galileo context. |
| `passport.digitalLink` | NO | NO | Custom property -- needs Galileo context. |
| `passport.txHash` | NO | NO | Custom property -- needs Galileo context. |
| `passport.tokenAddress` | NO | NO | Custom property -- needs Galileo context. |
| `passport.chainId` | NO | NO | Custom property -- needs Galileo context. |
| `passport.mintedAt` | NO | NO | Custom property -- needs Galileo context. |
| `brand` | YES (`schema:brand`) | -- | PARTIALLY -- see below |
| `brand.name` | YES (`schema:name`) | -- | COMPLIANT |
| `brand.did` | NO | NO | Custom property -- needs Galileo context. Uses bare `did` instead of `brandDID` which is defined in `galileo.jsonld`. |

**Key issue:** Without the Galileo JSON-LD context in `@context`, the properties `status`, `passport`, `brand.did` and all passport sub-properties are undefined terms. A JSON-LD processor performing expansion would silently drop them, meaning the data would be lost when consumed by any standards-compliant JSON-LD client.

#### D. `brand` Object Structure -- NON-COMPLIANT

In Schema.org, the `brand` property expects a value of type `Brand` or `Organization`. The current response has:

```json
"brand": { "name": "...", "did": "..." }
```

Issues:
1. Missing `"@type": "Brand"` -- JSON-LD processors cannot identify the type of this node.
2. The `did` property is not defined in any declared context.
3. Per Schema.org, a `Brand` has properties like `name`, `url`, `logo` but not `did`.

**Recommendation:**
```json
"brand": {
  "@type": "Brand",
  "@id": "did:galileo:brand:resolver-test-brand",
  "name": "Resolver Test Brand"
}
```

This uses `@id` (the standard JSON-LD identifier) instead of a custom `did` property, which is both more correct and more interoperable.

#### E. Content-Type Header -- COMPLIANT

The resolver correctly returns `content-type: application/ld+json` (line 63), which is the proper MIME type for JSON-LD responses.

#### F. Missing `@id` on Root Object -- NON-COMPLIANT (Best Practice)

The root JSON-LD object has no `@id`, making it an anonymous blank node in the RDF graph. For a product with a globally unique DID identifier, this should be set.

**Recommendation:** Add `"@id": "did:galileo:01:{gtin}:21:{serial}"` to the root object.

---

## 3. W3C Verifiable Credentials Data Model 2.0 Compliance

### 3.1 Context

The ROADMAP pins W3C VC Data Model 2.0 (May 2025 Recommendation). The specification at `/Users/pierrebeunardeau/GalileoLuxury/specifications/identity/verifiable-credentials.md` defines the required VC context as:

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://vocab.galileoprotocol.io/contexts/galileo.jsonld"
  ]
}
```

### 3.2 Assessment

The resolver response is NOT a Verifiable Credential -- it is a JSON-LD product description (DPP). This is architecturally correct. The VC layer is separate and used for:
- Authenticity claims
- CPO certifications
- Brand verification claims
- Compliance attestations

These are different document types serving different purposes. The VC specification (`verifiable-credentials.md`) correctly requires the W3C VC v2 context (`https://www.w3.org/ns/credentials/v2`) and defines proper credential types like `GalileoProductAuthenticity`, `GalileoCPOCertification`, etc.

The DID Documents described in `DID-DOCUMENT.md` correctly use the W3C DID context:
```json
"@context": ["https://www.w3.org/ns/did/v1", ...]
```

**VERDICT: COMPLIANT** for the VC specification alignment. The resolver response is not meant to be a VC and should not include VC contexts.

---

## 4. Schema.org Vocabulary Compliance

### 4.1 `Product` vs `IndividualProduct`

| Type | Definition | Appropriate For |
|------|-----------|-----------------|
| `Product` | Any offered product or service | Generic product listings, catalogs |
| `IndividualProduct` | "A single, identifiable product instance (e.g., a laptop with a particular serial number)" | DPP -- unique product with serial number |

Source: [Schema.org IndividualProduct](https://schema.org/IndividualProduct)

The type hierarchy is `Thing > Product > IndividualProduct`. `IndividualProduct` is disjoint from `ProductModel`, clarifying its purpose for individual instances rather than model definitions.

The DPP core schema correctly uses `IndividualProduct`, but the resolver implementation uses `Product`. These must be aligned.

### 4.2 Property Validation Against Schema.org

| Property | Schema.org Definition | Resolver Usage | Valid |
|----------|-----------------------|----------------|-------|
| `gtin` | Text. Valid GTIN (8, 12, 13, or 14 digits or GS1 Digital Link URL). | String of digits | YES |
| `name` | Text. The name of the item. | String | YES |
| `description` | Text. A description of the item. | String | YES |
| `brand` | Brand or Organization. | Object (missing @type) | NEEDS FIX |
| `category` | CategoryCode, PhysicalActivityCategory, Text, Thing, URL. | String | YES |
| `serialNumber` | Text. The serial number or any alphanumeric identifier. | NOT INCLUDED in resolver | MISSING |
| `countryOfOrigin` | Country. | NOT INCLUDED | MISSING (ESPR required) |
| `manufacturer` | Organization. | NOT INCLUDED | MISSING (ESPR required) |
| `productionDate` | Date. | NOT INCLUDED | MISSING (ESPR required) |

**Key gap:** The resolver response does not include `serialNumber`, which is the distinguishing property of `IndividualProduct` (and semantically essential for a per-item DPP). If the type is changed to `IndividualProduct`, `serialNumber` should be added.

### 4.3 GS1 Web Vocabulary

The GS1 Web Vocabulary at `https://ref.gs1.org/voc/` is designed as an extension to Schema.org. The latest JSON-LD is always available at `https://ref.gs1.org/voc/data/gs1Voc.jsonld`.

Source: [GS1 Web Vocabulary](https://www.gs1.org/gs1-web-vocabulary)

The resolver references `https://gs1.org/voc` which is NOT the canonical context URL. The correct URL should be either `https://ref.gs1.org/voc/` or `https://gs1.org/voc/` (with trailing slash). The current URL without trailing slash may not dereference to a valid JSON-LD context.

---

## 5. EU ESPR/DPP Compliance

### 5.1 Regulation Reference

EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781, Article 9, mandates Digital Product Passports with specific information fields. The regulation entered into force on 18 July 2024.

Sources:
- [European Commission ESPR page](https://commission.europa.eu/energy-climate-change-environment/standards-tools-and-labels/products-labelling-rules-and-requirements/ecodesign-sustainable-products-regulation_en)
- [ESPR DPP Regulation Requirements (TracexTech)](https://tracextech.com/espr-dpp-regulation/)
- [Circularise: DPPs Required by EU Legislation](https://www.circularise.com/blogs/dpps-required-by-eu-legislation-across-sectors)

### 5.2 Resolver Response vs ESPR Mandatory Fields

The CURRENT resolver response returns a minimal product object. The DPP core schema (`dpp-core.schema.json` at `/Users/pierrebeunardeau/GalileoLuxury/specifications/schemas/dpp/dpp-core.schema.json`) defines the FULL ESPR-compliant structure with all mandatory fields, but the resolver does not populate them.

| ESPR Mandatory Field | In dpp-core.schema.json | In Resolver Response | Gap |
|---------------------|------------------------|---------------------|-----|
| Unique identifier (UID per ISO/IEC 15459) | YES (`@id` + `identifier`) | Partial (only `gtin`) | Missing DID as `@id`, missing `identifier` PropertyValue object |
| Product name | YES (`name`) | YES | -- |
| Brand/manufacturer | YES (`brand`, `manufacturer`) | Partial (brand only, no manufacturer) | Missing `manufacturer` |
| Country of origin | YES (`countryOfOrigin`, ISO 3166-1 alpha-3) | NO | MISSING |
| Production date | YES (`productionDate`, ISO 8601) | NO | MISSING |
| Material composition | YES (`materialComposition[]`, sum = 100%) | NO | MISSING |
| Carbon footprint | YES (`carbonFootprint`, ISO 14067) | NO | MISSING |
| Repair instructions | YES (`repairInstructions`) | NO | MISSING |
| Compliance declaration | YES (`complianceDeclaration`) | NO | MISSING |

### 5.3 Timeline

| Year | Category | Impact on Galileo |
|------|----------|-------------------|
| 2027 | Textiles/apparel/footwear | DPP mandatory -- resolver must return full ESPR fields |
| 2027-2028 | Leather goods (pending delegated act) | Directly relevant to luxury brands |
| 2028+ | Watches/jewelry | Delegated acts pending |

### 5.4 Assessment

The DPP core schema is ESPR-compliant for the data model -- it defines all mandatory fields with proper validation rules (material percentages summing to 100%, ISO 14067 methodology for carbon footprint, repairability index 1-10, etc.). However, the actual resolver implementation returns only a minimal subset. This is acceptable for Sprint 2 MVP scope. The ESPR readiness guide at `/Users/pierrebeunardeau/GalileoLuxury/specifications/compliance/guides/espr-readiness.md` provides a comprehensive implementation checklist.

---

## 6. JSON-LD Best Practices Compliance

### 6.1 `@context` Array Usage

Per [W3C JSON-LD Best Practices](https://w3c.github.io/json-ld-bp/):

- Arrays of contexts are valid and processed in order (last-defined-wins for conflicting terms)
- Remote contexts should be cached (24h recommended)
- Contexts should be served with appropriate `Cache-Control` headers
- Treat contexts as part of an information exchange specification -- inspect, vet, and cache them

The current implementation uses an array `["https://schema.org", "https://gs1.org/voc"]`, which is syntactically correct JSON-LD but has the semantic issues noted in Section 2.2.A.

### 6.2 Galileo JSON-LD Context Analysis

The Galileo context file at `/Users/pierrebeunardeau/GalileoLuxury/specifications/schemas/contexts/galileo.jsonld` is well-structured:

- Uses `@version: 1.1` (JSON-LD 1.1 processing mode)
- Sets `@vocab: "https://schema.org/"` as the default vocabulary (any unmapped term is assumed Schema.org)
- Defines prefixes for `gs1`, `epcis`, `galileo`, `espr`, `xsd`, `did`, `sec`
- Maps Schema.org types: `IndividualProduct`, `Product`, `Brand`, `Organization`, `PropertyValue`, `QuantitativeValue`
- Maps Schema.org properties: `gtin`, `serialNumber`, `name`, `description`, `brand`, `manufacturer`, etc.
- Defines Galileo-specific types: `MaterialComponent`, `CarbonFootprint`, `RepairGuide`, `ComplianceDeclaration`, `ArtisanAttribution`
- Defines Galileo-specific properties: `materialComposition`, `carbonFootprint`, `repairInstructions`, `complianceDeclaration`, `artisanAttribution`, etc.

**Potential concern:** The `@vocab: "https://schema.org/"` setting means any property NOT explicitly mapped will be silently assumed to be a Schema.org property. This could cause incorrect RDF triples if properties like `status`, `passport`, `txHash`, etc. are used without explicit Galileo namespace mapping. These specific properties are NOT mapped in the context file, so even with the Galileo context included, they would still be incorrectly resolved to `https://schema.org/status`, `https://schema.org/passport`, etc.

---

## 7. DID Document Compliance (Specification Review)

The DID Document specification at `/Users/pierrebeunardeau/GalileoLuxury/specifications/identity/DID-DOCUMENT.md` is well-structured and W3C compliant:

| Requirement | Status | Detail |
|-------------|--------|--------|
| `@context` includes `https://www.w3.org/ns/did/v1` first | COMPLIANT | Correctly ordered per W3C requirement |
| `id` is a valid DID | COMPLIANT | Uses `did:galileo:...` format |
| `controller` is a DID | COMPLIANT | References brand DID |
| `verificationMethod` structure | COMPLIANT | Supports Ed25519VerificationKey2020, EcdsaSecp256k1VerificationKey2019, JsonWebKey2020 |
| `service` endpoints follow W3C structure | COMPLIANT | Has required `id`, `type`, `serviceEndpoint` |
| `alsoKnownAs` for GS1 Digital Link | GOOD PRACTICE | Links DID to its GS1 Digital Link URL |
| Custom Galileo context included | COMPLIANT | `https://galileoprotocol.io/ns/v1` included in context |

**Note:** The DID Document spec uses `https://galileoprotocol.io/ns/v1` while the DPP schema uses `https://vocab.galileoprotocol.io/contexts/galileo.jsonld`. These are different contexts for different purposes (identity layer vs product data layer), which is appropriate, but the distinction should be documented to avoid confusion.

---

## 8. Summary of Compliance Gaps

### 8.1 Critical (Must Fix)

| # | Gap | Files Affected | Recommendation |
|---|-----|----------------|----------------|
| C1 | Resolver returns undefined properties without Galileo context -- JSON-LD processors will silently drop `status`, `passport`, and `brand.did` | `apps/api/src/routes/resolver/resolve.ts` | Add `https://vocab.galileoprotocol.io/contexts/galileo.jsonld` to `@context` array. Also add explicit mappings for `status`, `passport`, and sub-properties in `galileo.jsonld`. |
| C2 | `@type` mismatch: resolver uses `"Product"`, DPP schema requires `"IndividualProduct"` | `apps/api/src/routes/resolver/resolve.ts` | Change to `"IndividualProduct"` |
| C3 | `brand` object missing `@type` and uses non-standard `did` property | `apps/api/src/routes/resolver/resolve.ts` | Add `"@type": "Brand"` and use `"@id"` (JSON-LD standard) instead of `"did"` |

### 8.2 Important (Should Fix)

| # | Gap | Files Affected | Recommendation |
|---|-----|----------------|----------------|
| I1 | GS1 context URL `https://gs1.org/voc` is not canonical | `apps/api/src/routes/resolver/resolve.ts` | Change to `https://ref.gs1.org/voc/` |
| I2 | No `@id` on root JSON-LD object (anonymous blank node) | `apps/api/src/routes/resolver/resolve.ts` | Add `"@id": "did:galileo:01:{gtin}:21:{serial}"` |
| I3 | `serialNumber` missing from resolver response | `apps/api/src/routes/resolver/resolve.ts` | Add `serialNumber` field (semantically required for `IndividualProduct`) |
| I4 | DID regex too permissive for serial (`.+` instead of constrained charset) | `packages/shared/src/validation/did.ts` | Tighten to `[A-Za-z0-9\-\.]{1,20}` per DID-METHOD.md ABNF |
| I5 | Resolver response missing ESPR mandatory fields (for 2027 compliance) | `apps/api/src/routes/resolver/resolve.ts`, DB schema | Extend to include `materialComposition`, `carbonFootprint`, `repairInstructions`, `complianceDeclaration`, `countryOfOrigin`, `productionDate`, `manufacturer` when data is available |

### 8.3 Minor (Nice to Have)

| # | Gap | Files Affected | Recommendation |
|---|-----|----------------|----------------|
| M1 | DID validation only supports AI `01` | `packages/shared/src/validation/did.ts` | Extend to support `8006`, `8010`, `253` per DID-METHOD.md |
| M2 | GTIN not normalized to 14 digits in DID | `packages/shared/src/validation/did.ts` | Normalize GTIN to 14 digits before generating DID |
| M3 | Galileo JSON-LD context not yet hosted at its canonical URL | Infrastructure | Deploy `galileo.jsonld` to `https://vocab.galileoprotocol.io/contexts/galileo.jsonld` |
| M4 | Test assertions expect `@type: "Product"` | `apps/api/test/resolver-qr.test.ts` (line 184) | Update test to expect `"IndividualProduct"` when C2 is fixed |
| M5 | `galileo.jsonld` missing mappings for `status`, `passport.*` properties | `specifications/schemas/contexts/galileo.jsonld` | Add explicit mappings to avoid `@vocab` fallback to Schema.org |

---

## 9. Recommendations

### 9.1 Corrected Resolver Response Structure

The resolver response should look like this to be fully JSON-LD compliant:

```json
{
  "@context": [
    "https://schema.org",
    "https://ref.gs1.org/voc/",
    "https://vocab.galileoprotocol.io/contexts/galileo.jsonld"
  ],
  "@type": "IndividualProduct",
  "@id": "did:galileo:01:04006381333931:21:SN-ACTIVE-001",
  "name": "Active Resolver Product",
  "description": "An active product for resolver tests",
  "gtin": "04006381333931",
  "serialNumber": "SN-ACTIVE-001",
  "category": "jewelry",
  "brand": {
    "@type": "Brand",
    "@id": "did:galileo:brand:resolver-test-brand",
    "name": "Resolver Test Brand"
  },
  "galileo:status": "ACTIVE",
  "galileo:passport": {
    "@type": "galileo:DigitalPassport",
    "galileo:digitalLink": "https://id.galileoprotocol.io/01/04006381333931/21/SN-ACTIVE-001",
    "galileo:txHash": "0x...",
    "galileo:tokenAddress": "0x...",
    "galileo:chainId": 84532,
    "galileo:mintedAt": "2026-03-04T..."
  }
}
```

### 9.2 Architecture Suggestions

1. **Two-tier response:** Consider a minimal public response (current) and a full DPP response (ESPR-compliant) based on content negotiation or `?linkType=` parameter, as described in the resolution protocol specification at `specifications/resolver/resolution-protocol.md`.
2. **Context hosting:** Deploy `galileo.jsonld` at the canonical URL before production. Serve with `Cache-Control: public, max-age=86400` and `Content-Type: application/ld+json` headers.
3. **Validation layer:** Add JSON-LD validation in CI to catch context/type mismatches automatically.
4. **Prefix custom properties:** Use the `galileo:` prefix for custom properties (e.g., `galileo:status` instead of bare `status`) and add explicit mappings in `galileo.jsonld` to prevent `@vocab` fallback issues.

### 9.3 Risks and Pitfalls

| Risk | Mitigation |
|------|------------|
| JSON-LD processors silently drop undefined terms | Add Galileo context to `@context` array (C1) and add explicit property mappings |
| GS1 conformance test suite may reject non-canonical context URL | Use `https://ref.gs1.org/voc/` (I1) |
| ESPR enforcement in 2027 requires full DPP fields | Progressive field addition during Sprints 3-4 (I5) |
| Schema.org type mismatch could affect SEO/structured data validation | Fix `Product` to `IndividualProduct` (C2) |
| Context file not yet served from Galileo domain | Deploy before production; use inline context object as fallback during development (M3) |
| `@vocab` fallback silently maps unknown properties to Schema.org | Add explicit mappings for all custom properties in `galileo.jsonld` (M5) |

### 9.4 Open Questions

1. Should the Galileo context (`galileo.jsonld`) be hosted before Sprint 2 exit, or is it acceptable to defer to Sprint 3?
2. The GS1 resolver conformance test suite (mentioned in ROADMAP open questions) -- should it be integrated into CI now or deferred?
3. Should the resolver support content negotiation (JSON-LD vs HTML vs linkset) in Sprint 2, or is that Sprint 3 scope?
4. The Galileo context file uses `@vocab: "https://schema.org/"` -- is this intentional? It means any property not explicitly mapped will be assumed to be a Schema.org property, which may cause silent mis-mappings for Galileo-specific properties.
5. Should the DID Document context (`https://galileoprotocol.io/ns/v1`) and the DPP context (`https://vocab.galileoprotocol.io/contexts/galileo.jsonld`) be merged into a single context, or is the separation justified?

---

## Sources

- [W3C DID Core v1.0](https://www.w3.org/TR/did-core/) -- DID syntax ABNF, Section 3.1
- [W3C DID Core v1.1 (experimental)](https://w3c-ccg.github.io/did-spec/)
- [W3C DID Core Issue #45 -- method-specific-id syntax](https://github.com/w3c/did-core/issues/45)
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [W3C VC 2.0 is now a Recommendation (May 2025)](https://www.w3.org/news/2025/the-verifiable-credentials-2-0-family-of-specifications-is-now-a-w3c-recommendation/)
- [Schema.org Product type](https://schema.org/Product)
- [Schema.org IndividualProduct type](https://schema.org/IndividualProduct)
- [GS1 Web Vocabulary](https://www.gs1.org/gs1-web-vocabulary)
- [GS1 Web Vocabulary JSON-LD](https://ref.gs1.org/voc/data/gs1Voc.jsonld)
- [GS1 Web Vocabulary Product Page](https://ref.gs1.org/voc/Product)
- [GS1 Conformant Resolver Standard 1.2.0](https://ref.gs1.org/standards/resolver/)
- [GS1 Digital Link URI Syntax 1.6.0](https://ref.gs1.org/standards/digital-link/uri-syntax/)
- [ESPR Regulation 2024/1781 (European Commission)](https://commission.europa.eu/energy-climate-change-environment/standards-tools-and-labels/products-labelling-rules-and-requirements/ecodesign-sustainable-products-regulation_en)
- [ESPR DPP Regulation Requirements (TracexTech)](https://tracextech.com/espr-dpp-regulation/)
- [Circularise: DPPs Required by EU Legislation](https://www.circularise.com/blogs/dpps-required-by-eu-legislation-across-sectors)
- [JSON-LD Best Practices (W3C)](https://w3c.github.io/json-ld-bp/)
- [JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)

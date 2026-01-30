# Phase 3: Core Data Models - Research

**Researched:** 2026-01-30
**Domain:** ESPR-compliant DPP schema, EPCIS 2.0 lifecycle events, JSON-LD semantic modeling
**Confidence:** MEDIUM-HIGH (ESPR framework established, delegated acts pending; EPCIS 2.0/CBV 2.0 finalized)

## Summary

This research addresses the core data modeling requirements for Galileo: ESPR-compliant Digital Product Passport schema, lifecycle event schemas aligned with EPCIS 2.0, and JSON-LD patterns for semantic interoperability. The EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781 mandates Digital Product Passports with specific fields, data carriers (QR/NFC/RFID), and tiered access controls. While the ESPR framework is established, product-specific delegated acts for textiles (relevant to luxury apparel) are expected in 2026-2027, with implementation from 2027-2028.

GS1 EPCIS 2.0 (ratified June 2022) provides the standard for lifecycle event tracking with native JSON-LD support and the Core Business Vocabulary (CBV) 2.0 supplying standardized vocabulary for business steps (commissioning, shipping, retail_selling, repairing, decommissioning) and dispositions (active, in_transit, retail_sold, damaged). The combination of GS1 Digital Link URIs for product identification and EPCIS events for lifecycle tracking is the established industry approach adopted by the EU for DPP interoperability.

For luxury-specific requirements, the Aura Blockchain Consortium (LVMH, Prada, Richemont/Cartier, OTB) has logged 50+ million products using blockchain-backed DPPs, while Arianee provides an open protocol with a comprehensive NFT schema covering apparel, accessories, and durable goods. Molecular signature authentication (DNA tagging, spectral fingerprinting) is emerging for ultra-luxury provenance verification, with companies like Applied DNA Sciences, SMX, and Haelixa providing solutions for leather, textiles, and precious materials.

**Primary recommendation:** Model DPP core schema using JSON-LD with Schema.org Product vocabulary extended for ESPR fields and Galileo-specific luxury attributes; model lifecycle events as EPCIS 2.0 ObjectEvent/TransactionEvent/TransformationEvent with CBV 2.0 vocabulary; use GS1 Digital Link URI syntax for unique identifiers linking to the Phase 2 `did:galileo` method.

## Standard Stack

The established standards and specifications for this domain:

### Core Standards

| Standard | Version | Purpose | Why Standard |
|----------|---------|---------|--------------|
| **ESPR** | 2024/1781 | DPP regulatory framework | EU mandatory, entering force 2026-2027 |
| **EPCIS** | 2.0 (June 2022) | Lifecycle event capture | GS1 standard, EU-endorsed for DPP |
| **CBV** | 2.0 (June 2022) | Event vocabulary | Companion to EPCIS, defines bizStep/disposition |
| **JSON-LD** | 1.1 | Semantic data format | W3C standard, DPP interoperability requirement |
| **Schema.org** | current | Product vocabulary | Web standard, ESPR-referenced |
| **GS1 Digital Link** | 1.4.0 | URI syntax for identifiers | DPP data carrier requirement |
| **ISO 15459** | 2015 | Unique identifier format | ESPR compliance requirement |

### Supporting Standards

| Standard | Version | Purpose | When to Use |
|----------|---------|---------|-------------|
| **W3C Verifiable Credentials** | 2.0 (May 2025) | Claims attestation | Certifications, compliance declarations |
| **W3C DID** | 1.0 | Product identity | Links to Phase 2 did:galileo |
| **GoodRelations** | 1.0 | E-commerce vocabulary | Product offers, pricing |

### Reference Implementations

| Implementation | Organization | Relevance |
|----------------|--------------|-----------|
| **Aura Blockchain** | LVMH, Prada, Richemont | 50M+ luxury products, industry standard |
| **Arianee Protocol** | Open consortium | NFT-based DPP schema, apparel focus |
| **EU Battery Passport** | EU Commission | First mandatory DPP, schema reference |
| **OpenEPCIS** | Open source | EPCIS 2.0 reference implementation |

## Architecture Patterns

### Recommended Schema Structure

```
schemas/
├── contexts/
│   ├── galileo.jsonld           # Main Galileo JSON-LD context
│   ├── espr.jsonld              # ESPR-specific vocabulary extension
│   ├── luxury.jsonld            # Luxury-specific extensions (terroir, artisan)
│   └── molecular.jsonld         # Molecular signature extension
├── dpp/
│   ├── dpp-core.schema.json     # ESPR-compliant DPP core schema
│   ├── dpp-textile.schema.json  # Textile-specific fields
│   ├── dpp-leather.schema.json  # Leather goods specific
│   └── dpp-watch.schema.json    # Timepiece specific
├── events/
│   ├── event-base.schema.json   # Common EPCIS event structure
│   ├── creation.schema.json     # Product creation (commissioning)
│   ├── commission.schema.json   # ID assignment (commissioning)
│   ├── sale.schema.json         # TransactionEvent (first sale)
│   ├── repair.schema.json       # TransformationEvent (MRO)
│   ├── resale.schema.json       # TransactionEvent (secondary)
│   └── decommission.schema.json # ObjectEvent (end of life)
└── extensions/
    ├── molecular-signature.schema.json
    ├── artisan-attribution.schema.json
    └── terroir-provenance.schema.json
```

### Pattern 1: JSON-LD Context Design

**What:** Define Galileo vocabulary context extending Schema.org and GS1 namespaces
**When to use:** All DPP and event documents must include context for semantic interoperability
**Source:** W3C JSON-LD Best Practices

```json
{
  "@context": [
    "https://schema.org",
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    {
      "galileo": "https://vocab.galileo.luxury/",
      "espr": "https://vocab.galileo.luxury/espr/",
      "cbv": "https://ref.gs1.org/cbv/",

      "materialComposition": "galileo:materialComposition",
      "carbonFootprint": "espr:carbonFootprint",
      "repairInstructions": "espr:repairInstructions",
      "complianceDeclaration": "espr:complianceDeclaration",

      "molecularSignature": "galileo:molecularSignature",
      "artisanAttribution": "galileo:artisanAttribution",
      "terroirProvenance": "galileo:terroirProvenance"
    }
  ]
}
```

### Pattern 2: ESPR DPP Core Schema

**What:** DPP schema with mandatory ESPR fields for luxury goods
**When to use:** All product passports must include ESPR-required fields
**Source:** ESPR 2024/1781, Arianee Schema

```json
{
  "@context": "https://vocab.galileo.luxury/context/galileo.jsonld",
  "@type": "IndividualProduct",
  "@id": "did:galileo:01:09506000134352:21:ABC123",

  "identifier": {
    "@type": "PropertyValue",
    "propertyID": "gtin",
    "value": "09506000134352"
  },
  "serialNumber": "ABC123",

  "name": "Birkin 35 Togo Gold Hardware",
  "brand": {
    "@type": "Brand",
    "@id": "did:galileo:brand:hermesparis",
    "name": "Hermes"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "Hermes International"
  },
  "model": "Birkin 35",
  "productionDate": "2024-06-15",
  "countryOfOrigin": "FRA",

  "materialComposition": [
    {
      "@type": "galileo:MaterialComponent",
      "material": "Togo Leather",
      "percentage": 85,
      "origin": "FRA",
      "certified": true,
      "certificationRef": "did:galileo:cert:leather:12345"
    },
    {
      "@type": "galileo:MaterialComponent",
      "material": "Palladium Hardware",
      "percentage": 10,
      "origin": "DEU"
    }
  ],

  "carbonFootprint": {
    "@type": "espr:CarbonFootprint",
    "value": 45.2,
    "unit": "kgCO2e",
    "scope": ["Scope1", "Scope2", "Scope3"],
    "methodology": "ISO 14067:2018",
    "verificationDate": "2024-05-01"
  },

  "repairInstructions": {
    "@type": "espr:RepairGuide",
    "url": "https://service.hermes.com/repair/birkin",
    "languages": ["en", "fr", "zh", "ja"],
    "repairabilityIndex": 8.5
  },

  "complianceDeclaration": {
    "@type": "espr:ComplianceDeclaration",
    "regulation": "ESPR 2024/1781",
    "compliant": true,
    "declarationDate": "2024-06-01",
    "notifiedBody": "did:galileo:notified:EU-NB-1234"
  }
}
```

### Pattern 3: EPCIS 2.0 Lifecycle Events

**What:** Lifecycle events using EPCIS 2.0 JSON-LD binding with CBV 2.0 vocabulary
**When to use:** All product lifecycle transitions

#### Creation Event (ObjectEvent + commissioning)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    "https://vocab.galileo.luxury/context/galileo.jsonld"
  ],
  "type": "ObjectEvent",
  "eventID": "ni:///sha-256;abc123...",
  "eventTime": "2024-06-15T10:30:00.000+02:00",
  "eventTimeZoneOffset": "+02:00",
  "action": "ADD",
  "bizStep": "cbv:BizStep-commissioning",
  "disposition": "cbv:Disp-active",

  "epcList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],

  "readPoint": {
    "id": "urn:epc:id:sgln:9506000.00001.atelier-paris"
  },

  "ilmd": {
    "galileo:productionBatch": "2024-Q2-PARIS-042",
    "galileo:artisanId": "did:galileo:artisan:jean-dupont",
    "galileo:qualityGrade": "A+",
    "galileo:productDID": "did:galileo:01:09506000134352:21:ABC123"
  },

  "galileo:dppContentHash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

#### First Sale Event (TransactionEvent)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    "https://vocab.galileo.luxury/context/galileo.jsonld"
  ],
  "type": "TransactionEvent",
  "eventID": "ni:///sha-256;def456...",
  "eventTime": "2024-07-20T14:15:00.000+01:00",
  "eventTimeZoneOffset": "+01:00",
  "action": "ADD",
  "bizStep": "cbv:BizStep-retail_selling",
  "disposition": "cbv:Disp-retail_sold",

  "epcList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],

  "bizTransactionList": [
    {
      "type": "cbv:BTT-po",
      "bizTransaction": "urn:galileo:invoice:HRM-2024-78901"
    }
  ],

  "sourceList": [
    {
      "type": "cbv:SDT-owning_party",
      "source": "did:galileo:brand:hermesparis"
    }
  ],
  "destinationList": [
    {
      "type": "cbv:SDT-owning_party",
      "destination": "did:galileo:customer:anon-hash-xyz"
    }
  ],

  "readPoint": {
    "id": "urn:epc:id:sgln:9506000.00002.boutique-london"
  },

  "galileo:warrantyActivation": {
    "startDate": "2024-07-20",
    "duration": "P2Y",
    "terms": "https://warranty.hermes.com/birkin"
  }
}
```

#### Repair/MRO Event (TransformationEvent)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    "https://vocab.galileo.luxury/context/galileo.jsonld"
  ],
  "type": "TransformationEvent",
  "eventID": "ni:///sha-256;ghi789...",
  "eventTime": "2025-03-10T09:00:00.000+01:00",
  "eventTimeZoneOffset": "+01:00",
  "bizStep": "cbv:BizStep-repairing",
  "disposition": "cbv:Disp-active",

  "inputEPCList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],
  "outputEPCList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],

  "readPoint": {
    "id": "urn:epc:id:sgln:9506000.00003.service-center-paris"
  },

  "ilmd": {
    "galileo:repairType": "leather_reconditioning",
    "galileo:repairDescription": "Full leather reconditioning and hardware polish",
    "galileo:technicianId": "did:galileo:technician:marie-laurent",
    "galileo:partsReplaced": [],
    "galileo:serviceOrderRef": "SRV-2025-12345"
  },

  "galileo:serviceHistory": {
    "serviceNumber": 1,
    "previousServices": [],
    "warrantyStatus": "in_warranty"
  }
}
```

#### Resale Event (TransactionEvent)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    "https://vocab.galileo.luxury/context/galileo.jsonld"
  ],
  "type": "TransactionEvent",
  "eventID": "ni:///sha-256;jkl012...",
  "eventTime": "2026-01-15T16:30:00.000+01:00",
  "eventTimeZoneOffset": "+01:00",
  "action": "ADD",
  "bizStep": "cbv:BizStep-retail_selling",
  "disposition": "cbv:Disp-retail_sold",

  "epcList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],

  "bizTransactionList": [
    {
      "type": "cbv:BTT-po",
      "bizTransaction": "urn:galileo:resale:VESTIAIRE-2026-45678"
    }
  ],

  "sourceList": [
    {
      "type": "cbv:SDT-owning_party",
      "source": "did:galileo:customer:anon-hash-xyz"
    }
  ],
  "destinationList": [
    {
      "type": "cbv:SDT-owning_party",
      "destination": "did:galileo:customer:anon-hash-abc"
    }
  ],

  "galileo:resaleContext": {
    "channel": "certified_marketplace",
    "marketplace": "did:galileo:marketplace:vestiaire",
    "authenticatedBy": "did:galileo:authenticator:entrupy",
    "cpoStatus": "certified_pre_owned",
    "condition": "excellent",
    "previousOwnerCount": 1
  }
}
```

#### Decommission Event (ObjectEvent)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    "https://vocab.galileo.luxury/context/galileo.jsonld"
  ],
  "type": "ObjectEvent",
  "eventID": "ni:///sha-256;mno345...",
  "eventTime": "2030-06-01T11:00:00.000+02:00",
  "eventTimeZoneOffset": "+02:00",
  "action": "DELETE",
  "bizStep": "cbv:BizStep-decommissioning",
  "disposition": "cbv:Disp-destroyed",

  "epcList": [
    "https://id.gs1.org/01/09506000134352/21/ABC123"
  ],

  "readPoint": {
    "id": "urn:epc:id:sgln:9506000.00004.recycling-center"
  },

  "ilmd": {
    "galileo:decommissionReason": "end_of_life_recycling",
    "galileo:recyclingPartner": "did:galileo:recycler:eco-luxury",
    "galileo:materialsRecovered": [
      {"material": "leather", "weight": "0.8kg", "disposition": "recycled"},
      {"material": "palladium", "weight": "0.15kg", "disposition": "recovered"}
    ]
  }
}
```

### Pattern 4: Molecular Signature Extension

**What:** Schema extension for DNA/spectral authentication of materials
**When to use:** Ultra-luxury products requiring material provenance verification
**Source:** Applied DNA Sciences, SMX, Haelixa research

```json
{
  "@context": "https://vocab.galileo.luxury/context/molecular.jsonld",

  "galileo:molecularSignature": {
    "@type": "galileo:MolecularAuthentication",

    "signatureType": "DNA_TAGGANT",
    "provider": "did:galileo:auth-provider:applied-dna",

    "leatherProvenance": {
      "@type": "galileo:LeatherSignature",
      "tanneryCertified": true,
      "tanneryId": "did:galileo:tannery:tanneries-haas",
      "hideOrigin": "FRA",
      "dnaMarkerRef": "ADNAS-LTH-2024-78901",
      "verificationMethod": "PCR_AMPLIFICATION",
      "signatureDate": "2024-05-01"
    },

    "spectralFingerprint": {
      "@type": "galileo:SpectralSignature",
      "method": "NIR_SPECTROSCOPY",
      "wavelengthRange": "900-2500nm",
      "referenceHash": "sha256:abc123...",
      "captureDate": "2024-06-15"
    },

    "terroirData": {
      "@type": "galileo:TerroirAuthentication",
      "materialType": "leather",
      "geographicOrigin": {
        "country": "FRA",
        "region": "Nouvelle-Aquitaine",
        "specificArea": "Perigord"
      },
      "isotopicSignature": {
        "method": "IRMS",
        "delta13C": -24.5,
        "delta15N": 6.2
      }
    }
  }
}
```

### Anti-Patterns to Avoid

- **Flat schemas without JSON-LD context:** Always include @context for semantic interoperability
- **Custom event types instead of EPCIS:** Use standard ObjectEvent/TransactionEvent/TransformationEvent
- **Inventing new vocabulary terms:** Extend Schema.org/GS1 CBV before creating new terms
- **Hardcoding identifiers:** Use GS1 Digital Link URI syntax with 14-digit GTIN
- **PII in event data:** Store customer identifiers as anonymized hashes, never plain PII (Phase 2 EDPB compliance)
- **Monolithic DPP schema:** Separate core, product-specific, and extension schemas

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Product identifiers | Custom ID scheme | GS1 Digital Link URI (GTIN+serial) | ISO 15459 compliance, resolver interoperability |
| Event vocabulary | Custom event types | EPCIS 2.0 + CBV 2.0 | EU DPP interoperability requirement |
| Material composition | Custom material ontology | Schema.org + ESPR vocabulary | Regulatory compliance, standardization |
| JSON-LD context | Inline definitions | External context files | Caching, reuse, maintenance |
| Event hashing | Custom hash format | ni:///sha-256 URN (RFC 6920) | EPCIS 2.0 eventID standard |
| Ownership transfer | Custom transfer schema | TransactionEvent + SDT vocabulary | CBV source/destination types |
| Carbon footprint | Custom CO2 schema | ESPR carbonFootprint + ISO 14067 | Regulatory acceptance |

**Key insight:** The EU has explicitly aligned DPP requirements with GS1 standards. Custom schemas will not interoperate with the central EU DPP registry launching July 2026.

## Common Pitfalls

### Pitfall 1: Ignoring EPCIS Action Semantics

**What goes wrong:** Using wrong action value (ADD/OBSERVE/DELETE) for event type
**Why it happens:** Confusion between event type and action
**How to avoid:**
- `ADD`: Object comes into scope (commissioning, ownership transfer TO)
- `OBSERVE`: Object observed without state change (inspection, counting)
- `DELETE`: Object leaves scope (decommissioning, ownership transfer FROM)
**Warning signs:** Commissioning event with action=OBSERVE; sale event with action=DELETE

### Pitfall 2: Missing ilmd for Creation Events

**What goes wrong:** Product attributes not captured at creation time
**Why it happens:** ilmd (Instance/Lot Master Data) only valid at commissioning
**How to avoid:** Include all immutable product attributes (batch, artisan, quality grade) in ilmd on first ObjectEvent
**Warning signs:** Empty ilmd on commissioning events; trying to add ilmd to later events

### Pitfall 3: GS1 Digital Link GTIN Format

**What goes wrong:** GTIN values not zero-padded to 14 digits
**Why it happens:** Using GTIN-8/12/13 directly without padding
**How to avoid:** Always express GTIN as 14 digits: `09506000134352` not `9506000134352`
**Warning signs:** GS1 Digital Link URIs with <14 digit GTIN values

### Pitfall 4: Missing eventTimeZoneOffset

**What goes wrong:** Events cannot be properly ordered across time zones
**Why it happens:** Treating eventTime as sufficient
**How to avoid:** Always include eventTimeZoneOffset with eventTime; use ISO 8601 format
**Warning signs:** Events with eventTime but no eventTimeZoneOffset

### Pitfall 5: Confusing TransformationEvent for Repairs

**What goes wrong:** Using ObjectEvent for repairs that change product state
**Why it happens:** Repairs don't always add/remove parts
**How to avoid:** Use TransformationEvent when product is modified (even reconditioning); same EPC in input and output is valid
**Warning signs:** Repair history lost; condition changes not traceable

### Pitfall 6: Schema.org Type Confusion

**What goes wrong:** Using Product instead of IndividualProduct for tracked items
**Why it happens:** Not understanding Schema.org product type hierarchy
**How to avoid:**
- `Product`: Generic product information (catalog)
- `ProductModel`: Manufacturer specification (datasheet)
- `IndividualProduct`: Specific serialized item (DPP subject)
**Warning signs:** DPP documents using @type: Product without serialNumber

### Pitfall 7: Context Array Ordering

**What goes wrong:** Local definitions overridden by external context
**Why it happens:** JSON-LD context arrays process in order, last wins
**How to avoid:** Place local definitions last: `["https://schema.org", "https://gs1.org/...", { "local": "..." }]`
**Warning signs:** Custom terms resolving to wrong URIs

## Code Examples

### DPP Document Validation (TypeScript)

```typescript
// Source: Galileo DPP validator pattern
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { JsonLdProcessor } from 'jsonld';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  expandedDocument?: object;
}

async function validateDPP(dpp: object): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. JSON Schema validation
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  const schemaValid = ajv.validate(dppCoreSchema, dpp);
  if (!schemaValid) {
    errors.push(...ajv.errors!.map(e => `Schema: ${e.instancePath} ${e.message}`));
  }

  // 2. JSON-LD expansion (verifies context resolution)
  let expanded: object | undefined;
  try {
    expanded = await JsonLdProcessor.expand(dpp);
  } catch (e) {
    errors.push(`JSON-LD: Context expansion failed - ${e.message}`);
  }

  // 3. ESPR mandatory field check
  const espr = dpp as any;
  if (!espr.materialComposition?.length) {
    errors.push('ESPR: materialComposition is required');
  }
  if (!espr.carbonFootprint) {
    errors.push('ESPR: carbonFootprint is required');
  }
  if (!espr.repairInstructions) {
    errors.push('ESPR: repairInstructions is required');
  }
  if (!espr.complianceDeclaration) {
    errors.push('ESPR: complianceDeclaration is required');
  }

  // 4. GS1 identifier validation
  const gtin = espr.identifier?.value;
  if (gtin && gtin.length !== 14) {
    errors.push(`GS1: GTIN must be 14 digits (got ${gtin.length})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    expandedDocument: expanded
  };
}
```

### EPCIS Event Builder (TypeScript)

```typescript
// Source: EPCIS 2.0 specification patterns
import { createHash } from 'crypto';

interface EPCISEvent {
  '@context': string[];
  type: 'ObjectEvent' | 'TransactionEvent' | 'TransformationEvent';
  eventID: string;
  eventTime: string;
  eventTimeZoneOffset: string;
  action: 'ADD' | 'OBSERVE' | 'DELETE';
  bizStep: string;
  disposition: string;
  epcList?: string[];
  inputEPCList?: string[];
  outputEPCList?: string[];
  readPoint: { id: string };
  ilmd?: Record<string, any>;
  [key: string]: any;
}

function createEventID(event: Omit<EPCISEvent, 'eventID'>): string {
  // RFC 6920 ni: URI with SHA-256
  const canonical = JSON.stringify(event, Object.keys(event).sort());
  const hash = createHash('sha256').update(canonical).digest('hex');
  return `ni:///sha-256;${hash}?ver=CBV2.0`;
}

function createObjectEvent(params: {
  gtin: string;
  serial: string;
  action: 'ADD' | 'OBSERVE' | 'DELETE';
  bizStep: string;
  disposition: string;
  location: string;
  ilmd?: Record<string, any>;
}): EPCISEvent {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const offsetStr = `${offset >= 0 ? '-' : '+'}${String(Math.abs(offset / 60)).padStart(2, '0')}:00`;

  const event: Omit<EPCISEvent, 'eventID'> = {
    '@context': [
      'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld',
      'https://vocab.galileo.luxury/context/galileo.jsonld'
    ],
    type: 'ObjectEvent',
    eventTime: now.toISOString(),
    eventTimeZoneOffset: offsetStr,
    action: params.action,
    bizStep: `cbv:BizStep-${params.bizStep}`,
    disposition: `cbv:Disp-${params.disposition}`,
    epcList: [
      `https://id.gs1.org/01/${params.gtin}/21/${params.serial}`
    ],
    readPoint: { id: params.location },
    ...(params.ilmd && { ilmd: params.ilmd })
  };

  return {
    ...event,
    eventID: createEventID(event)
  };
}

// Usage: Commissioning event
const commissionEvent = createObjectEvent({
  gtin: '09506000134352',
  serial: 'ABC123',
  action: 'ADD',
  bizStep: 'commissioning',
  disposition: 'active',
  location: 'urn:epc:id:sgln:9506000.00001.atelier-paris',
  ilmd: {
    'galileo:productionBatch': '2024-Q2-PARIS-042',
    'galileo:artisanId': 'did:galileo:artisan:jean-dupont'
  }
});
```

### GS1 Digital Link Parser (TypeScript)

```typescript
// Source: GS1 Digital Link URI Syntax 1.4.0
interface ParsedDigitalLink {
  gtin: string;          // AI 01 - always 14 digits
  serial?: string;       // AI 21
  lot?: string;          // AI 10
  cpv?: string;          // AI 22
  customPath?: string;
  queryParams?: Record<string, string>;
}

function parseGS1DigitalLink(uri: string): ParsedDigitalLink | null {
  try {
    const url = new URL(uri);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const result: ParsedDigitalLink = { gtin: '' };

    for (let i = 0; i < pathParts.length; i += 2) {
      const ai = pathParts[i];
      const value = pathParts[i + 1];

      switch (ai) {
        case '01':
        case 'gtin':
          // Validate 14 digits
          if (!/^\d{14}$/.test(value)) {
            throw new Error(`GTIN must be 14 digits: ${value}`);
          }
          result.gtin = value;
          break;
        case '21':
        case 'ser':
          result.serial = value;
          break;
        case '10':
        case 'lot':
          result.lot = value;
          break;
        case '22':
        case 'cpv':
          result.cpv = value;
          break;
      }
    }

    if (!result.gtin) {
      throw new Error('GTIN (AI 01) is required');
    }

    // Parse query parameters for data attributes
    url.searchParams.forEach((value, key) => {
      result.queryParams = result.queryParams || {};
      result.queryParams[key] = value;
    });

    return result;
  } catch (e) {
    console.error('Invalid GS1 Digital Link:', e);
    return null;
  }
}

function buildGS1DigitalLink(params: {
  domain: string;
  gtin: string;
  serial?: string;
  lot?: string;
}): string {
  // Ensure GTIN is 14 digits
  const gtin14 = params.gtin.padStart(14, '0');

  let path = `/01/${gtin14}`;

  if (params.lot) {
    path += `/10/${encodeURIComponent(params.lot)}`;
  }
  if (params.serial) {
    path += `/21/${encodeURIComponent(params.serial)}`;
  }

  return `https://${params.domain}${path}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XML-only EPCIS | JSON-LD + XML (EPCIS 2.0) | June 2022 | Developer adoption, web integration |
| URN-only identifiers | URN + Web URI (CBV 2.0) | June 2022 | GS1 Digital Link compatibility |
| Proprietary DPP schemas | ESPR-standardized fields | July 2024 | Regulatory compliance |
| Product-level tracking | Item-level serialization | ESPR mandate | Individual product passports |
| Manual authentication | Molecular signatures | 2024-2026 | Ultra-luxury provenance |
| Static product data | Lifecycle events | EPCIS adoption | Full traceability |

**Deprecated/outdated:**
- **EPCIS 1.2:** Still supported but lacks JSON-LD, REST API, sensor data support
- **CBV 1.x disposition values:** Several deprecated (non_sellable_* -> simpler terms)
- **Convenience alphas in Digital Link:** Removed in GS1 DL 1.3.0
- **GTIN without padding:** Version 1.4.0 requires 14-digit format

## Open Questions

Things that couldn't be fully resolved:

1. **ESPR Textile Delegated Act Details**
   - What we know: Expected 2026-2027, implementation 2027-2028
   - What's unclear: Exact mandatory fields for luxury textiles vs. fast fashion
   - Recommendation: Design for superset of Battery Passport + Arianee schema fields

2. **Molecular Signature Standardization**
   - What we know: DNA tagging (Applied DNA, Haelixa), spectral (SMX) available
   - What's unclear: No standard schema for molecular authentication data
   - Recommendation: Define galileo:MolecularAuthentication extension, expect industry standardization 2027+

3. **Cross-Border DPP Interoperability**
   - What we know: EU registry July 2026; US, UK, Japan exploring similar
   - What's unclear: International DPP recognition protocols
   - Recommendation: Use GS1 standards as global baseline; design for multi-registry resolution

4. **Artisan Attribution Privacy**
   - What we know: Artisan identification adds value for luxury
   - What's unclear: GDPR implications of artisan DID linkage
   - Recommendation: Use pseudonymous artisan DIDs; optional public profile linkage

5. **CPO Certification Schema**
   - What we know: Luxury brands (Rolex, Cartier) have proprietary CPO programs
   - What's unclear: No standard schema for certified pre-owned status
   - Recommendation: Define galileo:CPOCertification using Verifiable Credentials pattern

## Sources

### Primary (HIGH confidence)

- **ESPR 2024/1781** - [EUR-Lex Official](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng) - EU regulation text
- **EPCIS 2.0 Standard** - [GS1 Ref](https://ref.gs1.org/standards/epcis/) - Event specification
- **CBV 2.0 Standard** - [GS1 Ref](https://ref.gs1.org/standards/cbv/) - Vocabulary elements
- **GS1 Digital Link 1.4.0** - [GS1 Ref](https://ref.gs1.org/standards/digital-link/uri-syntax/) - URI syntax
- **GS1 EPCIS GitHub** - [Examples](https://github.com/gs1/EPCIS/tree/master/JSON) - JSON-LD examples
- **JSON-LD Best Practices** - [W3C](https://w3c.github.io/json-ld-bp/) - Context design patterns
- **Schema.org Product** - [Schema.org](https://schema.org/Product) - Product vocabulary
- **W3C Verifiable Credentials 2.0** - [W3C](https://w3c.github.io/vc-data-model/) - Claims attestation

### Secondary (MEDIUM confidence)

- **Aura Blockchain Consortium** - [Official](https://auraconsortium.com/) - Luxury industry standard
- **Arianee Protocol Schema** - [Docs](https://docs.arianee.org/docs/nft-schema) - NFT DPP reference
- **OpenEPCIS** - [Docs](https://openepcis.io/docs/epcis/) - Implementation guidance
- **EU Battery Passport** - [Battery Pass](https://thebatterypass.eu/) - First DPP implementation
- **Circularise DPP Guide** - [Blog](https://www.circularise.com/blogs/dpps-required-by-eu-legislation-across-sectors) - Timeline analysis

### Tertiary (LOW confidence, needs validation)

- **Textile Delegated Act timing** - Various sources suggest 2026-2027, not officially confirmed
- **Molecular signature standardization** - Industry developing, no formal standard yet
- **CPO certification schema** - No industry standard identified; brand-specific today
- **EU DPP registry API specs** - Expected early 2026, not yet published

## Metadata

**Confidence breakdown:**
- DPP core schema: HIGH - ESPR published, Schema.org/GS1 stable
- EPCIS events: HIGH - EPCIS 2.0/CBV 2.0 ratified June 2022
- JSON-LD patterns: HIGH - W3C standards, documented best practices
- Luxury extensions: MEDIUM - Arianee/Aura reference, no formal standard
- Molecular signatures: LOW - Emerging technology, no schema standard
- Textile delegated act fields: LOW - Expected 2026-2027, details pending

**Research date:** 2026-01-30
**Valid until:** 2026-04-30 (90 days - standards stable, but ESPR delegated acts may publish)

---

## Schema Deliverables (for Planner)

Based on this research, Phase 3 should produce:

### FOUND-04: DPP Core Schema

1. **JSON-LD Context Definition**
   - galileo.jsonld main context
   - espr.jsonld ESPR vocabulary
   - luxury.jsonld luxury extensions

2. **DPP Core Schema**
   - JSON Schema for validation
   - ESPR mandatory fields
   - Schema.org IndividualProduct alignment

3. **Product-Specific Schemas**
   - Textile/apparel schema
   - Leather goods schema
   - Timepiece schema

### EVENT-01 through EVENT-06: Lifecycle Event Schemas

1. **Event Base Schema**
   - Common EPCIS 2.0 structure
   - Galileo extensions namespace

2. **Event-Specific Schemas**
   - Creation (ObjectEvent + commissioning)
   - Commission (ObjectEvent + commissioning + ilmd)
   - First Sale (TransactionEvent + retail_selling)
   - Repair/MRO (TransformationEvent + repairing)
   - Resale (TransactionEvent + retail_selling + CPO)
   - Decommission (ObjectEvent + decommissioning)

### EVENT-07: EPCIS Alignment Document

1. **CBV 2.0 Vocabulary Mapping**
   - bizStep mapping for luxury lifecycle
   - disposition mapping for product states
   - source/destination type mapping

2. **GS1 Digital Link Integration**
   - URI construction patterns
   - Resolver integration with did:galileo

### EVENT-08: Molecular Signature Extension

1. **Extension Schema**
   - MolecularAuthentication type
   - LeatherSignature type
   - SpectralSignature type
   - TerroirAuthentication type

2. **Provider Integration Patterns**
   - DNA tagging (Applied DNA, Haelixa)
   - Spectral fingerprinting (SMX)
   - Isotopic analysis (IRMS)

---
*Research conducted: 2026-01-30*
*Researcher: gsd-phase-researcher*

---
phase: 03-core-data-models
plan: 03-01
title: DPP Core Schema
subsystem: data-models
tags: [json-ld, json-schema, espr, dpp, gtin, schema.org]

dependency-graph:
  requires:
    - 02-03 (did:galileo method for @id field format)
  provides:
    - JSON-LD context vocabulary (galileo, espr, luxury)
    - DPP core schema with ESPR 2024/1781 mandatory fields
    - Product-specific schemas (textile, leather, watch)
  affects:
    - 03-02 (Event schemas will reference DPP types)
    - 03-03 (Molecular signature extension will extend luxury.jsonld)
    - Phase 5 (Token schemas will link to DPP)

tech-stack:
  added:
    - JSON-LD 1.1 context format
    - JSON Schema draft-07
  patterns:
    - Schema.org IndividualProduct as base vocabulary
    - GS1 EPCIS 2.0 context integration
    - JSON Schema $ref composition for product extensions

key-files:
  created:
    - specifications/schemas/contexts/galileo.jsonld
    - specifications/schemas/contexts/espr.jsonld
    - specifications/schemas/contexts/luxury.jsonld
    - specifications/schemas/dpp/dpp-core.schema.json
    - specifications/schemas/dpp/dpp-textile.schema.json
    - specifications/schemas/dpp/dpp-leather.schema.json
    - specifications/schemas/dpp/dpp-watch.schema.json
  modified: []

decisions:
  - id: 03-01-D1
    decision: 14-digit GTIN required (GS1 Digital Link 1.4.0)
    rationale: GS1 standard format, consistent with Phase 2 DID method
  - id: 03-01-D2
    decision: Schema.org IndividualProduct as @type (not Product)
    rationale: IndividualProduct represents unique item instance, not product model
  - id: 03-01-D3
    decision: Material composition percentages must sum to 100
    rationale: ESPR requirement for complete composition disclosure
  - id: 03-01-D4
    decision: Repairability index 1-10 scale
    rationale: Matches French repairability index format, familiar to EU regulators
  - id: 03-01-D5
    decision: Provenance grades (museum_piece, collector, excellent, good, standard)
    rationale: Enables secondary market value differentiation based on documentation quality

metrics:
  duration: 7 min
  completed: 2026-01-30
---

# Phase 3 Plan 1: DPP Core Schema Summary

JSON-LD contexts and JSON Schemas for Digital Product Passport with ESPR 2024/1781 mandatory fields, Galileo vocabulary namespaces, and luxury-specific extensions for textile, leather, and timepiece products.

## What Was Built

### JSON-LD Contexts (3 files)

**galileo.jsonld** - Main vocabulary context
- Imports Schema.org and GS1 EPCIS 2.0
- Defines galileo namespace: `https://vocab.galileo.luxury/`
- Maps core terms: materialComposition, artisanAttribution, terroirProvenance, molecularSignature
- Defines types: GalileoProduct, MaterialComponent, CarbonFootprint, RepairGuide, etc.

**espr.jsonld** - ESPR-specific vocabulary
- Extends galileo context
- Defines CarbonFootprint with ISO 14067 methodology reference
- Defines RepairGuide with repairabilityIndex (1-10 scale)
- Defines ComplianceDeclaration for regulatory compliance
- Defines MaterialComponent with REACH/SVHC compliance fields
- Includes DurabilityInfo, RecyclingInfo, EnergyLabel types

**luxury.jsonld** - Luxury-specific extensions
- Defines ArtisanAttribution with pseudonymous DID support
- Defines CraftsmanshipDetails (techniques, hours of work, handmade percentage)
- Defines LimitedEdition (edition number, total size)
- Defines TerriorProvenance (region, appellation, protected designation)
- Defines ProvenanceGrade levels: museum_piece, collector, excellent, good, standard
- Defines MasteryLevel: apprentice, journeyman, craftsman, master, maitre_artisan, mof

### DPP Core Schema

**dpp-core.schema.json** - Base DPP validation schema
- Required fields: @context, @type, @id, identifier, serialNumber, name, brand, manufacturer, productionDate, countryOfOrigin
- ESPR mandatory sections: materialComposition, carbonFootprint, repairInstructions, complianceDeclaration
- Validation patterns:
  - GTIN: `^\d{14}$` (14 digits)
  - did:galileo: `^did:galileo:(01|8006|8010|253):\d{8,14}(:21:[A-Za-z0-9\-\.]{1,20})?$`
  - ISO country: `^[A-Z]{3}$`
- Includes luxury extensions: artisanAttribution, craftsmanshipDetails, limitedEdition, provenanceGrade

### Product-Specific Schemas (3 files)

**dpp-textile.schema.json**
- Required: fiberComposition, careInstructions
- FiberComponent: fiberType, percentage, fiberOrigin, fiberGrade, organic, recycled, micronage
- CareInstructions: ISO 3758 symbols (wash, dry, iron, bleach, professional care)
- TextileCertification: GOTS, OEKO-TEX, bluesign, GRS, RCS, RWS
- FabricConstruction: weave type, knit type, weight, thread count
- Collection: season, designer, show date

**dpp-leather.schema.json**
- Required: leatherType, tanneryOrigin
- LeatherType: leatherName (Togo, Box, Clemence, etc.), animalSource, tanningMethod, grainType, CITES permit
- TanneryOrigin: tanneryDID, country, region, certifications (LWG)
- LeatherFinish: finishType, colorName, dyeType, patina
- HardwareDetails: material, plating, lockType, keys
- StitchingDetails: technique (saddle-stitch, machine), thread, stitches per cm
- EdgeFinishing: method (painted, burnished), coat layers
- StampingDetails: brand stamp, artisan mark, date code

**dpp-watch.schema.json**
- Required: movement, caseDetails
- Movement: type (mechanical/automatic/quartz), caliber, inHouse, jewels, frequency, powerReserve, escapement, hairspring
- CaseDetails: material (steel, gold, platinum), diameter, waterResistance, bezel, crown
- Complications: date, perpetual-calendar, chronograph, tourbillon, minute-repeater, gmt, moonphase
- Chronometry: COSC, METAS, Geneva Hallmark, Patek Philippe Seal
- DialDetails: color, material (enamel, guilloche), indices, luminous
- ServiceRecord: service history with authorized service tracking
- OriginalAccessories: box, papers, warranty card, extra links

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-01-D1 | 14-digit GTIN required | GS1 Digital Link 1.4.0 standard, matches Phase 2 DID method |
| 03-01-D2 | Schema.org IndividualProduct as @type | Represents unique item instance, not product model |
| 03-01-D3 | Material percentages must sum to 100 | ESPR requirement for complete composition |
| 03-01-D4 | Repairability index 1-10 scale | Matches French repairability index, EU standard |
| 03-01-D5 | Five provenance grades | Enables secondary market value differentiation |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c2f544f | feat | JSON-LD context definitions (galileo, espr, luxury) |
| 08e223d | feat | DPP core schema with ESPR mandatory fields |
| aa2d374 | feat | Product-specific schemas (textile, leather, watch) |

## Verification

- [x] galileo.jsonld includes @context with Schema.org base and GS1 EPCIS reference
- [x] espr.jsonld defines vocabulary for materialComposition, carbonFootprint, repairInstructions, complianceDeclaration
- [x] dpp-core.schema.json validates all ESPR mandatory fields as required properties
- [x] dpp-core.schema.json uses Schema.org IndividualProduct as @type
- [x] All schemas enforce 14-digit GTIN format pattern
- [x] Product schemas extend dpp-core.schema.json using JSON Schema $ref composition
- [x] All DPP documents link to did:galileo product DID via @id field pattern

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| contexts/galileo.jsonld | 120 | Main vocabulary extending Schema.org + GS1 |
| contexts/espr.jsonld | 240 | ESPR 2024/1781 mandatory field vocabulary |
| contexts/luxury.jsonld | 375 | Luxury-specific extensions (artisan, terroir) |
| dpp/dpp-core.schema.json | 786 | Core DPP validation with ESPR fields |
| dpp/dpp-textile.schema.json | 515 | Textile/apparel fields and certifications |
| dpp/dpp-leather.schema.json | 630 | Leather goods fields and specifications |
| dpp/dpp-watch.schema.json | 935 | Timepiece fields, complications, chronometry |

**Total:** 7 files, 3,601 lines

## Next Phase Readiness

### For 03-02 (Event Schemas)
- MaterialComponent, CarbonFootprint, ComplianceDeclaration types available for event payloads
- Did:galileo @id format established for event subject references

### For 03-03 (Molecular Signature Extension)
- luxury.jsonld provides extension point for molecularSignature type
- AuthenticationDetails in luxury context ready for molecular verification results

### External Integration Notes
- JSON-LD contexts will need hosting at vocab.galileo.luxury domain
- JSON Schemas will need hosting at schemas.galileo.luxury domain
- GS1 EPCIS 2.0 context referenced as external dependency

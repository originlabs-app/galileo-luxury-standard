---
phase: 03-core-data-models
plan: 03-02
title: Lifecycle Event Schemas
subsystem: data-models
tags: [epcis, cbv, json-ld, json-schema, events, lifecycle, gs1]

dependency-graph:
  requires:
    - 03-01 (DPP Core Schema for galileo: vocabulary and did:galileo pattern)
    - 02-03 (did:galileo method for product and participant DIDs)
    - 02-01 (GDPR-compliant data boundaries for customer anonymization)
  provides:
    - EPCIS 2.0 JSON-LD event base schema with Galileo extensions
    - ObjectEvent schemas (creation, commission, decommission)
    - TransactionEvent schemas (first sale, resale with CPO)
    - TransformationEvent schema (repair/MRO)
  affects:
    - 03-03 (Molecular signature extension for authentication events)
    - Phase 5 (Token schema will link to lifecycle events)
    - Phase 7 (Event ordering and conflict resolution)

tech-stack:
  added:
    - EPCIS 2.0 JSON-LD binding
    - CBV 2.0 vocabulary (bizStep, disposition, SDT types)
    - RFC 6920 ni: URI format for eventID
    - GS1 Digital Link URI format for EPCs
  patterns:
    - JSON Schema $ref composition extending event-base
    - ILMD (Instance/Lot Master Data) for immutable attributes
    - Conditional schema validation per event type (allOf/if-then)
    - Anonymized customer DIDs for GDPR compliance

key-files:
  created:
    - specifications/schemas/events/event-base.schema.json
    - specifications/schemas/events/creation.schema.json
    - specifications/schemas/events/commission.schema.json
    - specifications/schemas/events/decommission.schema.json
    - specifications/schemas/events/sale.schema.json
    - specifications/schemas/events/resale.schema.json
    - specifications/schemas/events/repair.schema.json
  modified: []

decisions:
  - id: 03-02-D1
    decision: RFC 6920 ni: URI with SHA-256 hash for eventID
    rationale: CBV 2.0 standard format, content-addressable, verifiable
  - id: 03-02-D2
    decision: Same EPC in inputEPCList and outputEPCList for repair events
    rationale: EPCIS 2.0 pattern for non-destructive transformations
  - id: 03-02-D3
    decision: Anonymized customer DIDs (did:galileo:customer:anon-{hash})
    rationale: GDPR compliance per 02-01 data boundaries
  - id: 03-02-D4
    decision: TransformationEvent has no action field
    rationale: Per EPCIS 2.0 specification, only ObjectEvent and TransactionEvent have action
  - id: 03-02-D5
    decision: CPO status enum with five levels
    rationale: Enables marketplace differentiation (certified_pre_owned, authenticated, unverified, brand_certified, marketplace_certified)

metrics:
  duration: 6 min
  completed: 2026-01-30
---

# Phase 3 Plan 2: Lifecycle Event Schemas Summary

EPCIS 2.0 JSON-LD event schemas for six lifecycle stages (creation, commission, sale, repair, resale, decommission) with CBV 2.0 vocabulary, Galileo extensions, and GS1 Digital Link EPC format.

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-30T14:02:14Z
- **Completed:** 2026-01-30T14:08:XX Z
- **Tasks:** 4
- **Files created:** 7

## Accomplishments

- EPCIS 2.0 event base schema with conditional validation per event type
- Complete ObjectEvent coverage: creation (manufacturing), commission (ID assignment), decommission (end of life)
- TransactionEvent schemas with GDPR-compliant ownership transfer and warranty tracking
- TransformationEvent schema supporting repair history with parts traceability

## Task Commits

1. **Task 1: Event Base Schema** - `4955afc` (feat)
2. **Task 2: ObjectEvent Schemas** - `557c891` (feat)
3. **Task 3: TransactionEvent Schemas** - `edc0cb2` (feat)
4. **Task 4: TransformationEvent Schema** - `93fe188` (feat)

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| events/event-base.schema.json | 430 | Common EPCIS 2.0 structure with Galileo extensions |
| events/creation.schema.json | 182 | ObjectEvent for product manufacturing |
| events/commission.schema.json | 158 | ObjectEvent for ID/NFC/QR assignment |
| events/decommission.schema.json | 275 | ObjectEvent for end of life |
| events/sale.schema.json | 280 | TransactionEvent for first sale |
| events/resale.schema.json | 475 | TransactionEvent for secondary market |
| events/repair.schema.json | 538 | TransformationEvent for MRO operations |

**Total:** 7 files, 2,498 lines

## What Was Built

### Event Base Schema (event-base.schema.json)

**EPCIS 2.0 Core Structure:**
- @context: EPCIS 2.0 + Galileo JSON-LD contexts
- eventID: RFC 6920 ni: URI format (`ni:///sha-256;{hash}?ver=CBV2.0`)
- eventTime: ISO 8601 datetime with timezone
- eventTimeZoneOffset: +/-HH:MM format
- bizStep: CBV 2.0 URN format (`cbv:BizStep-{step}`)
- disposition: CBV 2.0 URN format (`cbv:Disp-{state}`)
- readPoint: SGLN URN format location

**Conditional Validation:**
- ObjectEvent requires: action, epcList
- TransactionEvent requires: action, epcList, sourceList, destinationList
- TransformationEvent requires: inputEPCList, outputEPCList (no action field)

**Galileo Extensions:**
- galileo:dppContentHash: SHA-256 hash linking to DPP document
- galileo:productDID: did:galileo reference
- galileo:eventSignature: Cryptographic signature for non-repudiation

### ObjectEvent Schemas

**Creation (creation.schema.json):**
- action=ADD, bizStep=commissioning, disposition=active
- Required ILMD: productionBatch, artisanId (pseudonymous DID), qualityGrade (A+/A/B), productDID
- Captures: production facility, craft techniques, raw material lots
- Links to DPP via dppContentHash

**Commission (commission.schema.json):**
- Separate from creation for post-manufacturing ID assignment
- Required ILMD: commissioningFacility
- Optional: nfcTagId (NTAG424DNA etc.), qrCodeRef, rfidEpc
- Physical link types: nfc_embedded, nfc_tag, qr_label, rfid_tag, laser_engraved

**Decommission (decommission.schema.json):**
- action=DELETE, bizStep=decommissioning
- Dispositions: destroyed, recalled, stolen
- Reasons: end_of_life_recycling, theft, loss, destruction, recall, counterfeit_discovered
- Materials recovery: material, weight, disposition (recycled/repurposed/disposed)
- Police report support for theft/loss cases
- Product lifetime metrics: age, total owners, total repairs

### TransactionEvent Schemas

**First Sale (sale.schema.json):**
- bizStep=retail_selling, disposition=retail_sold
- Required bizTransactionList with cbv:BTT-po (purchase order)
- sourceList: brand/retailer DID (cbv:SDT-owning_party)
- destinationList: anonymized customer DID (`did:galileo:customer:anon-{hash}`)
- Warranty activation: startDate, duration (ISO 8601), termsUrl, international coverage
- Purchase channels: boutique, online, authorized_retailer, department_store, duty_free, private_client, vip_event
- Personalization tracking: engraving, hot_stamping, monogram

**Resale (resale.schema.json):**
- Required galileo:resaleContext with CPO status and authentication
- Channels: certified_marketplace, auction, private_sale, brand_buyback, consignment
- Authentication: method array (visual_inspection, nfc_verification, dpp_validation, molecular_signature)
- CPO status: certified_pre_owned, authenticated, unverified, brand_certified, marketplace_certified
- Condition scale: new_with_tags through poor
- Auction support: lot number, estimates, hammer price, catalog URL
- Warranty transfer tracking
- Value assessment: rarity factor, collectibility score

### TransformationEvent Schema

**Repair/MRO (repair.schema.json):**
- bizStep=repairing, no action field (per EPCIS 2.0)
- Same EPC in inputEPCList and outputEPCList for non-destructive repair
- Required ILMD: repairType, repairDescription, technicianId (pseudonymous), serviceOrderRef
- Parts replaced: partType, partNumber, origin (oem_new, third_party, salvage, custom_made)
- Service history: serviceNumber (nth service), previousServices (event IDs), warrantyStatus
- QC/testing: water_resistance, accuracy_timing, power_reserve, leather_quality
- Repair warranty: duration, coverage, terms URL
- Cost categories: warranty_covered, goodwill, minor/standard/major_service, full_restoration

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-02-D1 | RFC 6920 ni: URI with SHA-256 for eventID | CBV 2.0 standard, content-addressable |
| 03-02-D2 | Same EPC in input/output for repairs | EPCIS 2.0 non-destructive transformation pattern |
| 03-02-D3 | Anonymized customer DIDs | GDPR compliance per 02-01 boundaries |
| 03-02-D4 | No action field for TransformationEvent | Per EPCIS 2.0 specification |
| 03-02-D5 | Five-level CPO status enum | Marketplace certification differentiation |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4955afc | feat | Event base schema with EPCIS 2.0 structure |
| 557c891 | feat | ObjectEvent schemas (creation, commission, decommission) |
| edc0cb2 | feat | TransactionEvent schemas (sale, resale) |
| 93fe188 | feat | TransformationEvent schema (repair) |

## Verification

- [x] event-base.schema.json enforces required EPCIS 2.0 fields: @context, type, eventID, eventTime, eventTimeZoneOffset, bizStep, disposition
- [x] All event schemas use GS1 Digital Link URI format: `https://id.gs1.org/01/{GTIN14}/21/{Serial}`
- [x] eventID follows RFC 6920 ni: URI format: `ni:///sha-256;{hash}?ver=CBV2.0`
- [x] bizStep values use CBV 2.0 URN format: cbv:BizStep-commissioning, cbv:BizStep-retail_selling, cbv:BizStep-repairing, cbv:BizStep-decommissioning
- [x] disposition values use CBV 2.0 URN format: cbv:Disp-active, cbv:Disp-retail_sold, cbv:Disp-destroyed
- [x] Creation/commission events include ilmd section for immutable product attributes
- [x] TransactionEvent schemas include sourceList and destinationList with cbv:SDT-owning_party
- [x] TransformationEvent supports same EPC in inputEPCList and outputEPCList
- [x] All events include readPoint for location tracking using SGLN URN format

## Next Phase Readiness

### For 03-03 (Molecular Signature Extension)
- Event schemas ready for molecularSignature authentication results
- resale.schema.json includes molecular_signature in authentication methods array
- Extension point in event-base for galileo:molecularSignature

### For Phase 5 (Token Schema)
- Event IDs (ni: URIs) ready for on-chain attestation references
- Ownership transfer events (sale, resale) provide provenance chain
- decommission events support token burn scenarios

### For Phase 7 (Event Ordering)
- eventID using content-addressed ni: URIs supports deduplication
- previousServices array in repair.schema.json establishes event ordering
- errorDeclaration in event-base supports event correction

### External Integration Notes
- EPCIS 2.0 context from https://ref.gs1.org/standards/epcis/2.0.0/
- CBV 2.0 vocabulary from https://ref.gs1.org/cbv/
- Event schemas will need hosting at schemas.galileo.luxury/events/

---
*Phase: 03-core-data-models*
*Completed: 2026-01-30*

---
phase: 03-core-data-models
plan: 03
subsystem: schemas
tags: [epcis, cbv, gs1, molecular-authentication, dna-tagging, spectroscopy, isotopic, artisan, privacy]

# Dependency graph
requires:
  - phase: 03-01
    provides: DPP core schema, galileo.jsonld context
  - phase: 03-02
    provides: Event schemas with EPCIS 2.0 structure
  - phase: 02-03
    provides: did:galileo method specification
  - phase: 02-01
    provides: GDPR boundaries for artisan PII
provides:
  - CBV 2.0 vocabulary mapping for luxury lifecycle stages
  - GS1 Digital Link bidirectional integration with did:galileo
  - Molecular authentication JSON-LD context
  - DNA tagging schema for leather provenance
  - Spectral fingerprinting schema for material authentication
  - Isotopic analysis schema for geographic origin verification
  - Artisan attribution schema with GDPR-compliant privacy controls
affects: [04-identity, 05-token, 06-resolver, 08-compliance]

# Tech tracking
tech-stack:
  added: []
  patterns: [cbv-vocabulary-mapping, gs1-digital-link-resolution, molecular-authentication, isotopic-origin-verification, privacy-preserving-attribution]

key-files:
  created:
    - specifications/schemas/alignment/cbv-mapping.md
    - specifications/schemas/alignment/gs1-integration.md
    - specifications/schemas/contexts/molecular.jsonld
    - specifications/schemas/extensions/molecular-signature.schema.json
    - specifications/schemas/extensions/leather-signature.schema.json
    - specifications/schemas/extensions/spectral-fingerprint.schema.json
    - specifications/schemas/extensions/terroir-provenance.schema.json
    - specifications/schemas/extensions/artisan-attribution.schema.json
  modified: []

key-decisions:
  - "Galileo custom dispositions: cpo_certified, vault_storage, authentication_pending for luxury-specific states"
  - "Molecular signature types: DNA_TAGGANT, SPECTRAL, ISOTOPIC, COMBINED"
  - "Leather verification methods: PCR_AMPLIFICATION, NEXT_GEN_SEQUENCING, QPCR, DIGITAL_PCR, LAMP"
  - "Spectral methods: NIR_SPECTROSCOPY, RAMAN_SPECTROSCOPY, FTIR, UV_VIS, XRF, LIBS"
  - "Isotopic methods: IRMS, EA_IRMS, SIMS, LA_ICP_MS, MC_ICP_MS, TIMS"
  - "Artisan privacy: Pseudonymous DIDs by default, opt-in public profiles"
  - "Team attribution supported for collaborative craftsmanship"
  - "Mastery levels include French MOF and Japanese Living Treasure designations"

patterns-established:
  - "Custom Galileo BTT types: auth_cert, cpo_cert, service_record, provenance_report"
  - "Context-aware resolution: consumer, brand, regulator, service_center views"
  - "GS1 Digital Link in DID alsoKnownAs for bidirectional resolution"
  - "ISO 17025 accreditation required for molecular signature providers"
  - "Privacy consent tracking for artisan public profile opt-in"

# Metrics
duration: 7min
completed: 2026-01-30
---

# Phase 3 Plan 03: EPCIS Alignment & Extensions Summary

**CBV 2.0 vocabulary mapping, GS1 Digital Link integration, and molecular signature authentication schemas for ultra-luxury provenance verification**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-30T14:12:12Z
- **Completed:** 2026-01-30T14:19:14Z
- **Tasks:** 4/4
- **Files created:** 8

## Accomplishments

- Documented CBV 2.0 vocabulary mapping for all luxury lifecycle stages (creation through decommission)
- Defined custom Galileo dispositions for luxury-specific states (CPO certified, vault storage, authentication pending)
- Created GS1 Digital Link integration specification with bidirectional URI mapping
- Implemented context-aware routing for consumer, brand, regulator, and service center access levels
- Established molecular authentication vocabulary in JSON-LD context
- Created DNA tagging schema supporting Applied DNA Sciences, Haelixa integration patterns
- Defined spectral fingerprinting schema for NIR, Raman, FTIR spectroscopy
- Built isotopic origin verification schema for terroir authentication (Oritain pattern)
- Implemented artisan attribution with GDPR-compliant privacy-first design

## Task Commits

Each task was committed atomically:

1. **Task 1: CBV 2.0 Vocabulary Mapping** - `4c2fb7e` (feat)
2. **Task 2: GS1 Digital Link Integration** - `82848b5` (feat)
3. **Task 3: Molecular Signature Extension Schemas** - `31ae95a` (feat)
4. **Task 4: Artisan Attribution Extension** - `135a398` (feat)

## Files Created/Modified

### Alignment Documentation
- `specifications/schemas/alignment/cbv-mapping.md` - CBV 2.0 vocabulary mapping (344 lines)
- `specifications/schemas/alignment/gs1-integration.md` - GS1 Digital Link integration (449 lines)

### JSON-LD Context
- `specifications/schemas/contexts/molecular.jsonld` - Molecular authentication vocabulary

### Extension Schemas
- `specifications/schemas/extensions/molecular-signature.schema.json` - Core molecular auth schema
- `specifications/schemas/extensions/leather-signature.schema.json` - Leather DNA/spectral signatures
- `specifications/schemas/extensions/spectral-fingerprint.schema.json` - NIR/Raman/FTIR data
- `specifications/schemas/extensions/terroir-provenance.schema.json` - Isotopic origin verification
- `specifications/schemas/extensions/artisan-attribution.schema.json` - Craftsperson attribution

## Decisions Made

1. **Custom Galileo dispositions:** Defined `galileo:Disp-cpo_certified`, `galileo:Disp-vault_storage`, `galileo:Disp-authentication_pending` where CBV 2.0 lacks appropriate luxury-specific states.

2. **Molecular signature provider types:** Four types supported - DNA_TAGGANT (synthetic DNA markers), SPECTRAL (spectroscopic fingerprints), ISOTOPIC (stable isotope ratios), COMBINED (multi-modal).

3. **Leather verification methods:** Five DNA verification methods aligned with ISO 17025 laboratory practices.

4. **Spectral methods:** Six spectroscopic techniques covering non-destructive material authentication from NIR to XRF.

5. **Isotopic methods:** Seven mass spectrometry techniques for geographic origin verification from bulk IRMS to laser ablation ICP-MS.

6. **Artisan privacy model:**
   - Default: Pseudonymous DID only (`did:galileo:artisan:xxx`)
   - Opt-in: Artisan can link DID to public profile with name/bio
   - Revocable: Artisan can disconnect public profile while keeping DID attribution
   - GDPR-compliant consent tracking included

7. **Mastery levels:** Eight levels from apprentice to living_treasure, including French MOF (Meilleur Ouvrier de France) designation.

8. **Context-aware routing:** Four requester contexts (consumer, brand, regulator, service_center) with differentiated data access levels per GS1 Digital Link link types.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward specification documentation following prior phase schemas and external standard references.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Phase 4 (Identity): ONCHAINID can reference molecular authentication credentials
- Phase 5 (Token): ERC-3643 tokens can include artisan attribution claims
- Phase 6 (Resolver): GS1 Resolver CE implementation uses cbv-mapping and gs1-integration specs
- Phase 8 (Compliance): Geographic indication verification builds on terroir-provenance schema

**Blockers:**
- None

**Notes:**
- EVENT-07 (EPCIS 2.0 alignment with CBV 2.0) is now fully satisfied
- EVENT-08 (Molecular signature extension schema) is now fully satisfied
- All extension schemas are optional additions compatible with DPP core schema
- GS1 integration enables dual resolution path (HTTPS + GS1 Digital Link)
- Phase 3 (Core Data Models) is now complete

---
*Phase: 03-core-data-models*
*Plan: 03*
*Completed: 2026-01-30*

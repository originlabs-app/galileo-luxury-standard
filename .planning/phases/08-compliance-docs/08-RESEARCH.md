# Phase 8: Compliance Documentation - Research

**Researched:** 2026-02-01
**Domain:** EU Regulatory Compliance Documentation (GDPR, MiCA, ESPR)
**Confidence:** HIGH

---

## Summary

This research covers the compliance documentation requirements for the Galileo Luxury Standard, focusing on three key EU regulations: GDPR (data protection), MiCA/TFR (crypto-asset regulation), and ESPR (Digital Product Passport). The existing specification documents (HYBRID-ARCHITECTURE.md, data-retention.md, kyc-hooks.md, aml-screening.md) provide comprehensive technical foundations. Phase 8 creates **adopter-facing implementation guides** that translate these technical specifications into actionable compliance checklists.

The Galileo ecosystem already has:
- CRAB model for GDPR Article 17 right-to-erasure compliance
- KYC/KYB hooks aligned with MiCA Travel Rule (TFR 2023/1113)
- DPP schema with ESPR 2024/1781 mandatory fields
- Data retention policies balancing GDPR and AML requirements

**Primary recommendation:** Create three focused compliance guides with implementation checklists, code examples referencing existing specifications, and regulatory timeline tracking. Target the guides at implementers (brands, retailers, service providers) who need to operationalize the Galileo standard.

---

## Regulatory Timeline Summary

| Regulation | Key Date | Requirement | Galileo Impact |
|------------|----------|-------------|----------------|
| **MiCA** | July 1, 2026 | CASP authorization mandatory EU-wide | Transfer compliance verification |
| **TFR 2023/1113** | Active (Dec 30, 2024) | Travel Rule for all crypto transfers | Identity data on transfers |
| **ESPR/DPP** | 2027 (textiles) | Digital Product Passport mandatory | DPP schema compliance |
| **GDPR** | Active | Right to erasure, data minimization | CRAB model implementation |

---

## Standard Stack for Compliance Documentation

### Core Documentation Frameworks

| Framework | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| **Markdown** | CommonMark | Documentation format | Universal, version-controllable |
| **JSON Schema** | Draft-07 | Checklist validation | Machine-readable compliance checks |
| **Mermaid** | Latest | Workflow diagrams | GitHub-native rendering |
| **YAML** | 1.2 | Configuration examples | Human-readable config |

### Reference Standards

| Standard | Version/Date | Purpose | Source Confidence |
|----------|--------------|---------|-------------------|
| **EDPB Guidelines 02/2025** | April 2025 | Blockchain GDPR compliance | HIGH - Official EDPB |
| **MiCA Regulation** | 2023/1114 | Crypto-asset framework | HIGH - EUR-Lex |
| **TFR Regulation** | 2023/1113 | Travel Rule requirements | HIGH - EUR-Lex |
| **ESPR Regulation** | 2024/1781 | DPP requirements | HIGH - EUR-Lex |
| **5AMLD Article 40** | 2018/843 | AML retention periods | HIGH - EUR-Lex |

---

## Architecture Patterns

### Guide Structure Pattern

Each compliance guide should follow a consistent structure:

```
compliance-guides/
├── gdpr/
│   ├── README.md                    # Overview and quick start
│   ├── implementation-checklist.md  # Step-by-step tasks
│   ├── crab-model-guide.md          # CRAB implementation details
│   ├── erasure-workflow.md          # Article 17 process
│   ├── dpia-template.md             # DPIA template for blockchain
│   └── examples/
│       ├── erasure-request.ts       # Code example
│       └── data-classification.yaml # Configuration example
├── mica/
│   ├── README.md
│   ├── casp-requirements.md         # CASP compliance mapping
│   ├── travel-rule-guide.md         # TFR 2023/1113 implementation
│   ├── kyc-integration.md           # Links to kyc-hooks.md
│   └── examples/
│       ├── travel-rule-data.ts
│       └── kyc-claim-flow.yaml
└── espr/
    ├── README.md
    ├── dpp-readiness-checklist.md   # 2027 compliance preparation
    ├── mandatory-fields.md          # Field-by-field mapping
    ├── data-carrier-guide.md        # QR/NFC requirements
    └── examples/
        ├── dpp-validation.ts
        └── textile-dpp-example.json
```

### Documentation Cross-Reference Pattern

**Pattern:** Each guide references the authoritative specification document and provides implementation guidance.

```markdown
## Implementing Right to Erasure

**Specification Reference:** `specifications/architecture/HYBRID-ARCHITECTURE.md` Section 4 (CRAB Model)

**Implementation Steps:**
1. [Step with code example]
2. [Step with configuration]
3. [Verification check]
```

### Checklist Item Pattern

**Pattern:** Use structured checklist format with regulation reference, verification method, and evidence requirements.

```markdown
### Checklist Item: Article 17 Erasure Response Time

- **Requirement:** Respond to valid erasure requests within 30 days
- **Regulation:** GDPR Article 12(3)
- **Verification:**
  - [ ] Erasure workflow configured with 30-day timer
  - [ ] Audit trail logs response timestamps
  - [ ] Extension process documented (up to 90 days for complex)
- **Evidence Required:** Erasure request logs, response timestamps, audit trail
- **Galileo Component:** `data-retention.md` Section 6 (Erasure Request Workflow)
```

---

## Don't Hand-Roll

Problems that have existing solutions in the Galileo ecosystem:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Erasure request workflow | Custom deletion logic | CRAB model from HYBRID-ARCHITECTURE.md | Already designed for blockchain GDPR compliance |
| Travel Rule data structure | Custom identity format | KYC claim schema from kyc-hooks.md | Aligned with ERC-3643 ONCHAINID |
| DPP mandatory fields | Custom product schema | dpp-core.schema.json | ESPR 2024/1781 compliant |
| AML/GDPR conflict resolution | Custom retention logic | data-retention.md Section 4 | Legal basis documented |
| Sanctions screening | Custom blocklist | Chainalysis Oracle + aml-screening.md | Industry standard, multi-layer |

**Key insight:** The compliance documentation should NOT duplicate specification content but rather guide implementers to use the existing specifications correctly.

---

## Common Pitfalls

### Pitfall 1: Treating Encrypted/Hashed PII as Non-Personal Data

**What goes wrong:** Implementers store encrypted or hashed personal data on-chain, believing it's "anonymous"

**Why it happens:** Misunderstanding of GDPR Recital 26 - encrypted data remains personal data

**How to avoid:**
- Quote EDPB Guidelines 02/2025: "Encrypted or hashed data remains personal data under GDPR"
- Enforce off-chain storage for ALL PII, including encrypted versions
- Use HYBRID-ARCHITECTURE.md Section 2.3 "Explicitly Prohibited On-Chain" as definitive list

**Warning signs:** Any design storing encrypted user data on-chain

### Pitfall 2: Assuming "Technical Impossibility" Exempts Blockchain

**What goes wrong:** Claiming blockchain immutability prevents erasure compliance

**Why it happens:** Legacy blockchain mental model; not understanding CRAB model

**How to avoid:**
- EDPB explicitly states: "Technical impossibility is not a justification for disregarding the rights of data subjects"
- Guide must emphasize: If erasure is impossible, the data should not have been stored there
- CRAB model provides compliant solution via content orphaning + key destruction

**Warning signs:** Arguments that "blockchain can't delete data so we can't comply"

### Pitfall 3: Missing Travel Rule Threshold Nuances

**What goes wrong:** Applying EUR 1,000 threshold incorrectly for EU CASP-to-CASP transfers

**Why it happens:** Confusion with FATF Recommendation 16 vs TFR 2023/1113

**How to avoid:**
- TFR 2023/1113 has NO de minimis threshold for CASP-to-CASP transfers
- Document clearly: "All crypto transfers, regardless of amount, must comply"
- Reference kyc-hooks.md Section 9 (Travel Rule Compliance)

**Warning signs:** Documentation suggesting small transfers are exempt

### Pitfall 4: DPP Confusion Between Product Types and Serial Numbers

**What goes wrong:** Creating one DPP per product model instead of per item

**Why it happens:** Misunderstanding ESPR's individual product tracking requirement

**How to avoid:**
- DPP is per product INSTANCE, not per model
- Schema uses `did:galileo:01:[GTIN]:21:[serial]` format
- Each physical item gets unique DPP

**Warning signs:** DPPs without serial numbers or batch identifiers

### Pitfall 5: Ignoring AML Retention When Processing Erasure Requests

**What goes wrong:** Deleting KYC/transaction data on erasure request, violating 5AMLD

**Why it happens:** Prioritizing GDPR over AML retention obligations

**How to avoid:**
- Reference data-retention.md Section 4 (GDPR-AML Conflict Resolution)
- GDPR Article 17(3)(b) exception for legal obligations
- Clear decision matrix: "AML data retained for 5 years minimum despite erasure request"

**Warning signs:** Erasure workflows that don't check retention obligations first

### Pitfall 6: Misunderstanding MiCA Authorization Deadline

**What goes wrong:** Assuming July 2026 deadline is uniform across EU

**Why it happens:** MiCA allows Member State transitional arrangements

**How to avoid:**
- Document jurisdiction-specific deadlines clearly
- Netherlands: July 2025, Italy: December 2025, Others: July 2026
- Guide should recommend early authorization regardless of local deadline

**Warning signs:** Single deadline cited without jurisdiction context

---

## Code Examples

### Example 1: CRAB Model Erasure Implementation

**Source:** Derived from HYBRID-ARCHITECTURE.md Section 4

```typescript
// erasure-handler.ts
interface ErasureRequest {
  requestId: string;
  dataSubjectId: string;
  requestDate: Date;
  dataCategories: DataCategory[];
}

interface ErasureResult {
  requestId: string;
  completedAt: Date;
  erasedCategories: DataCategory[];
  retainedCategories: { category: DataCategory; reason: string; eligibleDate: Date }[];
  orphanedHashes: string[];
}

async function processErasureRequest(request: ErasureRequest): Promise<ErasureResult> {
  // Step 1: Validate requester identity
  await verifyDataSubjectIdentity(request.dataSubjectId);

  // Step 2: Inventory all data
  const dataInventory = await inventoryDataForSubject(request.dataSubjectId);

  // Step 3: Check retention obligations (GDPR-AML conflict resolution)
  const { eligible, retained } = categorizeByRetention(dataInventory);

  // Step 4: Execute erasure on eligible data
  const orphanedHashes: string[] = [];
  for (const record of eligible) {
    // Delete off-chain content
    await deleteOffChainContent(record.contentId);

    // Destroy encryption key (if CRAB encryption used)
    if (record.encryptionKeyId) {
      await destroyEncryptionKey(record.encryptionKeyId);
    }

    // Track orphaned hash for audit
    orphanedHashes.push(record.onChainHash);
  }

  // Step 5: Log audit trail (non-PII)
  await logErasureAudit({
    requestId: request.requestId,
    erasedCount: eligible.length,
    retainedCount: retained.length,
    completedAt: new Date()
  });

  return {
    requestId: request.requestId,
    completedAt: new Date(),
    erasedCategories: eligible.map(r => r.category),
    retainedCategories: retained,
    orphanedHashes
  };
}
```

### Example 2: Travel Rule Data Retrieval

**Source:** Derived from kyc-hooks.md Section 9

```typescript
// travel-rule-data.ts
interface TravelRuleData {
  originator: {
    name: string;
    accountNumber: string; // Wallet address
    address?: string;
    nationalId?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
  };
  beneficiary: {
    name: string;
    accountNumber: string;
  };
}

async function getTravelRuleDataFromClaims(
  senderAddress: string,
  receiverAddress: string
): Promise<TravelRuleData> {
  // Retrieve identity from registry
  const senderIdentity = await identityRegistry.identity(senderAddress);
  const receiverIdentity = await identityRegistry.identity(receiverAddress);

  // Get KYC claim data (stored off-chain, referenced by hash)
  const senderClaimHash = await senderIdentity.getClaimData(KYC_BASIC_TOPIC);
  const receiverClaimHash = await receiverIdentity.getClaimData(KYC_BASIC_TOPIC);

  // Retrieve full claim content from off-chain storage
  const senderClaim = await fetchClaimContent(senderClaimHash);
  const receiverClaim = await fetchClaimContent(receiverClaimHash);

  return {
    originator: {
      name: senderClaim.credentialSubject.name,
      accountNumber: senderAddress,
      address: senderClaim.credentialSubject.address,
      nationalId: senderClaim.credentialSubject.nationalId,
      dateOfBirth: senderClaim.credentialSubject.dateOfBirth,
      placeOfBirth: senderClaim.credentialSubject.placeOfBirth
    },
    beneficiary: {
      name: receiverClaim.credentialSubject.name,
      accountNumber: receiverAddress
    }
  };
}
```

### Example 3: DPP Validation for ESPR Compliance

**Source:** Derived from dpp-core.schema.json

```typescript
// dpp-validator.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import dppCoreSchema from '../specifications/schemas/dpp/dpp-core.schema.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateDPP = ajv.compile(dppCoreSchema);

interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  missingMandatory?: string[];
  espr2024Compliant: boolean;
}

function validateDPPForESPR(dpp: unknown): ValidationResult {
  const valid = validateDPP(dpp);

  const result: ValidationResult = {
    valid,
    espr2024Compliant: false
  };

  if (!valid) {
    result.errors = validateDPP.errors?.map(e => ({
      path: e.instancePath,
      message: e.message || 'Unknown error',
      keyword: e.keyword
    }));

    // Check specifically for ESPR mandatory fields
    const mandatoryFields = [
      'materialComposition',
      'carbonFootprint',
      'repairInstructions',
      'complianceDeclaration'
    ];

    result.missingMandatory = mandatoryFields.filter(field => {
      const error = result.errors?.find(e => e.path.includes(field));
      return error !== undefined;
    });
  } else {
    result.espr2024Compliant = true;
  }

  return result;
}
```

---

## State of the Art

### GDPR-Blockchain Compliance

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Blockchain can't comply with GDPR" | Off-chain storage + on-chain references (CRAB model) | EDPB Guidelines 02/2025 (April 2025) | Provides authoritative compliance path |
| Encrypted PII on-chain | No PII on-chain at all | EDPB Guidelines 02/2025 | Encrypted data is still personal data |
| Technical impossibility defense | Design compliance in from start | EDPB Guidelines 02/2025 | No excuse for non-compliance |

### MiCA/Travel Rule

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| EUR 1,000 threshold (FATF) | No threshold for EU CASPs | TFR 2023/1113 (Dec 2024) | All transfers need Travel Rule data |
| National VASP registrations | MiCA authorization required | July 1, 2026 | EU-wide harmonized licensing |
| Voluntary compliance | Mandatory CASP requirements | MiCA in force | Penalties up to 12.5% of turnover |

### ESPR/DPP

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Paper certificates | Digital Product Passport | ESPR 2024/1781 | Machine-readable product data |
| Voluntary sustainability claims | Mandatory carbon footprint | ESPR 2024/1781 | ISO 14067 methodology required |
| Brand-specific formats | GS1 Digital Link standardization | 2024-2027 | Interoperability via QR/NFC |

**Deprecated/outdated approaches:**
- Storing any form of personal data on-chain (replaced by off-chain + hash reference)
- Assuming blockchain immutability exempts erasure obligations
- Country-specific VASP registrations for EU operations (replaced by MiCA)
- Paper-based product certificates for luxury goods

---

## GDPR Compliance Guide Research

### Key Requirements from EDPB Guidelines 02/2025

**Source:** [EDPB Guidelines 02/2025](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf)
**Confidence:** HIGH - Official regulatory guidance

1. **Recommendation against on-chain personal data:** "The EDPB recommends not storing personal data directly in a blockchain at all."

2. **Technical impossibility not an excuse:** "Technical impossibility is not a justification for disregarding the rights of data subjects."

3. **DPIA requirement:** "Since blockchain-based processing of personal data regularly entails high risks for data subjects, a comprehensive DPIA is imperative."

4. **Controller/processor relationships:** Node operators may be joint controllers depending on influence over processing purposes.

5. **Functional erasure standard:** Anonymization should produce outcome equivalent to erasure. Three-part test: (i) singling out, (ii) linkability, (iii) inferability.

### Implementation Guide Structure for GDPR

1. **Quick Start** - 5-minute overview of CRAB model
2. **Data Classification Guide** - What goes on-chain vs off-chain
3. **Right to Erasure Workflow** - Step-by-step with code examples
4. **DPIA Template** - Blockchain-specific assessment
5. **Controller/Processor Mapping** - For different deployment models
6. **Audit Trail Requirements** - What to log, how long to keep
7. **Cross-Border Transfers** - Chapter V compliance for public chains

---

## MiCA Compliance Guide Research

### Key Requirements for CASPs

**Sources:**
- [MiCA 2026 Guide](https://adamsmith.lt/en/mica-license-2025/)
- [EU Travel Rule TFR](https://www.21analytics.co/travel-rule-regulations/european-union-eu-travel-rule-regulation/)
**Confidence:** HIGH - Multiple authoritative sources confirm

1. **July 1, 2026 deadline:** After this date, MiCA authorization required to operate as CASP in EU.

2. **No Travel Rule threshold:** TFR 2023/1113 requires originator/beneficiary information for ALL crypto transfers between CASPs.

3. **Capital requirements:** EUR 50,000 - 150,000 permanent minimum depending on service type.

4. **Governance requirements:** EU presence + EU-resident director; clear organizational structure.

5. **Self-hosted wallet checks:** Extra verification for transfers >EUR 1,000 involving self-custody addresses.

6. **DORA integration:** Cybersecurity requirements from January 2026.

### Galileo Mapping to CASP Requirements

| CASP Requirement | Galileo Component | Implementation |
|------------------|-------------------|----------------|
| Travel Rule data | kyc-hooks.md Section 9 | KYC claims contain originator/beneficiary data |
| Identity verification | IGalileoIdentityRegistry | ONCHAINID claims from trusted issuers |
| AML screening | aml-screening.md | Chainalysis Oracle + TRM Labs |
| Transaction records | audit-trail.md | 7-year retention with timestamps |

### Implementation Guide Structure for MiCA

1. **CASP Licensing Overview** - What Galileo adopters need to know
2. **Travel Rule Implementation** - Using KYC hooks for TFR 2023/1113
3. **Jurisdiction-Specific Timelines** - NL, IT, FR, DE deadlines
4. **Identity Verification Integration** - IGalileoIdentityRegistry usage
5. **AML/CTF Compliance** - Linking to aml-screening.md
6. **Record Keeping** - 5-year retention requirements

---

## ESPR/DPP Compliance Guide Research

### Key Requirements from ESPR 2024/1781

**Sources:**
- [ESPR Official Regulation](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng)
- [DPP Compliance Guide](https://fluxy.one/post/digital-product-passport-dpp-eu-guide-2025-2030)
- [European Parliament Textile Study](https://www.europarl.europa.eu/RegData/etudes/STUD/2024/757808/EPRS_STU(2024)757808_EN.pdf)
**Confidence:** HIGH - Official sources

1. **2027 Textile Deadline:** "Minimal & simplified DPP" for textiles starting 2027, based on mandatory information dissemination.

2. **Mandatory Data Fields:**
   - Material composition (percentage breakdown)
   - Country of origin
   - Carbon footprint (ISO 14067)
   - Repair/maintenance information
   - Compliance declaration

3. **Data Carrier Requirements:** QR code, NFC, or RFID affixed to product/packaging, compliant with ISO 15459.

4. **GS1 Digital Link:** Standard for linking physical identifiers to digital information.

5. **Tiered Access:** Public data in 24 EU languages; sensitive data restricted to authorized users.

6. **Phased Timeline for Textiles:**
   - 2027: Minimal/simplified DPP
   - 2030: Advanced DPP
   - 2033: Full circular DPP

### Galileo DPP Schema Compliance Status

**Analysis of `dpp-core.schema.json`:**

| ESPR Requirement | Schema Field | Status |
|------------------|--------------|--------|
| Material composition | `materialComposition[]` | COMPLIANT |
| Carbon footprint | `carbonFootprint` (ISO14067) | COMPLIANT |
| Repair instructions | `repairInstructions` | COMPLIANT |
| Compliance declaration | `complianceDeclaration` | COMPLIANT |
| Country of origin | `countryOfOrigin` | COMPLIANT |
| Unique identifier | `@id` (DID) + `identifier` (GTIN) | COMPLIANT |
| Manufacturer info | `manufacturer` | COMPLIANT |
| Production date | `productionDate` | COMPLIANT |

**Assessment:** The existing dpp-core.schema.json is **ESPR 2024/1781 compliant** for mandatory fields.

### Implementation Guide Structure for ESPR

1. **DPP Quick Start** - Minimum viable compliance for 2027
2. **Mandatory Fields Checklist** - Field-by-field with examples
3. **Data Carrier Guide** - QR code generation, NFC programming
4. **GS1 Integration** - Linking GTIN to Galileo DID
5. **Textile-Specific Requirements** - First priority product category
6. **Phased Compliance Roadmap** - 2027 > 2030 > 2033
7. **Validation Tools** - Using dpp-core.schema.json for compliance checking

---

## Open Questions

### 1. EDPB Guidelines Finalization

**What we know:** Guidelines 02/2025 were published April 8, 2025; public consultation ended June 9, 2025.
**What's unclear:** Final version may have modifications based on consultation feedback.
**Recommendation:** Monitor EDPB website for final adoption; update guide when finalized.

### 2. ESPR Delegated Acts for Luxury Goods

**What we know:** Textiles/apparel are priority for 2027; specific product categories defined in delegated acts.
**What's unclear:** Whether luxury goods (leather goods, watches, jewelry) have different requirements or timeline.
**Recommendation:** Monitor Commission working plan; guides should note "pending delegated act confirmation."

### 3. MiCA Jurisdiction Variations

**What we know:** Transitional periods vary (NL: July 2025, IT: Dec 2025, others: July 2026).
**What's unclear:** Some Member States have not yet published final implementation guidance.
**Recommendation:** Include jurisdiction matrix with "check local NCA" advisory for unlisted countries.

---

## Sources

### Primary (HIGH confidence)

- **EDPB Guidelines 02/2025** - [Official PDF](https://www.edpb.europa.eu/system/files/2025-04/edpb_guidelines_202502_blockchain_en.pdf) - Blockchain GDPR compliance
- **ESPR 2024/1781** - [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng) - Ecodesign regulation
- **TFR 2023/1113** - Official EU regulation - Travel Rule
- **MiCA 2023/1114** - Official EU regulation - Crypto-asset framework
- **Galileo Specifications** - HYBRID-ARCHITECTURE.md, data-retention.md, kyc-hooks.md, aml-screening.md, dpp-core.schema.json

### Secondary (MEDIUM confidence)

- [EDPB Blockchain Guidelines Announcement](https://www.edpb.europa.eu/news/news/2025/edpb-adopts-guidelines-processing-personal-data-through-blockchains-and-ready_en)
- [MiCA 2026 Guide - AdamSmith](https://adamsmith.lt/en/mica-license-2025/)
- [EU Travel Rule Analysis - 21 Analytics](https://www.21analytics.co/travel-rule-regulations/european-union-eu-travel-rule-regulation/)
- [DPP Implementation Guide - Fluxy](https://fluxy.one/post/digital-product-passport-dpp-eu-guide-2025-2030)
- [European Parliament Textile DPP Study](https://www.europarl.europa.eu/RegData/etudes/STUD/2024/757808/EPRS_STU(2024)757808_EN.pdf)

### Tertiary (LOW confidence - require validation)

- Blog analyses of MiCA implementation timelines
- Community discussions on ESPR delegated act expectations

---

## Metadata

**Confidence breakdown:**
- GDPR guide: HIGH - EDPB Guidelines 02/2025 provide authoritative guidance
- MiCA guide: HIGH - Regulation in force, deadlines confirmed
- ESPR guide: MEDIUM-HIGH - Regulation adopted, delegated acts pending for some details
- Existing specs alignment: HIGH - Direct analysis of codebase documents

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - monitor EDPB final guidelines, ESPR delegated acts)

---

## Recommendations for Planning

1. **Structure:** Create three separate guides (GDPR, MiCA, ESPR) with consistent format
2. **Cross-references:** Heavily reference existing specifications rather than duplicating
3. **Checklists:** Use structured checklist format with regulation citations
4. **Code examples:** Provide TypeScript/Solidity examples that reference actual interfaces
5. **Timeline tracking:** Include regulatory deadline calendars
6. **Validation tools:** Include schema validation examples for DPP compliance
7. **Jurisdiction matrix:** Document country-specific variations for MiCA
8. **Update mechanism:** Include version dates and "check for updates" advisories

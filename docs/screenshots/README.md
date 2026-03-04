# Galileo Dashboard — Sprint 2 Demo Screenshots

Captured 2026-03-04 after Sprint 2 + 3 hardening rounds (188 tests green).

| # | Screenshot | Flow Step |
|---|-----------|-----------|
| 1 | [Register](demo-01-register.png) | Account creation with brand name (ABYSSE theme) |
| 2 | [Dashboard](demo-02-dashboard.png) | Empty dashboard with stat cards |
| 3 | [Create Product](demo-03-create-product.png) | Product form with 8 aligned categories |
| 4 | [Product DRAFT](demo-04-product-detail-draft.png) | Detail page with DID, GTIN, event timeline |
| 5 | [Product Edited](demo-05-product-edited.png) | Category changed Watches→Jewelry via PATCH (C1 fix) |
| 6 | [Product Minted](demo-06-product-minted.png) | ACTIVE status, QR code, Digital Link, txHash, chainId 84532 |
| 7 | [Dashboard Final](demo-07-dashboard-final.png) | Post-mint dashboard (single /auth/me, no hydration errors) |
| 8 | [Swagger UI](demo-08-swagger.png) | API documentation at /docs |

## Full E2E Flow

```
Register → Dashboard → Products → New Product → Fill Form (GTIN, serial, category)
→ Create → Detail (DRAFT) → Edit Category → Save → Mint → Detail (ACTIVE)
→ QR Code + Digital Link + txHash → Resolver returns JSON-LD
```

## GS1 Digital Link Resolver Response

```
GET /01/00012345678905/21/SN-DEMO-2026-001
→ 200 OK, application/json

{
  "@context": { "@vocab": "schema.org", "gs1": "ref.gs1.org/voc/", "galileo": "galileoprotocol.io/ns/" },
  "@type": "IndividualProduct",
  "@id": "did:galileo:01:00012345678905:21:SN-DEMO-2026-001",
  "galileo:status": "verified",
  "gs1:gtin": "00012345678905",
  ...
}
```

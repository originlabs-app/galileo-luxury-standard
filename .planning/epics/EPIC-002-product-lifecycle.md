# EPIC-002: Product Lifecycle

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Complete product lifecycle management: CRUD, mock/real mint, transfer, recall, verify, and remaining lifecycle events (REPAIRED, CPO_CERTIFIED). Includes webhook system for real-time notifications.

## Tasks

- [x] Product CRUD API: POST/GET/PATCH with GTIN validation and RBAC
- [x] DID generation: did:galileo:01:{gtin}:21:{serial}
- [x] Mint flow: mock mint with synthetic on-chain data, optimistic concurrency
- [x] QR code generation from Digital Link URL (PNG endpoint)
- [x] Dashboard: product list, create form, detail with edit, mint button, QR download
- [x] Recall endpoint: POST /products/:id/recall (ACTIVE -> RECALLED)
- [x] Transfer endpoint: POST /products/:id/transfer (wallet-to-wallet)
- [x] Verify endpoint: POST /products/:id/verify (public, optional auth)
- [x] Lifecycle events: CREATED, UPDATED, MINTED, TRANSFERRED, RECALLED, VERIFIED
- [ ] Remaining events: OWNERSHIP_CHANGED, REPAIRED, CPO_CERTIFIED
- [ ] CPO certification flow
- [ ] Transfer flow with compliance check (5 modules)
- [ ] Webhook system for real-time notifications (mint, transfer, CPO)
- [ ] Event logging: append-only, off-chain + on-chain anchoring

## Acceptance Criteria

- Full product lifecycle works: DRAFT -> ACTIVE -> RECALLED
- Transfers work between wallets
- All event types recorded and visible in provenance timeline

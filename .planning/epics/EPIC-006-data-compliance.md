# EPIC-006: Data Compliance

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

GDPR compliance, multi-tenant data isolation, file upload (R2 + CID), and audit trail. Ensures the platform meets regulatory requirements for handling personal data.

## Tasks

- [x] File upload: photo/certificate -> Cloudflare R2 + local CIDv1 computation
- [x] Dashboard: photo upload UI in product create/edit form
- [x] `DELETE /auth/me/data` — GDPR erasure (Art. 17) (Sprint #3, 22eb6c4)
- [x] `GET /auth/me/data` — GDPR data export (Art. 15) (Sprint #3, 8532fc3)
- [ ] Audit trail: who did what, when (append-only log)
- [ ] Human review endpoint for compliance rejections (GDPR Art. 22)
- [ ] DPIA draft (required before mainnet per EDPB Guidelines 02/2025)
- [ ] 🔒 PostgreSQL Row-Level Security (RLS) or schema-per-brand
- [ ] Batch operations: CSV import of products, batch mint

## Acceptance Criteria

- Photos/certificates upload to R2 with CID integrity hash
- GDPR erasure deletes from PostgreSQL + R2
- GDPR export returns all user data
- Multi-tenant isolation at database level

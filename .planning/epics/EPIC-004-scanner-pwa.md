# EPIC-004: Scanner PWA

**Status**: mostly-complete
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Mobile-first Progressive Web App for end customers to verify product authenticity by scanning QR codes. Includes provenance display, offline caching, and deep link support.

## Tasks

- [x] Scanner PWA shell: paste link -> resolve -> verification result
- [x] PWA manifest, SVG icons, viewport/theme config, standalone display
- [x] Security hardening: XSS fix, JSON.parse safety, no phantom API call
- [x] QR scanning: getUserMedia + barcode-detector (ZXing WASM ponyfill) — /scan route
- [x] Public verification page: provenance timeline in scanner + resolver API
- [x] Service worker for offline cache of previously scanned products
- [ ] Material composition display
- [ ] Deep link: scanning QR goes directly to product page

## Acceptance Criteria

- Customer scans QR and sees verified DPP with provenance history
- Works offline for previously scanned products
- Material composition visible when available

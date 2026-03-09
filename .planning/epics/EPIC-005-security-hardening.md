# EPIC-005: Security Hardening

**Status**: in-progress
**Owner**: Researcher
**Created**: 2026-03-08

## Description

Production-grade security: OWASP compliance, cookie hardening, MFA, SIWE wallet login, and comprehensive input validation across all API routes.

## Tasks

- [x] Rate limiting on all endpoints (@fastify/rate-limit)
- [x] Security headers via @fastify/helmet (CSP, HSTS, X-Frame-Options, CORP, COOP)
- [x] OWASP input validation audit against top 10
- [x] `__Host-` cookie prefix for production
- [x] Cookie signing via @fastify/cookie secret
- [x] Log warning when `secure: false` in development mode
- [x] Wallet-link: add nonce + expiry to signed message (Sprint #7, 7e0eb06)
- [ ] MFA: TOTP + passkey (enterprise-grade security)
- [x] SIWE (EIP-4361) for wallet login (Sprint #8, d590d24) — ERC-1271 supported natively via `siwe` package
- [x] ERC-1271 Smart Wallet verification — publicClient.verifyMessage for EOA + Smart Wallet (Sprint #9, 081ee0e)
- [x] Coinbase Smart Wallet connector — wagmi coinbaseWallet connector in dashboard (Sprint #9, ce70f02)

## Acceptance Criteria

- All API routes pass OWASP top 10 audit
- Cookies use `__Host-` prefix in production
- MFA available for enterprise users

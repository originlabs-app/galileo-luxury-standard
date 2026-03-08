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
- [ ] MFA: TOTP + passkey (enterprise-grade security)
- [ ] SIWE (EIP-4361) for wallet login with ERC-1271 smart wallet verification

## Acceptance Criteria

- All API routes pass OWASP top 10 audit
- Cookies use `__Host-` prefix in production
- MFA available for enterprise users

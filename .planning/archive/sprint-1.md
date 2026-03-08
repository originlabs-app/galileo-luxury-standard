# Sprint #1 -- Hardening & Quality (Archived)

**Goal**: Fix flaky tests, harden security (OWASP + cookies), and add file upload -- unblocking quality and features without waiting on blockchain RPC key.
**Started**: 2026-03-08
**Archived**: 2026-03-08
**Status**: completed

## Tasks

| # | Task | Epic | Status | Commit |
|---|------|------|--------|--------|
| 1 | Fix flaky test suites | EPIC-007 | validated | 3ac8bf6 |
| 2 | OWASP input validation audit | EPIC-005 | validated | 75d4038 |
| 3 | Cookie hardening | EPIC-005 | validated | 61ebf4e |
| 4 | File upload (R2 + CID) | EPIC-006 | validated | 9600650 |

## Outcomes

- Test suite is stable: TRUNCATE CASCADE cleanup, 30s timeouts, 173 API tests pass reliably
- All body schemas use `.strict()` -- prototype pollution and mass assignment blocked
- Cookies use `__Host-`/`__Secure-` prefix in production with signing support
- File upload endpoint with R2 storage, local fallback, CIDv1 tamper-evidence
- New test files: upload.test.ts (10 tests), extended security-hardening.test.ts (+12 tests)

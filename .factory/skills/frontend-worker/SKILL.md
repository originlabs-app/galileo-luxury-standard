---
name: frontend-worker
description: Builds Next.js pages, components, layouts, auth flows, frontend integration with the API, and Playwright e2e tests
---

# Frontend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- Next.js pages and layouts (App Router)
- React components (shadcn/ui based)
- Client-side auth (httpOnly cookie flow, NO localStorage)
- API integration (fetch wrapper with credentials:'include')
- Tailwind CSS styling and ABYSSE theming
- Playwright e2e tests

## Work Procedure

1. **Read the feature description thoroughly.** Understand every page, component, and interaction required.

2. **Read AGENTS.md** for mission boundaries, coding conventions, and known issues.

3. **Check preconditions.** Before starting:
   - Is the API server available? Check `.factory/services.yaml` for start command
   - Are shared types/validators importable from `@galileo/shared`?
   - Does the monorepo build? (`pnpm build`)
   - For dashboard: is apps/dashboard/ initialized with Next.js?

4. **Auth flow — CRITICAL (httpOnly cookies):**
   - All API calls MUST use `credentials: 'include'` — never set Authorization header
   - On login/register success: do NOT extract tokens from response body — cookies are set automatically by the browser
   - On logout: call POST /auth/logout — server expires cookies
   - The `use-auth` hook checks auth status via GET /auth/me with credentials:'include'
   - If GET /auth/me returns 401 → user is not authenticated
   - NO localStorage read/write for auth tokens. On app mount, clear any legacy localStorage auth keys.

5. **Build pages iteratively:**
   - For each page: create the route file under `apps/dashboard/src/app/`, implement the UI, wire up API calls
   - Use shadcn/ui components as the base (Button, Input, Card, Table, Badge, Select, etc.)
   - Implement form validation client-side before API calls (use @galileo/shared validators like validateGtin)
   - Handle loading states, error states, success states, and empty states
   - Status badges: DRAFT=yellow, ACTIVE=emerald (#00FF88), TRANSFERRED=cyan (#00FFFF), RECALLED=red

6. **ABYSSE Theme:**
   - Background: #020204 (obsidian)
   - Card: #0a0a0f (graphite)
   - Primary: #00FFFF (cyan)
   - Success: #00FF88 (emerald)
   - Text: #e8e6e3 (platinum)
   - Muted: #9a9a9a (silver)
   - Heading font: Cormorant Garamond
   - Body font: Outfit

7. **Verify with all validators:**
   ```bash
   pnpm build            # Dashboard builds
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   ```

8. **Manual verification with agent-browser (CRITICAL):**
   - Start the API server AND the dashboard dev server (check `.factory/services.yaml`)
   - Use agent-browser to visit each page and verify:
     - Page renders correctly (take screenshot)
     - Forms submit correctly (fill fields, click submit)
     - Navigation works (click sidebar links, buttons)
     - Auth flow works with cookies (login → dashboard → logout)
     - Error states display correctly
     - Theme is correct (dark background, cyan accents)
   - Each page visit = one `interactiveChecks` entry
   - If agent-browser is unavailable, use curl to verify page responses
   - **STOP all dev servers after testing**

9. **Playwright e2e tests (if required by feature):**
   - Config: `apps/dashboard/playwright.config.ts`
   - Tests: `apps/dashboard/e2e/`
   - Auth setup: `apps/dashboard/e2e/auth.setup.ts` saves storageState
   - Run: `cd apps/dashboard && npx playwright test`
   - webServer config auto-starts API + Dashboard

## When to Return to Orchestrator

- API server is not running or endpoints return unexpected errors
- @galileo/shared types are not importable
- shadcn/ui installation fails
- Port 3000 or 3001 is already in use
- CORS errors prevent dashboard from calling API (cookies not sent)
- agent-browser is unavailable AND pages cannot be verified

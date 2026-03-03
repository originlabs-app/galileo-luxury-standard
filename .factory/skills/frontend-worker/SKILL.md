---
name: frontend-worker
description: Builds Next.js pages, components, layouts, auth flows, and frontend integration with the API
---

# Frontend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- Next.js pages and layouts (App Router)
- React components (shadcn/ui based)
- Client-side auth (token storage, refresh, guards)
- API integration (fetch wrapper)
- Tailwind CSS styling and theming
- Static shell pages

## Work Procedure

1. **Read the feature description thoroughly.** Understand every page, component, and interaction required.

2. **Check preconditions.** Before starting:
   - Is the API server available? Check `.factory/services.yaml` for start command
   - Are shared types importable from `@galileo/shared`?
   - Is the monorepo build working? (`pnpm build`)
   - For dashboard: is apps/dashboard/ initialized with Next.js?

3. **Set up the design system first (if creating a new app):**
   - Install shadcn/ui and configure for dark theme
   - Set ABYSSE colors in Tailwind config:
     - Background: #020204 (obsidian)
     - Card: #0a0a0f (graphite)
     - Primary: #00FFFF (cyan)
     - Success: #00FF88 (emerald)
     - Text: #e8e6e3 (platinum)
     - Muted: #9a9a9a (silver)
   - Configure fonts: Cormorant Garamond (headings) + Outfit (body)

4. **Build pages iteratively:**
   - For each page: create the route file, implement the UI, wire up API calls
   - Use shadcn/ui components as the base (Button, Input, Card, etc.)
   - Implement form validation client-side before API calls
   - Handle loading states, error states, and success states

5. **Implement auth flow:**
   - Token storage (localStorage or secure cookie)
   - Auth context/hook providing user state
   - Auth guard component that redirects unauthenticated users to /login
   - Redirect authenticated users away from /login and /register to /dashboard
   - API fetch wrapper that attaches Bearer token and handles 401 refresh

6. **Verify with all validators:**
   ```bash
   pnpm build            # Dashboard/scanner builds
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   ```

7. **Manual verification with agent-browser (CRITICAL):**
   - Start the API server AND the frontend dev server (check `.factory/services.yaml`)
   - Use agent-browser to visit each page and verify:
     - Page renders correctly (take screenshot)
     - Forms submit correctly (fill fields, click submit)
     - Navigation works (click sidebar links)
     - Auth flow works (login → dashboard → logout → login)
     - Error states display correctly (wrong credentials)
     - Theme is correct (dark background, cyan accents)
   - Each page visit = one `interactiveChecks` entry with action + observation
   - If agent-browser is unavailable, use curl to verify page HTML responses (200 status)
   - **STOP all dev servers after testing** (kill processes by PID)

8. **Cross-check adjacent features:**
   - After implementing dashboard, verify the scanner shell still builds
   - After auth flow, verify API endpoints still work via curl

## Example Handoff

```json
{
  "salientSummary": "Built Next.js dashboard with 5 pages (login, register, dashboard home, products, sidebar layout) in ABYSSE dark theme. Auth flow works end-to-end: register → auto-login → dashboard → products → logout. All pages verified via agent-browser screenshots. Build, typecheck, lint all pass.",
  "whatWasImplemented": "apps/dashboard/ with Next.js App Router. Root layout with auth provider, Cormorant Garamond + Outfit fonts. Login page (/login) with email/password form, client-side validation, API integration. Register page (/register) with email/password/brandName form. Dashboard layout with sidebar (Dashboard, Products, Transfers disabled, Settings disabled, Logout). Dashboard home (/dashboard) with welcome message, 4 stat cards (all zero), empty activity feed, 'Create your first product' CTA. Products page (/dashboard/products) with empty state. Auth guard redirecting unauthenticated to /login. Authenticated redirect from /login to /dashboard. API fetch wrapper with token refresh. ABYSSE theme: #020204 bg, #0a0a0f cards, #00FFFF primary, #00FF88 success.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "pnpm build", "exitCode": 0, "observation": "Dashboard builds without errors" },
      { "command": "pnpm typecheck", "exitCode": 0, "observation": "Zero type errors" },
      { "command": "pnpm lint", "exitCode": 0, "observation": "Zero lint errors" }
    ],
    "interactiveChecks": [
      { "action": "Visit /login in browser", "observed": "Login page renders with email/password fields, dark background #020204, cyan submit button" },
      { "action": "Submit login with empty fields", "observed": "Validation errors appear, no network request made" },
      { "action": "Submit register with valid data", "observed": "POST /auth/register called, 201 returned, redirected to /dashboard" },
      { "action": "View /dashboard after login", "observed": "Welcome message, 4 stat cards showing 0, activity feed empty, CTA button visible" },
      { "action": "Click Products in sidebar", "observed": "Navigated to /dashboard/products, 'No products yet' empty state shown" },
      { "action": "Click Transfers in sidebar", "observed": "Item visually disabled, no navigation occurs" },
      { "action": "Click Logout", "observed": "Redirected to /login, tokens cleared from storage" },
      { "action": "Visit /dashboard without auth", "observed": "Redirected to /login" },
      { "action": "Visit scanner on port 3001", "observed": "Coming Soon page renders with ABYSSE theme" }
    ]
  },
  "tests": {
    "added": []
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- API server is not running or endpoints return unexpected errors
- @galileo/shared types are not importable
- shadcn/ui installation fails or is incompatible with Next.js version
- Port 3000 or 3001 is already in use
- CORS errors prevent dashboard from calling API (configuration issue)
- agent-browser is unavailable AND pages cannot be verified via curl

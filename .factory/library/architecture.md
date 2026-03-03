# Architecture

Architectural decisions, patterns, and conventions discovered during the mission.

**What belongs here:** Tech stack choices, directory patterns, coding conventions, design decisions.

---

## Monorepo Structure
- Turborepo with pnpm workspaces
- Only apps/* and packages/* in workspace
- website/ (Next.js 16, independent, Vercel deploy) — NOT in workspace
- contracts/ (Foundry, Solidity) — NOT in workspace

## Design Language: ABYSSE
- Dark ocean theme
- Background: #020204 (obsidian)
- Card: #0a0a0f (graphite)
- Primary: #00FFFF (cyan)
- Success: #00FF88 (emerald)
- Text: #e8e6e3 (platinum)
- Muted: #9a9a9a (silver)
- Heading font: Cormorant Garamond (serif)
- Body font: Outfit (sans-serif)

## Identifiers
- Products use GS1-native DIDs: did:galileo:01:{gtin}:21:{serial}
- Brands use DIDs: did:galileo:brand:{slug}
- GS1 Digital Link: https://id.galileoprotocol.io/01/{gtin}/21/{serial}
- No UUIDs as primary product identifiers

## GDPR Compliance
- Passwords: bcrypt 12 rounds
- JWT: minimal payload (sub, role, brandId only)
- Logs: no PII (user IDs only, never emails/names)
- CORS: strict origin validation

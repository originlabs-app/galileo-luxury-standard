# Phase 13: Production Deployment - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the Galileo Protocol website to production on Vercel with HTTPS, proper meta tags, and Lighthouse score >90 on all categories. Includes domain configuration, CI/CD setup, and performance optimization.

**Important:** Replace all mentions of `galileo.luxury` with `galileoprotocol.io` in the codebase.

</domain>

<decisions>
## Implementation Decisions

### Plateforme d'hébergement
- **Vercel** — optimisé pour Next.js
- **Domaine:** galileoprotocol.io (DNS accessible, configuration requise)
- **Environnement:** Production seule (pas de staging)
- Remplacer toutes les occurrences de `galileo.luxury` → `galileoprotocol.io`

### CI/CD & Pipeline
- Déploiement automatique sur push vers `main`
- Vérifications avant déploiement:
  - Build check (npm run build)
  - TypeScript strict (bloquer sur erreurs)
  - ESLint (vérifier qualité code)
  - Lighthouse CI (score >90 requis avant merge)
- Preview deployments: Claude's discretion (activer par défaut, Vercel natif)

### Meta tags & OpenGraph
- **Image OG:** Statique unique (Claude décide du design — logo + tagline style obsidian)
- **Meta description:** Focus standard ouvert — "Open standard for luxury product authentication and provenance"
- **Twitter Card:** Claude's discretion (summary_large_image recommandé)
- Canonical URLs vers galileoprotocol.io

### Optimisation Performance
- **Images:** next/image pour optimisation auto, WebP, lazy loading
- **Fonts:** Google Fonts CDN (Outfit, Inter, Cormorant Garamond, JetBrains Mono)
- **Caching:** Vercel defaults (headers auto, edge caching)
- **Objectif Lighthouse:** >90 sur Performance, Accessibility, Best Practices, SEO

### Claude's Discretion
- Design exact de l'image OG (logo + tagline sur fond obsidian)
- Format Twitter Card (summary_large_image recommandé)
- Configuration preview deployments
- Headers de cache spécifiques si nécessaire pour atteindre >90

</decisions>

<specifics>
## Specific Ideas

- Le domaine galileoprotocol.io est déjà acheté et DNS accessible
- Priorité sur la simplicité: production seule, pas de staging
- Vercel natif sans GitHub Actions custom
- Focus sur "open standard" dans le messaging SEO

</specifics>

<deferred>
## Deferred Ideas

- **Améliorer design des pages** — UX/UI polish pour v1.2 (pas du déploiement)
- **Geo/i18n** — Internationalisation, ciblage géographique → future version
- **Analytics avancés** — Vercel Analytics ou Plausible → v1.2
- **Staging environment** — À reconsidérer si l'équipe grandit

</deferred>

---

*Phase: 13-production-deployment*
*Context gathered: 2026-02-01*

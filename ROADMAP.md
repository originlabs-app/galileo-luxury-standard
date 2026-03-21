# GalileoLuxury — Roadmap & Backlog

## Déploiements

| App | Cible | Statut |
|-----|-------|--------|
| `apps/api` | Railway | ✅ En prod (health OK, faucet OK, auth OK) |
| `website/` | Vercel (`galileo-luxury-standard`) | ✅ En prod (site vitrine ABYSSE) |
| `apps/dashboard` | Vercel (à créer) | ⏳ Pas encore déployé |
| `apps/scanner` | Vercel (à créer) | ⏳ Pas encore déployé |

## Priorités immédiates

### P0 — Bloquants
- [ ] **Migrations Prisma sur DB Railway** — La table `Product` n'existe pas, le résolveur GS1 retourne 500. Il faut exécuter `prisma migrate deploy` ou `prisma db push` contre la DB de production.

### P1 — Déploiements manquants
- [ ] **Déployer apps/dashboard sur Vercel** — Back-office B2B pour les marques (gestion produits/DPP)
- [ ] **Déployer apps/scanner sur Vercel** — PWA consommateur pour scanner les QR et vérifier l'authenticité blockchain

### P2 — Configuration prod
- [ ] **Configurer R2 storage sur Railway** — Actuellement en mode `local`, les uploads d'images ne persistent pas entre redémarrages
- [ ] **Ajouter clé API Basescan** — Nécessaire pour la vérification des contrats sur Base Sepolia
- [ ] **Clean up worktrees git** — ~25 worktrees orphelins à supprimer dans `.claude/worktrees/`

### P3 — Tests & Validation
- [ ] **Test navigateur end-to-end** — Connexion wallet, faucet, flow complet sur le dashboard
- [ ] **Smoke test scanner** — Vérifier le scan QR et la résolution GS1 Digital Link
- [ ] **Vérifier communication dashboard ↔ API** — S'assurer que les env vars pointent vers la bonne URL API

## Roadmap Features
- [ ] Faire le point sur les features restantes à builder (à compléter après revue du code)

## Notes
- L'API a été fixée le 22/03/2026 : Prisma 7 ESM imports (.js extensions) + chemin contracts/deployments dans le Dockerfile
- Règle : toujours éditer en local + git push, ne jamais utiliser l'éditeur web GitHub sauf si parfaitement justifié

---
"galileo-protocol": patch
---

fix(deploy): production deployment fixes on 2026-03-22

- Fix Prisma 7 ESM imports by patching generated files with .js extensions in postbuild
- Fix contracts/deployments copy path in Dockerfile (was copying to /, now to /app)
- Fix sed delimiter conflict with file paths (use # delimiter)
- Deploy apps/scanner to Vercel with monorepo configuration
- Deploy apps/dashboard to Vercel (galileo-dashboard.vercel.app)
- Configure Cloudflare R2 storage for persistent image uploads
- Add Basescan API key for contract verification on Base Sepolia
- Fix Vercel environment variables pointing to production API
- Remove 46 orphaned git worktrees from .claude/worktrees/
- Run Prisma DB migrations on Railway production database

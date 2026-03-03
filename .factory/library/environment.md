# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## PostgreSQL
- Running via Homebrew (PostgreSQL 14) on localhost:5432
- System user: pierrebeunardeau (no password needed for local connections)
- Dev database: galileo_dev
- Connection string: postgresql://pierrebeunardeau@localhost:5432/galileo_dev

## Node.js
- Version 22 (specified in .nvmrc)
- Current: v22.22.0

## Package Manager
- pnpm 10.30.0
- Workspace: apps/* and packages/* only
- website/ and contracts/ are NOT in the workspace

## API Environment Variables
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Min 32 chars, used for access tokens
- JWT_REFRESH_SECRET: Min 32 chars, used for refresh tokens
- PORT: Default 4000
- CORS_ORIGIN: Default http://localhost:3000
- NODE_ENV: development | production | test

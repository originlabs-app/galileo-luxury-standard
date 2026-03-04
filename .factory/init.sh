#!/bin/bash
set -e

cd /Users/pierrebeunardeau/GalileoLuxury

# Detect the current OS user for PostgreSQL connections
PG_USER="${PGUSER:-$(whoami)}"

# Install workspace dependencies (idempotent)
if [ -f "package.json" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
fi

# Create galileo_dev database if it doesn't exist
psql -h localhost -p 5432 -U "$PG_USER" -tc "SELECT 1 FROM pg_database WHERE datname = 'galileo_dev'" postgres | grep -q 1 || \
  psql -h localhost -p 5432 -U "$PG_USER" -c "CREATE DATABASE galileo_dev" postgres

# Create galileo_test database if it doesn't exist
psql -h localhost -p 5432 -U "$PG_USER" -tc "SELECT 1 FROM pg_database WHERE datname = 'galileo_test'" postgres | grep -q 1 || \
  psql -h localhost -p 5432 -U "$PG_USER" -c "CREATE DATABASE galileo_test" postgres

# Export DATABASE_URL_TEST for test infrastructure
export DATABASE_URL_TEST="postgresql://${PG_USER}@localhost:5432/galileo_test"

# Set up API .env if it doesn't exist
if [ -d "apps/api" ] && [ ! -f "apps/api/.env" ]; then
  cat > apps/api/.env << EOF
DATABASE_URL=postgresql://${PG_USER}@localhost:5432/galileo_dev
JWT_SECRET=changeme-set-a-real-secret-at-least-32ch
JWT_REFRESH_SECRET=changeme-set-a-refresh-secret-32ch
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF
fi

# Set up Dashboard .env if it doesn't exist
if [ -d "apps/dashboard" ] && [ ! -f "apps/dashboard/.env" ]; then
  cat > apps/dashboard/.env << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
fi

# Push Prisma schema to dev DB
if [ -f "apps/api/prisma/schema.prisma" ] && [ -f "apps/api/.env" ]; then
  cd apps/api && pnpm prisma db push 2>/dev/null || true
  pnpm prisma generate 2>/dev/null || true
  cd /Users/pierrebeunardeau/GalileoLuxury
fi

# Push Prisma schema to test DB
if [ -f "apps/api/prisma/schema.prisma" ]; then
  cd apps/api && pnpm prisma db push --url "$DATABASE_URL_TEST" 2>/dev/null || true
  cd /Users/pierrebeunardeau/GalileoLuxury
fi

# Kill any leftover dev servers on our ports
lsof -ti :4000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

echo "Init complete."

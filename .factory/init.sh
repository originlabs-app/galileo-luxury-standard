#!/bin/bash
set -e

cd /Users/pierrebeunardeau/GalileoLuxury

# Install workspace dependencies (idempotent)
if [ -f "package.json" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
fi

# Create galileo_dev database if it doesn't exist
psql -h localhost -p 5432 -U pierrebeunardeau -tc "SELECT 1 FROM pg_database WHERE datname = 'galileo_dev'" postgres | grep -q 1 || \
  psql -h localhost -p 5432 -U pierrebeunardeau -c "CREATE DATABASE galileo_dev" postgres

# Create galileo_test database if it doesn't exist
psql -h localhost -p 5432 -U pierrebeunardeau -tc "SELECT 1 FROM pg_database WHERE datname = 'galileo_test'" postgres | grep -q 1 || \
  psql -h localhost -p 5432 -U pierrebeunardeau -c "CREATE DATABASE galileo_test" postgres

# Set up API .env if it doesn't exist
if [ -d "apps/api" ] && [ ! -f "apps/api/.env" ]; then
  cat > apps/api/.env << EOF
DATABASE_URL=postgresql://pierrebeunardeau@localhost:5432/galileo_dev
JWT_SECRET=changeme-set-a-real-secret-at-least-32ch
JWT_REFRESH_SECRET=changeme-set-a-refresh-secret-32ch
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF
fi

# Push Prisma schema to dev DB
if [ -f "apps/api/prisma/schema.prisma" ] && [ -f "apps/api/.env" ]; then
  cd apps/api && pnpm prisma db push --skip-generate 2>/dev/null || true
  pnpm prisma generate 2>/dev/null || true
  cd /Users/pierrebeunardeau/GalileoLuxury
fi

# Push Prisma schema to test DB
if [ -f "apps/api/prisma/schema.prisma" ]; then
  DATABASE_URL="postgresql://pierrebeunardeau@localhost:5432/galileo_test" \
    cd apps/api && pnpm prisma db push --skip-generate 2>/dev/null || true
  cd /Users/pierrebeunardeau/GalileoLuxury
fi

# Kill any leftover dev servers on our ports
lsof -ti :4000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

echo "Init complete."

#!/bin/bash
set -e

cd /Users/pierrebeunardeau/GalileoLuxury

# Install workspace dependencies (idempotent)
if [ -f "package.json" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
fi

# Create galileo_dev database if it doesn't exist
psql -h localhost -p 5432 -U $(whoami) -tc "SELECT 1 FROM pg_database WHERE datname = 'galileo_dev'" postgres | grep -q 1 || \
  psql -h localhost -p 5432 -U $(whoami) -c "CREATE DATABASE galileo_dev" postgres

# Set up API .env if it doesn't exist
if [ -d "apps/api" ] && [ ! -f "apps/api/.env" ]; then
  cat > apps/api/.env << 'EOF'
DATABASE_URL=postgresql://$(whoami)@localhost:5432/galileo_dev
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_REFRESH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF
  # Fix the whoami substitution
  sed -i '' "s/\$(whoami)/$(whoami)/g" apps/api/.env 2>/dev/null || true
fi

# Push Prisma schema if API exists and has schema
if [ -f "apps/api/prisma/schema.prisma" ] && [ -f "apps/api/.env" ]; then
  cd apps/api && pnpm prisma db push --skip-generate 2>/dev/null || true
  cd /Users/pierrebeunardeau/GalileoLuxury
fi

echo "Init complete."

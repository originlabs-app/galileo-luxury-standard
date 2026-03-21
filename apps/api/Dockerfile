# Stage 1: Install dependencies
FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
WORKDIR /app/packages/shared
RUN pnpm build
WORKDIR /app/apps/api
RUN pnpm prisma generate && pnpm tsc \
  && cp -rT src/generated/prisma/internal dist/generated/prisma/internal \
  && node -e 'var fs=require("fs"),p=require("path");function f(d){fs.readdirSync(d,{withFileTypes:true}).forEach(function(e){var n=p.join(d,e.name);if(e.isDirectory())f(n);else if(e.name.endsWith(".js")){var c=fs.readFileSync(n,"utf8");c=c.replace(/from ([\x27\x22])(\.\.\/[^\x27\x22]+)\1/g,function(m,q,i){return i.endsWith(".js")?m:"from "+q+i+".js"+q});c=c.replace(/from ([\x27\x22])(\.\/[^\x27\x22]+)\1/g,function(m,q,i){return i.endsWith(".js")?m:"from "+q+i+".js"+q});fs.writeFileSync(n,c)}})}f("dist/generated")' \
  && echo "=== Fixed client.js imports ===" && grep -n "from " dist/generated/prisma/client.js | head -10

# Stage 3: Production
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
# Copy root node_modules (contains pnpm virtual store .pnpm/)
COPY --from=builder /app/node_modules ./node_modules
# Copy workspace node_modules (contains symlinks to root .pnpm/)
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
# Deployment manifest resolved 3 dirs up from dist/ at runtime
COPY --from=builder /app/contracts/deployments /contracts/deployments
WORKDIR /app/apps/api
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok)throw 1}).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]


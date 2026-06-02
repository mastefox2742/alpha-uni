# ─── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copie les fichiers de dépendances en premier (meilleur cache Docker)
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/

# Install toutes les dépendances (incluant devDependencies pour le build)
RUN npm ci --workspace=packages/api --workspace=packages/shared --include-workspace-root

# Copie le code source
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api

# Build TypeScript
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/api

# ─── Stage 2 : Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

WORKDIR /app

ENV NODE_ENV=production

# Copie seulement les dépendances de production
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=packages/api --workspace=packages/shared \
    --include-workspace-root --omit=dev

# Copie les builds compilés depuis le stage builder
COPY --from=builder /app/packages/api/dist    ./packages/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Change le propriétaire
RUN chown -R apiuser:nodejs /app

USER apiuser

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "packages/api/dist/index.js"]

# ============================================
# Étape 1 : Installation des dépendances
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ============================================
# Étape 2 : Construction de l'application
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================
# Étape 3 : Image d'exécution (minimale)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root : si l'app est compromise, elle n'est pas root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Uniquement les artefacts du build autonome
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
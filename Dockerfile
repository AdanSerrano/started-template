# ──────────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ──────────────────────────────────────────────────────────
# Stage 2: Build the application
# ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1

# Dummy build-time env vars (real values injected at runtime)
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost/placeholder"
ARG BETTER_AUTH_SECRET="build-time-placeholder-secret-not-used-at-runtime"
ARG BETTER_AUTH_URL="http://localhost:3000"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"

ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN bun run build

# ──────────────────────────────────────────────────────────
# Stage 3: Production image
# ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# tini = init PID 1: reap zombies y reenvía SIGTERM/SIGINT para graceful shutdown.
RUN apk update && apk upgrade --no-cache && apk add --no-cache tini

# Versión inyectada en build (ej: --build-arg APP_VERSION=$(git rev-parse --short HEAD)).
ARG APP_VERSION="0.1.0"
ENV APP_VERSION=$APP_VERSION

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Liveness (proceso vivo). La readiness con dependencias (/api/health) la usa
# el balanceador/orquestador, no el healthcheck del contenedor (evita flapping
# por un blip de la DB).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/live || exit 1

# tini como PID 1 para señales limpias en rollouts.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]

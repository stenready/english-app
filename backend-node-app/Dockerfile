# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# --- deps: all dependencies + Prisma CLI (also used by the `migrate` service) ---
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# Prisma's schema engine (migrations) needs OpenSSL on Alpine
RUN apk add --no-cache openssl
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs `prisma generate`
RUN npm ci

# --- build: compile TypeScript to dist/ ---
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime: production dependencies + compiled code only ---
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
# Prisma CLI is a dev dependency, so skip postinstall; the client is already compiled into dist/
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health > /dev/null || exit 1
CMD ["node", "dist/server.js"]

# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
WORKDIR /app
# pnpm is pinned by package.json "packageManager"; corepack provisions it.
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts blocks transitive postinstall from running during image build.
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Railway (and plain Docker) only forward service variables to the build step
# when the Dockerfile declares them as ARG. SITE_URL is required by
# `astro build` to emit canonical URLs, OG tags, and sitemap.
ARG SITE_URL
ENV SITE_URL=${SITE_URL}
ENV NODE_ENV=production
RUN pnpm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
# Reuse the version of `serve` pinned in pnpm-lock.yaml (no global install).
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY scripts/upload-to-cdn.mjs ./scripts/upload-to-cdn.mjs
# node:24-alpine ships a non-root `node` user (uid 1000). Drop root for runtime.
USER node
EXPOSE 3000
ENV PORT=3000
# Run the CDN upload to completion (logs stream to Railway deploy logs),
# then exec into `serve`. The script catches all errors and exits 0, so
# serve always starts regardless of upload outcome.
# `serve` reads dist/serve.json (copied from public/serve.json by Astro) for security headers.
CMD ["sh", "-c", "node scripts/upload-to-cdn.mjs; exec node node_modules/serve/build/main.js -s dist -l ${PORT:-3000}"]

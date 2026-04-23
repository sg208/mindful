# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts blocks transitive postinstall from running during image build.
RUN npm ci --no-audit --no-fund --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Railway (and plain Docker) only forward service variables to the build step
# when the Dockerfile declares them as ARG. SITE_URL is required by
# `astro build` to emit canonical URLs, OG tags, and sitemap.
ARG SITE_URL
ENV SITE_URL=${SITE_URL}
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
# Reuse the version of `serve` pinned in package-lock.json (no global install).
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY scripts/upload-to-cdn.mjs ./scripts/upload-to-cdn.mjs
# node:22-alpine ships a non-root `node` user (uid 1000). Drop root for runtime.
USER node
EXPOSE 3000
ENV PORT=3000
# Run CDN upload first, then start the static file server.
# `serve` reads dist/serve.json (copied from public/serve.json by Astro) for security headers.
CMD ["sh", "-c", "node scripts/upload-to-cdn.mjs & exec node node_modules/serve/build/main.js -s dist -l ${PORT:-3000}"]

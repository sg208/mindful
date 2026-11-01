# design.md

## Architecture

- `astro.config.mjs:17` — `output: 'static'`; no server runtime. WHY: content-only blog, cheap hosting, fast TTFB
- `src/content.config.ts:20` — Zod `postSchema`; build fails on bad frontmatter. WHY: catch content errors before deploy
- `src/lib/posts.ts:18` — `getPublishedPosts` filters `draft` + sorts desc; every listing goes through it
- `src/components/NavLinks.astro` — single nav source for header dialog + footer. WHY: keeps menus in sync

## Data flow

1. Author markdown → `src/content/posts/*.md`
2. `astro build` → validates collections → renders `src/pages/**` → `dist/` + sitemap
3. Docker runtime → `scripts/upload-to-cdn.mjs` pushes `dist/` to Bunny storage + purges zone (exits 0 on any failure)
4. `serve -s dist` with `public/serve.json` security headers on `$PORT`

## Key decisions

- Zero framework runtime; inline `<script>` for the header dialog. WHY: no hydration cost (`src/components/Header.astro`)
- Service worker same-origin, network-first HTML, SWR assets, caches only `ok && basic && !redirected` (`public/sw.js`). WHY: avoid cache poisoning
- Non-root `node` user + `--ignore-scripts` install in Docker (`Dockerfile`). WHY: limit supply-chain blast radius
- Script helpers isolated in `scripts/lib/*.mjs`. WHY: unit-testable without running side-effectful CLIs

# GitHub Copilot — workspace instructions

Workspace context for the Mindful blog. Read this before suggesting changes;
it is the authoritative infrastructure map and answers "where does X live"
without requiring a wide search.

## Stack

Astro 7 static (`output: 'static'`) + TypeScript strict + Tailwind v4 (via
`@tailwindcss/vite`) + Content Collections (markdown + JSON). Zero framework
runtime. **E2E:** `@playwright/test` hits `astro preview` at `http://127.0.0.1:4173`
(never 4321 — avoids clashing with `astro dev`); `playwright.config.ts` sets
`SITE_URL` for the webServer build when unset. Live at https://mindful.engg.app, served by a Cloudflare Worker with
static assets (`wrangler.jsonc`, deploy with `pnpm run deploy`).

## Where to find things

**Content**

- Posts: `src/content/posts/*.md` (Zod-validated frontmatter, markdown body)
- Categories: `src/content/categories/*.json`
- Collection schema + loaders: `src/content.config.ts` (uses `astro/zod`, NOT
  `astro:content`'s deprecated `z`)

**Site wiring**

- Site-level constants (name, tagline, nav, theme color): `src/config/site.ts`
- Data helpers: `src/lib/posts.ts` (`getPublishedPosts`, `getFeaturedPost`,
  `getAdjacentPosts`, `formatDate`, `readingMinutes`), `src/lib/categories.ts`
  (`getCategories`, `getCategory`)

**Layouts**

- `src/layouts/BaseLayout.astro` — `<html>`, `<head>`, `Seo.astro`, skip link,
  `Header.astro`, `Footer.astro`, inline SW registration, manifest link
- `src/layouts/ArticleLayout.astro` — wraps `BaseLayout` with article chrome,
  prose container, prev/next nav, `Article` JSON-LD

**Components** (`src/components/`)

- `Header.astro` — sticky bar: wordmark, `siteConfig.headerNav` links (md+),
  "Need help now?" link, and a menu button that opens native
  `<dialog#site-menu>` full-screen; `MenuScript.astro` handles open/close
- `NavLinks.astro` — shared nav (footer + menu use this so they stay in sync)
- `Footer.astro` — uses `NavLinks` + disclaimer copy
- `Seo.astro` — title, description, canonical, OG, Twitter, JSON-LD (pass
  objects or arrays via the `jsonLd` prop)
- `PostCard.astro` — text-only entry for home + category listings
  (`variant`: `default` | `row` | `feature`); accepts `headingLevel: 2 | 3`
  (default 3) so parent pages keep a valid h1 → h2 → h3 outline. Post images
  render only on the article page
- `CategoryChip.astro` — theme link in ink with a small square of the
  category's `accent`
- `CategoryCard.astro` — theme row for the home page
- `PageHeader.astro` — breadcrumb, `<h1>` and lede for index and info pages
- `ArticleNav.astro` — previous/next essay links
- `Disclaimer.astro` — reusable "not medical advice" care note linking to the
  crisis section

**Pages** (`src/pages/`)

- `index.astro` (home: hero + featured + grid), `posts/[slug].astro`,
  `categories/[slug].astro`, `about.astro`, `disclaimer.astro`,
  `accessibility.astro`, `privacy.astro`, `terms.astro`,
  `offline.astro` (SW fallback, noindex), `404.astro` (noindex)

**Styling**

- `src/styles/global.css` — Tailwind import, fonts in `@theme`, colour
  tokens on `:root` (light/dark), base links, `.frame`, `.button`, `.meta`
- `src/styles/prose.css` — `.prose` rules (measure 64ch, drop cap via
  `.prose-essay`)
- `src/styles/motion.css` — rise / scroll-linked reveal, dropped under
  `prefers-reduced-motion`

**PWA**

- `public/manifest.webmanifest` (name, theme + bg `#F3F2EE`, icons)
- `public/sw.js` — same-origin only; network-first HTML (fallback `/offline`),
  SWR for assets; only caches `response.ok && type === 'basic' && !redirected`
  so error/opaque responses can't poison the cache. Registered inline from
  `BaseLayout.astro` (HTTPS or `localhost`/`127.0.0.1`).
- `public/_headers` — Cloudflare static-asset security headers (HSTS, CSP,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame
  lockdown); also forces no-cache on `sw.js`. Not applied by `astro preview`.
- Icons regenerated from `public/favicon.svg` via `pnpm run icons`

**Scripts** (`scripts/`)

- `csv-to-content.mjs` — one-shot CSV → markdown import (do not rerun casually;
  markdown is now source of truth)
- `generate-icons.mjs` — sharp-based favicon → PWA PNG icons
- `init-env.mjs` — copy `.env.example` → `.env` if missing
- `lib/` — pure helpers (CSV parser, frontmatter builder, CDN paths) unit-tested in `tests/unit/`

**E2E** (`e2e/`, `playwright.config.ts`)

- Specs: `e2e/home.spec.ts`, `e2e/menu.spec.ts`, `e2e/routes.spec.ts`,
  `e2e/footer-nav.spec.ts` — home landmarks, dialog menu + Escape, post/category/
  about/disclaimer/offline/sitemap/404, footer links
- Config: `playwright.config.ts` — `webServer` = build + preview on port **4173**;
  projects **chromium** + **mobile** (Pixel 5 profile, Chromium)
- Sample post slug hard-coded in `routes.spec.ts`: `what-is-mindfulness` — update
  if that post is removed

**Config**

- `astro.config.mjs` (integrations, image remote allowlist, Tailwind plugin).
  Fails `astro build` when `SITE_URL` is missing (canonical/OG/sitemap).
- `eslint.config.mjs` (flat config: astro + jsx-a11y + typescript-eslint + prettier)
- `.prettierrc`, `tsconfig.json` (path alias `~/*` → `src/*`; includes `e2e/**/*.ts`)
- `wrangler.jsonc` — Cloudflare Worker (static assets from `dist/`, custom
  domain `mindful.engg.app`, 404 page for unknown paths)

## Commands

- `dev` / `build` / `preview` — Astro dev, static build, preview built site
- `deploy` — build with `SITE_URL=https://mindful.engg.app` + `wrangler deploy`
  (wrangler v4 devDependency, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- `cdn:upload` — optional: push `dist/` to Bunny storage + purge (not the live host)
- `seed` — re-import posts + categories from CSV (rare, destructive)
- `icons` — regenerate PWA icons from `favicon.svg`
- `check` — `astro check && tsc --noEmit`
- `lint` / `lint:fix` — ESLint
- `format` / `format:check` — Prettier
- `fix` — `lint:fix` then `format`
- `init:env` — copy `.env.example` → `.env`
- `test` / `test:watch` — Vitest unit tests (`src/**/*.test.ts`, `tests/unit/`)
- `test:e2e` — Playwright (starts preview on **4173**, `--ignore-lock` keeps Astro 7 preview in foreground)
- `test:e2e:ui` — Playwright UI mode
- (first run) `pnpm exec playwright install chromium` — browser binaries

## Conventions

- `.astro` components only. No React/Vue/Svelte unless a component genuinely
  needs runtime state — confirm with the user first.
- Interactivity tiers (prefer earlier): CSS-only → inline vanilla `<script>` in
  the `.astro` file → `client:*` islands (last resort, must be justified).
- Soft cap **~120 lines per file**; split by responsibility, not line games.
- Path alias `~/*` resolves to `src/*`.
- Zod: import from `astro/zod` (NOT `astro:content`, deprecated in v6). Prefer
  `z.url()`, `z.coerce.date()`.
- TypeScript strict; no `any`. Use `unknown` + narrowing at boundaries.
- Tailwind tokens live in `global.css` `@theme`. Prefer `var(--...)` in inline
  styles for theme-adaptive values; use arbitrary values sparingly.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (already wired).
- Single `<h1>` per page; landmark regions mandatory; `aria-current="page"` on
  active nav; visible `:focus-visible` rings; alt text on meaningful images.

## Before touching X, read Y

- New post → `src/content.config.ts` schema, then an existing
  `src/content/posts/*.md` as an example.
- New category → `src/content/categories/*.json` example + add the id to the
  `CATEGORY_IDS` tuple in `src/content.config.ts`.
- New page → `src/layouts/BaseLayout.astro` props + `src/components/Seo.astro`.
- SEO change → `src/components/Seo.astro` + per-page `jsonLd` prop.
- Design token change → `src/styles/global.css` `@theme` block.
- Nav change → `src/config/site.ts` (both footer and menu consume it via
  `NavLinks.astro`).
- PWA change → `astro.config.mjs`, `public/sw.js`, `public/manifest.webmanifest`.
- New E2E scenario → existing `e2e/*.spec.ts` patterns; keep **4173** in
  `playwright.config.ts` unless you change the preview port everywhere.

## Hard don'ts

- Don't add React/Vue/Svelte unless a component truly needs runtime state.
- Don't bypass the Zod schema when adding fields; update schema and consumers
  together.
- Don't import `z` from `astro:content`; use `astro/zod`.
- Don't add `client:load` islands or turn on `prefetch` without a measured
  reason; the site ships no prefetch today.
- Don't introduce CSS-in-JS or a component library; Tailwind + `global.css`
  tokens are the system.
- Don't rerun `pnpm run seed` to edit posts — it is a one-shot migration;
  markdown files are now the source of truth.
- Don't edit the header without also checking `Footer.astro` (they share
  `NavLinks.astro`).
- Don't commit secrets; only `SITE_URL` belongs in `.env` right now. `SITE_URL`
  is **required** for production `astro build` (dev works without it).
- Don't point Playwright `baseURL` at `4321` for automated E2E — conflicts with
  `astro dev`; keep **4173** (or update config + docs together).

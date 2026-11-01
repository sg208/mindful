# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-11-01

### Added

- **Crisis help on every page**: the header's "Need help now?" link ("Crisis help" on small screens), the footer and the article disclaimer all point to a new crisis section at `/disclaimer#in-crisis`, which links to findahelpline.com.

### Changed

- **Editorial redesign**: new stone-and-moss palette in light and dark mode, new type and spacing for articles, and reworked home, essay index, theme and info pages. The header nav is now All essays, Themes and About, and previous/next essay links are restyled.
- **New icons**: the favicon and PWA app icons are redrawn in the new palette.
- **Node 24 and pnpm**: the project now builds with pnpm (`pnpm-lock.yaml` replaces `package-lock.json`) on Node 24, including the `Dockerfile`.

### Fixed

- **Security updates**: Astro 7.4.4, `@astrojs/mdx` 8 and `sharp` 0.35.5 patch the audited advisories, including a critical AVIF remote code execution issue and several XSS issues.
- **End-to-end tests under Astro 7**: `astro preview` now stays in the foreground so Playwright's web server no longer exits early.

## [0.1.0] - 2026-05-20

### Added

- Self-care post “Self-Compassion When You're Hard on Yourself” at `/posts/self-compassion-when-youre-hard-on-yourself`.
- Accessibility statement at `/accessibility`, privacy notice at `/privacy`, and terms of use at `/terms`, linked from the shared footer and menu nav.
- Playwright route smoke coverage for the new pages alongside About and Disclaimer.

### Removed

- RSS feed (`/rss.xml`), `@astrojs/rss`, head alternate link, footer “RSS feed” link, and related docs, privacy copy, and E2E assertions.

### Changed

- Refreshed blog posts with clearer SEO slugs and titles across anxiety, sleep, stress, boundaries, and mindfulness themes; retired older overlapping slugs in favor of consolidated pieces.
- Added Playwright coverage for a representative rewritten post URL so builds catch missing or broken article routes.
- Kept Picsum hero image placeholders on `picsum.photos` (seed endpoints) while allowing both `picsum.photos` and `fastly.picsum.photos` in CSP.
- Renamed the home "Most-read essays" label to "Editor picks" to match the curated `editorPickSlugs` source.

### Fixed

- Playwright `webServer` runs `astro build`, which requires `SITE_URL`; default it to the preview base URL when unset so E2E works without a local `.env`.
- README and Copilot workspace notes describe that E2E default and correct the category route coverage blurb (H1 uses the category label).
- Added missing `imageAlt` frontmatter for the sleep hygiene post.
- Set home editor pick cards to `headingLevel={3}` to preserve the H2 → H3 outline.
- Relaxed `script-src` to allow `'unsafe-inline'` for JSON-LD + Astro-generated snippets, and removed an invalid `document-domain` Permissions-Policy token that logged warnings.

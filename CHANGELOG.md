# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

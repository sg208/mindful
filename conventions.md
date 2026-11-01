# conventions.md

## Code

- `.astro` components only; no React/Vue/Svelte without a runtime-state need (`CLAUDE.md` Conventions)
- Interactivity order: CSS → inline `<script>` → `client:*` island
- Path alias `~/*` → `src/*` (`tsconfig.json`)
- Zod from `astro/zod` (`src/content.config.ts:2`)
- New script helpers: arrow-function `const` exports in `scripts/lib/`, tested in `tests/unit/`
- Single `<h1>` per page; `PostCard` takes `headingLevel` to keep outline valid

## Naming

- Files: PascalCase components (`src/components/PostCard.astro`), kebab-case content slugs, camelCase TS modules
- Tests: `<module>.test.ts` beside module or in `tests/unit/`

## Git

- Conventional commits (`feat(content):`, `fix(cdn):`, `docs(agent):`) — `git log`
- Work off `develop`; `main` = production via PR

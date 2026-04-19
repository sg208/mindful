/**
 * Home-page editorial curation.
 *
 * `editorPickSlugs` is an ordered list of post slugs (matching filenames in
 * `src/content/posts/`) to render as the "Start here" row on the home page.
 * Slugs that are also the featured post, or that no longer exist, are skipped
 * at build time — no errors thrown, the remaining picks still render.
 */
export const homeConfig = {
  editorPickSlugs: [
    'what-is-mindfulness',
    'setting-boundaries-in-relationships',
    'sleep-and-mental-health',
  ],
} as const;

export type HomeConfig = typeof homeConfig;

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const envSiteUrl = process.env.SITE_URL;
const isBuild = process.argv.includes('build');
if (!envSiteUrl && isBuild && process.env.NODE_ENV !== 'development') {
  throw new Error(
    'SITE_URL must be set when building for production (canonical URL, OG, and sitemap all depend on it).',
  );
}
const SITE_URL = envSiteUrl ?? 'https://mindful.example.com';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      // Seed URLs redirect here at runtime; allow if we ever use Astro image APIs.
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

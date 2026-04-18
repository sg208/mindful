import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const envSiteUrl = process.env.SITE_URL;
const isBuild = process.argv.includes('build');
if (!envSiteUrl && isBuild && process.env.NODE_ENV !== 'development') {
  throw new Error(
    'SITE_URL must be set when building for production (canonical URL, OG, sitemap, and RSS all depend on it).',
  );
}
const SITE_URL = envSiteUrl ?? 'https://mindful.example.com';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

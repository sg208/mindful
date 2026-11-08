import type { APIRoute } from 'astro';

// Built at deploy time: the robots spec needs an absolute Sitemap URL, and only SITE_URL knows the host.
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('/sitemap-index.xml', site).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

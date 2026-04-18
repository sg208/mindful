import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '~/lib/posts';
import { siteConfig } from '~/config/site';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('SITE_URL must be configured so RSS items can emit absolute URLs.');
  }
  const posts = await getPublishedPosts();
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishedAt,
      link: `/posts/${post.id}`,
      categories: [post.data.category],
    })),
    customData: `<language>${siteConfig.locale}</language>`,
  });
}

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Category = CollectionEntry<'categories'>;

const WORDS_PER_MINUTE = 220;

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function byDateDesc(a: Post, b: Post): number {
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort(byDateDesc);
}

export async function getFeaturedPost(): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.data.featured) ?? posts[0];
}

export async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.category === categoryId);
}

export async function getAdjacentPosts(slug: string): Promise<{ previous?: Post; next?: Post }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.id === slug);
  if (index === -1) return {};
  return {
    previous: index < posts.length - 1 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined,
  };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

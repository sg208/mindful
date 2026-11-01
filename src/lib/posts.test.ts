import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollection } from 'astro:content';
import {
  byDateDesc,
  formatDate,
  getAdjacentPosts,
  getFeaturedPost,
  getPostsByCategory,
  getPublishedPosts,
  readingMinutes,
  readingSpanLabel,
  type Post,
} from './posts';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

type PostOverrides = Partial<Post['data']> & { id: string };

const makePost = ({ id, ...data }: PostOverrides): Post =>
  ({
    id,
    data: {
      title: id,
      excerpt: 'excerpt',
      category: 'mindfulness',
      publishedAt: new Date('2026-01-01'),
      featured: false,
      reviewRequired: false,
      draft: false,
      ...data,
    },
  }) as Post;

const posts = [
  makePost({ id: 'oldest', publishedAt: new Date('2026-01-01'), category: 'self-care' }),
  makePost({ id: 'newest', publishedAt: new Date('2026-03-01') }),
  makePost({ id: 'middle', publishedAt: new Date('2026-02-01'), featured: true }),
  makePost({ id: 'hidden', publishedAt: new Date('2026-04-01'), draft: true }),
];

const mockCollection = (entries: Post[]) => {
  vi.mocked(getCollection).mockImplementation(async (_name, filter) =>
    filter ? entries.filter(filter) : entries,
  );
};

describe('readingMinutes', () => {
  it('returns at least one minute for empty or short bodies', () => {
    expect(readingMinutes(undefined)).toBe(1);
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('just a few words')).toBe(1);
  });

  it('rounds word count at 220 words per minute', () => {
    expect(readingMinutes(Array(660).fill('word').join(' '))).toBe(3);
    expect(readingMinutes(Array(770).fill('word').join('\n'))).toBe(4);
  });
});

describe('byDateDesc', () => {
  it('sorts newer posts first', () => {
    const sorted = [...posts].sort(byDateDesc).map((post) => post.id);
    expect(sorted).toEqual(['hidden', 'newest', 'middle', 'oldest']);
  });
});

describe('formatDate', () => {
  it('formats dates in long US English form', () => {
    expect(formatDate(new Date(2026, 3, 9))).toBe('April 9, 2026');
  });
});

describe('collection helpers', () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    mockCollection(posts);
  });

  it('getPublishedPosts drops drafts and sorts newest first', async () => {
    const published = await getPublishedPosts();
    expect(published.map((post) => post.id)).toEqual(['newest', 'middle', 'oldest']);
  });

  it('getFeaturedPost prefers the featured post', async () => {
    expect((await getFeaturedPost())?.id).toBe('middle');
  });

  it('getFeaturedPost falls back to the newest post', async () => {
    vi.mocked(getCollection).mockReset();
    mockCollection(posts.map((post) => makePost({ ...post.data, id: post.id, featured: false })));
    expect((await getFeaturedPost())?.id).toBe('newest');
  });

  it('getFeaturedPost returns undefined when nothing is published', async () => {
    vi.mocked(getCollection).mockReset();
    mockCollection([]);
    expect(await getFeaturedPost()).toBeUndefined();
  });

  it('getPostsByCategory filters by category id', async () => {
    const selfCare = await getPostsByCategory('self-care');
    expect(selfCare.map((post) => post.id)).toEqual(['oldest']);
  });

  it('getAdjacentPosts links older as previous and newer as next', async () => {
    const { previous, next } = await getAdjacentPosts('middle');
    expect(previous?.id).toBe('oldest');
    expect(next?.id).toBe('newest');
  });

  it('getAdjacentPosts leaves ends open and ignores unknown slugs', async () => {
    expect(await getAdjacentPosts('newest')).toMatchObject({ next: undefined });
    expect((await getAdjacentPosts('oldest')).previous).toBeUndefined();
    expect(await getAdjacentPosts('missing')).toEqual({});
  });
});

describe('readingSpanLabel', () => {
  it('returns undefined when there are no posts', () => {
    expect(readingSpanLabel([])).toBeUndefined();
  });

  it('uses the single-read phrasing when every post is the same length', () => {
    expect(readingSpanLabel([4, 4])).toBe('a 4-minute read');
  });

  it('spans shortest to longest', () => {
    expect(readingSpanLabel([5, 2, 9])).toBe('2 to 9 minutes to read');
  });
});

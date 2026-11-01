import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollection } from 'astro:content';
import { getCategories, getCategory, type Category } from './categories';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

const makeCategory = (id: string, label: string): Category =>
  ({ id, data: { id, label, description: '', accent: '#000000' } }) as Category;

describe('categories', () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue([
      makeCategory('sleep-rest', 'Sleep & Rest'),
      makeCategory('anxiety-stress', 'Anxiety & Stress'),
      makeCategory('mindfulness', 'Mindfulness'),
    ]);
  });

  it('getCategories sorts by label', async () => {
    const labels = (await getCategories()).map((category) => category.data.label);
    expect(labels).toEqual(['Anxiety & Stress', 'Mindfulness', 'Sleep & Rest']);
  });

  it('getCategory finds by id and returns undefined for unknown ids', async () => {
    expect((await getCategory('mindfulness'))?.data.label).toBe('Mindfulness');
    expect(await getCategory('nope')).toBeUndefined();
  });
});

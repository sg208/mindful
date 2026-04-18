import { getCollection, type CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'categories'>;

export async function getCategories(): Promise<Category[]> {
  const categories = await getCollection('categories');
  return categories.sort((a, b) => a.data.label.localeCompare(b.data.label));
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.data.id === id);
}

import { getCollection, type CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'categories'>;

export const getCategories = async (): Promise<Category[]> => {
  const categories = await getCollection('categories');
  return [...categories].sort((a, b) => a.data.label.localeCompare(b.data.label));
};

export const getCategory = async (id: string): Promise<Category | undefined> => {
  const categories = await getCategories();
  return categories.find((category) => category.data.id === id);
};

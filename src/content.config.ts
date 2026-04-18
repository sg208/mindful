import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const CATEGORY_IDS = [
  'anxiety-stress',
  'mindfulness',
  'relationships',
  'self-care',
  'sleep-rest',
] as const;

const categorySchema = z.object({
  id: z.enum(CATEGORY_IDS),
  label: z.string(),
  description: z.string(),
  accent: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
});

const postSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.enum(CATEGORY_IDS),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  image: z
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'image must be an http(s) URL')
    .optional(),
  /** If omitted, `ArticleLayout` falls back to the post title so no hero image
   * ships with an empty alt. Prefer to author a descriptive alt per post. */
  imageAlt: z.string().optional(),
  featured: z.boolean().default(false),
  reviewRequired: z.boolean().default(false),
  draft: z.boolean().default(false),
});

const posts = defineCollection({
  loader: glob({ base: 'src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: postSchema,
});

const categories = defineCollection({
  loader: glob({ base: 'src/content/categories', pattern: '**/*.json' }),
  schema: categorySchema,
});

export const collections = { posts, categories };
export type CategoryId = (typeof CATEGORY_IDS)[number];
export { CATEGORY_IDS };

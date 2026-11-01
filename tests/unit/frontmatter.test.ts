import { describe, expect, it } from 'vitest';
import {
  buildFrontmatter,
  escapeYaml,
  normalizeCategoryId,
  slugifyFilename,
} from '../../scripts/lib/frontmatter.mjs';

describe('normalizeCategoryId', () => {
  it('turns Appwrite ids into collection ids', () => {
    expect(normalizeCategoryId('cat_anxiety_stress')).toBe('anxiety-stress');
    expect(normalizeCategoryId('mindfulness')).toBe('mindfulness');
  });
});

describe('slugifyFilename', () => {
  it('lowercases and collapses unsafe characters', () => {
    expect(slugifyFilename('  Hello, World! ')).toBe('hello-world');
    expect(slugifyFilename('../../etc/passwd')).toBe('etc-passwd');
  });
});

describe('escapeYaml', () => {
  it('always double-quotes and escapes quotes and backslashes', () => {
    expect(escapeYaml('yes')).toBe('"yes"');
    expect(escapeYaml('say "hi" \\ bye')).toBe('"say \\"hi\\" \\\\ bye"');
    expect(escapeYaml(null)).toBe('""');
  });
});

describe('buildFrontmatter', () => {
  it('emits required fields, booleans and drafts review-required posts', () => {
    const output = buildFrontmatter({
      title: 'Breathe',
      excerpt: 'A short read',
      categoryId: 'cat_self_care',
      publishedAt: '2026-01-02',
      reviewRequired: 'TRUE',
      featured: 'false',
    });
    expect(output).toBe(
      [
        '---',
        'title: "Breathe"',
        'excerpt: "A short read"',
        'category: "self-care"',
        'publishedAt: "2026-01-02"',
        'updatedAt: "2026-01-02"',
        'featured: false',
        'reviewRequired: true',
        'draft: true',
        '---',
        '',
      ].join('\n'),
    );
  });

  it('only emits image fields when present', () => {
    const withImage = buildFrontmatter({
      title: 't',
      excerpt: 'e',
      categoryId: 'cat_mindfulness',
      publishedAt: '2026-01-02',
      imageUrl: ' https://picsum.photos/1 ',
      imageAlt: 'A lake',
    });
    expect(withImage).toContain('image: "https://picsum.photos/1"');
    expect(withImage).toContain('imageAlt: "A lake"');

    const withoutImage = buildFrontmatter({ title: 't', excerpt: 'e', imageUrl: '  ' });
    expect(withoutImage).not.toContain('image');
  });
});

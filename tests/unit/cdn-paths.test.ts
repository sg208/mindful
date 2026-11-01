import { describe, expect, it } from 'vitest';
import { collectDirectories, encodePath } from '../../scripts/lib/cdn-paths.mjs';

describe('encodePath', () => {
  it('encodes each segment but keeps separators', () => {
    expect(encodePath('posts/a b/index.html')).toBe('posts/a%20b/index.html');
  });

  it('normalises Windows backslashes', () => {
    expect(encodePath('_astro\\file#1.css')).toBe('_astro/file%231.css');
  });
});

describe('collectDirectories', () => {
  it('returns unique parents sorted so parents precede children', () => {
    const files = ['index.html', 'posts/a/index.html', 'posts/b/index.html', '_astro/x.css'];
    expect(collectDirectories(files)).toEqual(['_astro', 'posts', 'posts/a', 'posts/b']);
  });
});

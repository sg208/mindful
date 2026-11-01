import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // `astro:content` is a virtual module that only exists inside Astro's Vite
      // pipeline. Unit tests swap in a stub and mock `getCollection` per test.
      'astro:content': fromRoot('./tests/stubs/astro-content.ts'),
      '~': fromRoot('./src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});

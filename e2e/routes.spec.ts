import { test, expect } from '@playwright/test';

/** Stable slug present in repo content */
const SAMPLE_POST_SLUG = 'what-is-mindfulness';

/** Representative slug from SEO-focused post rewrites */
const SEO_REWRITE_POST_SLUG = 'how-to-calm-anxiety';

test.describe('Core routes', () => {
  test('article page renders title from frontmatter', async ({ page }) => {
    await page.goto(`/posts/${SAMPLE_POST_SLUG}`);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/mindfulness/i);
    await expect(page.locator('article')).toBeVisible();
  });

  test('SEO-rewrite post slug renders from frontmatter', async ({ page }) => {
    await page.goto(`/posts/${SEO_REWRITE_POST_SLUG}`);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/calm anxiety/i);
    await expect(page.locator('article')).toBeVisible();
  });

  test('category page lists theme', async ({ page }) => {
    await page.goto('/categories/mindfulness');

    // H1 is the category label; the description sits beneath as supporting copy.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/mindfulness/i);
    await expect(page.locator('header').getByText(/paying attention/i)).toBeVisible();
  });

  test('all-essays index groups posts by category', async ({ page }) => {
    await page.goto('/posts');

    const main = page.locator('main');

    await expect(main.getByRole('heading', { level: 1 })).toContainText(/all essays/i);
    // At least one category group heading (h2) and one post link must render.
    await expect(main.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(main.getByRole('link', { name: /mindfulness/i }).first()).toBeVisible();
  });

  test('About, legal, and info pages load', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/disclaimer');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/accessibility');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('offline fallback page', async ({ page }) => {
    await page.goto('/offline');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/offline/i);
  });

  test('sitemap index is reachable', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
    const html = await page.content();
    expect(html).toMatch(/sitemap/i);
  });

  test('robots.txt points crawlers at an absolute sitemap URL', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m);
  });

  test('sitemap leaves out the noindex offline page', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain('/offline<');
  });

  test('Open Graph locale uses language_TERRITORY', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  });

  test('unknown path returns 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/wandered off/i);
  });
});

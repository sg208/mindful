import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('has one main landmark and hero heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/reflections/i);
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto('/');

    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('header and footer are present', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});

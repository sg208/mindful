import { test, expect } from '@playwright/test';

const LEGAL_PAGES = [
  { name: 'Accessibility', path: '/accessibility', title: /^Accessibility/ },
  { name: 'Privacy', path: '/privacy', title: /^Privacy/ },
  { name: 'Terms', path: '/terms', title: /^Terms of use/ },
];

test.describe('Footer navigation', () => {
  test('footer link to category works', async ({ page }) => {
    await page.goto('/');

    await page
      .locator('footer')
      .getByRole('link', { name: /self-care/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/categories\/self-care$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  for (const legal of LEGAL_PAGES) {
    test(`footer reaches the ${legal.name} page`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto('/posts');
      await page.locator('footer').getByRole('link', { name: legal.name, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${legal.path}$`));
      await expect(page).toHaveTitle(legal.title);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('main')).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }

  test('footer has one subtle GitHub icon link to the repo', async ({ page }) => {
    await page.goto('/');

    const repoLink = page.locator('footer').getByRole('link', {
      name: 'Source code on GitHub (opens in a new tab)',
    });
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/sg208/mindful');
    await expect(repoLink).toHaveAttribute('target', '_blank');
    await expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(repoLink.locator('svg')).toHaveAttribute('aria-hidden', 'true');

    const box = await repoLink.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);

    await expect(page.locator('header a[href*="github.com"]')).toHaveCount(0);
    await expect(page.locator('footer a[href*="github.com"]')).toHaveCount(1);
  });
});

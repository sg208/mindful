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

  test('footer links to the source on GitHub', async ({ page }) => {
    await page.goto('/');

    const repoLink = page.locator('footer').getByRole('link', { name: 'Source code on GitHub' });
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute('href', 'https://github.com/sg208/mindful');
  });
});

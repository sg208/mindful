import { test, expect } from '@playwright/test';

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
});

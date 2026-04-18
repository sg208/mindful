import { test, expect } from '@playwright/test';

test.describe('Hamburger menu', () => {
  test('opens and closes with aria state', async ({ page }) => {
    await page.goto('/');

    const openBtn = page.getByRole('button', { name: /open menu/i });
    await expect(openBtn).toHaveAttribute('aria-expanded', 'false');

    await openBtn.click();
    await expect(openBtn).toHaveAttribute('aria-expanded', 'true');

    const dialog = page.locator('#site-menu');
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(openBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('navigates from menu to About and closes dialog', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /open menu/i }).click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: /^About$/ })
      .click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Escape closes menu (native dialog)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.locator('#site-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

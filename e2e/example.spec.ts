import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/YuyuCode/);
});

test('chat input exists', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('textarea, input[type="text"]').first();
  await expect(input).toBeVisible();
});

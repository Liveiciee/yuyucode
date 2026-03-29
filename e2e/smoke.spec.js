import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // Just check that the page title contains something
  await expect(page).toHaveTitle(/YuyuCode/);
});

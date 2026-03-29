import { test, expect } from '@playwright/test';

test('app loads without crash', async ({ page }) => {
  await page.goto('/');
  // Root div rendered by React
  await expect(page.locator('#root')).toBeAttached({ timeout: 15000 });
});

test('page title is set', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toBeTruthy();
});

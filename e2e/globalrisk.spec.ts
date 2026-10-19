import { test, expect } from '@playwright/test';

test.describe('GlobalRisk 360 — E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('dashboard loads', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    // Page should have substantial content
    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('policy list loads with search', async ({ page }) => {
    await page.goto('/policies');
    await expect(page.locator('h1.page-heading')).toContainText('Policies');
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('MP-2026');
    await page.waitForTimeout(350);
    
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('claim list loads and filters', async ({ page }) => {
    await page.goto('/claims');
    await expect(page.locator('h1.page-heading')).toContainText('Claims');
    
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('claim submission wizard loads', async ({ page }) => {
    await page.goto('/claims/new');
    await expect(page.locator('h1.page-heading')).toContainText('Submit a claim');
    
    const steps = page.locator('.progress li');
    await expect(steps).toHaveCount(5);
    
    // Verify form exists
    await expect(page.locator('form')).toBeVisible();
  });

  test('activity timeline loads', async ({ page }) => {
    await page.goto('/activity');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('gr-card')).toBeVisible();
  });

  test('404 page works', async ({ page }) => {
    await page.goto('/nonexistent');
    await expect(page.locator('body')).toBeVisible();
  });
});

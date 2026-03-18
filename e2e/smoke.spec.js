import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/#/');
    await expect(page.getByRole('heading', { name: /Learn for Free/i })).toBeVisible();
    await expect(page.getByText(/Practice Olympiad exams|at your own pace/i)).toBeVisible();
  });

  test('navigates to login when accessing exam', async ({ page }) => {
    await page.goto('/#/exam/imo');
    await expect(page).toHaveURL(/#\/login/);
  });

  test('login and select exam flow', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByLabel(/username/i).fill('student');
    await page.getByLabel(/password/i).fill('student123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/#\//);
    await page.goto('/#/exam/imo');
    await expect(page.getByRole('heading', { name: 'Select Grade' })).toBeVisible({ timeout: 15000 });
  });

  test('exam page loads after selecting grade and test', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByLabel(/username/i).fill('student');
    await page.getByLabel(/password/i).fill('student123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('/#/exam/imo/grade/3');
    await expect(page.getByRole('heading', { name: /Practice Mode|Mock Test Mode/i }).first()).toBeVisible({ timeout: 15000 });
    const practiceLink = page.getByRole('link', { name: /Practice.*questions|questions.*Practice/i }).first();
    await expect(practiceLink).toBeVisible({ timeout: 5000 });
    await practiceLink.click();
    await expect(page.getByText(/Q 1 of \d+/)).toBeVisible({ timeout: 20000 });
  });
});

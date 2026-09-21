import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('administrator dispatch and finance controls load without layout overflow', async ({ page }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and demo seed');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-ADMIN');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await page.getByRole('button', { name: 'Open administration →' }).click();
  await page.getByRole('button', { name: 'Dispatch & finance', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Automatic dispatch', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save dispatch settings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rental settlement ledger' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SMS delivery outbox' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('guest experience has login, browsing, language and no privileged role switcher', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByText('Administrator', { exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ta');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await page.goto('/#catalog');
  await expect(page.getByRole('heading', { name: 'உங்கள் இயந்திரத்தைத் தேடுங்கள்' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('real account sign-in shows working scoped dashboard and can sign out', async ({ page }, testInfo) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and demo seed');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Hello, Ravi.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true });
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.goto('/#catalog');
  await expect(page.getByRole('heading', { name: 'Mahindra 575 DI', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View & request' }).first().click();
  await expect(page.getByRole('heading', { name: 'Plan your rental' })).toBeVisible();
  await page.getByRole('button', { name: 'Calculate exact quote' }).click();
  await expect(page.getByText('50% advance', { exact: true })).toBeVisible();
  await page.goto('/#account');
  await expect(page.getByRole('heading', { name: 'Profile & preferences' })).toBeVisible();
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

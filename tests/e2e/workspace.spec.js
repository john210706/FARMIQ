import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('sign-in explains a stopped server and rate limits', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 503, contentType: 'text/plain', body: 'Unavailable' }),
  );
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('alert')).toHaveText(
    'FarmIQ is temporarily unavailable. Please try again shortly.',
  );
  await page.unroute('**/api/auth/login');
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 429, contentType: 'text/plain', body: 'Slow down' }),
  );
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('alert')).toHaveText('Too many requests. Please wait a minute and try again.');
});
test('administrator dispatch and finance controls load without layout overflow', async ({ page }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and demo seed');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-ADMIN');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await page.getByRole('button', { name: 'Open administration →' }).click();
  await page.getByRole('button', { name: 'Dispatch & finance', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Automatic dispatch', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save dispatch settings' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Rental settlement ledger' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SMS delivery outbox' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('guest experience has login, browsing, language and no privileged role switcher', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Administrator', { exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ta');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await page.goto('/#catalog');
  await expect(page.getByRole('heading', { name: 'உங்கள் இயந்திரத்தைத் தேடுங்கள்' })).toBeVisible();
  await expect(page.getByText('இயந்திர சந்தை')).toBeVisible();
  await expect(page.getByLabel('இயந்திரங்களைத் தேடு')).toBeVisible();
  await expect(page.getByLabel('வகை')).toBeVisible();
  await expect(page.getByRole('button', { name: 'என் இருப்பிடத்தைப் பயன்படுத்து' })).toBeVisible();
  await page.getByRole('combobox', { name: 'மொழி', exact: true }).selectOption('hi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.getByText('मशीन बाज़ार')).toBeVisible();
  await expect(page.getByLabel('मशीन खोजें')).toBeVisible();
  await page.goto('/#account');
  await expect(page.getByRole('heading', { name: 'वापसी पर स्वागत है' })).toBeVisible();
  await expect(page.getByLabel('मोबाइल नंबर या खाता ID')).toBeVisible();
  await page.getByRole('button', { name: 'साइन इन', exact: true }).last().click();
  expect(await page.getByLabel('मोबाइल नंबर या खाता ID').evaluate((input) => input.validationMessage)).toBe(
    'यह फ़ील्ड भरें।',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('driver account is limited to its delivery workspace', async ({ page }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and demo seed');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-DRIVER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

  await expect(page.getByText('DRIVER DELIVERY WORKSPACE')).toBeVisible();
  await expect(page.getByRole('button', { name: 'My deliveries' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find machinery' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Field planner' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Learn & get help' })).toHaveCount(0);

  await page.goto('/#catalog');
  await expect(page.getByText('DRIVER DELIVERY WORKSPACE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Find your machine' })).toHaveCount(0);

  await page.goto('/#account');
  await expect(page.getByText('On duty and available for deliveries')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved farm addresses' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Saved machinery' })).toHaveCount(0);
  await expect(page.getByText('Low-data mode (hide catalogue photos)')).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'OWNERSHIP' })).toHaveCount(0);
});
test('learning guides are localized and persist step progress', async ({ page }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and starter learning content');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Hello, Ravi.' })).toBeVisible();
  await page.goto('/#learning');
  await expect(page.getByRole('heading', { name: 'Book equipment in FarmIQ' })).toBeVisible();
  const guide = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Book equipment in FarmIQ' }) });
  await guide.getByRole('button', { name: 'Mark next step reviewed' }).click();
  await expect(guide.locator('progress')).toHaveAttribute('value', /[1-5]/);
  await page.reload();
  await expect(guide.locator('progress')).toHaveAttribute('value', /[1-5]/);
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ta');
  await expect(page.getByRole('heading', { name: 'FarmIQ-ல் இயந்திரத்தை முன்பதிவு செய்வது' })).toBeVisible();
  await page.getByRole('combobox', { name: 'மொழி', exact: true }).selectOption('hi');
  await expect(page.getByRole('heading', { name: 'FarmIQ में मशीन बुक करें' })).toBeVisible();
  expect(await page.locator('iframe').count()).toBe(0);
  await page.getByRole('combobox', { name: 'भाषा', exact: true }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
test('real account sign-in shows working scoped dashboard and can sign out', async ({
  page,
  context,
}, testInfo) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database and demo seed');
  await context.grantPermissions(['geolocation'], { origin: new URL(testInfo.project.use.baseURL).origin });
  await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });
  await page.route('**/api/location/address?*', (route) =>
    route.fulfill({ json: { address: 'Demo farm, Bengaluru, Karnataka, India' } }),
  );
  await page.route('**/api/notifications/unread-count', (route) => route.fulfill({ json: { count: 3 } }));
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Hello, Ravi.' })).toBeVisible();
  await expect(page.locator('.header .notification-count')).toHaveText('3');
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ta');
  await expect(page.getByRole('heading', { name: 'வணக்கம், Ravi.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'முன்பதிவுகள்' }).first()).toBeVisible();
  await page.getByRole('combobox', { name: 'மொழி', exact: true }).selectOption('en');
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
  await expect(page.getByText('9 nearby demo machines are ready to book.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.machine-card')).toHaveCount(9);
  await page.getByRole('button', { name: 'View & request' }).first().click();
  await expect(page.getByRole('heading', { name: 'Plan your rental' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.detail-photo')).toHaveAttribute(
    'src',
    /\/machinery\/demo-(tractor|harvester|rotavator)\.webp/,
  );
  await expect(page.getByLabel('Latitude')).toHaveCount(0);
  await expect(page.getByLabel('Longitude')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /farm location|current location/i })).toBeVisible();
  await expect(
    page.getByText('Demo machinery and the nearest delivery partner are ready near your farm.'),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel('Farm address', { exact: true })).toHaveValue(
    'Demo farm, Bengaluru, Karnataka, India',
  );
  await expect(page.getByLabel('Verified operator').locator('option')).toHaveCount(2);
  await page.getByLabel('Verified operator').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Update current location', exact: true }).click();
  await expect(page.getByLabel('Farm address', { exact: true })).toHaveValue(
    'Demo farm, Bengaluru, Karnataka, India',
  );
  await page.getByRole('button', { name: 'Calculate exact quote' }).click();
  await expect(page.getByText('50% advance', { exact: true })).toBeVisible();
  await page.goto('/#account');
  await expect(page.getByRole('heading', { name: 'Profile & preferences' })).toBeVisible();
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

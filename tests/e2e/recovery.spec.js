import { test, expect } from '@playwright/test';

test('a failed page download leaves a recovery message instead of a blank screen', async ({ page }) => {
  await page.route('**/src/pages/Catalog.jsx*', route => route.abort());
  await page.goto('/#catalog');
  await expect(page.getByRole('alert')).toContainText('This page could not load. Reconnect and reload the page.');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('offline actions are not silently submitted', async ({ page, context }) => {
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  let requests = 0;
  page.on('request', r => { if (new URL(r.url()).pathname === '/api/auth/login') requests++; });
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('alert')).toHaveText('You are offline. Reconnect and submit again; no changes were sent.');
  expect(requests).toBe(0);
  await context.setOffline(false);
});

test('catalogue recovers without reload and search is debounced', async ({ page }) => {
  let failing = true;
  const searches = [];
  await page.route('**/api/machinery/nearby?*', (route) => {
    searches.push(new URL(route.request().url()).searchParams.get('search'));
    return failing
      ? route.fulfill({
          status: 503,
          json: { error: 'FarmIQ is temporarily unavailable. Please try again shortly.' },
        })
      : route.fulfill({ json: [] });
  });
  await page.goto('/#catalog');
  await expect(page.getByRole('alert')).toBeVisible();
  failing = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No equipment matches. Try another date, category or location.')).toBeVisible();
  await page.getByLabel('Search equipment').pressSequentially('tractor', { delay: 20 });
  await expect.poll(() => searches.at(-1)).toBe('tractor');
  expect(searches.filter(Boolean)).toEqual(['tractor']);
});

test('saved farm survives reopening and offline submission stays a draft', async ({ page, context }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database');
  await page.goto('/');
  await page.getByLabel('Mobile number or account ID').fill('DEMO-FARMER');
  await page.getByLabel('Password', { exact: true }).fill('FarmIQ-demo-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Hello, Ravi.' })).toBeVisible();
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem('farmiqSession'));
    localStorage.setItem(
      `farmiq-draft-${session.user.id}-demo-tractor`,
      JSON.stringify({
        farmAddress: 'Saved farm landmark',
        farmLat: 10.79,
        farmLng: 79.13,
        durationHours: 6,
        scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      }),
    );
    navigator.geolocation.getCurrentPosition = () => {
      throw new Error('Saved location must not be overwritten');
    };
  });
  await page.goto('/#machine/demo-tractor');
  await expect(page.getByLabel('Farm address', { exact: true })).toHaveValue('Saved farm landmark');
  await expect(page.getByRole('button', { name: 'Update current location' })).toBeEnabled();
  let sent = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/bookings') sent++;
  });
  await page.locator('input[name=agreement]').check();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Send request to owner' }).click();
  await expect(page.getByText('You are offline. Draft saved; reconnect to submit.')).toBeVisible();
  expect(sent).toBe(0);
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByLabel('Farm address', { exact: true })).toHaveValue('Saved farm landmark');
  expect(sent).toBe(0);
});

test('demo refresh preserves requested equipment and shows the owner notification', async ({ page }) => {
  test.skip(!process.env.E2E_WITH_API, 'Requires isolated database');
  await page.goto('/');
  const login = async (accountId) => {
    const r = await page.request.post('/api/auth/login', {
      data: { accountId, password: 'FarmIQ-demo-2026' },
    });
    expect(r.ok()).toBe(true);
    return r.json();
  };
  const farmer = await login('DEMO-FARMER');
  const owner = await login('DEMO-OWNER');
  const headers = { Authorization: `Bearer ${farmer.token}` };
  const original = await (await page.request.get('/api/machinery/demo-tractor')).json();
  const created = await page.request.post('/api/bookings', {
    headers,
    data: {
      machineryId: original.id,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationHours: 2,
      farmAddress: 'Demo protection test farm',
      farmLat: original.latitude,
      farmLng: original.longitude,
      agreementAccepted: true,
      requestKey: crypto.randomUUID(),
    },
  });
  expect(created.status()).toBe(201);
  const booking = await created.json();
  try {
    const refreshed = await page.request.post('/api/demo/relocate', {
      headers,
      data: { latitude: 13, longitude: 80 },
    });
    expect(refreshed.ok()).toBe(true);
    expect((await refreshed.json()).preservedMachines).toBeGreaterThan(0);
    const after = await (await page.request.get('/api/machinery/demo-tractor')).json();
    expect([after.latitude, after.longitude]).toEqual([original.latitude, original.longitude]);
    const notices = await (
      await page.request.get('/api/notifications', { headers: { Authorization: `Bearer ${owner.token}` } })
    ).json();
    expect(notices.some((n) => n.bookingId === booking.id && !n.readAt)).toBe(true);
    const driver = await login('DEMO-DRIVER');
    const driverHeaders = { Authorization: `Bearer ${driver.token}` };
    expect(
      (
        await page.request.patch('/api/drivers/location', {
          headers: driverHeaders,
          data: { latitude: original.latitude, longitude: original.longitude },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (
        await page.request.patch(`/api/bookings/${booking.id}/status`, {
          headers: { Authorization: `Bearer ${owner.token}` },
          data: { status: 'PENDING_PAYMENT' },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (
        await page.request.post(`/api/bookings/${booking.id}/payments`, {
          headers,
          data: { kind: 'ADVANCE', idempotencyKey: crypto.randomUUID() },
        })
      ).ok(),
    ).toBe(true);
    const assigned = await (await page.request.get(`/api/bookings/${booking.id}`, { headers })).json();
    expect(assigned.driverId).toBe(driver.user.id);
    const driverNotices = await (
      await page.request.get('/api/notifications', { headers: driverHeaders })
    ).json();
    expect(driverNotices.some((n) => n.bookingId === booking.id)).toBe(true);
    expect(
      (
        await page.request.post('/api/demo/relocate', { headers, data: { latitude: 14, longitude: 79 } })
      ).ok(),
    ).toBe(true);
    const unchangedDriver = await (await page.request.get('/api/auth/me', { headers: driverHeaders })).json();
    expect([unchangedDriver.latitude, unchangedDriver.longitude]).toEqual([
      original.latitude,
      original.longitude,
    ]);
  } finally {
    const cancel = await page.request.patch(`/api/bookings/${booking.id}/status`, {
      headers,
      data: { status: 'CANCELLED' },
    });
    expect(cancel.ok()).toBe(true);
  }
});

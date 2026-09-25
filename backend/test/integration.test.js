const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const enabled = !!process.env.TEST_DATABASE_URL;
if (enabled) {
  const url = new URL(process.env.TEST_DATABASE_URL);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !url.pathname.includes('test'))
    throw new Error('Integration tests require an isolated localhost database with test in its name');
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
  process.env.PAYMENT_MODE = 'sandbox';
  process.env.JWT_SECRET = 'farmiq-integration-test-secret-not-for-production';
}
test(
  'four-role rental lifecycle, access control, concurrency and payment idempotency',
  { skip: !enabled },
  async () => {
    const request = require('supertest');
    const bcrypt = require('bcryptjs');
    const app = require('../src/app');
    const { prisma } = require('../src/config');
    const prefix = crypto.randomBytes(4).toString('hex').toUpperCase();
    let counter = 0;
    const admin = await prisma.user.create({
      data: {
        accountId: `TEST-${prefix}`,
        phone: `+9188${Date.now().toString().slice(-8)}`,
        fullName: 'Test admin',
        role: 'ADMIN',
        passwordHash: await bcrypt.hash('SecurePassword123', 4),
        verificationStatus: 'VERIFIED',
      },
    });
    const auth = await request(app)
      .post('/api/auth/login')
      .send({ accountId: admin.accountId, password: 'SecurePassword123' });
    assert.equal(auth.status, 200);
    const adminToken = auth.body.token;
    async function register(role) {
      counter++;
      const r = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: `Test ${role}`,
          phone: `+917${Date.now().toString().slice(-8)}${counter}`,
          password: 'SecurePassword123',
          role,
        });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      return r.body;
    }
    const farmer = await register('FARMER'),
      other = await register('FARMER'),
      owner = await register('OWNER'),
      driver = await register('DRIVER');
    async function call(token, method, path, body) {
      const r = await request(app)
        [method]('/api' + path)
        .set('Authorization', 'Bearer ' + token)
        .send(body);
      return r;
    }
    for (const u of [owner, driver]) {
      const r = await call(adminToken, 'patch', `/admin/users/${u.user.id}`, {
        verificationStatus: 'VERIFIED',
      });
      assert.equal(r.status, 200);
      const login = await request(app)
        .post('/api/auth/login')
        .send({ accountId: u.user.accountId, password: 'SecurePassword123' });
      u.token = login.body.token;
    }
    await call(driver.token, 'patch', '/auth/me', { onDuty: true });
    const input = {
      name: 'Test tractor',
      brand: 'Test',
      category: 'TRACTOR',
      description: 'Test equipment',
      pricePerHour: 1000,
      pricePerDay: 6500,
      imageUrl: 'https://example.com/tractor.jpg',
      latitude: 10.79,
      longitude: 79.13,
      location: 'Test depot',
    };
    const m = await call(owner.token, 'post', '/owner/machinery', input);
    assert.equal(m.status, 201, JSON.stringify(m.body));
    assert.equal(
      (await call(farmer.token, 'patch', `/admin/machinery/${m.body.id}`, { verificationStatus: 'VERIFIED' }))
        .status,
      403,
    );
    assert.equal(
      (await call(adminToken, 'patch', `/admin/machinery/${m.body.id}`, { verificationStatus: 'VERIFIED' }))
        .status,
      200,
    );
    for (const p of ['/rides', '/driver/deliveries', '/bookings'])
      assert.equal((await request(app).get('/api' + p)).status, 401);
    assert.equal(
      (await request(app).patch('/api/driver/deliveries/x/status').send({ status: 'COMPLETED' })).status,
      401,
    );
    const inputBooking = {
      machineryId: m.body.id,
      scheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      durationHours: 6,
      farmAddress: 'Test farm',
      farmLat: 10.79,
      farmLng: 79.13,
      agreementAccepted: true,
      requestKey: crypto.randomUUID(),
    };
    const race = await Promise.all([
      call(farmer.token, 'post', '/bookings', inputBooking),
      call(other.token, 'post', '/bookings', { ...inputBooking, requestKey: crypto.randomUUID() }),
    ]);
    assert.deepEqual(race.map((r) => r.status).sort(), [201, 409]);
    const winner = race[0].status === 201 ? farmer : other;
    const outsider = winner === farmer ? other : farmer;
    const b = race.find((r) => r.status === 201).body;
    const replay = { ...inputBooking, requestKey: b.requestKey };
    assert.equal(
      (await call(outsider.token, 'post', '/bookings', { ...replay, farmerId: winner.user.id })).status,
      403,
    );
    assert.equal(
      (await call(winner.token, 'post', '/bookings', { ...replay, durationHours: 7 })).status,
      409,
    );
    assert.equal((await call(winner.token, 'post', '/bookings', replay)).status, 201);
    assert.equal((await call(outsider.token, 'get', `/bookings/${b.id}`)).status, 404);
    assert.equal((await call(outsider.token, 'get', '/bookings')).body.length, 0);
    assert.equal(
      (await call(winner.token, 'patch', `/bookings/${b.id}/status`, { status: 'COMPLETED' })).status,
      409,
    );
    assert.equal(
      (
        await call(winner.token, 'post', `/bookings/${b.id}/payments`, {
          kind: 'ADVANCE',
          idempotencyKey: crypto.randomUUID(),
        })
      ).status,
      409,
    );
    assert.equal(
      (await call(owner.token, 'patch', `/bookings/${b.id}/status`, { status: 'PENDING_PAYMENT' })).status,
      200,
    );
    const payment = { kind: 'ADVANCE', idempotencyKey: crypto.randomUUID() };
    const pays = await Promise.all([
      call(winner.token, 'post', `/bookings/${b.id}/payments`, payment),
      call(winner.token, 'post', `/bookings/${b.id}/payments`, payment),
    ]);
    assert.ok(
      pays.every((r) => r.status === 200),
      JSON.stringify(pays.map((r) => r.body)),
    );
    assert.equal(await prisma.transaction.count({ where: { bookingId: b.id, kind: 'ADVANCE' } }), 1);
    assert.equal((await call(driver.token, 'get', '/bookings')).status, 403);
    assert.equal((await call(driver.token, 'get', '/analytics')).status, 403);
    const unassigned = await call(driver.token, 'get', '/driver/deliveries');
    assert.equal(
      unassigned.body.some((j) => j.id === b.id),
      false,
    );
    assert.equal(
      (
        await call(adminToken, 'post', `/admin/bookings/${b.id}/assign`, {
          driverId: driver.user.id,
          note: 'Assigned for integration delivery',
        })
      ).status,
      200,
    );
    const job = await call(driver.token, 'get', '/driver/deliveries');
    const assigned = job.body.find((j) => j.id === b.id);
    assert.equal(assigned.driver.id, driver.user.id);
    assert.equal(assigned.farmer.id, winner.user.id);
    assert.equal(assigned.quote, undefined);
    assert.equal(assigned.transactions, undefined);
    assert.equal(assigned.totalAmount, undefined);
    const driverDetail = await call(driver.token, 'get', `/bookings/${b.id}`);
    assert.equal(driverDetail.status, 200);
    assert.equal(driverDetail.body.agreementVersion, undefined);
    assert.equal(driverDetail.body.advanceAmount, undefined);
    assert.equal(
      (await call(driver.token, 'patch', `/bookings/${b.id}/status`, { status: 'PICKUP_INSPECTION' })).status,
      200,
    );
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=',
      'base64',
    );
    async function inspect(person, stage) {
      const u = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer ' + person.token)
        .field('kind', 'INSPECTION')
        .attach('file', png, 'condition.png');
      assert.equal(u.status, 201);
      const r = await call(person.token, 'post', `/bookings/${b.id}/inspections`, {
        stage,
        notes: 'Checked equipment condition and safety',
        checklist: { condition: true, safety: true, accessories: true },
        media: [u.body.id],
      });
      assert.equal(r.status, 201, JSON.stringify(r.body));
    }
    assert.equal(
      (await call(driver.token, 'patch', `/bookings/${b.id}/status`, { status: 'IN_TRANSIT' })).status,
      409,
    );
    await inspect(driver, 'PICKUP');
    assert.equal(
      (await call(driver.token, 'patch', `/bookings/${b.id}/status`, { status: 'IN_TRANSIT' })).status,
      200,
    );
    const code = await call(winner.token, 'post', `/bookings/${b.id}/handover-code`, {});
    assert.equal(code.status, 200);
    assert.equal(
      (
        await call(driver.token, 'patch', `/bookings/${b.id}/status`, {
          status: 'DELIVERED',
          code: code.body.code,
        })
      ).status,
      409,
    );
    await call(driver.token, 'patch', '/drivers/location', { latitude: 10.79, longitude: 79.13 });
    assert.equal(
      (await call(driver.token, 'patch', `/bookings/${b.id}/status`, { status: 'DELIVERED', code: '000000' }))
        .status,
      400,
    );
    assert.equal(
      (
        await call(driver.token, 'patch', `/bookings/${b.id}/status`, {
          status: 'DELIVERED',
          code: code.body.code,
        })
      ).status,
      200,
    );
    await inspect(winner, 'DELIVERY');
    assert.equal(
      (
        await call(winner.token, 'post', `/bookings/${b.id}/payments`, {
          kind: 'BALANCE',
          idempotencyKey: crypto.randomUUID(),
        })
      ).status,
      200,
    );
    assert.equal(
      (await call(winner.token, 'patch', `/bookings/${b.id}/status`, { status: 'IN_PROGRESS' })).status,
      200,
    );
    assert.equal(
      (await call(winner.token, 'patch', `/bookings/${b.id}/status`, { status: 'RETURN_INSPECTION' })).status,
      200,
    );
    await inspect(owner, 'RETURN');
    assert.equal(
      (await call(owner.token, 'patch', `/bookings/${b.id}/status`, { status: 'COMPLETED' })).status,
      200,
    );
    const review = await call(winner.token, 'post', `/bookings/${b.id}/reviews`, {
      rating: 5,
      condition: 5,
      reliability: 5,
      handling: 5,
      comment: 'Reliable rental',
    });
    assert.equal(review.status, 201);
    const final = await call(winner.token, 'get', `/bookings/${b.id}`);
    assert.equal(final.body.status, 'COMPLETED');
    assert.ok(final.body.history.length >= 10);
    assert.equal(final.body.farmer.passwordHash, undefined);
    assert.equal(final.body.machinery.owner.passwordHash, undefined);
    assert.equal(final.body.handoverCodeHash, undefined);
    assert.equal((await call(owner.token, 'get', '/analytics')).status, 200);
    assert.equal((await call(winner.token, 'get', '/operations/finance')).status, 403);
    const payout = await call(owner.token, 'post', `/operations/payouts/${b.id}`, {});
    assert.equal(payout.status, 200, JSON.stringify(payout.body));
    assert.equal(
      (await call(owner.token, 'post', `/operations/payouts/${b.id}`, {})).body.id,
      payout.body.id,
    );
    assert.equal(
      (await call(owner.token, 'post', `/operations/payouts/${payout.body.id}/approve`, {})).status,
      403,
    );
    assert.equal(
      (await call(adminToken, 'post', `/operations/payouts/${payout.body.id}/approve`, {})).body.status,
      'SIMULATED',
    );
    const dispatchLongitude = crypto.randomInt(-170000, 170000) / 1000;
    await prisma.machinery.update({
      where: { id: m.body.id },
      data: { latitude: -60, longitude: dispatchLongitude },
    });
    await prisma.user.update({
      where: { id: driver.user.id },
      data: { latitude: -60, longitude: dispatchLongitude },
    });
    const dispatchBooking = await prisma.booking.create({
      data: {
        farmerId: winner.user.id,
        machineryId: m.body.id,
        scheduledAt: new Date(Date.now() + 3600000),
        endsAt: new Date(Date.now() + 7200000),
        durationHours: 1,
        farmAddress: 'Test farm',
        farmLat: 10.79,
        farmLng: 79.13,
        status: 'PAID',
        totalAmount: 1000,
        advanceAmount: 500,
      },
    });
    await call(adminToken, 'put', '/operations/dispatch', { enabled: true, radiusKm: 1, horizonHours: 2 });
    await prisma.user.update({
      where: { id: driver.user.id },
      data: { preferences: { sms: true }, locationUpdatedAt: new Date(0) },
    });
    const dispatch = require('../src/services/dispatch');
    await dispatch.run(admin);
    assert.equal((await prisma.booking.findUnique({ where: { id: dispatchBooking.id } })).driverId, null);
    await prisma.user.update({ where: { id: driver.user.id }, data: { locationUpdatedAt: new Date() } });
    await Promise.all([dispatch.run(admin), dispatch.run(admin)]);
    assert.equal(
      (await prisma.booking.findUnique({ where: { id: dispatchBooking.id } })).driverId,
      driver.user.id,
    );
    assert.equal(
      await prisma.bookingEvent.count({ where: { bookingId: dispatchBooking.id, toStatus: 'ASSIGNED' } }),
      1,
    );
    const message = await prisma.messageOutbox.findFirst({ where: { userId: driver.user.id } });
    assert.ok(message, 'newly allocated driver must receive notification');
    const outbox = require('../src/services/outbox');
    let sends = 0;
    await Promise.all([
      outbox.run(async () => {
        sends++;
        throw new Error('timeout');
      }),
      outbox.run(async () => {
        sends++;
        throw new Error('timeout');
      }),
    ]);
    assert.equal(sends, 1);
    assert.equal((await prisma.messageOutbox.findUnique({ where: { id: message.id } })).status, 'UNKNOWN');
    await outbox.run(async () => {
      throw new Error('must not retry uncertain sends');
    });
    const sid = 'SM' + crypto.randomBytes(16).toString('hex');
    await outbox.receipt(message.id, sid, 'delivered');
    await outbox.receipt(message.id, sid, 'sent');
    assert.equal((await prisma.messageOutbox.findUnique({ where: { id: message.id } })).status, 'DELIVERED');
    await call(adminToken, 'put', '/operations/dispatch', { enabled: false, radiusKm: 30, horizonHours: 24 });
    assert.equal((await call(winner.token, 'get', `/bookings/${b.id}/receipt`)).status, 200);
    assert.equal(
      (await request(app).post('/api/payments/webhook').send({ event: 'payment.captured' })).status,
      401,
    );
    await call(winner.token, 'post', '/auth/logout', {});
    assert.equal((await call(winner.token, 'get', '/auth/me')).status, 401);
    await prisma.$disconnect();
  },
);

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

test(
  'Verify OTP is purpose-bound, single-use and throttled; signed opt-out cancels pending SMS',
  {
    skip: !process.env.TEST_DATABASE_URL,
  },
  async () => {
    const url = new URL(process.env.TEST_DATABASE_URL);
    assert.ok(['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname.includes('test'));
    Object.assign(process.env, {
      DATABASE_URL: url.href,
      DIRECT_URL: url.href,
      JWT_SECRET: 'isolated-messaging-test-secret',
      TWILIO_ACCOUNT_SID: 'AC' + 'a'.repeat(32),
      TWILIO_AUTH_TOKEN: 'isolated-test-token',
      TWILIO_VERIFY_SERVICE_SID: 'VA' + 'b'.repeat(32),
      PUBLIC_WEBHOOK_ORIGIN: 'https://farmiq.example',
    });
    const request = require('supertest');
    const { prisma } = require('../src/config');
    const app = require('../src/app');
    const twilio = require('twilio');
    const bcrypt = require('bcryptjs');
    const originalFetch = global.fetch;
    const user = await prisma.user.create({
      data: {
        accountId: `MSG-${crypto.randomUUID().toUpperCase()}`,
        phone: '+916' + String(crypto.randomInt(100000000, 999999999)),
        fullName: 'Messaging test',
        role: 'FARMER',
        passwordHash: await bcrypt.hash('OldPassword123', 4),
        language: 'ta',
        preferences: { lowData: true, sms: true },
      },
    });
    let sends = 0;
    const sid = 'VE' + 'c'.repeat(32);
    global.fetch = async (address, options) => {
      assert.equal(new URL(address).hostname, 'verify.twilio.com');
      const body = options.body;
      if (address.endsWith('/Verifications')) {
        sends++;
        assert.equal(body.get('To'), user.phone);
        assert.equal(body.get('Locale'), 'ta');
        return { ok: true, json: async () => ({ status: 'pending', sid }) };
      }
      assert.equal(body.get('VerificationSid'), sid);
      return {
        ok: true,
        json: async () => ({ status: body.get('Code') === '123456' ? 'approved' : 'pending', sid }),
      };
    };
    try {
      const challenge = await request(app)
        .post('/api/auth/challenge')
        .send({ phone: user.phone, purpose: 'RESET' });
      assert.equal(challenge.status, 200, JSON.stringify(challenge.body));
      assert.equal(sends, 1);
      assert.equal(
        (await request(app).post('/api/auth/challenge').send({ phone: user.phone, purpose: 'LOGIN' })).status,
        429,
      );
      const verify = (body) =>
        request(app)
          .post('/api/auth/challenge/verify')
          .send({ challengeId: challenge.body.challengeId, ...body });
      assert.equal((await verify({ code: '123456' })).status, 400, 'Reset must require a new password');
      assert.equal((await verify({ code: '000000', password: 'NewPassword123' })).status, 400);
      const approved = await verify({ code: '123456', password: 'NewPassword123' });
      assert.equal(approved.status, 200, JSON.stringify(approved.body));
      assert.equal((await verify({ code: '123456', password: 'AnotherPassword123' })).status, 400);
      assert.equal(
        (
          await request(app)
            .post('/api/auth/login')
            .send({ accountId: user.accountId, password: 'OldPassword123' })
        ).status,
        401,
      );
      assert.equal(
        (
          await request(app)
            .post('/api/auth/login')
            .send({ accountId: user.accountId, password: 'NewPassword123' })
        ).status,
        200,
      );
      const queued = await prisma.messageOutbox.create({
        data: { notificationId: crypto.randomUUID(), userId: user.id, body: 'Test only' },
      });
      async function sms(body, messageSid = 'SM' + crypto.randomBytes(16).toString('hex'), valid = true) {
        const values = { From: user.phone, Body: body, MessageSid: messageSid };
        const signature = twilio.getExpectedTwilioSignature(
          process.env.TWILIO_AUTH_TOKEN,
          process.env.PUBLIC_WEBHOOK_ORIGIN + '/api/channels/sms',
          values,
        );
        return request(app)
          .post('/api/channels/sms')
          .type('form')
          .set('X-Twilio-Signature', valid ? signature : 'invalid')
          .send(values);
      }
      assert.equal((await sms('STOP', undefined, false)).status, 401);
      const event = 'SM' + crypto.randomBytes(16).toString('hex');
      assert.equal((await sms('STOP', event)).status, 200);
      await sms('STOP', event);
      const stopped = await prisma.user.findUnique({ where: { id: user.id } });
      assert.deepEqual(stopped.preferences, { lowData: true, sms: false });
      assert.equal((await prisma.messageOutbox.findUnique({ where: { id: queued.id } })).status, 'CANCELLED');
      assert.equal(await prisma.auditLog.count({ where: { id: `consent-${event}` } }), 1);
      assert.equal((await sms('START')).status, 200);
      assert.equal((await prisma.user.findUnique({ where: { id: user.id } })).preferences.sms, true);
      const updated = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', 'Bearer ' + approved.body.token)
        .send({ preferences: { lowData: false } });
      assert.deepEqual(updated.body.preferences, { lowData: false, sms: true });
    } finally {
      global.fetch = originalFetch;
      await prisma.$disconnect();
    }
  },
);

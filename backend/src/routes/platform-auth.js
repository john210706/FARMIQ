const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { prisma, JWT_SECRET } = require('../config');
const { requireAuth } = require('../middleware/auth');
const { schemas, z, text, fail } = require('../domain');
const { rateLimit } = require('express-rate-limit');
const limit = rateLimit({
  windowMs: 15 * 60000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
function profile(u) {
  const { passwordHash, ...safe } = u;
  return safe;
}
function session(u) {
  return {
    token: jwt.sign({ sub: u.id, version: u.sessionVersion }, JWT_SECRET, {
      expiresIn: '8h',
      algorithm: 'HS256',
    }),
    user: profile(u),
  };
}
router.post('/auth/register', limit, async (req, res) => {
  const input = schemas.register.parse(req.body);
  const user = await prisma.user.create({
    data: {
      ...input,
      password: undefined,
      passwordHash: await bcrypt.hash(input.password, 12),
      accountId: `${input.role.slice(0, 3)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    },
  });
  res.status(201).json(session(user));
});
router.post('/auth/login', limit, async (req, res) => {
  const input = z.object({ accountId: text(100), password: text(100) }).parse(req.body);
  const user = await prisma.user.findFirst({
    where: { OR: [{ accountId: input.accountId.toUpperCase() }, { phone: input.accountId }] },
  });
  const valid = await bcrypt.compare(
    input.password,
    user?.passwordHash || '$2a$12$Bo58KnwMpBeqhbpAsmgjXuTlWuvAX3fFuQR5Wbp1/IuOz92mbCOcC',
  );
  if (!valid || !user?.active) fail(401, 'Invalid account or password');
  res.json(session(user));
});
router.get('/auth/me', requireAuth(), (req, res) => res.json(profile(req.user)));
router.post('/auth/logout', requireAuth(), async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { sessionVersion: { increment: 1 } } });
  res.json({ ok: true });
});
router.patch('/auth/me', requireAuth(), async (req, res) => {
  const input = z
    .object({
      fullName: text(100).optional(),
      language: z.enum(['en', 'ta', 'hi']).optional(),
      onDuty: z.boolean().optional(),
      preferences: z.object({ sms: z.boolean().optional(), lowData: z.boolean().optional() }).optional(),
    })
    .parse(req.body);
  if (input.onDuty !== undefined && req.user.role !== 'DRIVER') fail(403, 'Driver account required');
  res.json(profile(await prisma.user.update({ where: { id: req.user.id }, data: input })));
});
router.delete('/auth/me', requireAuth(), async (req, res) => {
  const { scope, activeStatuses } = require('../domain');
  if (await prisma.booking.count({ where: { ...scope(req.user), status: { in: activeStatuses } } }))
    fail(409, 'Finish or cancel active bookings before closing your account');
  await prisma.user.update({
    where: { id: req.user.id },
    data: { active: false, sessionVersion: { increment: 1 }, fullName: 'Closed account', preferences: {} },
  });
  res.json({ ok: true, message: 'Account closed. Transaction records retained for dispute resolution.' });
});
router.post('/auth/challenge', limit, async (req, res) => {
  const input = z
    .object({ phone: z.string().regex(/^\+?[0-9]{10,15}$/), purpose: z.enum(['LOGIN', 'RESET']) })
    .parse(req.body);
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM)
    fail(503, 'SMS sign-in is not configured. Use your password.');
  const code = String(crypto.randomInt(100000, 1000000));
  const challenge = await prisma.authChallenge.create({
    data: { ...input, codeHash: await bcrypt.hash(code, 12), expiresAt: new Date(Date.now() + 5 * 60000) },
  });
  const result = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString(
            'base64',
          ),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: input.phone,
        From: process.env.TWILIO_FROM,
        Body: `FarmIQ ${input.purpose.toLowerCase()} code: ${code}. Valid for 5 minutes.`,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!result.ok) fail(502, 'SMS provider could not send the code');
  res.json({ challengeId: challenge.id });
});
router.post('/auth/challenge/verify', limit, async (req, res) => {
  const input = z
    .object({
      challengeId: text(100),
      code: z.string().regex(/^\d{6}$/),
      password: z.string().min(10).max(100).optional(),
    })
    .parse(req.body);
  const result = await require('../services/booking').serial(async (tx) => {
    const c = await tx.authChallenge.findUnique({ where: { id: input.challengeId } });
    if (!c || c.usedAt || c.expiresAt < new Date() || c.attempts >= 5) return null;
    await tx.authChallenge.update({ where: { id: c.id }, data: { attempts: { increment: 1 } } });
    if (!(await bcrypt.compare(input.code, c.codeHash))) return null;
    const user = await tx.user.findUnique({ where: { phone: c.phone } });
    if (!user?.active) return null;
    if (c.purpose === 'RESET' && !input.password) fail(400, 'A new password is required');
    await tx.authChallenge.update({ where: { id: c.id }, data: { usedAt: new Date() } });
    return c.purpose === 'RESET'
      ? tx.user.update({
          where: { id: user.id },
          data: { passwordHash: await bcrypt.hash(input.password, 12), sessionVersion: { increment: 1 } },
        })
      : user;
  });
  if (!result) fail(400, 'Invalid or expired code');
  res.json(session(result));
});
module.exports = { router, profile };

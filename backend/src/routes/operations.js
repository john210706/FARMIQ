const router = require('express').Router();
const { prisma } = require('../config');
const { requireAuth } = require('../middleware/auth');
const { z, fail } = require('../domain');
const booking = require('../services/booking');
const dispatch = require('../services/dispatch');
router.use('/operations', requireAuth(['ADMIN', 'OWNER']));
router.get('/operations/finance', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      ...(req.user.role === 'OWNER' ? { machinery: { ownerId: req.user.id } } : {}),
    },
    include: { machinery: { select: { name: true, ownerId: true } }, transactions: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });
  const payouts = await prisma.payout.findMany({ where: { bookingId: { in: bookings.map((b) => b.id) } } });
  res.json(
    bookings.map((b) => ({
      bookingId: b.id,
      machine: b.machinery.name,
      completedAt: b.updatedAt,
      total: Number(b.totalAmount),
      commission: Number(b.quote?.commission || 0),
      ownerEarnings: Number(b.quote?.ownerEarnings || 0),
      captured: b.transactions.filter((t) => t.status === 'PAID').reduce((a, t) => a + Number(t.amount), 0),
      refunded: b.transactions
        .filter((t) => t.status === 'REFUNDED')
        .reduce((a, t) => a + Number(t.amount), 0),
      payout: payouts.find((p) => p.bookingId === b.id) || null,
    })),
  );
});
router.post('/operations/payouts/:bookingId', async (req, res) => {
  if (process.env.NODE_ENV === 'production' || (process.env.PAYMENT_MODE || 'sandbox') !== 'sandbox')
    fail(409, 'Payout simulation is only available in non-production sandbox mode');
  const result = await booking.serial(async (tx) => {
    const b = await tx.booking.findUnique({
      where: { id: req.params.bookingId },
      include: { machinery: true, transactions: true },
    });
    if (!b || (req.user.role !== 'ADMIN' && b.machinery.ownerId !== req.user.id))
      fail(404, 'Booking not found');
    if (b.status !== 'COMPLETED' || !Number.isFinite(b.quote?.ownerEarnings))
      fail(409, 'Completed booking with a verified quote is required');
    const paid = b.transactions.filter((t) => t.status === 'PAID');
    if (
      !paid.length ||
      paid.some((t) => t.provider !== 'sandbox') ||
      paid.reduce((a, t) => a + Number(t.amount), 0) < Number(b.totalAmount) ||
      b.transactions.some((t) => t.kind === 'REFUND')
    )
      fail(409, 'Only fully settled sandbox rentals without refunds are eligible');
    return tx.payout.upsert({
      where: { bookingId: b.id },
      update: {},
      create: { bookingId: b.id, ownerId: b.machinery.ownerId, amount: b.quote.ownerEarnings },
    });
  });
  res.json(result);
});
router.post('/operations/payouts/:id/approve', requireAuth(['ADMIN']), async (req, res) => {
  if (process.env.NODE_ENV === 'production' || (process.env.PAYMENT_MODE || 'sandbox') !== 'sandbox')
    fail(409, 'Sandbox only');
  res.json(
    await booking.serial(async (tx) => {
      const p = await tx.payout.findUnique({ where: { id: req.params.id } });
      if (!p || p.provider !== 'sandbox') fail(404, 'Sandbox payout not found');
      if (p.status === 'SIMULATED') return p;
      if (p.status !== 'REQUESTED') fail(409, 'Payout is not awaiting approval');
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'PAYOUT_SIMULATED',
          targetId: p.id,
          detail: { amount: String(p.amount) },
        },
      });
      return tx.payout.update({
        where: { id: p.id },
        data: {
          status: 'SIMULATED',
          reference: `sandbox-${p.id}`,
          note: 'Simulation only — no funds transferred',
        },
      });
    }),
  );
});
router.use('/operations', requireAuth(['ADMIN']));
router.get('/operations/dispatch', async (req, res) =>
  res.json((await prisma.setting.findUnique({ where: { key: 'dispatch' } }))?.value || dispatch.defaults),
);
router.put('/operations/dispatch', async (req, res) => {
  const value = z
    .object({
      enabled: z.boolean(),
      radiusKm: z.number().min(1).max(200),
      horizonHours: z.number().min(1).max(48),
    })
    .strict()
    .parse(req.body);
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: 'dispatch' },
      update: { value },
      create: { key: 'dispatch', value },
    }),
    prisma.auditLog.create({
      data: { actorId: req.user.id, action: 'DISPATCH_SETTINGS', targetId: 'dispatch', detail: value },
    }),
  ]);
  res.json(value);
});
router.post('/operations/dispatch/run', async (req, res) => res.json(await dispatch.run(req.user)));
router.get('/operations/messages', async (req, res) =>
  res.json(await prisma.messageOutbox.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })),
);
router.get('/operations/messaging-status', async (req, res) => {
  const outbox = require('../services/outbox');
  const grouped = await prisma.messageOutbox.groupBy({ by: ['status'], _count: { _all: true } });
  res.json({
    ...outbox.configuration(),
    queue: Object.fromEntries(grouped.map((row) => [row.status, row._count._all])),
    optedInUsers: await prisma.user.count({
      where: { active: true, preferences: { path: ['sms'], equals: true } },
    }),
  });
});
router.post('/operations/messages/process', async (req, res) =>
  res.json(await require('../services/outbox').run()),
);
module.exports = router;

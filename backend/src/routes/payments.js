const router = require('express').Router();
const crypto = require('node:crypto');
const { prisma } = require('../config');
const { requireAuth } = require('../middleware/auth');
const { fail, z, text } = require('../domain');
const booking = require('../services/booking');
function validSignature(body, signature, secret) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature || '')) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    crypto.createHmac('sha256', secret).update(body).digest(),
  );
}
router.post('/payments/webhook', async (req, res) => {
  if (!validSignature(req.rawBody, req.headers['x-razorpay-signature'], process.env.RAZORPAY_WEBHOOK_SECRET))
    fail(401, 'Invalid webhook signature');
  const event = req.body;
  if (!['payment.captured', 'payment.failed'].includes(event.event)) return res.json({ received: true });
  const p = event.payload?.payment?.entity;
  if (!p?.order_id) fail(400, 'Missing payment order');
  await booking.serial(async (tx) => {
    const t = await tx.transaction.findUnique({ where: { providerReference: p.order_id } });
    if (
      !t ||
      t.provider !== 'razorpay' ||
      Math.round(Number(t.amount) * 100) !== p.amount ||
      p.currency !== 'INR'
    )
      fail(400, 'Payment does not match the saved order');
    if (event.event === 'payment.failed') {
      if (t.status === 'PENDING')
        await tx.transaction.update({ where: { id: t.id }, data: { status: 'FAILED' } });
      return;
    }
    if (p.status !== 'captured') fail(400, 'Payment is not captured');
    await booking.settle(tx, t, { id: 'razorpay-webhook' });
  });
  await require('../services/dispatch').trigger();
  res.json({ received: true });
});
router.post('/bookings/:id/payments', requireAuth(['FARMER', 'ADMIN']), async (req, res) => {
  const { kind, idempotencyKey } = z
    .object({ kind: z.enum(['ADVANCE', 'BALANCE']), idempotencyKey: z.string().uuid() })
    .parse(req.body);
  const mode = process.env.PAYMENT_MODE || 'sandbox';
  if (!['sandbox', 'razorpay'].includes(mode)) fail(503, 'Payments are disabled');
  if (mode === 'sandbox' && process.env.NODE_ENV === 'production')
    fail(503, 'Sandbox payments cannot run in production');
  if (
    mode === 'razorpay' &&
    (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_WEBHOOK_SECRET)
  )
    fail(503, 'Payment provider is not configured');
  const t = await booking.serial(async (tx) => {
    const b = await booking.get(tx, req.params.id, req.user);
    const existing = await tx.transaction.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.bookingId !== b.id || existing.kind !== kind) fail(409, 'Idempotency key already used');
      return existing;
    }
    const same = await tx.transaction.findFirst({
      where: { bookingId: b.id, kind, status: { in: ['PAID', 'PENDING'] } },
    });
    if (same) return same;
    if (kind === 'ADVANCE' && (b.status !== 'PENDING_PAYMENT' || b.holdExpiresAt < new Date()))
      fail(409, 'Owner approval and an unexpired reservation are required');
    if (
      kind === 'BALANCE' &&
      (b.status !== 'DELIVERED' || !b.inspections.some((i) => i.stage === 'DELIVERY'))
    )
      fail(409, 'Complete delivery inspection first');
    const created = await tx.transaction.create({
      data: {
        bookingId: b.id,
        kind,
        amount: kind === 'ADVANCE' ? b.advanceAmount : Number(b.totalAmount) - Number(b.advanceAmount),
        provider: mode,
        idempotencyKey,
      },
    });
    if (mode === 'sandbox') {
      await booking.settle(tx, created, req.user);
      return { ...created, status: 'PAID' };
    }
    return created;
  });
  if ((mode === 'sandbox' || t.status === 'PAID') && kind === 'ADVANCE')
    await require('../services/dispatch').trigger();
  if (mode === 'sandbox' || t.status === 'PAID')
    return res.json({
      transaction: t,
      mode,
      message: mode === 'sandbox' ? 'Sandbox only; no money transferred.' : 'Payment already confirmed.',
    });
  if (!t.providerReference) {
    // Orders are created once under a row lock; callbacks alone never confirm payment.
    await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Transaction" WHERE id = ${t.id} FOR UPDATE`;
        const current = await tx.transaction.findUnique({ where: { id: t.id } });
        if (current.providerReference) {
          t.providerReference = current.providerReference;
          return;
        }
        const r = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString(
                'base64',
              ),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(Number(t.amount) * 100),
            currency: 'INR',
            receipt: t.id,
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) fail(502, 'Payment order could not be created');
        const order = await r.json();
        t.providerReference = order.id;
        await tx.transaction.update({ where: { id: t.id }, data: { providerReference: order.id } });
      },
      { timeout: 12000 },
    );
  }
  res.json({
    transaction: t,
    mode,
    key: process.env.RAZORPAY_KEY_ID,
    orderId: t.providerReference,
    amount: Math.round(Number(t.amount) * 100),
    currency: 'INR',
  });
});
module.exports = { router, validSignature };

const { prisma } = require('../config');
const {
  fail,
  activeStatuses,
  canAccess,
  authorizeTransition,
  quote,
  cancellation,
  digest,
} = require('../domain');
const { calculateDistance } = require('../utils/geo');
const include = {
  machinery: { include: { owner: true } },
  farmer: true,
  driver: true,
  history: { orderBy: { createdAt: 'asc' } },
  inspections: true,
  reviews: true,
  transactions: true,
};
const contact = (u) =>
  u && {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    latitude: u.latitude,
    longitude: u.longitude,
    locationUpdatedAt: u.locationUpdatedAt,
  };
function response(b) {
  const { handoverCodeHash, farmer, driver, machinery, ...safe } = b;
  return {
    ...safe,
    farmer: contact(farmer),
    driver: contact(driver),
    machinery: { ...machinery, owner: contact(machinery.owner) },
  };
}
async function serial(work) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(work, { isolationLevel: 'Serializable', timeout: 15000 });
    } catch (e) {
      if (e.code !== 'P2034' || attempt === 2) throw e;
    }
  }
}
async function get(tx, id, user) {
  const b = await tx.booking.findUnique({ where: { id }, include });
  if (!b || !canAccess(user, b)) fail(404, 'Booking not found');
  return b;
}
async function record(tx, b, user, status, note, data = {}) {
  const result = await tx.booking.update({
    where: { id: b.id },
    data: {
      ...data,
      status,
      history: { create: { actorId: user.id, fromStatus: b.status, toStatus: status, note } },
    },
    include,
  });
  await tx.auditLog.create({
    data: { actorId: user.id, action: 'BOOKING_' + status, targetId: b.id, detail: { note } },
  });
  const ids = [...new Set([result.farmerId, result.machinery.ownerId, result.driverId].filter(Boolean))];
  for (const userId of ids) {
    const notification = await tx.notification.create({
      data: {
        userId,
        bookingId: b.id,
        message: `${b.machinery.name}: ${status.replaceAll('_', ' ').toLowerCase()}. ${note}`,
      },
    });
    const recipient = await tx.user.findUnique({
      where: { id: userId },
      select: { active: true, preferences: true },
    });
    if (recipient?.active && recipient.preferences?.sms)
      await tx.messageOutbox.create({
        data: { notificationId: notification.id, userId, body: notification.message },
      });
  }
  return result;
}
async function available(tx, machineId, start, end, exclude) {
  const conflicts = await tx.booking.findMany({
    where: {
      machineryId: machineId,
      id: exclude ? { not: exclude } : undefined,
      status: { in: activeStatuses },
      scheduledAt: { lt: end },
      OR: [{ endsAt: { gt: start } }, { endsAt: null }],
    },
  });
  const overlap = conflicts.some(
    (b) =>
      (b.endsAt || new Date(+b.scheduledAt + b.durationHours * 3600000)) > start &&
      !(b.status === 'PENDING_PAYMENT' && b.holdExpiresAt && b.holdExpiresAt < new Date()),
  );
  if (
    overlap ||
    (await tx.availability.count({
      where: { machineryId: machineId, startsAt: { lt: end }, endsAt: { gt: start } },
    }))
  )
    fail(409, 'This time is unavailable. Choose another time.');
}
async function makeQuote(tx, machine, hours, operatorId) {
  let rate = 0;
  if (operatorId) {
    const operator = await tx.operator.findUnique({ where: { id: operatorId } });
    if (
      !machine.operatorAvailable ||
      !operator?.active ||
      operator.verificationStatus !== 'VERIFIED' ||
      !operator.skills.includes(machine.category)
    )
      fail(400, 'A verified operator qualified for this machine is required');
    rate = Number(operator.hourlyRate);
  }
  const settings = await tx.setting.findUnique({ where: { key: 'commission' } });
  return quote(machine, hours, rate, Number(settings?.value ?? 0.12));
}
async function create(user, input) {
  if (user.role !== 'ADMIN' && (input.farmerId || input.assistedConsent))
    fail(403, 'Only administrators may submit assisted bookings');
  if (user.role === 'ADMIN' && (!input.assistedConsent || !input.farmerId))
    fail(400, 'Farmer identity and consent are required');
  const farmerId = user.role === 'ADMIN' ? input.farmerId : user.id;
  return serial(async (tx) => {
    const existing = await tx.booking.findUnique({ where: { requestKey: input.requestKey }, include });
    if (existing) {
      if (existing.farmerId !== farmerId) fail(409, 'Request key already used');
      if (
        existing.machineryId !== input.machineryId ||
        existing.scheduledAt.toISOString() !== new Date(input.scheduledAt).toISOString() ||
        existing.durationHours !== input.durationHours ||
        existing.farmAddress !== input.farmAddress ||
        existing.farmLat !== input.farmLat ||
        existing.farmLng !== input.farmLng ||
        (existing.operatorId || undefined) !== input.operatorId
      )
        fail(409, 'This request key belongs to a different booking request');
      return existing;
    }
    const farmer = await tx.user.findUnique({ where: { id: farmerId } });
    if (!farmer?.active || farmer.role !== 'FARMER') fail(400, 'A farmer account is required');
    const machine = await tx.machinery.findUnique({
      where: { id: input.machineryId },
      include: { owner: true },
    });
    if (
      !machine ||
      machine.status !== 'AVAILABLE' ||
      machine.verificationStatus !== 'VERIFIED' ||
      !machine.owner.active ||
      machine.owner.verificationStatus !== 'VERIFIED'
    )
      fail(409, 'Machine is not available for booking');
    const start = new Date(input.scheduledAt),
      end = new Date(+start + input.durationHours * 3600000);
    if (start <= new Date() || start > new Date(Date.now() + 365 * 86400000))
      fail(400, 'Choose a future date within one year');
    if (
      machine.latitude != null &&
      calculateDistance(input.farmLat, input.farmLng, machine.latitude, machine.longitude) >
        machine.deliveryRadiusKm
    )
      fail(400, 'Your farm is outside this machine’s delivery area');
    await available(tx, machine.id, start, end);
    if (
      input.operatorId &&
      (await tx.booking.count({
        where: {
          operatorId: input.operatorId,
          status: { in: activeStatuses },
          scheduledAt: { lt: end },
          endsAt: { gt: start },
        },
      }))
    )
      fail(409, 'Operator is already booked at this time');
    const pricing = await makeQuote(tx, machine, input.durationHours, input.operatorId);
    const b = await tx.booking.create({
      data: {
        farmerId,
        machineryId: machine.id,
        scheduledAt: start,
        endsAt: end,
        durationHours: input.durationHours,
        operatorId: input.operatorId,
        farmAddress: input.farmAddress,
        farmLat: input.farmLat,
        farmLng: input.farmLng,
        requestKey: input.requestKey,
        status: 'REQUESTED',
        quote: pricing,
        totalAmount: pricing.total,
        advanceAmount: pricing.advance,
        deliveryFee: pricing.delivery,
        operatorFee: pricing.operator,
        agreementAcceptedAt: new Date(),
      },
      include,
    });
    return record(
      tx,
      b,
      user,
      'REQUESTED',
      user.role === 'ADMIN' ? 'Assisted booking with recorded farmer consent' : 'Owner approval requested',
    );
  });
}
async function transition(user, id, next, note = '', code = '') {
  return serial(async (tx) => {
    const b = await get(tx, id, user);
    authorizeTransition(user, b, next);
    const data = {};
    if (next === 'PENDING_PAYMENT') {
      await available(tx, b.machineryId, b.scheduledAt, b.endsAt, b.id);
      data.holdExpiresAt = new Date(Date.now() + 30 * 60000);
    }
    const stage = { IN_TRANSIT: 'PICKUP', IN_PROGRESS: 'DELIVERY', COMPLETED: 'RETURN' }[next];
    if (stage && !b.inspections.some((i) => i.stage === stage))
      fail(409, `Complete the ${stage.toLowerCase()} inspection first`);
    if (next === 'DELIVERED') {
      if (!b.handoverCodeHash || digest(code) !== b.handoverCodeHash)
        fail(400, 'Ask the farmer for the valid handover code');
      if (
        user.role !== 'ADMIN' &&
        (!user.locationUpdatedAt ||
          Date.now() - user.locationUpdatedAt > 300000 ||
          calculateDistance(user.latitude, user.longitude, b.farmLat, b.farmLng) > 0.5)
      )
        fail(409, 'Send a fresh GPS location within 500 metres of the farm');
      data.handoverCodeHash = null;
    }
    if (next === 'IN_PROGRESS' && !b.transactions.some((t) => t.kind === 'BALANCE' && t.status === 'PAID'))
      fail(409, 'Settle the remaining balance first');
    if (next === 'CANCELLED') {
      let { fee, refund } = cancellation(b);
      if (user.role !== 'FARMER') {
        refund += fee;
        fee = 0;
      }
      if (b.transactions.some((t) => t.provider === 'razorpay' && t.status === 'PAID'))
        fail(409, 'Open a support ticket for provider refund review before cancelling');
      data.cancellationFee = fee;
      if (refund)
        await tx.transaction.create({
          data: {
            bookingId: id,
            kind: 'REFUND',
            amount: refund,
            status: 'REFUNDED',
            provider: 'sandbox',
            idempotencyKey: `refund:${id}`,
          },
        });
    }
    return record(tx, b, user, next, note || next.replaceAll('_', ' '), data);
  });
}
async function settle(tx, transaction, actor) {
  if (transaction.status === 'PAID') return;
  const b = await tx.booking.findUnique({ where: { id: transaction.bookingId }, include });
  const duplicate = b.transactions.some(
    (t) => t.id !== transaction.id && t.kind === transaction.kind && t.status === 'PAID',
  );
  const expired =
    transaction.kind === 'ADVANCE' && (b.status !== 'PENDING_PAYMENT' || b.holdExpiresAt < new Date());
  if (transaction.provider === 'razorpay' && (duplicate || expired)) {
    await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'PAID' } });
    await tx.supportTicket.create({
      data: {
        userId: b.farmerId,
        bookingId: b.id,
        category: 'PAYMENT',
        message: `Provider captured ${transaction.id} after expiration or for an already-paid installment. Reconcile/refund before changing the reservation.`,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: 'PAYMENT_RECONCILIATION_REQUIRED',
        targetId: b.id,
        detail: { transactionId: transaction.id },
      },
    });
    return;
  }
  if (transaction.kind === 'ADVANCE') {
    if (expired) fail(409, 'Payment hold expired; ask the owner to approve a new request');
    await available(tx, b.machineryId, b.scheduledAt, b.endsAt, b.id);
  } else if (b.status !== 'DELIVERED') fail(409, 'Balance is payable after delivery');
  await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'PAID' } });
  await record(
    tx,
    b,
    actor,
    transaction.kind === 'ADVANCE' ? 'PAID' : b.status,
    `${transaction.kind.toLowerCase()} payment confirmed`,
  );
}
module.exports = { include, response, serial, get, record, available, makeQuote, create, transition, settle };

const { serial } = require('./booking');

async function update(userId, changes, source = 'account', eventId) {
  return serial(async (tx) => {
    if (eventId && (await tx.auditLog.findUnique({ where: { id: eventId } })))
      return tx.user.findUnique({ where: { id: userId } });
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const { preferences, ...profile } = changes;
    const result = await tx.user.update({
      where: { id: userId },
      data: {
        ...profile,
        ...(preferences && { preferences: { ...user.preferences, ...preferences } }),
      },
    });
    if (preferences?.sms !== undefined) {
      await tx.auditLog.create({
        data: {
          ...(eventId && { id: eventId }),
          actorId: userId,
          targetId: userId,
          action: preferences.sms ? 'SMS_OPT_IN' : 'SMS_OPT_OUT',
          detail: { source, version: '2026-10' },
        },
      });
      if (!preferences.sms)
        await tx.messageOutbox.updateMany({
          where: { userId, status: { in: ['PENDING', 'RETRY'] } },
          data: { status: 'CANCELLED', error: 'Recipient opted out' },
        });
    }
    return result;
  });
}
module.exports = { update };

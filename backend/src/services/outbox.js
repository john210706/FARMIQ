const { prisma } = require('../config');
const rank = { queued: 1, sending: 2, sent: 3, failed: 4, undelivered: 4, delivered: 5, read: 6 };
function configuration() {
  const checks = {
    SMS_OUTBOX_ENABLED: process.env.SMS_OUTBOX_ENABLED === 'true',
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM: !!process.env.TWILIO_FROM,
    PUBLIC_WEBHOOK_ORIGIN: /^https:\/\//.test(process.env.PUBLIC_WEBHOOK_ORIGIN || ''),
  };
  return {
    enabled: Object.values(checks).every(Boolean),
    missing: Object.keys(checks).filter((key) => !checks[key]),
  };
}
async function receipt(id, sid, status, error) {
  if (!rank[status] || !/^SM[a-f0-9]{32}$/i.test(sid || '')) return;
  const current = await prisma.messageOutbox.findUnique({ where: { id } });
  if (!current || (current.providerReference && current.providerReference !== sid)) return;
  if (!['SENDING', 'UNKNOWN', ...Object.keys(rank).map((s) => s.toUpperCase())].includes(current.status))
    return;
  if ((rank[current.status.toLowerCase()] || 0) > rank[status]) return;
  await prisma.messageOutbox.updateMany({
    where: { id, status: current.status, providerReference: current.providerReference },
    data: {
      providerReference: sid,
      status: status.toUpperCase(),
      error: error ? String(error).slice(0, 100) : null,
    },
  });
}
async function send(row, user) {
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString(
            'base64',
          ),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: user.phone,
        From: process.env.TWILIO_FROM,
        Body: row.body.slice(0, 1500),
        StatusCallback: `${process.env.PUBLIC_WEBHOOK_ORIGIN}/api/channels/status/${row.id}`,
      }),
    },
  );
  if (response.status === 429) return { retry: true };
  if (!response.ok)
    return {
      status: response.status >= 500 ? 'UNKNOWN' : 'FAILED',
      error: `Provider HTTP ${response.status}`,
    };
  const result = await response.json();
  if (!/^SM[a-f0-9]{32}$/i.test(result.sid || ''))
    return { status: 'UNKNOWN', error: 'Provider response missing reference' };
  return { status: 'QUEUED', providerReference: result.sid };
}
async function run(transport = send) {
  if (transport === send && !configuration().enabled) return { enabled: false, processed: 0 };
  await prisma.messageOutbox.updateMany({
    where: { status: 'SENDING', updatedAt: { lt: new Date(Date.now() - 120000) } },
    data: { status: 'UNKNOWN', error: 'Interrupted send; inspect provider before any resend' },
  });
  const rows = await prisma.messageOutbox.findMany({
    where: { status: { in: ['PENDING', 'RETRY'] }, nextAttemptAt: { lte: new Date() } },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });
  let processed = 0;
  for (const row of rows) {
    const claim = await prisma.messageOutbox.updateMany({
      where: { id: row.id, status: row.status, attempts: row.attempts },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    });
    if (!claim.count) continue;
    const user = await prisma.user.findUnique({ where: { id: row.userId } });
    let result;
    if (!user?.active || !user.preferences?.sms)
      result = { status: 'CANCELLED', error: 'Recipient inactive or opted out' };
    else if (Date.now() - row.createdAt > 86400000)
      result = { status: 'CANCELLED', error: 'Notification older than 24 hours' };
    else {
      try {
        result = await transport(row, user);
      } catch {
        result = { status: 'UNKNOWN', error: 'Uncertain provider outcome; manual reconciliation required' };
      }
    }
    if (result.retry)
      result =
        row.attempts >= 4
          ? { status: 'FAILED', error: 'Retry limit reached' }
          : {
              status: 'RETRY',
              nextAttemptAt: new Date(Date.now() + 60000 * 2 ** row.attempts),
              error: 'Provider rate limited request',
            };
    // Do not overwrite a signed receipt that arrived before the send response.
    await prisma.messageOutbox.updateMany({ where: { id: row.id, status: 'SENDING' }, data: result });
    processed++;
  }
  return { enabled: true, processed };
}
module.exports = { run, receipt, configuration };

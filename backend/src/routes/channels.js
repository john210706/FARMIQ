const express = require('express');
const crypto = require('node:crypto');
const router = express.Router();
const { prisma } = require('../config');
const { fail, schemas } = require('../domain');
const booking = require('../services/booking');
const i18n = require('../i18n');
const xml = (value) =>
  String(value).replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c],
  );
function signatureValid(url, params, signature, secret) {
  if (!secret || !signature) return false;
  const value =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join('');
  const expected = crypto.createHmac('sha1', secret).update(value).digest('base64');
  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}
router.use('/channels', express.urlencoded({ extended: false, limit: '20kb' }));
router.use('/channels', async (req, res, next) => {
  if (
    !process.env.PUBLIC_WEBHOOK_ORIGIN ||
    !signatureValid(
      process.env.PUBLIC_WEBHOOK_ORIGIN + req.originalUrl,
      req.body,
      req.headers['x-twilio-signature'],
      process.env.TWILIO_AUTH_TOKEN,
    )
  )
    return next(Object.assign(new Error('Invalid channel signature'), { status: 401 }));
  req.channelUser =
    typeof req.body.From === 'string' && /^\+[1-9]\d{7,14}$/.test(req.body.From)
      ? await prisma.user.findFirst({ where: { phone: req.body.From, active: true } })
      : null;
  next();
});
router.post('/channels/status/:id', async (req, res) => {
  await require('../services/outbox').receipt(
    req.params.id,
    req.body.MessageSid,
    req.body.MessageStatus,
    req.body.ErrorCode,
  );
  res.sendStatus(204);
});
router.post('/channels/sms', async (req, res) => {
  const lang = req.channelUser?.language || 'en';
  let reply = i18n.text('register', lang);
  const u = req.channelUser,
    body = String(req.body.Body || '').trim();
  if (u) {
    if (/^STATUS$/i.test(body)) {
      const b = await prisma.booking.findFirst({
        where: require('../domain').scope(u),
        orderBy: { createdAt: 'desc' },
        include: { machinery: true },
      });
      reply = b
        ? `${b.machinery.name}: ${i18n.status(b.status, lang)}. ${i18n.text('starts', lang, { date: b.scheduledAt.toLocaleString(`${lang}-IN`, { timeZone: 'Asia/Kolkata' }), id: b.id })}`
        : i18n.text('noBookings', lang);
    } else if (/^BOOK /i.test(body) && u.role === 'FARMER') {
      const match = body.match(
        /^BOOK\s+(\S+)\s+(\d{4}-\d{2}-\d{2})\s+(\d+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(.+)\s+AGREE$/i,
      );
      if (!match) reply = i18n.text('bookHelp', lang);
      else {
        const hex = crypto.createHash('sha256').update(String(req.body.MessageSid)).digest('hex');
        const requestKey = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
        try {
          const b = await booking.create(
            u,
            schemas.booking.parse({
              machineryId: match[1],
              scheduledAt: `${match[2]}T08:00:00+05:30`,
              durationHours: Number(match[3]),
              farmLat: Number(match[4]),
              farmLng: Number(match[5]),
              farmAddress: match[6],
              agreementAccepted: true,
              requestKey,
            }),
          );
          reply = i18n.text('requested', lang, { id: b.id, total: b.totalAmount, advance: b.advanceAmount });
        } catch (e) {
          if (e.status && e.status < 500) reply = e.message;
          else if (e.name === 'ZodError') reply = i18n.text('badBooking', lang);
          else throw e;
        }
      }
    } else if (/^HELP(?:\s|$)/i.test(body)) {
      const ticketId = `sms-${String(req.body.MessageSid).slice(0, 80)}`;
      await prisma.supportTicket.upsert({
        where: { id: ticketId },
        update: {},
        create: {
          id: ticketId,
          userId: u.id,
          category: 'HELP',
          message: body.slice(0, 3000) || 'SMS assistance requested',
        },
      });
      reply = i18n.text('support', lang);
    } else reply = i18n.text('smsHelp', lang);
  }
  res.type('text/xml').send(`<Response><Message>${xml(reply)}</Message></Response>`);
});
router.post('/channels/voice', async (req, res) => {
  const u = req.channelUser;
  const lang = u?.language || 'en';
  const say = (value) => `<Say language="${i18n.voiceLanguage(lang)}">${xml(value)}</Say>`;
  let body;
  if (!u) body = say(i18n.text('voiceRegister', lang));
  else if (req.body.Digits === '1') {
    const b = await prisma.booking.findFirst({
      where: require('../domain').scope(u),
      orderBy: { createdAt: 'desc' },
      include: { machinery: true },
    });
    body = say(
      b
        ? `${b.machinery.name}. ${i18n.text('bookingStatus', lang, { status: i18n.status(b.status, lang) })}`
        : i18n.text('voiceNoBookings', lang),
    );
  } else if (req.body.Digits === '2') {
    const id = `voice-${String(req.body.CallSid).slice(0, 80)}`;
    await prisma.supportTicket.upsert({
      where: { id },
      update: {},
      create: {
        id,
        userId: u.id,
        category: 'HELP',
        message:
          'Phone-assisted booking callback requested. Contact the farmer and record consent before booking.',
      },
    });
    body = say(i18n.text('callback', lang));
  } else
    body = `<Gather numDigits="1" action="/api/channels/voice" method="POST">${say(i18n.text('menu', lang))}</Gather>`;
  res.type('text/xml').send(`<Response>${body}</Response>`);
});
module.exports = { router, signatureValid };

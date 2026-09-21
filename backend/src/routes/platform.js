const router = require('express').Router();
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const { prisma } = require('../config');
const { requireAuth } = require('../middleware/auth');
const {
  fail,
  schemas,
  z,
  text,
  date,
  lat,
  lng,
  url,
  scope,
  activeStatuses,
  digest,
  cancellation,
} = require('../domain');
const booking = require('../services/booking');
const { calculateDistance } = require('../utils/geo');
const admin = requireAuth(['ADMIN']),
  owner = requireAuth(['OWNER', 'ADMIN']);
const audit = (u, action, targetId, detail = {}) =>
  prisma.auditLog.create({ data: { actorId: u.id, action, targetId, detail } });
const visible = {
  status: 'AVAILABLE',
  verificationStatus: 'VERIFIED',
  owner: { active: true, verificationStatus: 'VERIFIED' },
};
const publicMachine = (m) => ({
  ...m,
  owner: m.owner && {
    id: m.owner.id,
    fullName: m.owner.fullName,
    verificationStatus: m.owner.verificationStatus,
  },
  reviews: m.bookings?.flatMap((b) => b.reviews).map(({ reviewerId, ...r }) => r),
  bookings: undefined,
});
router.get('/capabilities', (req, res) =>
  res.json({
    payments: process.env.PAYMENT_MODE || 'sandbox',
    sms: !!process.env.TWILIO_FROM,
    ivr: !!process.env.PUBLIC_WEBHOOK_ORIGIN,
    ai: !!process.env.GEMINI_API_KEY && !!process.env.GEMINI_MODEL,
    version: '2.0',
    insurance: false,
    escrow: false,
  }),
);
router.get('/machinery/nearby', async (req, res) => {
  const q = z
    .object({
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
      radius: z.coerce.number().positive().max(500).default(30),
      search: z.string().max(100).default(''),
      category: z.string().max(40).optional(),
      startsAt: date.optional(),
      hours: z.coerce.number().int().min(1).max(48).default(6),
    })
    .parse(req.query);
  if ((q.lat === undefined) !== (q.lng === undefined)) fail(400, 'Supply both coordinates');
  const machines = await prisma.machinery.findMany({
    where: {
      ...visible,
      category: q.category || undefined,
      OR: [
        { name: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ],
    },
    include: { owner: true, bookings: { select: { reviews: { where: { hidden: false } } } } },
    take: 200,
  });
  const results = [];
  for (const m of machines) {
    const distance =
      q.lat !== undefined && m.latitude != null
        ? calculateDistance(q.lat, q.lng, m.latitude, m.longitude)
        : null;
    if (distance !== null && distance > Math.min(q.radius, m.deliveryRadiusKm)) continue;
    if (q.startsAt) {
      try {
        await booking.available(
          prisma,
          m.id,
          new Date(q.startsAt),
          new Date(+new Date(q.startsAt) + q.hours * 3600000),
        );
      } catch (e) {
        if (e.status === 409) continue;
        throw e;
      }
    }
    results.push({ ...publicMachine(m), distance });
  }
  res.json(results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)));
});
router.get('/machinery/:id', async (req, res) => {
  const m = await prisma.machinery.findFirst({
    where: { id: req.params.id, ...visible },
    include: {
      owner: true,
      availability: true,
      serviceRecords: true,
      bookings: { select: { reviews: { where: { hidden: false } } } },
    },
  });
  if (!m) fail(404, 'Machine not found');
  const reserved = await prisma.booking.findMany({
    where: {
      machineryId: m.id,
      status: { in: activeStatuses },
      OR: [
        { holdExpiresAt: null },
        { holdExpiresAt: { gt: new Date() } },
        { status: { not: 'PENDING_PAYMENT' } },
      ],
    },
    select: { scheduledAt: true, endsAt: true },
  });
  res.json({ ...publicMachine(m), reserved });
});
router.get('/operators', async (req, res) =>
  res.json(
    await prisma.operator.findMany({
      where: { active: true, verificationStatus: 'VERIFIED' },
      select: { id: true, name: true, skills: true, certification: true, hourlyRate: true },
    }),
  ),
);
router.get('/tutorials', async (req, res) =>
  res.json(await prisma.tutorial.findMany({ where: { published: true } })),
);
router.use(requireAuth());
router.get('/bookings', async (req, res) =>
  res.json(
    (
      await prisma.booking.findMany({
        where: scope(req.user),
        include: booking.include,
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    ).map(booking.response),
  ),
);
router.get('/rides', async (req, res) =>
  res.json(
    (
      await prisma.booking.findMany({
        where: {
          ...scope(req.user),
          status: {
            in: [
              'ASSIGNED',
              'PICKUP_INSPECTION',
              'IN_TRANSIT',
              'DELIVERED',
              'IN_PROGRESS',
              'RETURN_INSPECTION',
            ],
          },
        },
        include: booking.include,
      })
    ).map(booking.response),
  ),
);
router.post('/bookings/quote', requireAuth(['FARMER', 'ADMIN']), async (req, res) => {
  const i = z
    .object({
      machineryId: text(100),
      durationHours: z.number().int().min(1).max(48),
      operatorId: text(100).optional(),
    })
    .parse(req.body);
  const m = await prisma.machinery.findFirst({ where: { id: i.machineryId, ...visible } });
  if (!m) fail(404, 'Machine not available');
  res.json(await booking.makeQuote(prisma, m, i.durationHours, i.operatorId));
});
router.post('/bookings', requireAuth(['FARMER', 'ADMIN']), async (req, res) =>
  res.status(201).json(booking.response(await booking.create(req.user, schemas.booking.parse(req.body)))),
);
router.get('/bookings/:id', async (req, res) =>
  res.json(booking.response(await booking.get(prisma, req.params.id, req.user))),
);
router.patch('/bookings/:id/status', async (req, res) => {
  const i = z
    .object({
      status: text(40),
      note: z.string().max(1000).default(''),
      code: z.string().max(10).default(''),
    })
    .parse(req.body);
  res.json(booking.response(await booking.transition(req.user, req.params.id, i.status, i.note, i.code)));
});
router.post('/bookings/:id/reschedule', requireAuth(['FARMER', 'ADMIN']), async (req, res) => {
  const i = z.object({ scheduledAt: date }).parse(req.body);
  const b = await booking.serial(async (tx) => {
    const b = await booking.get(tx, req.params.id, req.user);
    if (!['REQUESTED', 'PENDING_PAYMENT'].includes(b.status))
      fail(409, 'Paid bookings require support to reschedule');
    if (b.transactions.some((t) => t.status === 'PENDING'))
      fail(409, 'Resolve pending payment before rescheduling');
    const start = new Date(i.scheduledAt),
      end = new Date(+start + b.durationHours * 3600000);
    if (start < new Date()) fail(400, 'Choose a future date');
    await booking.available(tx, b.machineryId, start, end, b.id);
    if (
      b.operatorId &&
      (await tx.booking.count({
        where: {
          id: { not: b.id },
          operatorId: b.operatorId,
          status: { in: activeStatuses },
          scheduledAt: { lt: end },
          endsAt: { gt: start },
        },
      }))
    )
      fail(409, 'Operator is already booked at this time');
    return booking.record(tx, b, req.user, 'REQUESTED', 'Rescheduled; owner approval required', {
      scheduledAt: start,
      endsAt: end,
      holdExpiresAt: null,
    });
  });
  res.json(booking.response(b));
});
router.get('/bookings/:id/cancellation', async (req, res) =>
  res.json(cancellation(await booking.get(prisma, req.params.id, req.user))),
);
router.post('/bookings/:id/handover-code', requireAuth(['FARMER']), async (req, res) => {
  const b = await booking.get(prisma, req.params.id, req.user);
  if (b.status !== 'IN_TRANSIT') fail(409, 'Generate the code when the driver is on the way');
  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.booking.update({ where: { id: b.id }, data: { handoverCodeHash: digest(code) } });
  res.json({ code });
});
router.post('/bookings/:id/inspections', async (req, res) => {
  const i = schemas.inspection.parse(req.body);
  const result = await booking.serial(async (tx) => {
    const b = await booking.get(tx, req.params.id, req.user);
    const allowed = {
      PICKUP: ['PICKUP_INSPECTION', 'DRIVER'],
      DELIVERY: ['DELIVERED', 'FARMER'],
      RETURN: ['RETURN_INSPECTION', 'OWNER'],
    }[i.stage];
    if (b.status !== allowed[0] || (req.user.role !== allowed[1] && req.user.role !== 'ADMIN'))
      fail(409, 'Inspection is not available at this stage');
    const documents = await tx.document.findMany({
      where: { id: { in: i.media }, userId: req.user.id, kind: 'INSPECTION' },
    });
    if (documents.length !== i.media.length) fail(400, 'Upload your inspection photographs first');
    const inspection = await tx.inspection.create({ data: { ...i, actorId: req.user.id, bookingId: b.id } });
    await booking.record(tx, b, req.user, b.status, `${i.stage} inspection recorded`);
    return inspection;
  });
  res.status(201).json(result);
});
router.post('/bookings/:id/reviews', requireAuth(['FARMER']), async (req, res) => {
  const b = await booking.get(prisma, req.params.id, req.user);
  if (b.status !== 'COMPLETED') fail(409, 'Reviews are available after completion');
  res.status(201).json(
    await prisma.review.create({
      data: { ...schemas.review.parse(req.body), bookingId: b.id, reviewerId: req.user.id },
    }),
  );
});
router.get('/bookings/:id/receipt', async (req, res) => {
  const b = await booking.get(prisma, req.params.id, req.user);
  res.json({
    receiptNumber: `FQ-${b.id}`,
    issuedAt: new Date(),
    machine: b.machinery.name,
    farmer: b.farmer.fullName,
    quote: b.quote,
    transactions: b.transactions,
    agreement: b.agreementVersion,
    status: b.status,
    note: 'Payment receipt. Not a GST tax invoice. Sandbox payments do not transfer money.',
  });
});
router.get('/driver/deliveries', requireAuth(['DRIVER', 'ADMIN']), async (req, res) => {
  const jobs = await prisma.booking.findMany({
    where: {
      OR: [
        { driverId: req.user.id, status: { in: activeStatuses } },
        { status: 'PAID', driverId: null },
      ],
    },
    include: booking.include,
    take: 100,
  });
  res.json(
    jobs.map((b) =>
      b.driverId === req.user.id || req.user.role === 'ADMIN'
        ? booking.response(b)
        : {
            id: b.id,
            status: b.status,
            scheduledAt: b.scheduledAt,
            machinery: { name: b.machinery.name, location: b.machinery.location },
            area: 'Pickup available',
            deliveryFee: b.deliveryFee,
          },
    ),
  );
});
router.post('/driver/deliveries/:id/accept', requireAuth(['DRIVER']), async (req, res) => {
  if (req.user.verificationStatus !== 'VERIFIED' || !req.user.onDuty)
    fail(403, 'Verification and on-duty status are required');
  const b = await booking.serial(async (tx) => {
    const b = await tx.booking.findUnique({ where: { id: req.params.id }, include: booking.include });
    if (!b || b.status !== 'PAID' || b.driverId) fail(409, 'Delivery is no longer available');
    if (
      await tx.booking.count({
        where: {
          driverId: req.user.id,
          status: { in: ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT', 'DELIVERED', 'RETURN_INSPECTION'] },
        },
      })
    )
      fail(409, 'Finish your current delivery first');
    return booking.record(tx, b, req.user, 'ASSIGNED', 'Driver accepted delivery', { driverId: req.user.id });
  });
  res.json(booking.response(b));
});
router.patch('/drivers/location', requireAuth(['DRIVER']), async (req, res) => {
  const i = z.object({ latitude: lat, longitude: lng }).parse(req.body);
  await prisma.user.update({ where: { id: req.user.id }, data: { ...i, locationUpdatedAt: new Date() } });
  res.json({ ok: true });
});
router.get('/owner/machinery', owner, async (req, res) =>
  res.json(
    await prisma.machinery.findMany({
      where: req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id },
      include: { availability: true, serviceRecords: true },
    }),
  ),
);
router.post('/owner/machinery', requireAuth(['OWNER']), async (req, res) => {
  const m = await prisma.machinery.create({
    data: { ...schemas.machine.parse(req.body), id: crypto.randomUUID(), ownerId: req.user.id },
  });
  await audit(req.user, 'MACHINE_CREATED', m.id);
  res.status(201).json(m);
});
async function ownMachine(req) {
  const m = await prisma.machinery.findUnique({ where: { id: req.params.id } });
  if (!m || (req.user.role !== 'ADMIN' && m.ownerId !== req.user.id)) fail(404, 'Machine not found');
  return m;
}
router.patch('/owner/machinery/:id', owner, async (req, res) => {
  await ownMachine(req);
  const data = schemas.machine
    .partial()
    .extend({ status: z.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']).optional() })
    .parse(req.body);
  res.json(
    await prisma.machinery.update({
      where: { id: req.params.id },
      data: { ...data, verificationStatus: 'PENDING' },
    }),
  );
  await audit(req.user, 'MACHINE_UPDATED', req.params.id);
});
router.post('/owner/machinery/:id/availability', owner, async (req, res) => {
  await ownMachine(req);
  const i = z.object({ startsAt: date, endsAt: date, reason: text(200) }).parse(req.body);
  if (new Date(i.endsAt) <= new Date(i.startsAt)) fail(400, 'End must follow start');
  const result = await booking.serial(async (tx) => {
    await booking.available(tx, req.params.id, new Date(i.startsAt), new Date(i.endsAt));
    return tx.availability.create({ data: { ...i, machineryId: req.params.id } });
  });
  res.status(201).json(result);
});
router.delete('/owner/machinery/:id/availability/:blockId', owner, async (req, res) => {
  await ownMachine(req);
  await prisma.availability.deleteMany({ where: { id: req.params.blockId, machineryId: req.params.id } });
  res.json({ ok: true });
});
router.post('/owner/machinery/:id/service', owner, async (req, res) => {
  await ownMachine(req);
  res.status(201).json(
    await prisma.serviceRecord.create({
      data: {
        ...z.object({ performedAt: date, notes: text(2000), nextServiceAt: date.optional() }).parse(req.body),
        machineryId: req.params.id,
      },
    }),
  );
});
router.get('/addresses', async (req, res) =>
  res.json(await prisma.address.findMany({ where: { userId: req.user.id } })),
);
router.post('/addresses', async (req, res) =>
  res
    .status(201)
    .json(await prisma.address.create({ data: { ...schemas.address.parse(req.body), userId: req.user.id } })),
);
router.delete('/addresses/:id', async (req, res) => {
  await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
});
router.get('/favourites', async (req, res) =>
  res.json(await prisma.favourite.findMany({ where: { userId: req.user.id }, include: { machinery: true } })),
);
router.put('/favourites/:id', async (req, res) =>
  res.json(
    await prisma.favourite.upsert({
      where: { userId_machineryId: { userId: req.user.id, machineryId: req.params.id } },
      create: { userId: req.user.id, machineryId: req.params.id },
      update: {},
    }),
  ),
);
router.delete('/favourites/:id', async (req, res) => {
  await prisma.favourite.deleteMany({ where: { userId: req.user.id, machineryId: req.params.id } });
  res.json({ ok: true });
});
router.get('/notifications', async (req, res) =>
  res.json(
    await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ),
);
router.patch('/notifications/:id', async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { readAt: new Date() },
  });
  res.json({ ok: true });
});
router.get('/tickets', async (req, res) =>
  res.json(
    await prisma.supportTicket.findMany({
      where: req.user.role === 'ADMIN' ? {} : { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ),
);
router.post('/tickets', async (req, res) => {
  const i = z
    .object({
      bookingId: z.string().uuid().optional(),
      category: z.enum(['HELP', 'DAMAGE', 'BREAKDOWN', 'PAYMENT', 'EMERGENCY']),
      message: text(3000),
    })
    .parse(req.body);
  if (i.bookingId) await booking.get(prisma, i.bookingId, req.user);
  res.status(201).json(await prisma.supportTicket.create({ data: { ...i, userId: req.user.id } }));
});
const uploadDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
router.post('/documents', upload.single('file'), async (req, res) => {
  const kind = z.enum(['IDENTITY', 'LICENCE', 'OWNERSHIP', 'INSPECTION']).parse(req.body.kind);
  const f = req.file;
  if (!f) fail(400, 'Choose a file');
  const bytes = f.buffer;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const pdf = bytes.subarray(0, 5).toString() === '%PDF-';
  if (!(png || jpg || (pdf && kind !== 'INSPECTION')))
    fail(400, 'Use a JPEG, PNG or PDF; inspection evidence must be a photograph');
  const storageKey = crypto.randomUUID() + (png ? '.png' : jpg ? '.jpg' : '.pdf');
  fs.writeFileSync(path.join(uploadDir, storageKey), bytes, { flag: 'wx' });
  res.status(201).json(
    await prisma.document.create({
      data: {
        userId: req.user.id,
        kind,
        filename: path.basename(f.originalname).slice(0, 150),
        storageKey,
      },
    }),
  );
});
router.get('/documents', async (req, res) =>
  res.json(
    await prisma.document.findMany({
      where: req.user.role === 'ADMIN' ? {} : { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ),
);
router.get('/documents/:id', async (req, res) => {
  const d = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!d) fail(404, 'File not found');
  if (d.userId !== req.user.id && req.user.role !== 'ADMIN') {
    const inspections = await prisma.inspection.findMany({
      where: { media: { array_contains: [d.id] } },
      include: { booking: { include: { machinery: true } } },
    });
    if (!inspections.some((i) => require('../domain').canAccess(req.user, i.booking)))
      fail(404, 'File not found');
  }
  res.set('Cache-Control', 'no-store');
  res.download(path.join(uploadDir, d.storageKey), d.filename);
});
router.get('/progress', async (req, res) =>
  res.json(await prisma.tutorialProgress.findMany({ where: { userId: req.user.id } })),
);
router.put('/tutorials/:id/progress', async (req, res) => {
  const { completedSteps } = z.object({ completedSteps: z.number().int().min(0).max(100) }).parse(req.body);
  const t = await prisma.tutorial.findFirst({ where: { id: req.params.id, published: true } });
  if (!t) fail(404, 'Tutorial not found');
  if (completedSteps > t.steps.length) fail(400, 'Invalid step count');
  const data = { completedSteps, completedAt: completedSteps === t.steps.length ? new Date() : null };
  res.json(
    await prisma.tutorialProgress.upsert({
      where: { userId_tutorialId: { userId: req.user.id, tutorialId: t.id } },
      create: { userId: req.user.id, tutorialId: t.id, ...data },
      update: data,
    }),
  );
});
router.get('/groups', async (req, res) =>
  res.json(
    (
      await prisma.groupRequest.findMany({
        include: { members: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    ).map((g) => ({
      ...g,
      members: undefined,
      memberCount: g.members.length,
      totalAcres: g.members.reduce((n, m) => n + m.acres, 0),
      joined: g.members.some((m) => m.userId === req.user.id),
      myAcres: g.members.find((m) => m.userId === req.user.id)?.acres || 0,
    })),
  ),
);
router.post('/groups', requireAuth(['FARMER']), async (req, res) => {
  const i = z
    .object({
      title: text(150),
      village: text(150),
      category: text(40),
      scheduledAt: date,
      acres: z.number().positive().max(1000),
    })
    .parse(req.body);
  if (new Date(i.scheduledAt) < new Date()) fail(400, 'Choose a future date');
  const { acres, ...data } = i;
  res.status(201).json(
    await prisma.groupRequest.create({
      data: { ...data, organiserId: req.user.id, members: { create: { userId: req.user.id, acres } } },
    }),
  );
});
router.put('/groups/:id/join', requireAuth(['FARMER']), async (req, res) => {
  const { acres } = z.object({ acres: z.number().positive().max(1000) }).parse(req.body);
  const g = await prisma.groupRequest.findUnique({ where: { id: req.params.id } });
  if (!g || g.status !== 'OPEN' || g.scheduledAt < new Date()) fail(409, 'Group is no longer open');
  res.json(
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: g.id, userId: req.user.id } },
      create: { groupId: g.id, userId: req.user.id, acres },
      update: { acres },
    }),
  );
});
router.delete('/groups/:id/join', requireAuth(['FARMER']), async (req, res) => {
  await prisma.groupMember.deleteMany({ where: { groupId: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
});
router.get('/analytics', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: scope(req.user),
    include: { machinery: true, transactions: true },
  });
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const money = (kind) =>
    bookings
      .flatMap((b) => b.transactions)
      .filter((t) => t.kind === kind && t.status === 'PAID')
      .reduce((n, t) => n + Number(t.amount), 0);
  const fleet =
    req.user.role === 'OWNER' ? await prisma.machinery.count({ where: { ownerId: req.user.id } }) : 0;
  const hours = completed.reduce((n, b) => n + b.durationHours, 0);
  const demand = {};
  for (const b of bookings) {
    const key = b.machinery.category;
    demand[key] = (demand[key] || 0) + 1;
  }
  res.json({
    bookings: bookings.length,
    active: bookings.filter((b) => activeStatuses.includes(b.status)).length,
    completed: completed.length,
    received: money('ADVANCE') + money('BALANCE'),
    ownerEarnings: completed.reduce((n, b) => n + Number(b.quote.ownerEarnings || 0), 0),
    commission: completed.reduce((n, b) => n + Number(b.quote.commission || 0), 0),
    fleet,
    rentedHours: hours,
    demand,
    note: 'Earnings are calculated from completed bookings. Payouts require provider reconciliation.',
  });
});
router.get('/admin/users', admin, async (req, res) =>
  res.json(
    await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        accountId: true,
        phone: true,
        role: true,
        verificationStatus: true,
        active: true,
      },
      take: 200,
    }),
  ),
);
router.patch('/admin/users/:id', admin, async (req, res) => {
  const data = z
    .object({
      verificationStatus: z.enum(['VERIFIED', 'REJECTED', 'PENDING']).optional(),
      active: z.boolean().optional(),
    })
    .parse(req.body);
  if (req.params.id === req.user.id && data.active === false)
    fail(400, 'Cannot suspend your own administrator account');
  const u = await prisma.user.update({
    where: { id: req.params.id },
    data: { ...data, sessionVersion: { increment: 1 } },
  });
  await audit(req.user, 'USER_REVIEW', u.id, data);
  res.json({ id: u.id, verificationStatus: u.verificationStatus, active: u.active });
});
router.patch('/admin/machinery/:id', admin, async (req, res) => {
  const data = z
    .object({
      verificationStatus: z.enum(['VERIFIED', 'REJECTED', 'PENDING']),
      status: z.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']).optional(),
    })
    .parse(req.body);
  res.json(await prisma.machinery.update({ where: { id: req.params.id }, data }));
  await audit(req.user, 'MACHINE_REVIEW', req.params.id, data);
});
router.patch('/admin/documents/:id', admin, async (req, res) => {
  const data = z.object({ status: z.enum(['VERIFIED', 'REJECTED']) }).parse(req.body);
  res.json(await prisma.document.update({ where: { id: req.params.id }, data }));
  await audit(req.user, 'DOCUMENT_REVIEW', req.params.id, data);
});
router.patch('/admin/tickets/:id', admin, async (req, res) => {
  const data = z
    .object({ status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED']), resolution: text(3000) })
    .parse(req.body);
  const ticket = await prisma.supportTicket.update({ where: { id: req.params.id }, data });
  await prisma.notification.create({
    data: { userId: ticket.userId, message: `Support: ${data.resolution}` },
  });
  await audit(req.user, 'TICKET_UPDATED', ticket.id, data);
  res.json(ticket);
});
router.get('/admin/audit', admin, async (req, res) =>
  res.json(await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })),
);
router.get('/admin/reviews', admin, async (req, res) =>
  res.json(await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })),
);
router.patch('/admin/reviews/:id', admin, async (req, res) => {
  const data = z.object({ hidden: z.boolean() }).parse(req.body);
  res.json(await prisma.review.update({ where: { id: req.params.id }, data }));
  await audit(req.user, 'REVIEW_MODERATED', req.params.id, data);
});
router.put('/admin/settings', admin, async (req, res) => {
  const i = z.object({ commission: z.number().min(0).max(0.3) }).parse(req.body);
  res.json(
    await prisma.setting.upsert({
      where: { key: 'commission' },
      create: { key: 'commission', value: i.commission },
      update: { value: i.commission },
    }),
  );
  await audit(req.user, 'COMMISSION_UPDATED', 'commission', i);
});
router.post('/admin/operators', admin, async (req, res) => {
  res.status(201).json(
    await prisma.operator.create({
      data: z
        .object({
          name: text(100),
          phone: text(20),
          skills: z.array(text(40)).min(1),
          certification: text(),
          hourlyRate: z.number().positive(),
          verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
        })
        .parse(req.body),
    }),
  );
});
router.get('/admin/tutorials', admin, async (req, res) => res.json(await prisma.tutorial.findMany()));
const tutorialSchema = z.object({
  title: text(200),
  category: text(40),
  language: z.enum(['en', 'ta', 'hi']),
  summary: text(2000),
  steps: z.array(text(1000)).min(1).max(30),
  videoUrl: url.nullable().optional(),
  audioUrl: url.nullable().optional(),
  captionsUrl: url.nullable().optional(),
  sourceUrl: url,
  published: z.boolean(),
});
router.post('/admin/tutorials', admin, async (req, res) =>
  res.status(201).json(await prisma.tutorial.create({ data: tutorialSchema.parse(req.body) })),
);
router.patch('/admin/tutorials/:id', admin, async (req, res) =>
  res.json(
    await prisma.tutorial.update({
      where: { id: req.params.id },
      data: tutorialSchema.partial().parse(req.body),
    }),
  ),
);
router.post('/admin/bookings/:id/assign', admin, async (req, res) => {
  const { driverId, note } = z.object({ driverId: z.string().uuid(), note: text(1000) }).parse(req.body);
  const b = await booking.serial(async (tx) => {
    const b = await booking.get(tx, req.params.id, req.user);
    if (!['PAID', 'ASSIGNED'].includes(b.status)) fail(409, 'Assignment is unavailable at this stage');
    const driver = await tx.user.findFirst({
      where: { id: driverId, role: 'DRIVER', active: true, onDuty: true, verificationStatus: 'VERIFIED' },
    });
    if (!driver) fail(400, 'Choose a verified on-duty driver');
    if (
      await tx.booking.count({
        where: {
          driverId,
          status: { in: ['ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT', 'DELIVERED', 'RETURN_INSPECTION'] },
          id: { not: b.id },
        },
      })
    )
      fail(409, 'Driver is busy');
    return booking.record(tx, b, req.user, 'ASSIGNED', note, { driverId });
  });
  res.json(booking.response(b));
});
router.post('/admin/bookings/:id/replace', admin, async (req, res) => {
  const { machineryId, note } = z.object({ machineryId: text(100), note: text(1000) }).parse(req.body);
  const b = await booking.serial(async (tx) => {
    const b = await booking.get(tx, req.params.id, req.user);
    if (
      !['PAID', 'ASSIGNED', 'PICKUP_INSPECTION', 'IN_TRANSIT', 'DELIVERED', 'IN_PROGRESS'].includes(b.status)
    )
      fail(409, 'Replacement unavailable');
    const machine = await tx.machinery.findFirst({
      where: { id: machineryId, ...visible, category: b.machinery.category },
    });
    if (!machine || machine.ownerId !== b.machinery.ownerId)
      fail(
        409,
        'Choose an available equivalent from the same owner; other owners require payment reconciliation',
      );
    if (machine.id === b.machineryId) fail(409, 'Choose a different replacement machine');
    await booking.available(tx, machine.id, b.scheduledAt, b.endsAt, b.id);
    await tx.machinery.update({ where: { id: b.machineryId }, data: { status: 'MAINTENANCE' } });
    for (const inspection of b.inspections.filter((i) =>
      ['PICKUP', 'DELIVERY', 'RETURN'].includes(i.stage),
    )) {
      await tx.inspection.update({
        where: { id: inspection.id },
        data: {
          stage: `ARCHIVED_${inspection.stage}_${inspection.id}`,
          notes: `Original machine ${b.machineryId}; retained after replacement. ${inspection.notes}`,
        },
      });
    }
    return booking.record(
      tx,
      b,
      req.user,
      'PAID',
      `Replacement: ${note}. Original customer quote retained.`,
      { machineryId: machine.id, driverId: null, handoverCodeHash: null },
    );
  });
  res.json(booking.response(b));
});
module.exports = router;

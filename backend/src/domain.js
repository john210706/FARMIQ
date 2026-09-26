const crypto = require('node:crypto');
const { z } = require('zod');
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const activeStatuses = [
  'REQUESTED',
  'PENDING_PAYMENT',
  'PAID',
  'ASSIGNED',
  'PICKUP_INSPECTION',
  'IN_TRANSIT',
  'DELIVERED',
  'IN_PROGRESS',
  'RETURN_INSPECTION',
  'RETURN_IN_TRANSIT',
  'RETURNED',
  'DISPUTED',
];
const transitions = {
  REQUESTED: { PENDING_PAYMENT: ['OWNER'], REJECTED: ['OWNER'], CANCELLED: ['FARMER'] },
  PENDING_PAYMENT: { CANCELLED: ['FARMER', 'OWNER'] },
  PAID: { CANCELLED: ['FARMER', 'OWNER'] },
  ASSIGNED: { PICKUP_INSPECTION: ['DRIVER'], CANCELLED: ['FARMER', 'OWNER'] },
  PICKUP_INSPECTION: { IN_TRANSIT: ['DRIVER'] },
  IN_TRANSIT: { DELIVERED: ['DRIVER'] },
  DELIVERED: { IN_PROGRESS: ['FARMER'] },
  IN_PROGRESS: { RETURN_INSPECTION: ['FARMER'] },
  RETURN_INSPECTION: { RETURN_IN_TRANSIT: ['DRIVER'] },
  RETURN_IN_TRANSIT: { RETURNED: ['DRIVER'] },
  RETURNED: { COMPLETED: ['OWNER'] },
};
function canAccess(user, booking) {
  return (
    user.role === 'ADMIN' ||
    (user.role === 'FARMER' && booking.farmerId === user.id) ||
    (user.role === 'OWNER' && booking.machinery.ownerId === user.id) ||
    (user.role === 'DRIVER' && booking.driverId === user.id)
  );
}
function scope(user) {
  if (user.role === 'ADMIN') return {};
  if (user.role === 'OWNER') return { machinery: { ownerId: user.id } };
  return user.role === 'DRIVER' ? { driverId: user.id } : { farmerId: user.id };
}
function authorizeTransition(user, booking, next) {
  if (!canAccess(user, booking)) fail(404, 'Booking not found');
  const roles = transitions[booking.status]?.[next];
  if (!roles || (user.role !== 'ADMIN' && !roles.includes(user.role)))
    fail(409, 'This booking cannot move to that stage');
}
function quote(machine, hours, operatorRate = 0, commissionRate = 0.12) {
  const round = (n) => Math.round(n * 100) / 100;
  const hourly = Number(machine.pricePerHour) * hours;
  const days = Math.floor(hours / 8),
    extra = hours % 8;
  const daily = machine.pricePerDay
    ? Number(machine.pricePerDay) * days +
      Math.min(extra * Number(machine.pricePerHour), Number(machine.pricePerDay))
    : hourly;
  const rental = round(Math.min(hourly, daily));
  const operator = round(operatorRate * hours),
    delivery = 600;
  const total = round(rental + operator + delivery);
  const advance = round(total / 2),
    commission = round(rental * commissionRate);
  return {
    rental,
    operator,
    delivery,
    total,
    advance,
    balance: round(total - advance),
    commission,
    ownerEarnings: round(rental - commission),
    deposit: Number(machine.deposit || 0),
    currency: 'INR',
    tax: 0,
    taxNote: 'Prototype receipt; not a GST tax invoice',
    version: '2026-09-v1',
  };
}
function cancellation(booking, now = new Date()) {
  const paid = (booking.transactions || [])
    .filter((t) => t.status === 'PAID' && ['ADVANCE', 'BALANCE'].includes(t.kind))
    .reduce((n, t) => n + Number(t.amount), 0);
  const fee =
    paid && new Date(booking.scheduledAt) - now < 24 * 3600000
      ? Math.round(Number(booking.totalAmount) * 0.1 * 100) / 100
      : 0;
  return { fee: Math.min(paid, fee), refund: Math.max(0, paid - fee) };
}
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const text = (max = 500) => z.string().trim().min(1).max(max);
const lat = z.number().min(-90).max(90),
  lng = z.number().min(-180).max(180);
const date = z.string().datetime({ offset: true });
const url = z
  .string()
  .url()
  .refine((v) => v.startsWith('https://'), 'Use an HTTPS URL');
const schemas = {
  register: z.object({
    fullName: text(100),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/),
    password: z.string().min(10).max(100),
    role: z.enum(['FARMER', 'OWNER', 'DRIVER']),
    language: z.enum(['en', 'ta', 'hi']).default('en'),
  }),
  booking: z.object({
    machineryId: text(100),
    scheduledAt: date,
    durationHours: z.number().int().min(1).max(48),
    farmAddress: text(),
    farmLat: lat,
    farmLng: lng,
    operatorId: text(100).optional(),
    agreementAccepted: z.literal(true),
    requestKey: z.string().uuid(),
    farmerId: z.string().uuid().optional(),
    assistedConsent: z.literal(true).optional(),
  }),
  machine: z.object({
    name: text(150),
    brand: text(80),
    category: z.enum(['TRACTOR', 'HARVESTER', 'TILLAGE', 'SPRAYER', 'TRANSPLANTER', 'THRESHER', 'BALER']),
    description: text(2000),
    pricePerHour: z.number().positive().max(100000),
    pricePerDay: z.number().positive().max(1000000).nullable().optional(),
    horsepower: z.number().int().min(0).max(1500).optional(),
    fuelType: text(80).optional(),
    imageUrl: url,
    media: z.array(url).max(8).default([]),
    operatorAvailable: z.boolean().default(false),
    latitude: lat,
    longitude: lng,
    location: text(),
    deliveryRadiusKm: z.number().min(1).max(300).default(30),
    deposit: z.number().min(0).max(1000000).default(0),
    fuelLitresPerHour: z.number().min(0).max(100).default(0),
    acresPerHour: z.number().positive().max(50).default(1),
  }),
  address: z.object({ label: text(50), address: text(), latitude: lat, longitude: lng }),
  inspection: z.object({
    stage: z.enum(['PICKUP', 'DELIVERY', 'RETURN']),
    notes: text(2000),
    checklist: z.object({
      condition: z.literal(true),
      safety: z.literal(true),
      accessories: z.literal(true),
    }),
    media: z.array(text(100)).min(1).max(5),
  }),
  review: z.object({
    rating: z.number().int().min(1).max(5),
    condition: z.number().int().min(1).max(5),
    reliability: z.number().int().min(1).max(5),
    handling: z.number().int().min(1).max(5),
    comment: text(1500),
  }),
};
module.exports = {
  fail,
  activeStatuses,
  transitions,
  canAccess,
  scope,
  authorizeTransition,
  quote,
  cancellation,
  digest,
  schemas,
  z,
  text,
  date,
  lat,
  lng,
  url,
};

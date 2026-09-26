const { prisma } = require('../config');
const booking = require('./booking');
const { calculateDistance } = require('../utils/geo');
const busyStatuses = [
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
const defaults = { enabled: true, radiusKm: 30, horizonHours: 24 };
async function run(actor) {
  const setting = await prisma.setting.findUnique({ where: { key: 'dispatch' } });
  const options = { ...defaults, ...setting?.value };
  if (!options.enabled) return { assigned: [], enabled: false };
  const pending = await prisma.booking.findMany({
    where: {
      status: 'PAID',
      driverId: null,
      scheduledAt: { gte: new Date(), lte: new Date(Date.now() + options.horizonHours * 3600000) },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 50,
    select: { id: true },
  });
  const assigned = [];
  for (const item of pending) {
    const result = await booking.serial(async (tx) => {
      const b = await tx.booking.findUnique({ where: { id: item.id }, include: booking.include });
      if (
        !b ||
        b.status !== 'PAID' ||
        b.driverId ||
        b.machinery.latitude == null ||
        b.machinery.longitude == null
      )
        return null;
      if (
        !b.machinery.owner.active ||
        b.machinery.status !== 'AVAILABLE' ||
        b.machinery.verificationStatus !== 'VERIFIED'
      )
        return null;
      const drivers = await tx.user.findMany({
        where: {
          role: 'DRIVER',
          active: true,
          onDuty: true,
          verificationStatus: 'VERIFIED',
          locationUpdatedAt: { gte: new Date(Date.now() - 300000) },
          latitude: { not: null },
          longitude: { not: null },
        },
      });
      const busy = await tx.booking.findMany({
        where: { driverId: { in: drivers.map((d) => d.id) }, status: { in: busyStatuses } },
        select: { driverId: true },
      });
      const occupied = new Set(busy.map((b) => b.driverId));
      const candidates = drivers
        .filter((d) => !occupied.has(d.id))
        .map((d) => ({
          ...d,
          distance: calculateDistance(d.latitude, d.longitude, b.machinery.latitude, b.machinery.longitude),
        }))
        .filter((d) => d.distance <= options.radiusKm)
        .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
      if (!candidates.length) return null;
      const driver = candidates[0];
      await booking.record(
        tx,
        b,
        actor,
        'ASSIGNED',
        `Nearest eligible driver: ${driver.distance.toFixed(1)} km from owner pickup; selected from ${candidates.length} available candidate${candidates.length === 1 ? '' : 's'}`,
        { driverId: driver.id },
      );
      return { bookingId: b.id, driverId: driver.id, distanceKm: Math.round(driver.distance * 10) / 10 };
    });
    if (result) assigned.push(result);
  }
  return { assigned, enabled: true };
}
async function trigger() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', active: true },
    orderBy: { id: 'asc' },
  });
  return admin ? run(admin) : { assigned: [], enabled: false };
}
module.exports = { run, trigger, defaults };

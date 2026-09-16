const express = require("express");
const router = express.Router();
const { prisma, BookingStatus, MachineryStatus, PaymentStatus, Role } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { calculateDistance, parseCoordinate, parsePositiveInteger } = require("../utils/geo");
const { bookingResponse } = require("../utils/formatters");

/** POST /api/bookings — farmer creates a booking */
router.post("/bookings", requireAuth([Role.FARMER]), async (req, res, next) => {
  try {
    const machineryId = String(req.body.machineryId || "").trim();
    const farmerAccountId = req.user.accountId;
    const durationHours = parsePositiveInteger(req.body.durationHours, "durationHours", 48);
    const farmLat = parseCoordinate(req.body.farmLat, "farmLat", -90, 90);
    const farmLng = parseCoordinate(req.body.farmLng, "farmLng", -180, 180);
    const scheduledAt = new Date(req.body.scheduledAt || Date.now());

    if (!machineryId) return res.status(400).json({ error: "machineryId is required" });
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
      return res.status(400).json({ error: "scheduledAt must be a valid future date" });
    }

    const [farmer, machine, drivers] = await Promise.all([
      prisma.user.findUnique({ where: { accountId: farmerAccountId } }),
      prisma.machinery.findUnique({ where: { id: machineryId } }),
      prisma.user.findMany({ where: { role: Role.DRIVER, active: true, verificationStatus: "VERIFIED" } }),
    ]);

    if (!farmer || farmer.role !== Role.FARMER)
      return res.status(404).json({ error: "Farmer account not found" });
    if (!machine || machine.status !== MachineryStatus.AVAILABLE)
      return res.status(409).json({ error: "Machinery is not available" });

    const requestedEnd = new Date(scheduledAt.getTime() + durationHours * 60 * 60 * 1000);
    const possibleConflicts = await prisma.booking.findMany({
      where: {
        machineryId,
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
        scheduledAt: { lt: requestedEnd },
      },
      select: { scheduledAt: true, durationHours: true },
    });
    const overlaps = possibleConflicts.some((booking) => {
      const existingEnd = new Date(
        booking.scheduledAt.getTime() + booking.durationHours * 60 * 60 * 1000
      );
      return existingEnd > scheduledAt;
    });
    if (overlaps) return res.status(409).json({ error: "Machinery is already booked for that time" });

    const closestDriver =
      drivers
        .filter((driver) => driver.latitude != null && driver.longitude != null)
        .map((driver) => ({
          driver,
          distance: calculateDistance(farmLat, farmLng, driver.latitude, driver.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)[0]?.driver || null;

    const operatorFee = req.body.includeOperator ? 180 * durationHours : 0;
    const deliveryFee = 600;
    const discount = 500;
    const totalAmount = Math.max(
      Number(machine.pricePerHour) * durationHours + operatorFee + deliveryFee - discount,
      0
    );
    const advanceAmount = Math.round(totalAmount * 0.5);
    const paymentMethod = ["upi", "card", "cash"].includes(req.body.paymentMethod)
      ? req.body.paymentMethod
      : "upi";

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          scheduledAt,
          durationHours,
          totalAmount,
          advanceAmount,
          deliveryFee,
          operatorFee,
          farmAddress: String(req.body.farmAddress || "").trim() || null,
          farmLat,
          farmLng,
          farmerId: farmer.id,
          machineryId: machine.id,
          driverId: closestDriver?.id || null,
          status: closestDriver ? BookingStatus.ASSIGNED : BookingStatus.PENDING_PAYMENT,
          payment: {
            create: {
              amount: advanceAmount,
              method: paymentMethod,
              status: PaymentStatus.PAID,
              providerReference: `DEMO-${Date.now()}`,
              paidAt: new Date(),
            },
          },
        },
      });
      await tx.machinery.update({
        where: { id: machine.id },
        data: { status: MachineryStatus.BOOKED },
      });
      return created;
    });

    const result = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { farmer: true, driver: true, machinery: true, payment: true },
    });
    res.status(201).json(bookingResponse(result));
  } catch (error) {
    next(error);
  }
});

/** GET /api/rides — active ride list for live tracking */
router.get("/rides", async (req, res, next) => {
  try {
    const status = req.query.status;
    const allowedStatuses = Object.values(BookingStatus);
    const where =
      status && allowedStatuses.includes(status)
        ? { status }
        : {
            status: {
              in: [
                BookingStatus.ASSIGNED,
                BookingStatus.IN_TRANSIT,
                BookingStatus.DELIVERED,
                BookingStatus.IN_PROGRESS,
              ],
            },
          };
    const rides = await prisma.booking.findMany({
      where,
      include: { farmer: true, driver: true, machinery: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(rides.map(bookingResponse));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

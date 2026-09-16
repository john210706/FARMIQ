const express = require("express");
const router = express.Router();
const { prisma, BookingStatus, Role } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { parseCoordinate } = require("../utils/geo");
const { publicUser, bookingResponse } = require("../utils/formatters");

/** GET /api/driver/deliveries — driver sees all active bookings */
router.get("/driver/deliveries", async (req, res, next) => {
  try {
    const deliveries = await prisma.booking.findMany({
      where: {
        status: {
          in: [
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.ASSIGNED,
            BookingStatus.IN_TRANSIT,
            BookingStatus.DELIVERED,
            BookingStatus.IN_PROGRESS,
          ],
        },
      },
      include: { farmer: true, driver: true, machinery: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(deliveries.map(bookingResponse));
  } catch (error) {
    next(error);
  }
});

/** POST /api/driver/deliveries/:id/accept — driver accepts a delivery */
router.post("/driver/deliveries/:id/accept", async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    let driverId = req.body.driverId;

    // If no driverId provided, pick the first active driver
    if (!driverId) {
      const defaultDriver = await prisma.user.findFirst({
        where: { role: Role.DRIVER, active: true },
      });
      if (defaultDriver) driverId = defaultDriver.id;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: driverId || undefined,
        status: BookingStatus.ASSIGNED,
      },
      include: { farmer: true, driver: true, machinery: true, payment: true },
    });

    res.json(bookingResponse(updated));
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/driver/deliveries/:id/status — advance delivery status */
router.patch("/driver/deliveries/:id/status", async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const nextStatus = req.body.status;

    if (!Object.values(BookingStatus).includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid booking status" });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus },
      include: { farmer: true, driver: true, machinery: true, payment: true },
    });

    res.json(bookingResponse(updated));
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/drivers/location — driver pings their GPS location */
router.patch("/drivers/location", requireAuth([Role.DRIVER]), async (req, res, next) => {
  try {
    const latitude = parseCoordinate(req.body.latitude, "latitude", -90, 90);
    const longitude = parseCoordinate(req.body.longitude, "longitude", -180, 180);
    const driver = await prisma.user.update({
      where: { id: req.user.sub },
      data: { latitude, longitude },
    });
    res.json(publicUser(driver));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

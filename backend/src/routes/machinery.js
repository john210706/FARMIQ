const express = require("express");
const router = express.Router();
const { prisma, MachineryStatus } = require("../config");
const { calculateDistance, parseCoordinate } = require("../utils/geo");
const { machineryResponse } = require("../utils/formatters");

/** GET /api/machinery/nearby?lat=&lng= */
router.get("/machinery/nearby", async (req, res, next) => {
  try {
    const hasCoordinates = req.query.lat !== undefined && req.query.lng !== undefined;
    const userLat = hasCoordinates ? parseCoordinate(req.query.lat, "lat", -90, 90) : null;
    const userLng = hasCoordinates ? parseCoordinate(req.query.lng, "lng", -180, 180) : null;

    const machines = await prisma.machinery.findMany({
      where: { status: MachineryStatus.AVAILABLE },
      include: {
        owner: {
          select: { id: true, accountId: true, fullName: true, phone: true, verificationStatus: true },
        },
      },
    });

    const results = machines
      .map((machine) => {
        const distance =
          hasCoordinates && machine.latitude != null && machine.longitude != null
            ? calculateDistance(userLat, userLng, machine.latitude, machine.longitude)
            : null;
        return machineryResponse(machine, distance);
      })
      .sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
      );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

/** GET /api/machinery/:id */
router.get("/machinery/:id", async (req, res, next) => {
  try {
    const machine = await prisma.machinery.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });
    if (!machine) return res.status(404).json({ error: "Machinery not found" });
    res.json(machineryResponse(machine));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

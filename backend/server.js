require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient, BookingStatus, MachineryStatus, PaymentStatus, Role } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "farmiq-development-secret-change-me";

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

function calculateDistance(lat1, lon1, lat2, lon2) {
  const radiusKm = 6371;
  const toRadians = (value) => value * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return radiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function parseCoordinate(value, label, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${label} must be a number between ${min} and ${max}`);
    error.status = 400;
    throw error;
  }
  return number;
}

function parsePositiveInteger(value, label, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > maximum) {
    const error = new Error(`${label} must be an integer between 1 and ${maximum}`);
    error.status = 400;
    throw error;
  }
  return number;
}

function publicUser(user) {
  return {
    id: user.id,
    accountId: user.accountId,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    language: user.language,
    verificationStatus: user.verificationStatus,
  };
}

function machineryResponse(machine, distance = null) {
  const { owner, ...machineData } = machine;
  return {
    ...machineData,
    pricePerHour: Number(machine.pricePerHour),
    pricePerDay: machine.pricePerDay == null ? null : Number(machine.pricePerDay),
    distance: distance == null ? null : Number(distance.toFixed(2)),
    owner: owner ? publicUser(owner) : undefined,
  };
}

function bookingResponse(booking) {
  const { farmer, driver, machinery, payment, ...bookingData } = booking;
  return {
    ...bookingData,
    totalAmount: Number(booking.totalAmount),
    advanceAmount: Number(booking.advanceAmount),
    deliveryFee: Number(booking.deliveryFee),
    operatorFee: Number(booking.operatorFee),
    farmer: farmer ? publicUser(farmer) : undefined,
    driver: driver ? publicUser(driver) : null,
    machinery: machinery ? machineryResponse(machinery) : undefined,
    payment: payment ? { ...payment, amount: Number(payment.amount) } : undefined,
  };
}

function requireAuth(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required" });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: "This account does not have permission" });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
  };
}

app.get("/api/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "postgresql", service: "FarmIQ API" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const accountId = String(req.body.accountId || "").trim().toUpperCase();
    const password = String(req.body.password || "");
    if (!accountId || !password) return res.status(400).json({ error: "Account ID and password are required" });

    const user = await prisma.user.findUnique({ where: { accountId } });
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid account ID or password" });
    }

    const token = jwt.sign({ sub: user.id, accountId: user.accountId, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/machinery/nearby", async (req, res, next) => {
  try {
    const hasCoordinates = req.query.lat !== undefined && req.query.lng !== undefined;
    const userLat = hasCoordinates ? parseCoordinate(req.query.lat, "lat", -90, 90) : null;
    const userLng = hasCoordinates ? parseCoordinate(req.query.lng, "lng", -180, 180) : null;
    const machines = await prisma.machinery.findMany({
      where: { status: MachineryStatus.AVAILABLE },
      include: { owner: { select: { id: true, accountId: true, fullName: true, phone: true, verificationStatus: true } } },
    });
    const results = machines
      .map((machine) => {
        const distance = hasCoordinates && machine.latitude != null && machine.longitude != null
          ? calculateDistance(userLat, userLng, machine.latitude, machine.longitude)
          : null;
        return machineryResponse(machine, distance);
      })
      .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));
    res.json(results);
  } catch (error) {
    next(error);
  }
});

app.get("/api/machinery/:id", async (req, res, next) => {
  try {
    const machine = await prisma.machinery.findUnique({ where: { id: req.params.id }, include: { owner: true } });
    if (!machine) return res.status(404).json({ error: "Machinery not found" });
    res.json(machineryResponse(machine));
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", requireAuth([Role.FARMER]), async (req, res, next) => {
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
    if (!farmer || farmer.role !== Role.FARMER) return res.status(404).json({ error: "Farmer account not found" });
    if (!machine || machine.status !== MachineryStatus.AVAILABLE) return res.status(409).json({ error: "Machinery is not available" });

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
      const existingEnd = new Date(booking.scheduledAt.getTime() + booking.durationHours * 60 * 60 * 1000);
      return existingEnd > scheduledAt;
    });
    if (overlaps) return res.status(409).json({ error: "Machinery is already booked for that time" });

    const closestDriver = drivers
      .filter((driver) => driver.latitude != null && driver.longitude != null)
      .map((driver) => ({ driver, distance: calculateDistance(farmLat, farmLng, driver.latitude, driver.longitude) }))
      .sort((a, b) => a.distance - b.distance)[0]?.driver || null;
    const operatorFee = req.body.includeOperator ? 180 * durationHours : 0;
    const deliveryFee = 600;
    const discount = 500;
    const totalAmount = Math.max(Number(machine.pricePerHour) * durationHours + operatorFee + deliveryFee - discount, 0);
    const advanceAmount = Math.round(totalAmount * 0.5);
    const paymentMethod = ["upi", "card", "cash"].includes(req.body.paymentMethod) ? req.body.paymentMethod : "upi";

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
      await tx.machinery.update({ where: { id: machine.id }, data: { status: MachineryStatus.BOOKED } });
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

app.get("/api/rides", async (req, res, next) => {
  try {
    const status = req.query.status;
    const allowedStatuses = Object.values(BookingStatus);
    const where = status && allowedStatuses.includes(status)
      ? { status }
      : { status: { in: [BookingStatus.ASSIGNED, BookingStatus.IN_TRANSIT, BookingStatus.DELIVERED, BookingStatus.IN_PROGRESS] } };
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

app.patch("/api/drivers/location", requireAuth([Role.DRIVER]), async (req, res, next) => {
  try {
    const latitude = parseCoordinate(req.body.latitude, "latitude", -90, 90);
    const longitude = parseCoordinate(req.body.longitude, "longitude", -180, 180);
    const driver = await prisma.user.update({ where: { id: req.user.sub }, data: { latitude, longitude } });
    res.json(publicUser(driver));
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => res.status(404).json({ error: "API endpoint not found" }));
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || (error.code === "P2003" ? 409 : 500);
  res.status(status).json({ error: status >= 500 ? "The server could not complete the request" : error.message });
});

async function start() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error("Missing DATABASE_URL or DIRECT_URL. Copy .env.example to .env and add the Supabase PostgreSQL connection strings.");
    process.exit(1);
  }
  await prisma.$connect();
  app.listen(PORT, () => console.log(`FarmIQ API running at http://localhost:${PORT}`));
}

start().catch(async (error) => {
  console.error("FarmIQ API failed to start:", error.message);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

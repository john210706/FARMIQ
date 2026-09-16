const express = require("express");
const cors = require("cors");
const { prisma, PORT, FRONTEND_URL } = require("./config");

// ── Route modules ─────────────────────────────────────────────────────────────
const healthRouter   = require("./routes/health");
const authRouter     = require("./routes/auth");
const machineryRouter = require("./routes/machinery");
const aiRouter       = require("./routes/ai");
const bookingsRouter = require("./routes/bookings");
const driverRouter   = require("./routes/driver");

const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "100kb" }));

// ── Mount all routes under /api ───────────────────────────────────────────────
app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", machineryRouter);
app.use("/api", aiRouter);
app.use("/api", bookingsRouter);
app.use("/api", driverRouter);

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "API endpoint not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || (error.code === "P2003" ? 409 : 500);
  res
    .status(status)
    .json({ error: status >= 500 ? "The server could not complete the request" : error.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error(
      "Missing DATABASE_URL or DIRECT_URL. Copy .env.example to .env and add the Supabase PostgreSQL connection strings."
    );
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

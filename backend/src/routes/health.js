const express = require("express");
const router = express.Router();
const { prisma } = require("../config");

/** GET /api/health — database liveness check */
router.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "postgresql", service: "FarmIQ API" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

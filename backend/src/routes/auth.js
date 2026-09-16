const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma, JWT_SECRET } = require("../config");
const { publicUser } = require("../utils/formatters");

/** POST /api/auth/login */
router.post("/auth/login", async (req, res, next) => {
  try {
    const accountId = String(req.body.accountId || "").trim().toUpperCase();
    const password = String(req.body.password || "");
    if (!accountId || !password)
      return res.status(400).json({ error: "Account ID and password are required" });

    const user = await prisma.user.findUnique({ where: { accountId } });
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid account ID or password" });
    }

    const token = jwt.sign(
      { sub: user.id, accountId: user.accountId, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

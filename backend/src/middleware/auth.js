const jwt = require("jsonwebtoken");
const { JWT_SECRET, prisma } = require("../config");

/**
 * Express middleware factory for JWT authentication.
 * @param {string[]} roles - Allowed roles. Empty array allows all authenticated users.
 */
function requireAuth(roles = []) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required" });
    try {
      const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user?.active || (payload.version ?? 0) !== user.sessionVersion) return res.status(401).json({ error: 'Session no longer valid' });
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: "This account does not have permission" });
      }
      req.user = { ...user, sub: user.id };
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ error: "Invalid or expired session" });
      next(error);
    }
  };
}

module.exports = { requireAuth };

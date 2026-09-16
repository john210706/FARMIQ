const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

/**
 * Express middleware factory for JWT authentication.
 * @param {string[]} roles - Allowed roles. Empty array allows all authenticated users.
 */
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

module.exports = { requireAuth };

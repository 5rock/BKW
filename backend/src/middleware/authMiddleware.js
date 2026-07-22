/**
 * authMiddleware.js  (refactored)
 *
 * protect      — verifies JWT; attaches req.user (from token payload)
 * requireSeller — gate: isSeller flag must be true (set by backend)
 * requireAdmin  — gate: isAdmin flag must be true (set by backend)
 *
 * Roles are set ONLY by the backend roleResolver — never from request body.
 */

const { verifyToken } = require('../utils/tokenUtils');

/**
 * Attach authenticated user to req.user.
 * Returns 401 if token is missing or invalid.
 */
const protect = (req, res, next) => {
  const token = req.cookies?.gm_access_token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    const msg =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again'
        : 'Not authorized — invalid token';
    return res.status(401).json({ message: msg });
  }
};

/**
 * Require seller or admin access.
 * Must be used AFTER protect().
 * Gate is based on backend-set isSeller flag — not frontend role.
 */
const requireSeller = (req, res, next) => {
  if (req.user?.isSeller || req.user?.isAdmin) return next();
  return res.status(403).json({ message: 'Access denied — seller account required' });
};

/**
 * Require admin access only.
 * Must be used AFTER protect().
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ message: 'Access denied — admin only' });
};

module.exports = { protect, requireSeller, requireAdmin };

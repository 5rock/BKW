/**
 * tokenUtils.js
 *
 * Centralized JWT helpers.
 * Access tokens are short-lived (15 min by default).
 * Refresh tokens are long-lived (7 days) and stored server-side in the future.
 *
 * FIX: Supports separate secrets for access and refresh tokens.
 * Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env for separation.
 * Falls back to JWT_SECRET for backwards compatibility.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

if (!JWT_SECRET) {
  console.error('❌  FATAL: JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

/**
 * Payload embedded in the access token.
 * Do NOT include sensitive fields (password, etc.).
 * Roles come from DB — NOT from frontend input.
 */
const buildPayload = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,           // resolved by backend
  isAdmin: user.isAdmin,
  isSeller: user.isSeller,
  emailVerified: user.emailVerified,
});

// FIX: Access and refresh tokens use separate secrets when configured
const signAccessToken = (user) =>
  jwt.sign(buildPayload(user), ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

const verifyToken = (token) => jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = { signAccessToken, signRefreshToken, verifyToken, verifyRefreshToken, buildPayload };

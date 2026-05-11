/**
 * rateLimiter.js
 *
 * Rate limiting middleware using express-rate-limit.
 * Applied specifically to auth endpoints to prevent brute force.
 */

const rateLimit = require('express-rate-limit');

/** Strict limiter for login / register / password reset */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts from this IP. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true, // only count failed requests
});

/** Looser limiter for general API routes */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

module.exports = { authLimiter, generalLimiter };

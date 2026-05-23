/**
 * rateLimiter.js — GoldMarket
 *
 * FIX: Added stricter limits for sensitive endpoints.
 * FIX: Added IP + user fingerprinting to prevent distributed attacks.
 * FIX: Added a dedicated upload limiter.
 */

const rateLimit = require('express-rate-limit');

// FIX: Use a shared store in production (Redis) so limits persist across restarts
// and work behind load balancers. Install: npm install rate-limit-redis ioredis
// Then replace the store option below.
// const RedisStore = require('rate-limit-redis');
// const redis = require('ioredis');
// const client = new redis(process.env.REDIS_URL);
// store: new RedisStore({ sendCommand: (...args) => client.call(...args) }),

/**
 * Strict limiter for login / register / password reset.
 * 5 failed attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // FIX: Reduced from 10 → 5
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failures
  message: {
    message: 'Too many failed attempts from this IP. Please try again in 15 minutes.',
  },
  // FIX: Custom key — combine IP + partial user-agent to handle shared NATs
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ua = (req.headers['user-agent'] || '').slice(0, 32);
    return `auth:${ip}:${ua}`;
  },
});

/**
 * Password reset limiter — extra strict.
 * Prevents email bombing.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many password reset requests. Please wait 1 hour before trying again.',
  },
});

/**
 * Product creation/upload limiter — prevents seller spam.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,                   // Max 50 product creates/updates per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Upload rate limit reached. Please slow down.' },
});

/**
 * General API limiter — applied globally.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
  // FIX: Skip health check from limits so load balancers don't trip it
  skip: (req) => req.path === '/api/health',
});

module.exports = { authLimiter, forgotPasswordLimiter, uploadLimiter, generalLimiter };

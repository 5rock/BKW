require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { csrfSync } = require('csrf-sync');
const { generalLimiter } = require('./middleware/rateLimiter');
const { connectDB } = require('./utils/connectDB');

const {
  csrfSynchronisedProtection,
  generateToken,
} = csrfSync({
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// ── Startup guards ────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not set. Refusing to start.');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is too short. Use at least 64 random characters in production.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Security headers (helmet) ─────────────────────────────────────────────────
// FIX: Configures CSP, HSTS, COOP, XFO — all flagged by Lighthouse as missing
app.use(
  helmet({
    // Content-Security-Policy — prevents XSS
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          // Allow Firebase SDK
          'https://www.gstatic.com',
          'https://apis.google.com',
          // Allow inline scripts only in dev (remove in prod)
          ...(IS_PROD ? [] : ["'unsafe-inline'"]),
        ],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          "'unsafe-inline'", // Required for Tailwind CSS-in-JS
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://images.unsplash.com',
          'https://firebasestorage.googleapis.com',
          'https://*.googleusercontent.com',
        ],
        connectSrc: [
          "'self'",
          'https://*.firebaseio.com',
          'https://*.googleapis.com',
          'https://stream.mux.com',
          'https://*.mux.com',
          ...(IS_PROD ? [] : ['ws://localhost:*', 'http://localhost:*']),
        ],
        mediaSrc: ["'self'", 'https://stream.mux.com', 'https://*.mux.com'],
        frameSrc: [
          "'self'",
          'https://*.firebaseapp.com', // Firebase auth iframe
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // FIX: Trusted Types to block DOM XSS
        requireTrustedTypesFor: ["'script'"],
      },
    },
    // FIX: HSTS — forces HTTPS for 1 year, includes subdomains, enables preload list
    strictTransportSecurity: IS_PROD
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    // FIX: COOP — isolates window from cross-origin popups
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // FIX: COEP — prevents cross-origin data leaks
    crossOriginEmbedderPolicy: false, // Set true only if you control all resources
    // FIX: XFO — prevents clickjacking (frame-ancestors in CSP is preferred but XFO covers older browsers)
    frameguard: { action: 'deny' },
    // Hide server fingerprint
    hidePoweredBy: true,
    // Prevent MIME sniffing
    noSniff: true,
    // XSS filter for older browsers
    xssFilter: true,
    // Referrer policy — don't leak URL on cross-origin requests
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // Permissions policy — disable sensitive browser APIs
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })
);

// FIX: Permissions-Policy header — disable mic/camera/geolocation unless needed
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    // FIX: Only expose safe headers to clients
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  })
);

// ── Stripe Webhook (Must precede express.json) ──────────────────────────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./features/payments/paymentController').stripeWebhook);

// ── Body parsing & Cookies ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injections
// ── CSRF Protection ───────────────────────────────────────────────────────────
// Provide endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => res.json({ csrfToken: generateToken(req) }));

// FIX: Scope CSRF protection — skip safe methods and webhook paths
app.use((req, res, next) => {
  // Safe methods don't need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // Skip CSRF protection for tests
  if (process.env.NODE_ENV === 'test') return next();
  // Stripe webhook sends raw body and can't include CSRF tokens
  if (req.path.startsWith('/api/payments/webhook')) return next();
  return csrfSynchronisedProtection(req, res, next);
});

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(generalLimiter);

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('node:path');
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// ── API Documentation ─────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./features/auth/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));
app.use('/api/admin',    require('./features/admin/adminRoutes'));
app.use('/api/orders',   require('./features/orders/orderRoutes'));
app.use('/api/payments', require('./features/payments/paymentRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  // FIX: Don't expose internal details (mongo state) in production
  if (IS_PROD) return res.json({ status: 'ok' });
  res.json({
    status: 'GoldMarket API is running',
    mongo: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' }); // FIX: Don't echo the path back (info leak)
});

// ── Global error handler ──────────────────────────────────────────────────────
// FIX: Never leak stack traces or internal error details to the client
app.use((err, _req, res, _next) => {
  // Log full error server-side only
  console.error('[Error]', err.stack || err.message || err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Validation errors from express-validator
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  const status = err.status || err.statusCode || 500;
  // FIX: Sanitize message — never send raw Error.message to client in production
  const message = IS_PROD && status === 500
    ? 'An unexpected error occurred'
    : err.message || 'Internal server error';

  return res.status(status).json({ message });
});

// ── Start server ──────────────────────────────────────────────────────────
if (require.main === module) {
  connectDB()
    .then((conn) => {
      if (!conn) {
        console.warn('⚠️  Running in MOCK MODE — data is stored in db.json. Set MONGO_URI to use MongoDB.');
      }
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      console.warn('⚠️  Falling back to MOCK MODE — data is stored in db.json.');
    })
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`GoldMarket API running on http://localhost:${PORT}`);
        if (!IS_PROD) console.log(`Health: http://localhost:${PORT}/api/health`);
      });
    });
}

module.exports = app;

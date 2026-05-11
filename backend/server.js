require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');

// Validate critical env vars on startup
if (!process.env.JWT_SECRET) {
  console.error('❌  FATAL: JWT_SECRET not set. Refusing to start.');
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers (helmet)
app.use(helmet());

// ── CORS — explicit allowed origins from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (Postman, curl) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing
app.use(express.json({ limit: '10kb' })); // prevent large payload attacks

// ── General rate limiter (all routes)
app.use(generalLimiter);

// ── Routes
app.use('/api/auth',     require('./routes/authRoutes'));     // register, login, OAuth
app.use('/api/users',    require('./routes/userRoutes'));     // profile (me)
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));

// ── Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'GoldMarket API is running', timestamp: new Date().toISOString() })
);

// ── 404 handler
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
);

// ── Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 GoldMarket API running on http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: /api/auth/(register|login|refresh|logout|firebase)\n`);
});

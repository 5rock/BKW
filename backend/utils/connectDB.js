const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MongoDB URI is not configured. Backend will run in MOCK MODE using db.json.');
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const connection = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}. Falling back to MOCK MODE.`);
    return null;
  }
};

const isMockMode = () => mongoose.connection.readyState !== 1;

const requireMongo = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  if (process.env.ALLOW_MOCK_DB === 'true' && isMockMode()) return next();
  return res.status(503).json({
    message: 'Authentication database is not connected. Set MONGO_URI (or ALLOW_MOCK_DB=true for mock mode) and restart the server.',
  });
};

module.exports = { connectDB, requireMongo, isMockMode };

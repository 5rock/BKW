const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MongoDB URI is not configured. Auth APIs that require MongoDB will return 503.');
    return null;
  }

  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

const requireMongo = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: 'Authentication database is not connected. Set MONGO_URI and restart the server.',
  });
};

module.exports = { connectDB, requireMongo };

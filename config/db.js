const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 *
 * During the migration phase the app can still boot without a database
 * (the legacy in-memory/file flow keeps working), so a missing URI logs a
 * warning instead of crashing. Once the app fully depends on MongoDB this
 * should be hardened to exit the process on failure.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '⚠️  MONGODB_URI is not set — skipping MongoDB connection. ' +
      'Add it to your .env file to enable persistence (see .env.example).'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return null;
  }
}

module.exports = connectDB;

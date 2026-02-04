const mongoose = require('mongoose');

async function connectDB() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    const err = new Error('MONGODB_URI is not set');
    console.error('DB config error:', err.message);
    throw err;
  }
  try {
    await mongoose.connect(uri);
    const dbName = mongoose.connection.db?.databaseName || 'openmarket';
    console.log('MongoDB connected to database:', dbName);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // Caller can decide whether to exit
  }
}

module.exports = { connectDB };

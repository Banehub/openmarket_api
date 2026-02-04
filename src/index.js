require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const ratingRoutes = require('./routes/ratings');
const uploadRoutes = require('./routes/upload');
const { UPLOAD_DIR } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow localhost, production frontend, and optional CORS_ORIGIN list
const isLocalOrigin = (origin) =>
  !origin || /^https?:\/\/localhost(:\d+)?$/i.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin);
const allowedOrigins = [
  'https://open-market-frontend.onrender.com',
  ...(process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
];
const corsOptions = {
  origin: (origin, cb) => {
    if (isLocalOrigin(origin)) return cb(null, true);
    if (origin && allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
  res.json({ name: 'OpenMarket API', version: '1.0.0', baseUrl: '/api' });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';
  res.json({ status: 'ok', db: dbStatus });
});

// Error logging
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR on ${req.method} ${req.originalUrl}:`, err.message);
  if (err.stack) console.error('Stack:', err.stack);
  res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Internal server error' });
});

// Start server so Render detects a port; DB may connect in background
// Listen on 0.0.0.0 so any host (localhost, LAN IP) can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenMarket API listening on port ${PORT} (all interfaces)`);
  connectDB().catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Don't exit - server stays up, /api/health will show db: 'disconnected'
  });
});

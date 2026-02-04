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
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Request logging (frontend traffic)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl;
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || '-';
  console.log(`[${timestamp}] ${method} ${path} | IP: ${ip} | ${userAgent}`);
  next();
});

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
app.listen(PORT, () => {
  console.log(`OpenMarket API listening on port ${PORT}`);
  connectDB().catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Don't exit - server stays up, /api/health will show db: 'disconnected'
  });
});

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`OpenMarket API listening on port ${PORT}`));
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Apex Detailed Wash API is operating normally',
    timestamp: new Date().toISOString()
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_wash_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB database at ${MONGODB_URI}`))
  .catch(err => console.error('MongoDB connection error:', err));

// Route Handlers
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Apex Wash Server running on port ${PORT}`);
});

module.exports = app;
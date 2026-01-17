const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config');
const config = require('./env-config');

// Routes
const bukuRoutes = require('./routes/buku');
const userRoutes = require('./routes/user');
const peminjamanRoutes = require('./routes/peminjaman');
const dendaRoutes = require('./routes/denda');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://localhost:3000', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/buku', bukuRoutes);
app.use('/api/user', userRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/denda', dendaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║     🎉 PERPUSTAKAAN API SERVER RUNNING                ║
║     ✅ Server: http://localhost:${PORT}              ║
║     ✅ Database: Connected                           ║
║     ✅ Environment: ${config.NODE_ENV}               ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = app;

const path = require('path');
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Body parsers (Express 5 built-ins — no body-parser dependency needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static frontend (replaced by the React client in a later commit)
app.use(express.static(path.join(__dirname, '../../public')));

// API routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;

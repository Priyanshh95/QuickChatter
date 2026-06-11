const fs = require('fs');
const path = require('path');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const roomRoutes = require('./routes/roomRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body parsers (Express 5 built-ins — no body-parser dependency needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the built React client (produced by `npm run build` in client/).
// In development the client is served by Vite instead, so this is skipped.
const clientDist = path.join(__dirname, '../../client/dist');
const hasClient = fs.existsSync(clientDist);
if (hasClient) app.use(express.static(clientDist));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes); // default-room history (back-compat)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// SPA fallback: serve index.html for client-side routes (non-API GETs).
if (hasClient) {
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Central error handler (must be registered last)
app.use(errorHandler);

module.exports = app;

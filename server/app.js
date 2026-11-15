const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/studentRoutes');
const recordRoutes = require('./routes/recordRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function buildCors() {
  const configured = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return cors({
    origin(origin, cb) {
      // No Origin header = same-origin request, curl, or server-to-server: allow.
      if (!origin) return cb(null, true);
      if (configured.length ? configured.includes(origin) : LOCAL_ORIGIN.test(origin)) return cb(null, true);
      return cb(null, false);
    },
  });
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(buildCors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const database = states[mongoose.connection.readyState] || 'unknown';
    res.status(database === 'connected' ? 200 : 503).json({ status: database === 'connected' ? 'ok' : 'degraded', database });
  });

  app.use('/api/students', studentRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api', notFound);

  // Optional single-host deployment: serve the built React app from ../dist.
  const dist = path.join(__dirname, '..', 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

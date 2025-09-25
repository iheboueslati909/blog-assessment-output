// src/app.js
'use strict';
const express = require('express');
const config = require('./config');
const cors = require('cors');
const app = express();

/**
 * CORS setup
 * - Accepts a comma-separated list in config.CORS_ORIGINS
 * - Allows credentials (cookies)
 */
const origins = String(config.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin like curl, mobile apps
    if (!origin) return callback(null, true);
    if (origins.length === 0) return callback(null, true);
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true, // important so browser sends HttpOnly cookie
};

app.use(cors(corsOptions));

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);

  const status = err && err.status ? err.status : 500;
  const safe = {
    message: err && err.message ? err.message : 'Internal Server Error',
  };

  res.status(status).json(safe);
});

module.exports = app;

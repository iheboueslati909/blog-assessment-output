// src/app.js
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const articleRoutes = require('./routes/article.routes');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Basic rate limiter (adjust in config)
const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/articles', articleRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Central error handler (simple)
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);

  const status = err && err.status ? err.status : 500;
  const safe = {
    message: err && err.message ? err.message : 'Internal Server Error',
  };

  res.status(status).json(safe);
});

module.exports = app;

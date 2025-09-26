// src/config/index.js
'use strict';

const dotenv = require('dotenv');
const assert = require('assert');
dotenv.config();

const getEnv = (key, fallback) => {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  return v;
};

const config = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: Number(getEnv('PORT', 3001)),

  // Mongo
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/articles-service'),

  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', null),

  // CORS
  CORS_ORIGINS: getEnv('CORS_ORIGINS', 'http://localhost:4200'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(getEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
  RATE_LIMIT_MAX: Number(getEnv('RATE_LIMIT_MAX', 400)),

  // Storage
  STORAGE_PROVIDER: getEnv('STORAGE_PROVIDER', 'local'), // local | cloud
  FILE_BASE_URL: getEnv('FILE_BASE_URL', `http://localhost:${getEnv('PORT', 3001)}`),
  UPLOAD_DIR: getEnv('UPLOAD_DIR', 'uploads'),
};

// Fail fast for essential secrets in non-dev environments
if (config.NODE_ENV !== 'development') {
  assert(config.JWT_SECRET, 'JWT_SECRET is required in non-development environments');
}

module.exports = config;

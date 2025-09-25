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
  PORT: Number(getEnv('PORT', 3003)),

  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', null),

  // CORS
  CORS_ORIGINS: getEnv('CORS_ORIGINS', 'http://localhost:4200'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(getEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)), // 15m
  RATE_LIMIT_MAX: Number(getEnv('RATE_LIMIT_MAX', 100)),
};

// Fail fast for essential secrets in non-dev environments
if (config.NODE_ENV !== 'development') {
  assert(config.JWT_SECRET, 'JWT_SECRET is required in non-development environments');
}

module.exports = config;

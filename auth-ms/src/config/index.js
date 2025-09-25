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
  PORT: Number(getEnv('PORT', 3000)),

  // Mongo
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/auth-service'),

  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', null),
  ACCESS_TOKEN_TTL: getEnv('ACCESS_TOKEN_TTL', '15m'),
  REFRESH_TOKEN_TTL_DAYS: Number(getEnv('REFRESH_TOKEN_TTL_DAYS', 30)),

  // Cookie
  REFRESH_TOKEN_COOKIE_NAME: getEnv('REFRESH_TOKEN_COOKIE_NAME', 'refresh_token'),
  REFRESH_COOKIE_SAME_SITE: getEnv('REFRESH_COOKIE_SAME_SITE', 'Strict'),
  REFRESH_COOKIE_SECURE: getEnv('REFRESH_COOKIE_SECURE', 'true') === 'true',

  // Security
  BCRYPT_SALT_ROUNDS: Number(getEnv('BCRYPT_SALT_ROUNDS', 12)),

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

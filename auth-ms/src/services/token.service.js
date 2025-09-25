// src/domain/services/token.service.js
'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const DEFAULT_JTI_BYTES = 16;

function generateJti() {
  // Use random UUID when available, fallback to crypto
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(DEFAULT_JTI_BYTES).toString('hex');
}

function generateAccessToken(user) {
  if (!user || !user._id) throw new Error('Invalid user for access token');

  const payload = {
    sub: user._id.toString(),
    roles: user.roles || [],
    jti: generateJti(),
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.ACCESS_TOKEN_TTL,
  });

  return token;
}

function verifyAccessToken(token) {
  if (!token) throw new Error('No token provided');
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    return payload;
  } catch (err) {
    throw err;
  }
}

function generateRefreshTokenRaw() {
  return crypto.randomBytes(64).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshTokenRaw,
  hashRefreshToken,
  generateJti,
};

// src/domain/services/auth.service.js
'use strict';

const bcrypt = require('bcrypt');
const TokenService = require('./token.service');
const UserModel = require('../models/user.model');
const RefreshTokenModel = require('../models/refreshToken.model');
const config = require('../config');

// Simple local helper to compute expiry date
function computeExpiryDate(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * login(credentials)
 * - finds user
 * - verifies password
 * - issues access token
 * - persists a refresh token (hashed)
 *
 * returns { accessToken, refreshToken } where refreshToken is the raw string
 */
async function login({ email, password, userAgent }) {
  if (!email || !password) {
    const err = new Error('Email and password required');
    err.status = 400;
    throw err;
  }

  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const accessToken = TokenService.generateAccessToken(user);
  const refreshTokenRaw = TokenService.generateRefreshTokenRaw();
  const tokenHash = TokenService.hashRefreshToken(refreshTokenRaw);
  const expiresAt = computeExpiryDate(config.REFRESH_TOKEN_TTL_DAYS);

  const refreshDoc = new RefreshTokenModel({
    userId: user._id,
    tokenHash,
    userAgent,
    expiresAt,
  });

  await refreshDoc.save();

  // Update lastLoginAt (non-blocking)
  user.lastLoginAt = new Date();

  user.save().catch(() => {console.log("Error saving user's last login")});

  return {
    accessToken,
    refreshToken: refreshTokenRaw,
  };
}

/**
 * refresh(refreshTokenRaw)
 * - finds hashed token in DB
 * - if invalid or revoked -> throw
 * - create new refresh token, persist, revoke old (mark replacedBy)
 * - return { accessToken, refreshToken }
 */
async function refresh({ refreshTokenRaw, userAgent }) {
  if (!refreshTokenRaw) {
    const err = new Error('Refresh token required');
    err.status = 400;
    throw err;
  }

  const tokenHash = TokenService.hashRefreshToken(refreshTokenRaw);
  const existing = await RefreshTokenModel.findOne({ tokenHash }).exec();

  if (!existing) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  if (existing.revoked) {
    // Token reuse detection: treat as compromise
    // Revoke all user's tokens as a safety measure
    await RefreshTokenModel.updateMany({ userId: existing.userId, revoked: false }, { revoked: true }).exec();
    const err = new Error('Refresh token has been revoked — possible compromise. All sessions revoked.');
    err.status = 401;
    throw err;
  }

  if (existing.expiresAt && existing.expiresAt < new Date()) {
    existing.revoked = true;
    await existing.save();
    const err = new Error('Refresh token expired');
    err.status = 401;
    throw err;
  }

  // Rotate: create a new refresh token, persist it, mark old as revoked and replacedBy
  const newRefreshRaw = TokenService.generateRefreshTokenRaw();
  const newHash = TokenService.hashRefreshToken(newRefreshRaw);
  const expiresAt = computeExpiryDate(config.REFRESH_TOKEN_TTL_DAYS);

  const newDoc = new RefreshTokenModel({
    userId: existing.userId,
    tokenHash: newHash,
    userAgent,
    expiresAt,
  });

  // Save new token and update existing atomically-ish (not a transaction here for simplicity)
  await newDoc.save();

  existing.revoked = true;
  existing.replacedBy = newDoc._id;
  await existing.save();

  // Issue new access token (need user data)
  const user = await UserModel.findById(existing.userId);
  if (!user) {
    const err = new Error('User not found for refresh token');
    err.status = 500;
    throw err;
  }

  const accessToken = TokenService.generateAccessToken(user);

  return {
    accessToken,
    refreshToken: newRefreshRaw,
  };
}

/**
 * logout(refreshTokenRaw)
 * - revoke the specific refresh token (if found)
 */
async function logout({ refreshTokenRaw }) {
  if (!refreshTokenRaw) {
    // no cookie/token: nothing to do
    return;
  }

  const tokenHash = TokenService.hashRefreshToken(refreshTokenRaw);
  await RefreshTokenModel.updateOne({ tokenHash }, { revoked: true }).exec();
}

module.exports = {
  login,
  refresh,
  logout,
};

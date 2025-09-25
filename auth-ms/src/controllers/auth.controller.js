// src/api/controllers/auth.controller.js
'use strict';

const config = require('../config');
const AuthService = require('../services/auth.service');
const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');

const COOKIE_NAME = config.REFRESH_TOKEN_COOKIE_NAME;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.REFRESH_COOKIE_SECURE,
  sameSite: config.REFRESH_COOKIE_SAME_SITE,
  path: '/',
  maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000, // ms
};

/**
 * POST /auth/login
 * body: { email, password }
 * sets httpOnly refresh cookie and returns accessToken
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const userAgent = req.get('User-Agent') || '';

    const { accessToken, refreshToken } = await AuthService.login({
      email,
      password,
      userAgent,
    });

    // Set HttpOnly refresh cookie
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/refresh
 * relies on HttpOnly cookie; returns new access token and rotates refresh cookie
 */
async function refresh(req, res, next) {
  try {
    // Read refresh token from cookie
    const refreshToken = req.cookies && req.cookies[COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';

    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh({
      refreshTokenRaw: refreshToken,
      ip,
      userAgent,
    });

    // Rotate cookie
    res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/logout
 * clears the refresh cookie and revokes token server-side if cookie present
 */
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies && req.cookies[COOKIE_NAME];

    if (refreshToken) {
      await AuthService.logout({ refreshTokenRaw: refreshToken });
    }

    // Clear cookie on client
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.REFRESH_COOKIE_SECURE,
      sameSite: config.REFRESH_COOKIE_SAME_SITE,
      path: '/',
    });

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/register
 * body: { name, email, password }
 * - Creates a new user with role "Reader"
 * - Hashes password with bcrypt
 * - Returns safe user object (no passwordHash)
 */

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

    const user = new UserModel({
      name: name || '',
      email,
      passwordHash,
      roles: ['Author'],
    });

    await user.save();

    const safe = typeof user.toSafeObject === 'function'
      ? user.toSafeObject()
      : user.toObject();

    return res.status(201).json({ user: safe });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  refresh,
  logout,
  register
};

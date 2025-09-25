// src/middleware/auth.middleware.js
'use strict';

const TokenService = require('../services/token.service');

/**
 * authenticate
 * - reads Authorization: Bearer <token>
 * - verifies token and attaches req.user = { id, roles }
 * - on failure responds 401
 */
async function authenticate(req, res, next) {
  try {
    const auth = req.get('Authorization') || req.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = auth.slice('Bearer '.length).trim();
    if (!token) return res.status(401).json({ message: 'Missing token' });

    let payload;
    try {
      payload = TokenService.verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // minimal user object attached to request
    req.user = {
      id: payload.sub,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      jti: payload.jti,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticate,
};

'use strict';

const TokenService = require('../services/token.service.js');

/**
 * Socket.io auth middleware
 * - expects { auth: { token: "Bearer <token>" } } or { auth: { token: "<token>" } }
 * - verifies JWT and attaches socket.user = { id, roles }
 */
function socketAuthenticate(socket, next) {
  try {
    const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!raw) {
      return next(new Error('Missing auth token'));
    }

    // Allow both "Bearer <token>" and raw token
    const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : raw;

    let payload;
    try {
      payload = TokenService.verifyAccessToken(token);
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }

    socket.user = {
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
  socketAuthenticate,
};

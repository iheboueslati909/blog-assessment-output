'use strict';
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const auth = req.get('Authorization') || req.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = auth.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      jti: payload.jti,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };

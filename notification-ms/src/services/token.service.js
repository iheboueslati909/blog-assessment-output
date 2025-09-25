// src/domain/services/token.service.js
'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');


function verifyAccessToken(token) {
  if (!token) throw new Error('No token provided');
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    return payload;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  verifyAccessToken,
};

// src/data/models/refreshToken.model.js
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    createdByIp: { type: String },
    userAgent: { type: String },
    revoked: { type: Boolean, default: false },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'RefreshToken', default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Optional TTL cleanup: Mongo will remove docs after `expiresAt` if you use TTL on `expiresAt`.
// NOTE: TTL index granularity is 60s; created for cleanup convenience.
// RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);

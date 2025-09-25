// src/data/models/user.model.js
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    roles: { type: [String], default: ['Author'] }, // Admin, Editor, Author
    // lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ getters: true, versionKey: false });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

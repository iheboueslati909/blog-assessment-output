// scripts/seed-users.js
'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const config = require('../config');
const UserModel = require('../models/user.model');

async function run() {
  try {
    await mongoose.connect(config.MONGO_URI);

    const roles = ['Admin', 'Editor', 'Author'];

    for (const role of roles) {
      const email = `${role.toLowerCase()}@example.com`;
      const password = `${role.toLowerCase()}123`;
      const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

      const existing = await UserModel.findOne({ email });
      if (existing) {
        console.log(`User with email ${email} already exists, skipping.`);
        continue;
      }

      const user = new UserModel({
        name: role,
        email,
        passwordHash,
        roles: [role],
      });

      await user.save();
      console.log(`Created ${role} user: ${email} / ${password}`);
    }

    await mongoose.disconnect();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();

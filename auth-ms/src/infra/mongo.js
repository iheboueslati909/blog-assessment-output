// src/infra/db/mongo.js
'use strict';

const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

async function connect() {
  if (isConnected) return mongoose.connection;
  const uri = config.MONGO_URI;

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, opts);
  isConnected = true;

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.log('MongoDB disconnected');
    isConnected = false;
  });

  // Graceful shutdown
  const handleExit = async () => {
    try {
      await mongoose.connection.close(false);
      // eslint-disable-next-line no-console
      console.log('MongoDB connection closed gracefully');
      process.exit(0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error during MongoDB disconnection', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);

  return mongoose.connection;
}

async function disconnect() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = {
  connect,
  disconnect,
  mongoose,
};

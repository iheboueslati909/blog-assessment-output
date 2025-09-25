// src/server.js
'use strict';

const http = require('http');
const app = require('./app');
const db = require('./infra/mongo');
const config = require('./config');

const PORT = config.PORT || 3000;

let server;

async function start() {
  try {
    // Connect to Mongo
    await db.connect();
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  }

  server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Articles service listening on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}

async function shutdown(signal) {
  try {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
      });
    }
    await db.disconnect();
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});

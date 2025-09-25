// src/server.js
'use strict';

const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const config = require('./config');
const eventBus = require('./eventBus');
const { socketAuthenticate } = require('./middlewares/socketAuth.middleware');

const PORT = config.PORT || 3000;

let server;
let io;

async function start() {
  // create HTTP + Socket.io once
  server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: config.FRONTEND_URL, // e.g. "http://localhost:4200"
      credentials: true,
    }
  });

  io.use(socketAuthenticate);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected`);
  });

  eventBus.subscribe('comment.created', (data) => {
    console.log("COMMENT CREATED" , data)
    io.to(`user:${data.articleAuthorId}`).emit('notification', {
      type: 'comment',
      articleId: data.articleId,
      commentId: data.commentId,
      message: 'New comment on your article!',
    });
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`Notification service listening on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  setTimeout(() => process.exit(0), 100);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});

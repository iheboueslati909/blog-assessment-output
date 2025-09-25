'use strict';

const { createClient } = require('redis');

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const publisher = createClient({ url });
const subscriber = createClient({ url });

publisher.connect();
subscriber.connect();

module.exports = {
  publish: async (channel, payload) => {
    await publisher.publish(channel, JSON.stringify(payload));
  },

  subscribe: async (channel, handler) => {
    await subscriber.subscribe(channel, (message) => {
      handler(JSON.parse(message));
    });
  }
};

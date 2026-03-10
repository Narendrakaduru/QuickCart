const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('BullMQ Redis Connection Error:', err.message);
});

module.exports = connection;

const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

const connectRedis = async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  
  try {
    await redisClient.connect();
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
  }
};

module.exports = {
  redisClient,
  connectRedis
};
